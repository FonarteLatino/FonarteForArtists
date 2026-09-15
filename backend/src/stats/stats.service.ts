import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { PrismaService } from '../prisma/prisma.service';
import { Fonarte2DatabaseService } from './fonarte2.service';
import { PermissionsService } from '../permissions/permissions.service';
import { TipoEntidadPermiso, EfectoPermiso } from '../permissions/permissions.types';
import { StatsFiltroDto } from './dto/stats-filtro.dto';
import {
  ResumenKpiDto,
  StreamCancionDto,
  StreamPlataformaDto,
  StreamPaisDto,
  TendenciaMensualDto,
  CatalogoItemDto,
} from './dto/stats-responses.dto';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fonarte2Db: Fonarte2DatabaseService,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Obtiene la lista de referencias ISRC/UPC del catálogo del artista,
   * excluyendo aquellas que tengan una concesión DENY explícita para este usuario.
   */
  private async obtenerReferenciasAutorizadas(
    artistaId: number,
    usuarioId: number,
  ): Promise<{ isrcsPermitidos: string[]; deniedIsrcs: string[] }> {
    // 1. Obtener todas las entidades registradas para este artista
    const catalogo = await (this.prisma as any).entidadCatalogo.findMany({
      where: { artistaId },
    });

    if (catalogo.length === 0) {
      return { isrcsPermitidos: [], deniedIsrcs: [] };
    }

    // 2. Buscar si el usuario tiene concesiones DENY explícitas en canciones/álbumes individuales
    const denies = await (this.prisma as any).concesionAcceso.findMany({
      where: {
        usuarioId,
        efecto: EfectoPermiso.DENY,
        revocadoEn: null,
      },
    });

    const deniedEntidadIds = new Set(denies.map((d: any) => d.entidadId));
    const deniedIsrcs: string[] = [];
    const permitidos: string[] = [];

    for (const item of catalogo) {
      if (deniedEntidadIds.has(item.id)) {
        deniedIsrcs.push(item.referenciaIdFonarte2);
      } else {
        permitidos.push(item.referenciaIdFonarte2);
      }
    }

    return { isrcsPermitidos: permitidos, deniedIsrcs };
  }

  /**
   * Obtiene el resumen de indicadores clave (KPI) para las tarjetas del dashboard.
   */
  async getKpi(artistaId: number, usuarioId: number): Promise<ResumenKpiDto> {
    const artista = await (this.prisma as any).artista.findUnique({
      where: { id: artistaId },
      include: { sello: true },
    });

    if (!artista) {
      throw new NotFoundException(`Artista con ID ${artistaId} no encontrado`);
    }

    // Consultar vista vw_stats_resumen_artista en fonarte2
    const query = `
      SELECT
        [artista],
        [sello],
        [plataforma],
        [periodo],
        [streams_totales]
      FROM [dbo].[vw_stats_resumen_artista]
      WHERE [artista] = @artistaNombre
    `;

    const records = await this.fonarte2Db.query<{
      artista: string;
      sello: string;
      plataforma: string;
      periodo: string;
      streams_totales: number;
    }>(query, {
      artistaNombre: { type: sql.NVarChar(500), value: artista.nombre },
    });

    // Calcular métricas
    let totalStreams = 0;
    let streamsPeriodoActual = 0;
    const plataformasSet = new Set<string>();
    const streamsPorPlataforma: Record<string, number> = {};

    // Obtener periodo más reciente
    const periodos = records.map((r) => r.periodo).sort();
    const ultimoPeriodo = periodos.length > 0 ? periodos[periodos.length - 1] : null;

    for (const r of records) {
      const cant = Number(r.streams_totales) || 0;
      totalStreams += cant;
      plataformasSet.add(r.plataforma);

      streamsPorPlataforma[r.plataforma] = (streamsPorPlataforma[r.plataforma] || 0) + cant;

      if (ultimoPeriodo && r.periodo === ultimoPeriodo) {
        streamsPeriodoActual += cant;
      }
    }

    // Identificar top plataforma
    let topPlataforma: { nombre: string; streams: number } | null = null;
    let maxStreams = 0;
    for (const [nombre, streams] of Object.entries(streamsPorPlataforma)) {
      if (streams > maxStreams) {
        maxStreams = streams;
        topPlataforma = { nombre, streams };
      }
    }

    // Contar catálogo registrado
    const countCanciones = await (this.prisma as any).entidadCatalogo.count({
      where: { artistaId, tipo: 'CANCION' },
    });

    return {
      artistaId,
      artistaNombre: artista.nombre,
      selloNombre: artista.sello?.nombre,
      streamsTotales: totalStreams,
      streamsPeriodoActual,
      cancionesActivas: countCanciones,
      plataformasActivas: plataformasSet.size,
      topPlataforma,
    };
  }

  /**
   * Obtiene la lista de canciones con streams agregados, respetando exclusiones DENY.
   */
  async getStreamsPorCancion(
    artistaId: number,
    usuarioId: number,
    filtro: StatsFiltroDto,
  ): Promise<StreamCancionDto[]> {
    const artista = await (this.prisma as any).artista.findUnique({
      where: { id: artistaId },
    });

    if (!artista) {
      throw new NotFoundException(`Artista con ID ${artistaId} no encontrado`);
    }

    const { deniedIsrcs } = await this.obtenerReferenciasAutorizadas(artistaId, usuarioId);

    // Consulta contra vw_stats_streams_por_cancion unida con catálogo
    let query = `
      SELECT
        s.[ISRC] AS [isrc],
        c.[SONG] AS [titulo],
        c.[ALBUM] AS [album],
        c.[ARTIST] AS [artista],
        s.[Retailer] AS [plataforma],
        s.[Year_Month] AS [periodo],
        s.[Country_Sale] AS [pais],
        SUM(s.[streams]) AS [streams]
      FROM [dbo].[vw_stats_streams_por_cancion] s
      INNER JOIN [dbo].[vw_stats_catalogo_canciones] c
        ON s.[ISRC] = c.[ISRC]
      WHERE c.[ARTIST] = @artistaNombre
    `;

    const params: Record<string, { type: sql.ISqlType; value: any }> = {
      artistaNombre: { type: sql.NVarChar(500), value: artista.nombre },
    };

    if (filtro.periodoInicio) {
      query += ` AND s.[Year_Month] >= @periodoInicio`;
      params.periodoInicio = { type: sql.VarChar(10), value: filtro.periodoInicio };
    }

    if (filtro.periodoFin) {
      query += ` AND s.[Year_Month] <= @periodoFin`;
      params.periodoFin = { type: sql.VarChar(10), value: filtro.periodoFin };
    }

    if (filtro.plataforma) {
      query += ` AND s.[Retailer] = @plataforma`;
      params.plataforma = { type: sql.NVarChar(100), value: filtro.plataforma };
    }

    // Exclusión explícita de ISRCs denegados
    if (deniedIsrcs.length > 0) {
      const deniedList = deniedIsrcs.map((_, i) => `@denied${i}`).join(',');
      query += ` AND s.[ISRC] NOT IN (${deniedList})`;
      deniedIsrcs.forEach((isrc, i) => {
        params[`denied${i}`] = { type: sql.VarChar(50), value: isrc };
      });
    }

    query += `
      GROUP BY
        s.[ISRC],
        c.[SONG],
        c.[ALBUM],
        c.[ARTIST],
        s.[Retailer],
        s.[Year_Month],
        s.[Country_Sale]
      ORDER BY [streams] DESC
    `;

    const records = await this.fonarte2Db.query<{
      isrc: string;
      titulo: string;
      album: string;
      artista: string;
      plataforma: string;
      periodo: string;
      pais: string;
      streams: number;
    }>(query, params);

    return records.map((r) => ({
      isrc: r.isrc,
      titulo: r.titulo,
      album: r.album,
      artista: r.artista,
      plataforma: r.plataforma,
      periodo: r.periodo,
      pais: r.pais,
      streams: Number(r.streams) || 0,
    }));
  }

  /**
   * Obtiene la distribución de streams por plataforma (para gráficas de donut/barras).
   */
  async getStreamsPorPlataforma(
    artistaId: number,
    usuarioId: number,
    filtro: StatsFiltroDto,
  ): Promise<StreamPlataformaDto[]> {
    const canciones = await this.getStreamsPorCancion(artistaId, usuarioId, filtro);

    const plataformaTotales: Record<string, number> = {};
    let totalGeneral = 0;

    for (const c of canciones) {
      const plat = c.plataforma || 'Desconocida';
      plataformaTotales[plat] = (plataformaTotales[plat] || 0) + c.streams;
      totalGeneral += c.streams;
    }

    const resultado: StreamPlataformaDto[] = [];
    for (const [plataforma, streamsTotales] of Object.entries(plataformaTotales)) {
      const porcentaje = totalGeneral > 0 ? (streamsTotales / totalGeneral) * 100 : 0;
      resultado.push({
        plataforma,
        streamsTotales,
        porcentaje: Math.round(porcentaje * 100) / 100,
      });
    }

    return resultado.sort((a, b) => b.streamsTotales - a.streamsTotales);
  }

  /**
   * Obtiene la distribución de streams por país para el mapa geográfico.
   */
  async getStreamsPorPais(
    artistaId: number,
    usuarioId: number,
    filtro: StatsFiltroDto,
  ): Promise<StreamPaisDto[]> {
    const canciones = await this.getStreamsPorCancion(artistaId, usuarioId, filtro);

    const paisTotales: Record<string, number> = {};
    let totalGeneral = 0;

    for (const c of canciones) {
      if (!c.pais) continue;
      const pais = c.pais.toUpperCase().trim();
      paisTotales[pais] = (paisTotales[pais] || 0) + c.streams;
      totalGeneral += c.streams;
    }

    const resultado: StreamPaisDto[] = [];
    for (const [codigoPais, streamsTotales] of Object.entries(paisTotales)) {
      const porcentaje = totalGeneral > 0 ? (streamsTotales / totalGeneral) * 100 : 0;
      resultado.push({
        codigoPais,
        streamsTotales,
        porcentaje: Math.round(porcentaje * 100) / 100,
      });
    }

    return resultado.sort((a, b) => b.streamsTotales - a.streamsTotales);
  }

  /**
   * Obtiene la tendencia mensual de streams para gráficas de serie de tiempo.
   */
  async getTendenciaMensual(
    artistaId: number,
    usuarioId: number,
    filtro: StatsFiltroDto,
  ): Promise<TendenciaMensualDto[]> {
    const canciones = await this.getStreamsPorCancion(artistaId, usuarioId, filtro);

    const porPeriodo: Record<string, { streams: number; plataformas: Record<string, number> }> = {};

    for (const c of canciones) {
      if (!c.periodo) continue;
      if (!porPeriodo[c.periodo]) {
        porPeriodo[c.periodo] = { streams: 0, plataformas: {} };
      }
      porPeriodo[c.periodo].streams += c.streams;

      if (c.plataforma) {
        porPeriodo[c.periodo].plataformas[c.plataforma] =
          (porPeriodo[c.periodo].plataformas[c.plataforma] || 0) + c.streams;
      }
    }

    const periodosOrdenados = Object.keys(porPeriodo).sort();

    return periodosOrdenados.map((periodo) => ({
      periodo,
      streams: porPeriodo[periodo].streams,
      plataformas: porPeriodo[periodo].plataformas,
    }));
  }

  /**
   * Consulta el catálogo de entidades del artista registrado en el portal.
   */
  async getCatalogo(artistaId: number, usuarioId: number): Promise<CatalogoItemDto[]> {
    const artista = await (this.prisma as any).artista.findUnique({
      where: { id: artistaId },
    });

    if (!artista) {
      throw new NotFoundException(`Artista con ID ${artistaId} no encontrado`);
    }

    const catalogo = await (this.prisma as any).entidadCatalogo.findMany({
      where: { artistaId },
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });

    return catalogo.map((item: any) => ({
      id: item.id,
      tipo: item.tipo,
      referenciaId: item.referenciaIdFonarte2,
      nombre: item.nombre || item.referenciaIdFonarte2,
      artistaNombre: artista.nombre,
    }));
  }
}
