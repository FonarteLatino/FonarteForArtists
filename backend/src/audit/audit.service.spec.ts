import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditService — Pruebas Unitarias', () => {
  let service: AuditService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      auditoriaAcceso: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      usuario: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  describe('getLogs', () => {
    it('debe retornar registros paginados con total de páginas', async () => {
      mockPrisma.auditoriaAcceso.count.mockResolvedValue(105);
      mockPrisma.auditoriaAcceso.findMany.mockResolvedValue([
        { id: 1, evento: 'LOGIN_OK', fecha: new Date() },
      ]);

      const result = await service.getLogs({ page: 1, limit: 10 });

      expect(result.total).toBe(105);
      expect(result.totalPages).toBe(11);
      expect(result.logs).toHaveLength(1);
      expect(mockPrisma.auditoriaAcceso.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });
  });

  describe('getStats', () => {
    it('debe calcular métricas de seguridad de las últimas 24 horas', async () => {
      mockPrisma.auditoriaAcceso.count
        .mockResolvedValueOnce(50) // LOGIN_OK
        .mockResolvedValueOnce(2)  // LOGIN_FAIL
        .mockResolvedValueOnce(5); // PERMISOS
      mockPrisma.usuario.count.mockResolvedValue(25);

      const stats = await service.getStats();

      expect(stats.ultimas24Horas.loginsExitosos).toBe(50);
      expect(stats.ultimas24Horas.loginsFallidos).toBe(2);
      expect(stats.ultimas24Horas.permisosModificados).toBe(5);
      expect(stats.usuariosActivos).toBe(25);
    });
  });
});
