/**
 * Contratos de la API de estadísticas del portal del artista.
 *
 * Reflejan los DTOs del backend (`backend/src/stats/dto/stats-responses.dto.ts`).
 *
 * ⚠️ REGLA ABSOLUTA: aquí no existe —ni debe existir— ninguna propiedad
 * monetaria. Solo conteos de reproducciones y metadatos de catálogo.
 * Si algún día aparece un campo de dinero en estos tipos, es un bug.
 */

/** Respuesta de `GET /stats/kpi/:artistaId` */
export interface ResumenKpi {
  artistaId: number;
  artistaNombre: string;
  selloNombre?: string;
  streamsTotales: number;
  streamsPeriodoActual: number;
  cancionesActivas: number;
  plataformasActivas: number;
  topPlataforma: { nombre: string; streams: number } | null;
}

/** Elemento de `GET /stats/canciones/:artistaId` */
export interface StreamCancion {
  isrc: string;
  titulo: string;
  album?: string | null;
  artista: string;
  plataforma?: string | null;
  periodo?: string | null;
  pais?: string | null;
  streams: number;
}

/** Respuesta de `GET /stats/plataformas/:artistaId` */
export interface StreamPlataforma {
  plataforma: string;
  streamsTotales: number;
  porcentaje: number;
}

/** Respuesta de `GET /stats/paises/:artistaId` */
export interface StreamPais {
  codigoPais: string;
  nombrePais?: string;
  streamsTotales: number;
  porcentaje: number;
}

/** Respuesta de `GET /stats/tendencia/:artistaId` */
export interface TendenciaMensual {
  periodo: string;
  streams: number;
  plataformas?: Record<string, number>;
}

/** Respuesta de `GET /stats/catalogo/:artistaId` */
export interface CatalogoItem {
  id: number;
  tipo: 'ALBUM' | 'CANCION' | 'VIDEO' | string;
  referenciaId: string;
  nombre: string;
  artistaNombre: string;
}

/** Filtros soportados por `StatsFiltroDto` en el backend. */
export interface FiltrosStats {
  periodoInicio?: string;
  periodoFin?: string;
  plataforma?: string;
  pais?: string;
}

/** Fila de una canción ya agregada para presentación. */
export interface CancionAgregada {
  isrc: string;
  titulo: string;
  album: string;
  streams: number;
  plataformas: number;
}

/** Fila de un álbum ya agregado para presentación. */
export interface AlbumAgregado {
  album: string;
  streams: number;
  canciones: number;
}

/** Punto de la serie temporal. */
export interface PuntoTendencia {
  periodo: string;
  streams: number;
}
