/**
 * DTOs de respuesta para el módulo de estadísticas.
 * 
 * REGLA DE SEGURIDAD ABSOLUTA (Defensa en profundidad):
 * Ninguna propiedad financiera (montos, regalías, pagos, porcentajes monetarios)
 * está permitida en estos modelos. Solo conteos de reproducciones/streams y metadata.
 */

export interface ResumenKpiDto {
  artistaId: number;
  artistaNombre: string;
  selloNombre?: string;
  streamsTotales: number;
  streamsPeriodoActual: number;
  cancionesActivas: number;
  plataformasActivas: number;
  topPlataforma: {
    nombre: string;
    streams: number;
  } | null;
}

export interface StreamCancionDto {
  isrc: string;
  titulo: string;
  album?: string;
  artista: string;
  plataforma?: string;
  periodo?: string;
  pais?: string;
  streams: number;
}

export interface StreamPlataformaDto {
  plataforma: string;
  streamsTotales: number;
  porcentaje: number;
}

export interface StreamPaisDto {
  codigoPais: string;
  nombrePais?: string;
  streamsTotales: number;
  porcentaje: number;
}

export interface TendenciaMensualDto {
  periodo: string; // YYYY-MM
  streams: number;
  plataformas?: Record<string, number>;
}

export interface CatalogoItemDto {
  id: number;
  tipo: string;
  referenciaId: string; // ISRC o UPC
  nombre: string;
  artistaNombre: string;
}
