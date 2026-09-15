import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Ip,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  CreateSelloDto,
  CreateArtistaDto,
  CreateCatalogoItemDto,
  CreateConcesionDto,
  UpdateUsuarioStatusDto,
} from './dto/admin.dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireAdmin } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireAdmin()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Sellos
  @Get('sellos')
  async getSellos() {
    return this.adminService.getSellos();
  }

  @Post('sellos')
  async createSello(
    @Body() dto: CreateSelloDto,
    @CurrentUser('id') adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.createSello(dto, adminId, ip);
  }

  @Delete('sellos/:id')
  async deleteSello(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.deleteSello(id, adminId, ip);
  }

  // Artistas
  @Get('artistas')
  async getArtistas() {
    return this.adminService.getArtistas();
  }

  @Post('artistas')
  async createArtista(
    @Body() dto: CreateArtistaDto,
    @CurrentUser('id') adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.createArtista(dto, adminId, ip);
  }

  // Catálogo
  @Get('catalogo')
  async getCatalogo(@Query('artistaId') artistaId?: string) {
    const id = artistaId ? parseInt(artistaId, 10) : undefined;
    return this.adminService.getCatalogo(id);
  }

  @Post('catalogo')
  async createCatalogoItem(
    @Body() dto: CreateCatalogoItemDto,
    @CurrentUser('id') adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.createCatalogoItem(dto, adminId, ip);
  }

  // Usuarios
  @Get('usuarios')
  async getUsuarios() {
    return this.adminService.getUsuarios();
  }

  @Patch('usuarios/:id/status')
  async updateUsuarioStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioStatusDto,
    @CurrentUser('id') adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.updateUsuarioStatus(id, dto, adminId, ip);
  }

  // Concesiones de Permisos
  @Get('concesiones')
  async getConcesiones(@Query('usuarioId') usuarioId?: string) {
    const id = usuarioId ? parseInt(usuarioId, 10) : undefined;
    return this.adminService.getConcesiones(id);
  }

  @Post('concesiones')
  async otorgarConcesion(
    @Body() dto: CreateConcesionDto,
    @CurrentUser('id') adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.otorgarConcesion(dto, adminId, ip);
  }

  @Delete('concesiones/:id')
  async revocarConcesion(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.revocarConcesion(id, adminId, ip);
  }
}
