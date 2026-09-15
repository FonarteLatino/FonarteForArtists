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
});
