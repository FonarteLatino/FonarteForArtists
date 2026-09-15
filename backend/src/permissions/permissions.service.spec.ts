/**
 * FASE 2 — Tests unitarios de PermissionsService
 * 
 * Cubre los 4 escenarios definidos en el implementation plan (sección 5.2):
 * 1. Acceso completo a artista
 * 2. Acceso a artista con una canción revocada
 * 3. Acceso solo a un álbum específico sin acceso al resto del artista
 * 4. Acceso heredado desde el sello
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService, SolicitudPermiso } from './permissions.service';
import { PrismaService } from '../prisma/prisma.service';
import { TipoEntidadPermiso, EfectoPermiso } from '@prisma/client';

// Mock de PrismaService para tests unitarios (sin BD real)
const mockPrismaService = {
  concesionAcceso: {
    findMany: jest.fn(),
  },
};

describe('PermissionsService — Resolución de Permisos', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Escenario 1: Acceso completo a artista
  // ---------------------------------------------------------------------------
  describe('Escenario 1: Acceso completo a artista', () => {
    it('debe permitir acceso cuando hay ALLOW explícito al nivel ARTISTA', async () => {
      mockPrismaService.concesionAcceso.findMany.mockResolvedValue([
        {
          id: 1,
          usuarioId: 10,
          tipoEntidad: TipoEntidadPermiso.ARTISTA,
          entidadId: 5,
          efecto: EfectoPermiso.ALLOW,
          revocadoEn: null,
        },
      ]);

      const solicitud: SolicitudPermiso = {
        usuarioId: 10,
        tipoEntidad: TipoEntidadPermiso.ARTISTA,
        entidadId: 5,
        jerarquiaSuperior: [],
      };

      const resultado = await service.resolverPermiso(solicitud);

      expect(resultado.permitido).toBe(true);
      expect(resultado.efecto).toBe(EfectoPermiso.ALLOW);
      expect(resultado.nivel).toBe(TipoEntidadPermiso.ARTISTA);
    });

    it('debe permitir acceso a canción cuando hay ALLOW heredado desde ARTISTA', async () => {
      mockPrismaService.concesionAcceso.findMany.mockResolvedValue([
        {
          id: 1,
          usuarioId: 10,
          tipoEntidad: TipoEntidadPermiso.ARTISTA,
          entidadId: 5,
          efecto: EfectoPermiso.ALLOW,
          revocadoEn: null,
        },
      ]);

      const solicitud: SolicitudPermiso = {
        usuarioId: 10,
        tipoEntidad: TipoEntidadPermiso.CANCION,
        entidadId: 99,  // Canción específica
        jerarquiaSuperior: [
          { tipo: TipoEntidadPermiso.ALBUM, id: 20 },   // Álbum padre
          { tipo: TipoEntidadPermiso.ARTISTA, id: 5 },  // Artista (tiene ALLOW)
          { tipo: TipoEntidadPermiso.SELLO, id: 1 },
        ],
      };

      const resultado = await service.resolverPermiso(solicitud);

      expect(resultado.permitido).toBe(true);
      expect(resultado.efecto).toBe(EfectoPermiso.ALLOW);
      expect(resultado.nivel).toBe(TipoEntidadPermiso.ARTISTA);
      expect(resultado.motivo).toContain('heredado');
    });
  });

  // ---------------------------------------------------------------------------
  // Escenario 2: Acceso a artista con una canción revocada
  // ---------------------------------------------------------------------------
  describe('Escenario 2: Artista con canción revocada', () => {
    it('debe denegar una canción específica con DENY explícito aunque el artista tenga ALLOW', async () => {
      mockPrismaService.concesionAcceso.findMany.mockResolvedValue([
        {
          // ALLOW en artista
          id: 1,
          usuarioId: 10,
          tipoEntidad: TipoEntidadPermiso.ARTISTA,
          entidadId: 5,
          efecto: EfectoPermiso.ALLOW,
          revocadoEn: null,
        },
        {
          // DENY explícito en una canción específica
          id: 2,
          usuarioId: 10,
          tipoEntidad: TipoEntidadPermiso.CANCION,
          entidadId: 77,  // Esta canción está revocada
          efecto: EfectoPermiso.DENY,
          revocadoEn: null,
        },
      ]);

      const solicitudCancionRevocada: SolicitudPermiso = {
        usuarioId: 10,
        tipoEntidad: TipoEntidadPermiso.CANCION,
        entidadId: 77,  // La canción con DENY explícito
        jerarquiaSuperior: [
          { tipo: TipoEntidadPermiso.ALBUM, id: 20 },
          { tipo: TipoEntidadPermiso.ARTISTA, id: 5 },
          { tipo: TipoEntidadPermiso.SELLO, id: 1 },
        ],
      };

      const resultado = await service.resolverPermiso(solicitudCancionRevocada);

      // El DENY al nivel exacto debe ganar sobre el ALLOW heredado
      expect(resultado.permitido).toBe(false);
      expect(resultado.efecto).toBe(EfectoPermiso.DENY);
      expect(resultado.nivel).toBe(TipoEntidadPermiso.CANCION);
    });

    it('debe permitir otras canciones del mismo artista aunque una esté revocada', async () => {
      mockPrismaService.concesionAcceso.findMany.mockResolvedValue([
        {
          id: 1,
          usuarioId: 10,
          tipoEntidad: TipoEntidadPermiso.ARTISTA,
          entidadId: 5,
          efecto: EfectoPermiso.ALLOW,
          revocadoEn: null,
        },
        {
          id: 2,
          usuarioId: 10,
          tipoEntidad: TipoEntidadPermiso.CANCION,
          entidadId: 77,  // Solo esta está revocada
          efecto: EfectoPermiso.DENY,
          revocadoEn: null,
        },
      ]);

      const solicitudOtraCancion: SolicitudPermiso = {
        usuarioId: 10,
        tipoEntidad: TipoEntidadPermiso.CANCION,
        entidadId: 78,  // Otra canción del mismo artista
        jerarquiaSuperior: [
          { tipo: TipoEntidadPermiso.ALBUM, id: 20 },
          { tipo: TipoEntidadPermiso.ARTISTA, id: 5 },
          { tipo: TipoEntidadPermiso.SELLO, id: 1 },
        ],
      };

      const resultado = await service.resolverPermiso(solicitudOtraCancion);

      // Debe permitir — hereda ALLOW del artista
      expect(resultado.permitido).toBe(true);
      expect(resultado.nivel).toBe(TipoEntidadPermiso.ARTISTA);
    });
  });

  // ---------------------------------------------------------------------------
  // Escenario 3: Acceso solo a un álbum específico sin acceso al resto del artista
  // ---------------------------------------------------------------------------
  describe('Escenario 3: Acceso solo a un álbum específico', () => {
    it('debe permitir acceso al álbum con ALLOW explícito', async () => {
      mockPrismaService.concesionAcceso.findMany.mockResolvedValue([
        {
          id: 1,
          usuarioId: 10,
          tipoEntidad: TipoEntidadPermiso.ALBUM,
          entidadId: 20,  // Solo este álbum
          efecto: EfectoPermiso.ALLOW,
          revocadoEn: null,
        },
      ]);

      const solicitud: SolicitudPermiso = {
        usuarioId: 10,
        tipoEntidad: TipoEntidadPermiso.ALBUM,
        entidadId: 20,
        jerarquiaSuperior: [
          { tipo: TipoEntidadPermiso.ARTISTA, id: 5 },
          { tipo: TipoEntidadPermiso.SELLO, id: 1 },
        ],
      };

      const resultado = await service.resolverPermiso(solicitud);
      expect(resultado.permitido).toBe(true);
      expect(resultado.nivel).toBe(TipoEntidadPermiso.ALBUM);
    });

    it('debe denegar el artista cuando solo se concedió acceso a un álbum', async () => {
      mockPrismaService.concesionAcceso.findMany.mockResolvedValue([
        {
          id: 1,
          usuarioId: 10,
          tipoEntidad: TipoEntidadPermiso.ALBUM,
          entidadId: 20,  // Solo este álbum
          efecto: EfectoPermiso.ALLOW,
          revocadoEn: null,
        },
      ]);

      const solicitudArtista: SolicitudPermiso = {
        usuarioId: 10,
        tipoEntidad: TipoEntidadPermiso.ARTISTA,
        entidadId: 5,  // El artista completo — no tiene permiso
        jerarquiaSuperior: [
          { tipo: TipoEntidadPermiso.SELLO, id: 1 },
        ],
      };

      const resultado = await service.resolverPermiso(solicitudArtista);
      // Sin concesión explícita al artista → default deny
      expect(resultado.permitido).toBe(false);
      expect(resultado.nivel).toBeNull();
      expect(resultado.motivo).toContain('default deny');
    });

    it('debe denegar otro álbum del mismo artista cuando no tiene concesión', async () => {
      mockPrismaService.concesionAcceso.findMany.mockResolvedValue([
        {
          id: 1,
          usuarioId: 10,
          tipoEntidad: TipoEntidadPermiso.ALBUM,
          entidadId: 20,  // Solo álbum 20
          efecto: EfectoPermiso.ALLOW,
          revocadoEn: null,
        },
      ]);

      const solicitudOtroAlbum: SolicitudPermiso = {
        usuarioId: 10,
        tipoEntidad: TipoEntidadPermiso.ALBUM,
        entidadId: 21,  // Otro álbum del mismo artista
        jerarquiaSuperior: [
          { tipo: TipoEntidadPermiso.ARTISTA, id: 5 },
          { tipo: TipoEntidadPermiso.SELLO, id: 1 },
        ],
      };

      const resultado = await service.resolverPermiso(solicitudOtroAlbum);
      expect(resultado.permitido).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Escenario 4: Acceso heredado desde el sello
  // ---------------------------------------------------------------------------
  describe('Escenario 4: Acceso heredado desde el sello', () => {
    it('debe permitir acceso a artista cuando hay ALLOW en el sello padre', async () => {
      mockPrismaService.concesionAcceso.findMany.mockResolvedValue([
        {
          id: 1,
          usuarioId: 10,
          tipoEntidad: TipoEntidadPermiso.SELLO,
          entidadId: 1,  // ALLOW en el sello
          efecto: EfectoPermiso.ALLOW,
          revocadoEn: null,
        },
      ]);

      const solicitud: SolicitudPermiso = {
        usuarioId: 10,
        tipoEntidad: TipoEntidadPermiso.ARTISTA,
        entidadId: 5,  // Artista dentro del sello
        jerarquiaSuperior: [
          { tipo: TipoEntidadPermiso.SELLO, id: 1 },  // Sello con ALLOW
        ],
      };

      const resultado = await service.resolverPermiso(solicitud);
      expect(resultado.permitido).toBe(true);
      expect(resultado.nivel).toBe(TipoEntidadPermiso.SELLO);
      expect(resultado.motivo).toContain('heredado');
    });

    it('debe denegar acceso si no hay concesión en ningún nivel (default deny)', async () => {
      mockPrismaService.concesionAcceso.findMany.mockResolvedValue([]);

      const solicitud: SolicitudPermiso = {
        usuarioId: 10,
        tipoEntidad: TipoEntidadPermiso.CANCION,
        entidadId: 99,
        jerarquiaSuperior: [
          { tipo: TipoEntidadPermiso.ALBUM, id: 20 },
          { tipo: TipoEntidadPermiso.ARTISTA, id: 5 },
          { tipo: TipoEntidadPermiso.SELLO, id: 1 },
        ],
      };

      const resultado = await service.resolverPermiso(solicitud);
      expect(resultado.permitido).toBe(false);
      expect(resultado.nivel).toBeNull();
      expect(resultado.efecto).toBeNull();
    });
  });
});
