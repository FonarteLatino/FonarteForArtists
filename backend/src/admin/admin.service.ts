import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { TipoEventoAuditoria } from '../auth/auth.types';
import {
  CreateSelloDto,
  CreateArtistaDto,
  CreateCatalogoItemDto,
  CreateConcesionDto,
  UpdateUsuarioStatusDto,
} from './dto/admin.dtos';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  // ===========================================================================
  // SELLOS
  // ===========================================================================
  async getSellos() {
    return (this.prisma as any).sello.findMany({
      include: {
        _count: { select: { artistas: true } },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async createSello(dto: CreateSelloDto, adminId: number, ip?: string) {
    const sello = await (this.prisma as any).sello.create({
      data: { nombre: dto.nombre.trim() },
    });
    await this.authService.registrarAuditoria(
      adminId,
      TipoEventoAuditoria.DATOS_CONSULTADOS,
      `Sello creado: ${sello.nombre} (ID: ${sello.id})`,
      ip,
    );
    return sello;
  }

  async deleteSello(id: number, adminId: number, ip?: string) {
    const countArtistas = await (this.prisma as any).artista.count({ where: { selloId: id } });
    if (countArtistas > 0) {
      throw new BadRequestException(
        'No se puede eliminar un sello con artistas asignados. Reasigna o elimina los artistas primero.',
      );
    }
    const res = await (this.prisma as any).sello.delete({ where: { id } });
    await this.authService.registrarAuditoria(
      adminId,
      TipoEventoAuditoria.DATOS_CONSULTADOS,
      `Sello eliminado ID: ${id}`,
      ip,
    );
    return res;
  }

  // ===========================================================================
  // ARTISTAS
  // ===========================================================================
  async getArtistas() {
    return (this.prisma as any).artista.findMany({
      include: {
        sello: true,
        _count: {
          select: {
            usuarios: true,
            entidades: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async createArtista(dto: CreateArtistaDto, adminId: number, ip?: string) {
    const sello = await (this.prisma as any).sello.findUnique({ where: { id: dto.selloId } });
    if (!sello) {
      throw new NotFoundException(`Sello con ID ${dto.selloId} no encontrado`);
    }

    const artista = await (this.prisma as any).artista.create({
      data: {
        nombre: dto.nombre.trim(),
        selloId: dto.selloId,
      },
      include: { sello: true },
    });

    await this.authService.registrarAuditoria(
      adminId,
      TipoEventoAuditoria.DATOS_CONSULTADOS,
      `Artista creado: ${artista.nombre} bajo sello ${sello.nombre}`,
      ip,
    );
    return artista;
  }

  // ===========================================================================
  // CATÁLOGO
  // ===========================================================================
  async getCatalogo(artistaId?: number) {
    const where = artistaId ? { artistaId } : {};
    return (this.prisma as any).entidadCatalogo.findMany({
      where,
      include: { artista: true },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async createCatalogoItem(dto: CreateCatalogoItemDto, adminId: number, ip?: string) {
    const artista = await (this.prisma as any).artista.findUnique({ where: { id: dto.artistaId } });
    if (!artista) {
      throw new NotFoundException(`Artista con ID ${dto.artistaId} no encontrado`);
    }

    const item = await (this.prisma as any).entidadCatalogo.create({
      data: {
        artistaId: dto.artistaId,
        tipo: dto.tipo,
        referenciaIdFonarte2: dto.referenciaIdFonarte2.trim(),
        nombre: dto.nombre?.trim() || null,
      },
    });

    await this.authService.registrarAuditoria(
      adminId,
      TipoEventoAuditoria.DATOS_CONSULTADOS,
      `Catálogo registrado: ${item.tipo} ${item.referenciaIdFonarte2} para artista ${artista.nombre}`,
      ip,
    );
    return item;
  }

  // ===========================================================================
  // USUARIOS
  // ===========================================================================
  async getUsuarios() {
    return (this.prisma as any).usuario.findMany({
      select: {
        id: 1,
        email: true,
        esAdmin: true,
        activo: true,
        mfaHabilitado: true,
        creadoEn: true,
        artista: {
          select: {
            id: true,
            nombre: true,
            sello: { select: { id: true, nombre: true } },
          },
        },
        invitaciones: {
          select: {
            id: true,
            expiraEn: true,
            usadaEn: true,
            creadoEn: true,
          },
          orderBy: { creadoEn: 'desc' },
          take: 1,
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async updateUsuarioStatus(id: number, dto: UpdateUsuarioStatusDto, adminId: number, ip?: string) {
    const usuario = await (this.prisma as any).usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const actualizado = await (this.prisma as any).usuario.update({
      where: { id },
      data: { activo: dto.activo },
    });

    await this.authService.registrarAuditoria(
      adminId,
      dto.activo ? TipoEventoAuditoria.CUENTA_CREADA : TipoEventoAuditoria.CUENTA_DESACTIVADA,
      `Estado de usuario ${usuario.email} modificado a ${dto.activo ? 'ACTIVO' : 'INACTIVO'}`,
      ip,
    );

    return actualizado;
  }

  // ===========================================================================
  // CONCESIONES DE ACCESO (Permisos)
  // ===========================================================================
  async getConcesiones(usuarioId?: number) {
    const where = usuarioId ? { usuarioId } : {};
    return (this.prisma as any).concesionAcceso.findMany({
      where,
      include: {
        usuario: { select: { id: true, email: true } },
        concedente: { select: { id: true, email: true } },
      },
      orderBy: { otorgadoEn: 'desc' },
    });
  }

  async otorgarConcesion(dto: CreateConcesionDto, adminId: number, ip?: string) {
    const usuario = await (this.prisma as any).usuario.findUnique({ where: { id: dto.usuarioId } });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${dto.usuarioId} no encontrado`);
    }

    // Revocar concesiones activas previas del mismo usuario, tipo y entidad para evitar duplicidad
    await (this.prisma as any).concesionAcceso.updateMany({
      where: {
        usuarioId: dto.usuarioId,
        tipoEntidad: dto.tipoEntidad,
        entidadId: dto.entidadId,
        revocadoEn: null,
      },
      data: { revocadoEn: new Date() },
    });

    const concesion = await (this.prisma as any).concesionAcceso.create({
      data: {
        usuarioId: dto.usuarioId,
        tipoEntidad: dto.tipoEntidad,
        entidadId: dto.entidadId,
        efecto: dto.efecto,
        otorgadoPor: adminId,
        otorgadoEn: new Date(),
      },
    });

    await this.authService.registrarAuditoria(
      adminId,
      TipoEventoAuditoria.PERMISO_OTORGADO,
      `Permiso ${dto.efecto} otorgado a usuario ${usuario.email} sobre ${dto.tipoEntidad}:${dto.entidadId}`,
      ip,
    );

    return concesion;
  }

  async revocarConcesion(id: number, adminId: number, ip?: string) {
    const concesion = await (this.prisma as any).concesionAcceso.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!concesion) {
      throw new NotFoundException(`Concesión con ID ${id} no encontrada`);
    }

    const revocada = await (this.prisma as any).concesionAcceso.update({
      where: { id },
      data: { revocadoEn: new Date() },
    });

    await this.authService.registrarAuditoria(
      adminId,
      TipoEventoAuditoria.PERMISO_REVOCADO,
      `Permiso ID ${id} revocado para usuario ${concesion.usuario.email} (${concesion.tipoEntidad}:${concesion.entidadId})`,
      ip,
    );

    return revocada;
  }
}
