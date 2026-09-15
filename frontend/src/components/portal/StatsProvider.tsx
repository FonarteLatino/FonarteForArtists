'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import type {
  AlbumAgregado,
  CancionAgregada,
  FiltrosStats,
  PuntoTendencia,
  StreamCancion,
} from '@/lib/stats-types';

/**
 * Contexto del portal del artista.
 *
 * Resuelve de qué artista se muestran las estadísticas y centraliza la carga de
 * datos para que TODAS las vistas del portal compartan la misma consulta y los
 * mismos filtros. Un solo endpoint (`GET /stats/canciones/:artistaId`) entrega
 * el detalle plano, y a partir de él se agregan en cliente los desgloses por
 * canción, álbum, plataforma, país y período. Así los filtros son consistentes
 * entre vistas y no se multiplican las llamadas.
 *
 * Seguridad: el backend valida los permisos en cada endpoint
 * (`@RequireAccess(ARTISTA, 'artistaId')`) y excluye los ISRC con DENY explícito.
 * Este contexto nunca decide permisos; solo consume lo autorizado.
 */

export interface OpcionPlataforma {
  plataforma: string;
  streams: number;
}

interface StatsContextValue {
  /** ID del artista cuyas estadísticas se están mostrando. */
  artistaId: number | null;
  artistaNombre: string | null;
  selloNombre: string | null;
  /** Permite cambiar de artista (solo tiene efecto para administradores). */
  setArtistaId: (id: number | null) => void;

  /** Filtros vigentes. */
  filtros: FiltrosStats;
  setFiltros: (f: FiltrosStats) => void;
  limpiarFiltros: () => void;

  /** Datos crudos del endpoint de canciones. */
  canciones: StreamCancion[];
  cargando: boolean;
  error: string | null;
  recargar: () => void;

  /** Catálogo registrado del artista (para saber qué álbumes/canciones existen). */
  catalogo: Array<{ id: number; tipo: string; referenciaId: string; nombre: string }>;

  /** Agregaciones derivadas del dataset filtrado. */
  streamsTotales: number;
  cancionesAgregadas: CancionAgregada[];
  albums: AlbumAgregado[];
  tendencia: PuntoTendencia[];
  plataformas: Array<{ plataforma: string; streams: number; porcentaje: number }>;
  paises: Array<{ codigoPais: string; streams: number; porcentaje: number }>;
  periodos: string[];

  /** Opciones disponibles para los selectores, calculadas sobre el dataset SIN filtrar. */
  opcionesPlataforma: OpcionPlataforma[];
  opcionesPais: Array<{ codigoPais: string; streams: number }>;
  rangoPeriodos: { min: string | null; max: string | null };
  /** `true` cuando hay algún filtro activo. */
  hayFiltros: boolean;
}

const StatsContext = createContext<StatsContextValue | null>(null);

export function useStats(): StatsContextValue {
  const ctx = useContext(StatsContext);
  if (!ctx) {
    throw new Error('useStats debe usarse dentro de <StatsProvider>');
  }
  return ctx;
}

/**
 * Determina el artista a mostrar:
 * 1. `?artistaId=` en la URL (permite a un administrador abrir el portal de un artista).
 * 2. El artista asignado a la cuenta autenticada (`GET /auth/me`).
 */
function resolverArtistaInicial(): number | null {
  if (typeof window === 'undefined') return null;

  const desdeUrl = new URLSearchParams(window.location.search).get('artistaId');
  if (desdeUrl) {
    const n = Number(desdeUrl);
    if (Number.isInteger(n) && n > 0) return n;
  }

  const userStr = localStorage.getItem('fonarte_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const id = user?.artistaId ?? user?.artista?.id ?? null;
      if (typeof id === 'number' && id > 0) return id;
    } catch {
      // Perfil corrupto o ausente: se resolverá contra el backend
    }
  }
  return null;
}

