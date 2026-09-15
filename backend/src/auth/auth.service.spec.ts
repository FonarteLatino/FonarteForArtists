import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { TipoEventoAuditoria } from './auth.types';
import * as argon2 from 'argon2';

describe('AuthService — Pruebas Unitarias', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockPrisma = {
      usuario: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      invitacionActivacion: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      auditoriaAcceso: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
      $transaction: jest.fn().mockImplementation((promises) => Promise.all(promises)),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => defaultValue || '15m'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debe autenticar exitosamente con credenciales válidas y registrar auditoría LOGIN_OK', async () => {
      const plainPassword = 'Password123!';
      const hashPassword = await argon2.hash(plainPassword);

      mockPrisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: 'artista@fonartelatino.com',
        hashPassword,
        activo: true,
        esAdmin: false,
        artistaId: 42,
      });

      mockPrisma.refreshToken.create.mockResolvedValue({ id: 1 });
      mockPrisma.auditoriaAcceso.create.mockResolvedValue({ id: 1 });

      const result = await service.login({
        email: 'artista@fonartelatino.com',
        password: plainPassword,
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.tokenType).toBe('Bearer');
      expect(mockPrisma.auditoriaAcceso.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            usuarioId: 1,
            evento: TipoEventoAuditoria.LOGIN_OK,
          }),
        }),
      );
    });

    it('debe lanzar UnauthorizedException y registrar LOGIN_FAIL si el usuario no existe', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'inexistente@fonarte.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.auditoriaAcceso.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            usuarioId: null,
            evento: TipoEventoAuditoria.LOGIN_FAIL,
          }),
        }),
      );
    });

    it('debe denegar acceso a cuentas inactivas', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue({
        id: 2,
        email: 'desactivado@fonarte.com',
        hashPassword: 'hash',
        activo: false,
      });

      await expect(
        service.login({ email: 'desactivado@fonarte.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe denegar acceso si la contraseña es incorrecta y registrar LOGIN_FAIL', async () => {
      const hashPassword = await argon2.hash('CorrectPassword1!');
      mockPrisma.usuario.findUnique.mockResolvedValue({
        id: 3,
        email: 'artista@fonarte.com',
        hashPassword,
        activo: true,
      });

      await expect(
        service.login({ email: 'artista@fonarte.com', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.auditoriaAcceso.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            usuarioId: 3,
            evento: TipoEventoAuditoria.LOGIN_FAIL,
          }),
        }),
      );
    });
  });

  describe('crearInvitacion (Flujo sin autoregistro)', () => {
    it('debe crear invitación criptográfica de un solo uso para nuevo artista', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);
      mockPrisma.usuario.create.mockResolvedValue({
        id: 10,
        email: 'nuevo@artista.com',
        artistaId: 5,
        esAdmin: false,
        activo: true,
      });
      mockPrisma.invitacionActivacion.create.mockResolvedValue({ id: 1 });

      const adminUser = { id: 1, email: 'admin@fonarte.com', esAdmin: true, artistaId: null, activo: true };

      const result = await service.crearInvitacion(adminUser, {
        email: 'nuevo@artista.com',
        artistaId: 5,
      });

      expect(result).toHaveProperty('token');
      expect(result.token.length).toBe(64); // 32 bytes hex = 64 chars
      expect(result.email).toBe('nuevo@artista.com');
      expect(mockPrisma.invitacionActivacion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            usuarioId: 10,
            tokenHash: expect.any(String),
          }),
        }),
      );
      expect(mockPrisma.auditoriaAcceso.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            evento: TipoEventoAuditoria.INVITACION_CREADA,
          }),
        }),
      );
    });
  });

  describe('aceptarInvitacion', () => {
    it('debe activar la cuenta, configurar contraseña Argon2id y retornar tokens', async () => {
      const expiraEn = new Date();
      expiraEn.setDate(expiraEn.getDate() + 1); // mañana

      mockPrisma.invitacionActivacion.findUnique.mockResolvedValue({
        id: 1,
        usuarioId: 10,
        expiraEn,
        usadaEn: null,
        usuario: {
          id: 10,
          email: 'artista@fonartelatino.com',
          esAdmin: false,
          artistaId: 5,
          activo: true,
        },
      });

      mockPrisma.refreshToken.create.mockResolvedValue({ id: 1 });

      const result = await service.aceptarInvitacion({
        token: 'token-valido-12345',
        password: 'NewSecurePassword123!',
      });

      expect(result).toHaveProperty('accessToken');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.auditoriaAcceso.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            usuarioId: 10,
            evento: TipoEventoAuditoria.INVITACION_ACTIVADA,
          }),
        }),
      );
    });

    it('debe rechazar invitaciones ya utilizadas', async () => {
      mockPrisma.invitacionActivacion.findUnique.mockResolvedValue({
        id: 2,
        usuarioId: 11,
        expiraEn: new Date(Date.now() + 100000),
        usadaEn: new Date(), // ya usada
      });

      await expect(
        service.aceptarInvitacion({ token: 'usado-token', password: 'Password123!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar invitaciones expiradas', async () => {
      const fechaPasada = new Date(Date.now() - 1000000);
      mockPrisma.invitacionActivacion.findUnique.mockResolvedValue({
        id: 3,
        usuarioId: 12,
        expiraEn: fechaPasada,
        usadaEn: null,
      });

      await expect(
        service.aceptarInvitacion({ token: 'expirado-token', password: 'Password123!' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refrescarToken', () => {
    it('debe rotar el refresh token y emitir nuevos tokens', async () => {
      const expiraEn = new Date(Date.now() + 1000000);
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: 1,
        usuarioId: 10,
        expiraEn,
        revocadoEn: null,
        usuario: { id: 10, email: 'user@test.com', esAdmin: false, artistaId: null, activo: true },
      });
      mockPrisma.refreshToken.update.mockResolvedValue({ id: 1 });
      mockPrisma.refreshToken.create.mockResolvedValue({ id: 2 });

      const result = await service.refrescarToken({ refreshToken: 'valid-refresh-token' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { revocadoEn: expect.any(Date) },
        }),
      );
    });
  });
});
