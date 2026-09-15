import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';
import { Fonarte2DatabaseService } from './fonarte2.service';
import { PermissionsService } from '../permissions/permissions.service';
import { EfectoPermiso } from '../permissions/permissions.types';

describe('StatsService — Pruebas Unitarias', () => {
  let service: StatsService;
  let mockPrisma: any;
  let mockFonarte2Db: any;
  let mockPermissionsService: any;

  beforeEach(async () => {
    mockPrisma = {
      artista: {
        findUnique: jest.fn(),
      },
      entidadCatalogo: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      concesionAcceso: {
        findMany: jest.fn(),
      },
    };

    mockFonarte2Db = {
      query: jest.fn(),
    };

    mockPermissionsService = {
      resolverPermiso: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: Fonarte2DatabaseService, useValue: mockFonarte2Db },
        { provide: PermissionsService, useValue: mockPermissionsService },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    jest.clearAllMocks();
  });

  describe('getKpi', () => {
    it('debe devolver métricas KPI sin ninguna columna financiera', async () => {
      mockPrisma.artista.findUnique.mockResolvedValue({
        id: 5,
        nombre: 'Oscar Chavez',
        sello: { nombre: 'Fonarte Latino' },
      });

      mockFonarte2Db.query.mockResolvedValue([
        {
          artista: 'Oscar Chavez',
          sello: 'Fonarte Latino',
          plataforma: 'Spotify',
          periodo: '2024-01',
          streams_totales: 15000,
        },
        {
          artista: 'Oscar Chavez',
          sello: 'Fonarte Latino',
          plataforma: 'Apple Music',
          periodo: '2024-01',
          streams_totales: 5000,
        },
      ]);

      mockPrisma.entidadCatalogo.count.mockResolvedValue(12);

      const kpi = await service.getKpi(5, 1);

      expect(kpi.artistaId).toBe(5);
      expect(kpi.streamsTotales).toBe(20000);
      expect(kpi.plataformasActivas).toBe(2);
      expect(kpi.topPlataforma?.nombre).toBe('Spotify');
      expect(kpi.topPlataforma?.streams).toBe(15000);

      // Verificación estricta de defensa en profundidad: NO existen propiedades monetarias
      expect((kpi as any).regalias).toBeUndefined();
      expect((kpi as any).monto).toBeUndefined();
      expect((kpi as any).pago).toBeUndefined();
      expect((kpi as any).net_royalty).toBeUndefined();
    });
  });

  describe('getStreamsPorCancion con exclusiones DENY', () => {
    it('debe filtrar canciones que tienen DENY explícito para el usuario', async () => {
      mockPrisma.artista.findUnique.mockResolvedValue({
        id: 10,
        nombre: 'Guadalupe Pineda',
      });

      // Catálogo de 2 canciones
      mockPrisma.entidadCatalogo.findMany.mockResolvedValue([
        { id: 101, referenciaIdFonarte2: 'MXA010100001' },
        { id: 102, referenciaIdFonarte2: 'MXA010100002' },
      ]);

      // Usuario tiene DENY sobre la canción 102
      mockPrisma.concesionAcceso.findMany.mockResolvedValue([
        {
          id: 1,
          usuarioId: 2,
          entidadId: 102,
          efecto: EfectoPermiso.DENY,
          revocadoEn: null,
        },
      ]);

      mockFonarte2Db.query.mockResolvedValue([
        {
          isrc: 'MXA010100001',
          titulo: 'Yolanda',
          album: 'Grandes Exitos',
          artista: 'Guadalupe Pineda',
          plataforma: 'Spotify',
          periodo: '2024-01',
          pais: 'MEX',
          streams: 8500,
        },
      ]);

      const result = await service.getStreamsPorCancion(10, 2, {});

      expect(result).toHaveLength(1);
      expect(result[0].isrc).toBe('MXA010100001');
      expect(result[0].streams).toBe(8500);

      // Verificación de query SQL: debe haber incluido el parámetro de exclusión
      const queryLlamada = mockFonarte2Db.query.mock.calls[0][0];
      expect(queryLlamada).toContain('NOT IN');

      // Verificación de que no hay campos de dinero
      for (const item of result) {
        expect((item as any).monto).toBeUndefined();
        expect((item as any).regalias).toBeUndefined();
        expect((item as any).net_royalty).toBeUndefined();
      }
    });
  });

  describe('getStreamsPorPlataforma', () => {
    it('debe calcular los porcentajes de cada plataforma correctamente', async () => {
      mockPrisma.artista.findUnique.mockResolvedValue({ id: 1, nombre: 'Test Artista' });
      mockPrisma.entidadCatalogo.findMany.mockResolvedValue([]);
      mockPrisma.concesionAcceso.findMany.mockResolvedValue([]);

      mockFonarte2Db.query.mockResolvedValue([
        { isrc: '1', titulo: 'A', artista: 'Test Artista', plataforma: 'Spotify', streams: 75 },
        { isrc: '2', titulo: 'B', artista: 'Test Artista', plataforma: 'Apple Music', streams: 25 },
      ]);

      const plataformas = await service.getStreamsPorPlataforma(1, 1, {});

      expect(plataformas).toHaveLength(2);
      expect(plataformas[0].plataforma).toBe('Spotify');
      expect(plataformas[0].porcentaje).toBe(75);
      expect(plataformas[1].plataforma).toBe('Apple Music');
      expect(plataformas[1].porcentaje).toBe(25);
    });
  });

  // ---------------------------------------------------------------------------
  // Regresión: las columnas del SELECT deben existir en las vistas de la Fase 1.
  //
  // Las vistas exponen TRACK_NAME y ALBUM_NAME. Una versión anterior consultaba
  // `c.[SONG]` y `c.[ALBUM]`, que no existen en vw_stats_catalogo_canciones: en
  // SQL Server real eso produce "Invalid column name" y dejaba el portal sin
  // datos. Estas pruebas fallan si alguien vuelve a introducir esas columnas.
  // ---------------------------------------------------------------------------
  describe('Contrato SQL con las vistas de la Fase 1 (regresión)', () => {
    beforeEach(() => {
      mockPrisma.artista.findUnique.mockResolvedValue({ id: 1, nombre: 'Test Artista' });
      mockPrisma.entidadCatalogo.findMany.mockResolvedValue([]);
      mockPrisma.concesionAcceso.findMany.mockResolvedValue([]);
      mockFonarte2Db.query.mockResolvedValue([]);
    });

    it('debe consultar TRACK_NAME y ALBUM_NAME, no columnas inexistentes', async () => {
      await service.getStreamsPorCancion(1, 1, {});

      const sql = mockFonarte2Db.query.mock.calls[0][0] as string;

      // Columnas reales de vw_stats_catalogo_canciones
      expect(sql).toContain('c.[TRACK_NAME]');
      expect(sql).toContain('c.[ALBUM_NAME]');
      // El nombre del álbum sirve de título de respaldo (los álbumes no tienen TRACK_NAME)
      expect(sql).toContain('COALESCE');

      // Columnas que NO existen en la vista
      expect(sql).not.toContain('c.[SONG]');
      expect(sql).not.toContain('c.[ALBUM]');
      expect(sql).not.toMatch(/c\.\[ALBUM\]\s+AS/i);
    });

    it('debe consultar solo las vistas y tablas permitidas de fonarte2', async () => {
      await service.getStreamsPorCancion(1, 1, {});

      const sql = mockFonarte2Db.query.mock.calls[0][0] as string;

      expect(sql).toContain('[dbo].[vw_stats_streams_por_cancion]');
      expect(sql).toContain('[dbo].[vw_stats_catalogo_canciones]');

      // Nunca debe tocar las tablas base que contienen columnas monetarias
      for (const tablaProhibida of [
        'APPLEMUSIC',
        'ITUNES',
        'ORCHARD',
        '000_Client_Dashboard_Total',
      ]) {
        expect(sql).not.toContain(tablaProhibida);
      }
      expect(sql).not.toMatch(/Net_Royalty|Partner_Share|Label_Share/i);
    });

    it('debe aplicar el filtro de país cuando se solicita', async () => {
      await service.getStreamsPorCancion(1, 1, { pais: 'MEX' });

      const sql = mockFonarte2Db.query.mock.calls[0][0] as string;
      const params = mockFonarte2Db.query.mock.calls[0][1];

      expect(sql).toContain('s.[Country_Sale] = @pais');
      expect(params.pais.value).toBe('MEX');
    });

    it('debe aplicar los filtros de período y plataforma', async () => {
      await service.getStreamsPorCancion(1, 1, {
        periodoInicio: '2024-01',
        periodoFin: '2024-06',
        plataforma: 'Spotify',
      });

      const sql = mockFonarte2Db.query.mock.calls[0][0] as string;
      const params = mockFonarte2Db.query.mock.calls[0][1];

      expect(sql).toContain('s.[Year_Month] >= @periodoInicio');
      expect(sql).toContain('s.[Year_Month] <= @periodoFin');
      expect(sql).toContain('s.[Retailer] = @plataforma');
      expect(params.periodoInicio.value).toBe('2024-01');
      expect(params.periodoFin.value).toBe('2024-06');
      expect(params.plataforma.value).toBe('Spotify');
    });
  });
});
