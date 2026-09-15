import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import {
  TipoEventoAuditoria,
  JwtPayload,
  AuthTokensResponse,
  AuthenticatedUser,
} from './auth.types';
import { LoginDto } from './dto/login.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Genera un hash SHA-256 seguro para tokens de activación y refresh tokens.
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Hashea una contraseña usando el algoritmo Argon2id con parámetros recomendados OWASP.
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  /**
   * Verifica una contraseña contra su hash Argon2id.
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (err) {
      this.logger.error(`Error verificando password: ${err.message}`);
      return false;
    }
  }

  /**
   * Registra un evento en la tabla inmutable de auditoría.
   */
  async registrarAuditoria(
    usuarioId: number | null,
    evento: TipoEventoAuditoria,
    detalle?: string,
    ipOrigen?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await (this.prisma as any).auditoriaAcceso.create({
        data: {
          usuarioId,
          evento,
          detalle,
          ipOrigen: ipOrigen?.slice(0, 50),
          userAgent: userAgent?.slice(0, 500),
          fecha: new Date(),
        },
      });
    } catch (err) {
      this.logger.error(`Error al registrar auditoría [${evento}]: ${err.message}`);
    }
  }

  /**
   * Genera tokens JWT (accessToken de vida corta + refreshToken con rotación).
   */
  private async generarTokens(
    user: { id: number; email: string; esAdmin: boolean; artistaId: number | null },
    ipOrigen?: string,
  ): Promise<AuthTokensResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      esAdmin: user.esAdmin,
      artistaId: user.artistaId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
    });

    // Generar refresh token criptográfico aleatorio de alta entropía (64 caracteres hex)
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);

    const expiraEn = new Date();
    expiraEn.setDate(expiraEn.getDate() + 7); // 7 días

    await (this.prisma as any).refreshToken.create({
      data: {
        usuarioId: user.id,
        tokenHash,
        expiraEn,
        ipOrigen: ipOrigen?.slice(0, 50),
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 15 * 60, // 15 minutos en segundos
    };
  }

  /**
   * Autenticación con email y contraseña (Argon2id).
   */
  async login(
    loginDto: LoginDto,
    ipOrigen?: string,
    userAgent?: string,
  ): Promise<AuthTokensResponse> {
    const { email, password } = loginDto;

    const user = await (this.prisma as any).usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      await this.registrarAuditoria(
        null,
        TipoEventoAuditoria.LOGIN_FAIL,
        `Intento de login con email no existente: ${email}`,
        ipOrigen,
        userAgent,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      await this.registrarAuditoria(
        user.id,
        TipoEventoAuditoria.LOGIN_FAIL,
        'Intento de login en cuenta inactiva o deshabilitada',
        ipOrigen,
        userAgent,
      );
      throw new UnauthorizedException('La cuenta se encuentra deshabilitada');
    }

    if (!user.hashPassword) {
      await this.registrarAuditoria(
        user.id,
        TipoEventoAuditoria.LOGIN_FAIL,
        'Intento de login en cuenta pendiente de activación',
        ipOrigen,
        userAgent,
      );
      throw new UnauthorizedException(
        'La cuenta no ha sido activada aún. Por favor utiliza el enlace de invitación recibido.',
      );
    }

    const passwordValido = await this.verifyPassword(password, user.hashPassword);

    if (!passwordValido) {
      await this.registrarAuditoria(
        user.id,
        TipoEventoAuditoria.LOGIN_FAIL,
        'Contraseña incorrecta',
        ipOrigen,
        userAgent,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generarTokens(user, ipOrigen);

    await this.registrarAuditoria(
      user.id,
      TipoEventoAuditoria.LOGIN_OK,
      'Inicio de sesión exitoso',
      ipOrigen,
      userAgent,
    );

    return tokens;
  }

  /**
   * Provisión de cuenta por Administrador (Flujo de Invitación segura sin contraseñas en claro).
   */
  async crearInvitacion(
    adminUser: AuthenticatedUser,
    dto: CreateInvitationDto,
    ipOrigen?: string,
  ): Promise<{ usuarioId: number; email: string; token: string; expiraEn: Date }> {
    const emailNormalizado = dto.email.toLowerCase().trim();

    // Verificar si ya existe usuario
    const existente = await (this.prisma as any).usuario.findUnique({
      where: { email: emailNormalizado },
    });

    let usuario = existente;

    if (!usuario) {
      // Crear nuevo usuario en estado pendiente (sin hashPassword)
      usuario = await (this.prisma as any).usuario.create({
        data: {
          email: emailNormalizado,
          artistaId: dto.artistaId || null,
          esAdmin: dto.esAdmin ?? false,
          activo: true,
          creadoPor: adminUser.id,
        },
      });

      await this.registrarAuditoria(
        adminUser.id,
        TipoEventoAuditoria.CUENTA_CREADA,
        `Admin ${adminUser.email} creó usuario ${emailNormalizado} (artistaId: ${dto.artistaId ?? 'N/A'})`,
        ipOrigen,
      );
    }

    // Generar token de invitación criptográfico de un solo uso
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const horasExpiracion = parseInt(
      this.configService.get<string>('INVITATION_TOKEN_EXPIRATION_HOURS', '72'),
      10,
    );
    const expiraEn = new Date();
    expiraEn.setHours(expiraEn.getHours() + horasExpiracion);

    await (this.prisma as any).invitacionActivacion.create({
      data: {
        usuarioId: usuario.id,
        tokenHash,
        expiraEn,
      },
    });

    await this.registrarAuditoria(
      adminUser.id,
      TipoEventoAuditoria.INVITACION_CREADA,
      `Invitación creada para ${emailNormalizado}. Expira: ${expiraEn.toISOString()}`,
      ipOrigen,
    );

    return {
      usuarioId: usuario.id,
      email: emailNormalizado,
      token: rawToken,
      expiraEn,
    };
  }

  /**
   * Aceptación de invitación: el artista establece su contraseña por primera vez.
   */
  async aceptarInvitacion(
    dto: AcceptInvitationDto,
    ipOrigen?: string,
    userAgent?: string,
  ): Promise<AuthTokensResponse> {
    const tokenHash = this.hashToken(dto.token);

    const invitacion = await (this.prisma as any).invitacionActivacion.findUnique({
      where: { tokenHash },
      include: { usuario: true },
    });

    if (!invitacion) {
      throw new BadRequestException('Token de invitación inválido o no reconocido');
    }

    if (invitacion.usadaEn !== null) {
      throw new BadRequestException('Este enlace de invitación ya ha sido utilizado previamente');
    }

    if (new Date() > new Date(invitacion.expiraEn)) {
      throw new BadRequestException('El enlace de invitación ha expirado. Solicita uno nuevo al administrador.');
    }

    // Hashear la contraseña con Argon2id
    const hashPassword = await this.hashPassword(dto.password);

    // Actualizar usuario y marcar invitación como usada en una transacción
    await (this.prisma as any).$transaction([
      (this.prisma as any).usuario.update({
        where: { id: invitacion.usuarioId },
        data: {
          hashPassword,
          activo: true,
        },
      }),
      (this.prisma as any).invitacionActivacion.update({
        where: { id: invitacion.id },
        data: { usadaEn: new Date() },
      }),
    ]);

    await this.registrarAuditoria(
      invitacion.usuarioId,
      TipoEventoAuditoria.INVITACION_ACTIVADA,
      'Cuenta activada exitosamente y contraseña establecida con Argon2id',
      ipOrigen,
      userAgent,
    );

    // Autenticar de inmediato al usuario tras activar
    return this.generarTokens(invitacion.usuario, ipOrigen);
  }

  /**
   * Renovación de token de acceso con rotación segura de refresh token.
   */
  async refrescarToken(
    dto: RefreshTokenDto,
    ipOrigen?: string,
    userAgent?: string,
  ): Promise<AuthTokensResponse> {
    const tokenHash = this.hashToken(dto.refreshToken);

    const record = await (this.prisma as any).refreshToken.findUnique({
      where: { tokenHash },
      include: { usuario: true },
    });

    if (!record || record.revocadoEn !== null || new Date() > new Date(record.expiraEn)) {
      throw new UnauthorizedException('Refresh token inválido, expirado o revocado');
    }

    if (!record.usuario || !record.usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Revocar el token usado inmediatamente (Rotación de refresh tokens)
    await (this.prisma as any).refreshToken.update({
      where: { id: record.id },
      data: { revocadoEn: new Date() },
    });

    const nuevosTokens = await this.generarTokens(record.usuario, ipOrigen);

    await this.registrarAuditoria(
      record.usuario.id,
      TipoEventoAuditoria.TOKEN_REFRESH,
      'Sesión renovada con rotación de refresh token',
      ipOrigen,
      userAgent,
    );

    return nuevosTokens;
  }

  /**
   * Cierre de sesión: revoca el refresh token y registra la auditoría.
   */
  async logout(
    usuarioId: number,
    refreshToken?: string,
    ipOrigen?: string,
    userAgent?: string,
  ): Promise<{ mensaje: string }> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await (this.prisma as any).refreshToken.updateMany({
        where: { tokenHash, usuarioId },
        data: { revocadoEn: new Date() },
      });
    }

    await this.registrarAuditoria(
      usuarioId,
      TipoEventoAuditoria.LOGOUT,
      'Cierre de sesión',
      ipOrigen,
      userAgent,
    );

    return { mensaje: 'Sesión finalizada exitosamente' };
  }

  /**
   * Obtiene la información del perfil del usuario actual junto con su artista asignado.
   */
  async getPerfil(usuarioId: number): Promise<any> {
    const usuario = await (this.prisma as any).usuario.findUnique({
      where: { id: usuarioId },
      include: {
        artista: {
          include: {
            sello: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      esAdmin: usuario.esAdmin,
      activo: usuario.activo,
      mfaHabilitado: usuario.mfaHabilitado,
      artistaId: usuario.artistaId,
      artista: usuario.artista
        ? {
            id: usuario.artista.id,
            nombre: usuario.artista.nombre,
            sello: usuario.artista.sello
              ? {
                  id: usuario.artista.sello.id,
                  nombre: usuario.artista.sello.nombre,
                }
              : null,
          }
        : null,
      creadoEn: usuario.creadoEn,
    };
  }
}
