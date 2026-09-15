import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { TipoEntidadPermiso } from './permissions.types';

export const PERMISSION_REQUIREMENT_KEY = 'permission_requirement';

export interface PermisoRequirement {
  tipoEntidad: TipoEntidadPermiso;
  paramKey: string; // ej. 'id', 'artistaId', 'isrc', etc.
}

/**
 * Decorador para exigir verificación de acceso granular a una entidad.
 * Uso: @RequireAccess(TipoEntidadPermiso.ARTISTA, 'id')
 *      @RequireAccess(TipoEntidadPermiso.CANCION, 'isrc')
 */
export const RequireAccess = (
  tipoEntidad: TipoEntidadPermiso,
  paramKey: string = 'id',
): CustomDecorator<string> =>
  SetMetadata(PERMISSION_REQUIREMENT_KEY, { tipoEntidad, paramKey } as PermisoRequirement);
