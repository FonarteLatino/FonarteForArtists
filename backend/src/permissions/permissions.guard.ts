import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSION_REQUIREMENT_KEY,
  PermisoRequirement,
} from './permissions.decorator';
import { TipoEntidadPermiso } from './permissions.types';
import { PermissionsService, SolicitudPermiso } from './permissions.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<PermisoRequirement>(
      PERMISSION_REQUIREMENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si la ruta no tiene el decorador @RequireAccess, el guard permite pasar
    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Los administradores tienen acceso global
    if (user.esAdmin) {
      return true;
    }

    // Extraer el identificador de la entidad de params, query o body
    const rawId =
      request.params?.[requirement.paramKey] ??
      request.query?.[requirement.paramKey] ??
      request.body?.[requirement.paramKey];

    if (rawId === undefined || rawId === null) {
      throw new ForbiddenException(
        `Falta el parámetro requerido '${requirement.paramKey}' para validar permisos`,
      );
    }

    const entidadId = parseInt(rawId, 10);
    if (isNaN(entidadId)) {
      throw new ForbiddenException(
        `El identificador '${requirement.paramKey}' debe ser numérico`,
      );
    }

    // Construir jerarquía superior según el tipo de entidad
    const jerarquiaSuperior: Array<{ tipo: TipoEntidadPermiso; id: number }> = [];

    try {
      if (
        requirement.tipoEntidad === TipoEntidadPermiso.CANCION ||
        requirement.tipoEntidad === TipoEntidadPermiso.ALBUM ||
        requirement.tipoEntidad === TipoEntidadPermiso.VIDEO
      ) {
        // Consultar artista y sello vinculados a esta entidad
        const entidad = await (this.prisma as any).entidadCatalogo?.findUnique({
          where: { id: entidadId },
          include: {
            artista: {
              include: { sello: true },
            },
          },
        });

        if (entidad?.artista) {
          jerarquiaSuperior.push({
            tipo: TipoEntidadPermiso.ARTISTA,
            id: entidad.artista.id,
          });
          if (entidad.artista.sello) {
            jerarquiaSuperior.push({
              tipo: TipoEntidadPermiso.SELLO,
              id: entidad.artista.sello.id,
            });
          }
        }
      } else if (requirement.tipoEntidad === TipoEntidadPermiso.ARTISTA) {
        const artista = await (this.prisma as any).artista?.findUnique({
          where: { id: entidadId },
        });
        if (artista?.selloId) {
          jerarquiaSuperior.push({
            tipo: TipoEntidadPermiso.SELLO,
            id: artista.selloId,
          });
        }
      }
    } catch (dbErr) {
      this.logger.warn(`Error al resolver jerarquía superior: ${dbErr.message}`);
    }

    const solicitud: SolicitudPermiso = {
      usuarioId: user.id,
      tipoEntidad: requirement.tipoEntidad,
      entidadId,
      jerarquiaSuperior,
    };

    const resultado = await this.permissionsService.resolverPermiso(solicitud);

    if (!resultado.permitido) {
      this.logger.warn(
        `Acceso denegado: Usuario ${user.id} -> ${requirement.tipoEntidad}:${entidadId}. Motivo: ${resultado.motivo}`,
      );
      throw new ForbiddenException(`Acceso denegado: ${resultado.motivo}`);
    }

    return true;
  }
}
