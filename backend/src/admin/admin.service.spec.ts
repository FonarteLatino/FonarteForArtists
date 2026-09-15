import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

describe('AdminService — Pruebas Unitarias', () => {
  let service: AdminService;
  let mockPrisma: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockPrisma = {
      sello: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      artista: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
      },
      entidadCatalogo: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      usuario: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      concesionAcceso: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    mockAuthService = {
      registrarAuditoria: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  describe('Sellos', () => {
    it('debe impedir eliminar un sello si tiene artistas asociados', async () => {
      mockPrisma.artista.count.mockResolvedValue(3); // tiene 3 artistas

      await expect(service.deleteSello(1, 99)).rejects.toThrow(BadRequestException);
    });

    it('debe permitir eliminar un sello si no tiene artistas asociados', async () => {
      mockPrisma.artista.count.mockResolvedValue(0);
      mockPrisma.sello.delete.mockResolvedValue({ id: 2, nombre: 'Sello Vacio' });

      const res = await service.deleteSello(2, 99);
      expect(res.id).toBe(2);
      expect(mockAuthService.registrarAuditoria).toHaveBeenCalled();
    });
  });

  describe('Concesiones de Acceso', () => {
    it('debe revocar concesiones previas idénticas y crear la nueva concesión', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue({ id: 10, email: 'artista@fonarte.com' });
      mockPrisma.concesionAcceso.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.concesionAcceso.create.mockResolvedValue({
        id: 50,
        usuarioId: 10,
        tipoEntidad: 'ARTISTA',
        entidadId: 5,
        efecto: 'ALLOW',
      });

      const res = await service.otorgarConcesion(
        {
          usuarioId: 10,
          tipoEntidad: 'ARTISTA',
          entidadId: 5,
          efecto: 'ALLOW',
        },
        1,
      );

      expect(res.id).toBe(50);
      expect(mockPrisma.concesionAcceso.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            usuarioId: 10,
            tipoEntidad: 'ARTISTA',
            entidadId: 5,
            revocadoEn: null,
          }),
        }),
      );
      expect(mockAuthService.registrarAuditoria).toHaveBeenCalled();
    });

    it('debe revocar una concesión existente', async () => {
      mockPrisma.concesionAcceso.findUnique.mockResolvedValue({
        id: 15,
        tipoEntidad: 'CANCION',
        entidadId: 100,
        usuario: { email: 'artista@fonarte.com' },
      });
      mockPrisma.concesionAcceso.update.mockResolvedValue({
        id: 15,
        revocadoEn: new Date(),
      });

      const res = await service.revocarConcesion(15, 1);

      expect(res.id).toBe(15);
      expect(mockAuthService.registrarAuditoria).toHaveBeenCalled();
    });
  });
});
