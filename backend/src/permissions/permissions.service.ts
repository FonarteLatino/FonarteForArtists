/**
 * FASE 2 — Módulo de Permisos: Lógica de resolución
 * 
 * Implementa la regla "lo más específico gana":
 * 1. Si hay DENY explícito al nivel exacto → DENEGAR (sin importar niveles superiores)
 * 2. Sin DENY explícito → heredar el ALLOW más cercano en la jerarquía
 * 3. Sin ninguna concesión → DENEGAR (default deny)
 * 
 * Jerarquía de niveles (de más general a más específico):
 *   SELLO → ARTISTA → ALBUM/VIDEO/CANCION
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TipoEntidadPermiso,
  EfectoPermiso,
  ConcesionAcceso,
} from '@prisma/client';

export interface SolicitudPermiso {
  usuarioId: number;
  tipoEntidad: TipoEntidadPermiso;
  entidadId: number;
  /** IDs de los niveles superiores (de más específico a más general) */
  jerarquiaSuperior?: Array<{ tipo: TipoEntidadPermiso; id: number }>;
}

export interface ResultadoPermiso {
  permitido: boolean;
  nivel: TipoEntidadPermiso | null;  // Nivel donde se resolvió el permiso
  efecto: EfectoPermiso | null;
  motivo: string;
}

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resuelve si un usuario tiene acceso a una entidad específica.
   * 
   * Aplica la regla "lo más específico gana":
   * - DENY explícito al nivel solicitado → false (inmediato)
   * - ALLOW al nivel solicitado → true
   * - Sin concesión al nivel solicitado → buscar en jerarquía superior (ARTISTA, SELLO)
   * - Sin ninguna concesión → false (default deny)
   */
  async resolverPermiso(solicitud: SolicitudPermiso): Promise<ResultadoPermiso> {
    const { usuarioId, tipoEntidad, entidadId, jerarquiaSuperior = [] } = solicitud;

    // Cargar todas las concesiones vigentes del usuario (no revocadas)
    const concesiones = await this.prisma.concesionAcceso.findMany({
      where: {
        usuarioId,
        revocadoEn: null,  // Solo concesiones activas
      },
    });

    // Paso 1: Buscar concesión explícita al nivel exacto solicitado
    const concesionExacta = concesiones.find(
      (c) => c.tipoEntidad === tipoEntidad && c.entidadId === entidadId,
    );

    if (concesionExacta) {
      if (concesionExacta.efecto === EfectoPermiso.DENY) {
        return {
          permitido: false,
          nivel: tipoEntidad,
          efecto: EfectoPermiso.DENY,
          motivo: `DENY explícito en nivel ${tipoEntidad}:${entidadId}`,
        };
      }
      // ALLOW explícito al nivel exacto
      return {
        permitido: true,
        nivel: tipoEntidad,
        efecto: EfectoPermiso.ALLOW,
        motivo: `ALLOW explícito en nivel ${tipoEntidad}:${entidadId}`,
      };
    }

    // Paso 2: Sin concesión exacta → recorrer la jerarquía de más específico a más general
    // jerarquiaSuperior viene ordenado: [ARTISTA, SELLO] (de más cercano a más lejano)
    for (const nivel of jerarquiaSuperior) {
      const concesionNivel = concesiones.find(
        (c) => c.tipoEntidad === nivel.tipo && c.entidadId === nivel.id,
      );

      if (concesionNivel) {
        if (concesionNivel.efecto === EfectoPermiso.DENY) {
          // DENY en nivel superior se propaga hacia abajo (a menos que haya ALLOW explícito más específico, ya comprobado)
          return {
            permitido: false,
            nivel: nivel.tipo,
            efecto: EfectoPermiso.DENY,
            motivo: `DENY heredado desde nivel ${nivel.tipo}:${nivel.id}`,
          };
        }
        // ALLOW heredado desde nivel superior
        return {
          permitido: true,
          nivel: nivel.tipo,
          efecto: EfectoPermiso.ALLOW,
          motivo: `ALLOW heredado desde nivel ${nivel.tipo}:${nivel.id}`,
        };
      }
    }

    // Paso 3: Sin ninguna concesión en ningún nivel → default deny
    return {
      permitido: false,
      nivel: null,
      efecto: null,
      motivo: 'Sin concesión en ningún nivel (default deny)',
    };
  }

  /**
   * Lista todas las entidades accesibles para un usuario,
   * resolviendo permisos en batch para mejor rendimiento.
   */
  async listarEntidadesPermitidas(
    usuarioId: number,
    tipoEntidad: TipoEntidadPermiso,
  ): Promise<number[]> {
    const concesiones = await this.prisma.concesionAcceso.findMany({
      where: {
        usuarioId,
        tipoEntidad,
        efecto: EfectoPermiso.ALLOW,
        revocadoEn: null,
      },
    });

    // Filtrar entidades con DENY explícito al mismo nivel
    const denies = await this.prisma.concesionAcceso.findMany({
      where: {
        usuarioId,
        tipoEntidad,
        efecto: EfectoPermiso.DENY,
        revocadoEn: null,
      },
    });

    const denyIds = new Set(denies.map((d) => d.entidadId));

    return concesiones
      .filter((c) => !denyIds.has(c.entidadId))
      .map((c) => c.entidadId);
  }
}
