export enum TipoEventoAuditoria {
  LOGIN_OK = 'LOGIN_OK',
  LOGIN_FAIL = 'LOGIN_FAIL',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  INVITACION_CREADA = 'INVITACION_CREADA',
  INVITACION_ACTIVADA = 'INVITACION_ACTIVADA',
  PERMISO_OTORGADO = 'PERMISO_OTORGADO',
  PERMISO_REVOCADO = 'PERMISO_REVOCADO',
  DATOS_CONSULTADOS = 'DATOS_CONSULTADOS',
  CUENTA_CREADA = 'CUENTA_CREADA',
  CUENTA_DESACTIVADA = 'CUENTA_DESACTIVADA',
}

export interface JwtPayload {
  sub: number;       // usuario_id
  email: string;
  esAdmin: boolean;
  artistaId?: number | null;
  iat?: number;
  exp?: number;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // segundos
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  esAdmin: boolean;
  artistaId: number | null;
  activo: boolean;
}
