import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Ip,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RequireAdmin } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Inicio de sesión para usuarios y administradores.
   * Sin autoregistro.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(loginDto, ip, userAgent);
  }

  /**
   * Renovación de token de acceso mediante refresh token con rotación.
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.refrescarToken(refreshTokenDto, ip, userAgent);
  }

  /**
   * Cierre de sesión y revocación del refresh token.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') usuarioId: number,
    @Body() body: { refreshToken?: string },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.logout(usuarioId, body?.refreshToken, ip, userAgent);
  }

  /**
   * Provisión de cuenta por el Administrador.
   * Genera un enlace/token de activación de un solo uso.
   */
  @Post('invitations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireAdmin()
  @HttpCode(HttpStatus.CREATED)
  async createInvitation(
    @CurrentUser() adminUser: AuthenticatedUser,
    @Body() createInvitationDto: CreateInvitationDto,
    @Ip() ip: string,
  ) {
    return this.authService.crearInvitacion(adminUser, createInvitationDto, ip);
  }

  /**
   * Activación de cuenta por el artista: establece su propia contraseña.
   */
  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.aceptarInvitacion(acceptInvitationDto, ip, userAgent);
  }

  /**
   * Obtiene la identidad y el perfil del usuario autenticado.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('id') usuarioId: number) {
    return this.authService.getPerfil(usuarioId);
  }
}
