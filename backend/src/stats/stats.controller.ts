import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsFiltroDto } from './dto/stats-filtro.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequireAccess } from '../permissions/permissions.decorator';
import { TipoEntidadPermiso } from '../permissions/permissions.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('stats')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * Resumen de indicadores clave (KPI) para el artista solicitado.
   */
  @Get('kpi/:artistaId')
  @RequireAccess(TipoEntidadPermiso.ARTISTA, 'artistaId')
  async getKpi(
    @Param('artistaId', ParseIntPipe) artistaId: number,
    @CurrentUser('id') usuarioId: number,
  ) {
    return this.statsService.getKpi(artistaId, usuarioId);
  }

  /**
   * Desglose de streams por canción para el artista solicitado.
   */
  @Get('canciones/:artistaId')
  @RequireAccess(TipoEntidadPermiso.ARTISTA, 'artistaId')
  async getStreamsPorCancion(
    @Param('artistaId', ParseIntPipe) artistaId: number,
    @CurrentUser('id') usuarioId: number,
    @Query() filtro: StatsFiltroDto,
  ) {
    return this.statsService.getStreamsPorCancion(artistaId, usuarioId, filtro);
  }

  /**
   * Distribución de streams por plataforma para el artista solicitado.
   */
  @Get('plataformas/:artistaId')
  @RequireAccess(TipoEntidadPermiso.ARTISTA, 'artistaId')
  async getStreamsPorPlataforma(
    @Param('artistaId', ParseIntPipe) artistaId: number,
    @CurrentUser('id') usuarioId: number,
    @Query() filtro: StatsFiltroDto,
  ) {
    return this.statsService.getStreamsPorPlataforma(artistaId, usuarioId, filtro);
  }

  /**
   * Distribución geográfica de streams por país (para el mapa).
   */
  @Get('paises/:artistaId')
  @RequireAccess(TipoEntidadPermiso.ARTISTA, 'artistaId')
  async getStreamsPorPais(
    @Param('artistaId', ParseIntPipe) artistaId: number,
    @CurrentUser('id') usuarioId: number,
    @Query() filtro: StatsFiltroDto,
  ) {
    return this.statsService.getStreamsPorPais(artistaId, usuarioId, filtro);
  }

  /**
   * Tendencia mensual de streams (serie de tiempo).
   */
  @Get('tendencia/:artistaId')
  @RequireAccess(TipoEntidadPermiso.ARTISTA, 'artistaId')
  async getTendenciaMensual(
    @Param('artistaId', ParseIntPipe) artistaId: number,
    @CurrentUser('id') usuarioId: number,
    @Query() filtro: StatsFiltroDto,
  ) {
    return this.statsService.getTendenciaMensual(artistaId, usuarioId, filtro);
  }

  /**
   * Catálogo de entidades registradas para este artista.
   */
  @Get('catalogo/:artistaId')
  @RequireAccess(TipoEntidadPermiso.ARTISTA, 'artistaId')
  async getCatalogo(
    @Param('artistaId', ParseIntPipe) artistaId: number,
    @CurrentUser('id') usuarioId: number,
  ) {
    return this.statsService.getCatalogo(artistaId, usuarioId);
  }
}
