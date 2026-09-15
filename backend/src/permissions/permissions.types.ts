export enum TipoEntidadPermiso {
  SELLO = 'SELLO',
  ARTISTA = 'ARTISTA',
  ALBUM = 'ALBUM',
  CANCION = 'CANCION',
  VIDEO = 'VIDEO',
}

export enum EfectoPermiso {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
}

export interface JerarquiaNivel {
  tipo: TipoEntidadPermiso;
  id: number;
}

export interface SolicitudPermiso {
  usuarioId: number;
  tipoEntidad: TipoEntidadPermiso;
  entidadId: number;
  /** IDs de los niveles superiores (de más específico a más general, ej. [ARTISTA, SELLO]) */
  jerarquiaSuperior?: JerarquiaNivel[];
}

export interface ResultadoPermiso {
  permitido: boolean;
  nivel: TipoEntidadPermiso | null; // Nivel donde se resolvió el permiso
  efecto: EfectoPermiso | null;
  motivo: string;
}