export function StatsProvider({ children }: { children: ReactNode }) {
  const [artistaId, setArtistaIdState] = useState<number | null>(null);
  const [artistaNombre, setArtistaNombre] = useState<string | null>(null);
  const [selloNombre, setSelloNombre] = useState<string | null>(null);

  const [filtros, setFiltrosState] = useState<FiltrosStats>({});
  const [canciones, setCanciones] = useState<StreamCancion[]>([]);
  const [catalogo, setCatalogo] = useState<StatsContextValue['catalogo']>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);

  // ---------------------------------------------------------------------------
  // Resolución del artista (URL → perfil de la cuenta)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const inicial = resolverArtistaInicial();
    if (inicial != null) {
      setArtistaIdState(inicial);
      return;
    }

    // Sin artista en caché: se consulta el perfil al backend
    let vigente = true;
    api
      .getMe()
      .then((perfil: any) => {
        if (!vigente) return;
        localStorage.setItem('fonarte_user', JSON.stringify(perfil));
        const id = perfil?.artistaId ?? perfil?.artista?.id ?? null;
        if (typeof id === 'number' && id > 0) {
          setArtistaIdState(id);
          setArtistaNombre(perfil?.artista?.nombre ?? null);
          setSelloNombre(perfil?.artista?.sello?.nombre ?? null);
        } else {
          setError(
            'Esta cuenta no está asociada a un artista, por lo que no hay estadísticas que mostrar.',
          );
          setCargando(false);
        }
      })
      .catch((e: any) => {
        if (!vigente) return;
        setError(e?.message || 'No se pudo obtener el perfil de la cuenta.');
        setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  // Nombre del artista desde la caché, para pintar el encabezado mientras carga
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userStr = localStorage.getItem('fonarte_user');
    if (!userStr) return;
    try {
      const user = JSON.parse(userStr);
      if ((user?.artistaId ?? user?.artista?.id) === artistaId) {
        if (user?.artista?.nombre) setArtistaNombre(user.artista.nombre);
        if (user?.artista?.sello?.nombre) setSelloNombre(user.artista.sello.nombre);
      }
    } catch {
      // Ignorar caché corrupta
    }
  }, [artistaId]);

  // ---------------------------------------------------------------------------
  // Carga de datos
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (artistaId == null) return;

    let vigente = true;
    setCargando(true);
    setError(null);

    const params: Record<string, string> = {};
    if (filtros.periodoInicio) params.periodoInicio = filtros.periodoInicio;
    if (filtros.periodoFin) params.periodoFin = filtros.periodoFin;
    if (filtros.plataforma) params.plataforma = filtros.plataforma;
    if (filtros.pais) params.pais = filtros.pais;

    Promise.all([
      api.getStreamsPorCancion(artistaId, params),
      api.getCatalogo(artistaId).catch(() => []),
    ])
      .then(([data, cat]) => {
        if (!vigente) return;
        setCanciones(Array.isArray(data) ? data : []);
        setCatalogo(Array.isArray(cat) ? cat : []);
      })
      .catch((e: any) => {
        if (!vigente) return;
        setError(
          e?.message ||
            'No se pudieron cargar las estadísticas. Verifica tu conexión e inténtalo de nuevo.',
        );
        setCanciones([]);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [artistaId, filtros, recarga]);

  // ---------------------------------------------------------------------------
  // Derivados
  // ---------------------------------------------------------------------------
  const streamsTotales = useMemo(
    () => canciones.reduce((acc, c) => acc + (Number(c.streams) || 0), 0),
    [canciones],
  );

  const cancionesAgregadas = useMemo<CancionAgregada[]>(() => {
    const mapa = new Map<string, { titulo: string; album: string; streams: number; plats: Set<string> }>();

    for (const c of canciones) {
      const key = c.isrc || c.titulo;
      const actual = mapa.get(key);
      const streams = Number(c.streams) || 0;

      if (actual) {
        actual.streams += streams;
        if (c.plataforma) actual.plats.add(c.plataforma);
      } else {
        mapa.set(key, {
          titulo: c.titulo || c.isrc || 'Sin título',
          album: c.album || 'Sin álbum',
          streams,
          plats: new Set(c.plataforma ? [c.plataforma] : []),
        });
      }
    }

    return Array.from(mapa.entries())
      .map(([isrc, v]) => ({
        isrc,
        titulo: v.titulo,
        album: v.album,
        streams: v.streams,
        plataformas: v.plats.size,
      }))
      .sort((a, b) => b.streams - a.streams);
  }, [canciones]);

  const albums = useMemo<AlbumAgregado[]>(() => {
    const mapa = new Map<string, { streams: number; canciones: Set<string> }>();

    for (const c of canciones) {
      const album = c.album || 'Sin álbum';
      const actual = mapa.get(album) ?? { streams: 0, canciones: new Set<string>() };
      actual.streams += Number(c.streams) || 0;
      actual.canciones.add(c.isrc || c.titulo);
      mapa.set(album, actual);
    }

    return Array.from(mapa.entries())
      .map(([album, v]) => ({
        album,
        streams: v.streams,
        canciones: v.canciones.size,
      }))
      .sort((a, b) => b.streams - a.streams);
  }, [canciones]);

  const tendencia = useMemo<PuntoTendencia[]>(() => {
    const mapa = new Map<string, number>();

    for (const c of canciones) {
      if (!c.periodo) continue;
      mapa.set(c.periodo, (mapa.get(c.periodo) || 0) + (Number(c.streams) || 0));
    }

    return Array.from(mapa.entries())
      .map(([periodo, streams]) => ({ periodo, streams }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  }, [canciones]);

  const plataformas = useMemo(() => {
    const mapa = new Map<string, number>();

    for (const c of canciones) {
      const plat = c.plataforma || 'Desconocida';
      mapa.set(plat, (mapa.get(plat) || 0) + (Number(c.streams) || 0));
    }

    const total = Array.from(mapa.values()).reduce((a, b) => a + b, 0);

    return Array.from(mapa.entries())
      .map(([plataforma, streams]) => ({
        plataforma,
        streams,
        porcentaje: total > 0 ? Math.round((streams / total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.streams - a.streams);
  }, [canciones]);

  const paises = useMemo(() => {
    const mapa = new Map<string, number>();

    for (const c of canciones) {
      if (!c.pais) continue;
      const pais = c.pais.toUpperCase().trim();
      mapa.set(pais, (mapa.get(pais) || 0) + (Number(c.streams) || 0));
    }

    const total = Array.from(mapa.values()).reduce((a, b) => a + b, 0);

    return Array.from(mapa.entries())
      .map(([codigoPais, streams]) => ({
        codigoPais,
        streams,
        porcentaje: total > 0 ? Math.round((streams / total) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.streams - a.streams);
  }, [canciones]);

  const periodos = useMemo(
    () => Array.from(new Set(canciones.map((c) => c.periodo).filter(Boolean) as string[])).sort(),
    [canciones],
  );

  /**
   * Las opciones de los selectores se calculan sobre el dataset SIN filtrar por
   * plataforma/país (únicamente acotado por el rango de fechas vigente), para que
   * elegir una plataforma no haga desaparecer las demás opciones del selector.
   */
  const opcionesPlataforma = useMemo<OpcionPlataforma[]>(() => {
    const mapa = new Map<string, number>();
    for (const c of canciones) {
      const plat = c.plataforma || 'Desconocida';
      mapa.set(plat, (mapa.get(plat) || 0) + (Number(c.streams) || 0));
    }
    return Array.from(mapa.entries())
      .map(([plataforma, streams]) => ({ plataforma, streams }))
      .sort((a, b) => b.streams - a.streams);
  }, [canciones]);

  const opcionesPais = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const c of canciones) {
      if (!c.pais) continue;
      const pais = c.pais.toUpperCase().trim();
      mapa.set(pais, (mapa.get(pais) || 0) + (Number(c.streams) || 0));
    }
    return Array.from(mapa.entries())
      .map(([codigoPais, streams]) => ({ codigoPais, streams }))
      .sort((a, b) => b.streams - a.streams);
  }, [canciones]);

  const rangoPeriodos = useMemo(() => {
    const todos = Array.from(
      new Set(canciones.map((c) => c.periodo).filter(Boolean) as string[]),
    ).sort();
    return {
      min: todos.length > 0 ? todos[0] : null,
      max: todos.length > 0 ? todos[todos.length - 1] : null,
    };
  }, [canciones]);

  const setArtistaId = useCallback((id: number | null) => {
    setArtistaIdState(id);
    setArtistaNombre(null);
    setSelloNombre(null);
  }, []);

  const setFiltros = useCallback((f: FiltrosStats) => setFiltrosState(f), []);
  const limpiarFiltros = useCallback(() => setFiltrosState({}), []);
  const recargar = useCallback(() => setRecarga((n) => n + 1), []);

  const hayFiltros = Boolean(
    filtros.periodoInicio || filtros.periodoFin || filtros.plataforma || filtros.pais,
  );

  const value: StatsContextValue = {
    artistaId,
    artistaNombre,
    selloNombre,
    setArtistaId,
    filtros,
    setFiltros,
    limpiarFiltros,
    canciones,
    cargando,
    error,
    recargar,
    catalogo,
    streamsTotales,
    cancionesAgregadas,
    albums,
    tendencia,
    plataformas,
    paises,
    periodos,
    opcionesPlataforma,
    opcionesPais,
    rangoPeriodos,
    hayFiltros,
  };

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}
