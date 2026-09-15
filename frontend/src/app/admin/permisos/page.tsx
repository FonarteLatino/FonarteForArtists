'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { AdminNavbar } from '@/components/AdminNavbar';
import { ConfirmModal } from '@/components/ConfirmModal';

// =============================================================================
// Tipos
// =============================================================================

type TipoEntidad = 'SELLO' | 'ARTISTA' | 'ALBUM' | 'CANCION' | 'VIDEO';
type Efecto = 'ALLOW' | 'DENY';

interface Sello {
  id: number;
  nombre: string;
}

interface Artista {
  id: number;
  nombre: string;
  sello: Sello;
  _count?: { usuarios: number; entidades: number };
}

interface Usuario {
  id: number;
  email: string;
  esAdmin: boolean;
  activo: boolean;
  artista: { id: number; nombre: string; sello: Sello } | null;
}

interface CatalogoItem {
  id: number;
  artistaId: number;
  tipo: 'ALBUM' | 'CANCION' | 'VIDEO';
  referenciaIdFonarte2: string;
  nombre: string | null;
}

interface Concesion {
  id: number;
  usuarioId: number;
  tipoEntidad: TipoEntidad;
  entidadId: number;
  efecto: Efecto;
  otorgadoEn: string;
  revocadoEn: string | null;
  usuario?: { id: number; email: string };
  concedente?: { id: number; email: string };
}

/** Acción pendiente de confirmación antes de ejecutarse. */
interface AccionPendiente {
  titulo: string;
  descripcion: string;
  confirmLabel: string;
  tone: 'danger' | 'primary' | 'success';
  /** Se ejecuta al confirmar. */
  ejecutar: () => Promise<void>;
}

const ETIQUETA_TIPO: Record<string, string> = {
  ALBUM: 'Álbum',
  CANCION: 'Canción',
  VIDEO: 'Video',
};

const ETIQUETA_NIVEL: Record<TipoEntidad, string> = {
  SELLO: 'Sello',
  ARTISTA: 'Artista',
  ALBUM: 'Álbum',
  CANCION: 'Canción',
  VIDEO: 'Video',
};

// =============================================================================
// Sub-componentes presentacionales
// =============================================================================

function BadgeEfecto({ efecto }: { efecto: Efecto }) {
  const esAllow = efecto === 'ALLOW';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        esAllow
          ? 'bg-fonarte-success/10 text-fonarte-success border-fonarte-success/30'
          : 'bg-fonarte-danger/10 text-fonarte-danger border-fonarte-danger/30'
      }`}
    >
      {esAllow ? 'Permitido' : 'Denegado'}
    </span>
  );
}

function BadgeHeredado({ nivel }: { nivel: TipoEntidad }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
      Heredado de {ETIQUETA_NIVEL[nivel]}
    </span>
  );
}

/** Fila de un elemento del catálogo (álbum, canción o video) con su control de acceso. */
function FilaCatalogo({
  item,
  concesion,
  nivelHeredado,
  ocupado,
  onOtorgar,
  onRevocar,
}: {
  item: CatalogoItem;
  concesion: Concesion | undefined;
  nivelHeredado: TipoEntidad | null;
  ocupado: boolean;
  onOtorgar: (tipo: 'ALBUM' | 'CANCION' | 'VIDEO', entidadId: number, efecto: Efecto) => void;
  onRevocar: (concesion: Concesion) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-slate-900/40 border border-fonarte-border hover:border-fonarte-borderHighlight transition">
      <div className="min-w-0 flex items-center gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-fonarte-primary/10 text-fonarte-primary flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {item.tipo === 'ALBUM' ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            ) : item.tipo === 'VIDEO' ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            )}
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {item.nombre || ETIQUETA_TIPO[item.tipo]}
          </p>
          <p className="text-[11px] text-fonarte-textMuted font-mono truncate">
            {ETIQUETA_TIPO[item.tipo]} · {item.referenciaIdFonarte2}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {concesion ? (
          <>
            <BadgeEfecto efecto={concesion.efecto} />
            <button
              onClick={() => onRevocar(concesion)}
              disabled={ocupado}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-fonarte-danger border border-fonarte-danger/30 hover:bg-fonarte-danger/10 transition disabled:opacity-50"
            >
              Revocar
            </button>
          </>
        ) : (
          <>
            {nivelHeredado && <BadgeHeredado nivel={nivelHeredado} />}
            <button
              onClick={() => onOtorgar(item.tipo, item.id, 'ALLOW')}
              disabled={ocupado}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-fonarte-success border border-fonarte-success/30 hover:bg-fonarte-success/10 transition disabled:opacity-50"
            >
              Otorgar
            </button>
            <button
              onClick={() => onOtorgar(item.tipo, item.id, 'DENY')}
              disabled={ocupado}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-fonarte-danger border border-fonarte-danger/30 hover:bg-fonarte-danger/10 transition disabled:opacity-50"
              title="Denegar explícitamente aunque herede acceso del artista o sello"
            >
              Denegar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Página
// =============================================================================

export default function PermisosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]);
  const [concesiones, setConcesiones] = useState<Concesion[]>([]);

  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [expandido, setExpandido] = useState<Record<string, boolean>>({
    ALBUM: true,
    CANCION: false,
    VIDEO: false,
  });

  const [accionPendiente, setAccionPendiente] = useState<AccionPendiente | null>(null);

  // ---------------------------------------------------------------------------
  // Carga inicial: usuarios con cuenta de artista + jerarquía de artistas
  // ---------------------------------------------------------------------------
  const cargarBase = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usr, arts] = await Promise.all([api.getUsuarios(), api.getArtistas()]);
      const listaUsuarios: Usuario[] = Array.isArray(usr) ? usr : [];
      setUsuarios(listaUsuarios.filter((u) => !u.esAdmin && u.artista));
      setArtistas(Array.isArray(arts) ? arts : []);
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar los usuarios y artistas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarBase();
  }, [cargarBase]);

  // ---------------------------------------------------------------------------
  // Al elegir usuario: cargar su catálogo y todas las concesiones
  // ---------------------------------------------------------------------------
  const cargarDetalle = useCallback(async (id: number) => {
    setCargandoCatalogo(true);
    setError(null);
    setAviso(null);
    try {
      const usuario = usuarios.find((u) => u.id === id);
      const [cat, conc] = await Promise.all([
        api.getCatalogo(usuario?.artista?.id),
        api.getConcesiones(id),
      ]);
      setCatalogo(Array.isArray(cat) ? cat : []);
      setConcesiones(Array.isArray(conc) ? conc : []);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar el detalle de accesos del usuario.');
      setCatalogo([]);
      setConcesiones([]);
    } finally {
      setCargandoCatalogo(false);
    }
  }, [usuarios]);

  useEffect(() => {
    if (usuarioId != null) cargarDetalle(usuarioId);
  }, [usuarioId, cargarDetalle]);

  // ---------------------------------------------------------------------------
  // Derivados
  // ---------------------------------------------------------------------------
  const usuarioSel = useMemo(
    () => usuarios.find((u) => u.id === usuarioId) || null,
    [usuarios, usuarioId],
  );

  /** Concesiones vigentes (no revocadas) del usuario seleccionado. */
  const vigentes = useMemo(() => concesiones.filter((c) => c.revocadoEn === null), [concesiones]);

  /** Mapa "TIPO:entidadId" → concesión vigente, para resolver en O(1). */
  const mapaConcesiones = useMemo(() => {
    const m = new Map<string, Concesion>();
    for (const c of vigentes) m.set(`${c.tipoEntidad}:${c.entidadId}`, c);
    return m;
  }, [vigentes]);

  const concesionArtista = useMemo(() => {
    if (!usuarioSel?.artista) return undefined;
    return mapaConcesiones.get(`ARTISTA:${usuarioSel.artista.id}`);
  }, [mapaConcesiones, usuarioSel]);

  const concesionSello = useMemo(() => {
    if (!usuarioSel?.artista?.sello) return undefined;
    return mapaConcesiones.get(`SELLO:${usuarioSel.artista.sello.id}`);
  }, [mapaConcesiones, usuarioSel]);

  /**
   * Nivel del que hereda el acceso un elemento del catálogo.
   * Aplica la regla "lo más específico gana" (implementation_plan §5.2):
   * el ALLOW del artista gana sobre el del sello.
   */
  const nivelHeredado: TipoEntidad | null = useMemo(() => {
    if (concesionArtista?.efecto === 'ALLOW') return 'ARTISTA';
    if (concesionSello?.efecto === 'ALLOW') return 'SELLO';
    return null;
  }, [concesionArtista, concesionSello]);

  const itemsPorTipo = useMemo(
    () => ({
      ALBUM: catalogo.filter((c) => c.tipo === 'ALBUM'),
      CANCION: catalogo.filter((c) => c.tipo === 'CANCION'),
      VIDEO: catalogo.filter((c) => c.tipo === 'VIDEO'),
    }),
    [catalogo],
  );

  const historial = useMemo(
    () => [...concesiones].sort((a, b) => +new Date(b.otorgadoEn) - +new Date(a.otorgadoEn)),
    [concesiones],
  );

  // ---------------------------------------------------------------------------
  // Mutaciones
  // ---------------------------------------------------------------------------
  const ejecutar = useCallback(
    async (fn: () => Promise<any>, mensajeExito: string) => {
      setOcupado(true);
      setError(null);
      setAviso(null);
      try {
        await fn();
        if (usuarioId != null) await cargarDetalle(usuarioId);
        setAviso(mensajeExito);
      } catch (e: any) {
        setError(e?.message || 'La operación no se pudo completar.');
      } finally {
        setOcupado(false);
      }
    },
    [usuarioId, cargarDetalle],
  );

  /** Otorgar o denegar acceso sobre un nivel concreto. */
  const otorgar = useCallback(
    (tipoEntidad: TipoEntidad, entidadId: number, efecto: Efecto, etiqueta: string) => {
      if (usuarioId == null) return;

      const esDeny = efecto === 'DENY';
      setAccionPendiente({
        titulo: esDeny ? 'Denegar acceso explícito' : 'Otorgar acceso',
        descripcion: `Se otorgará «${esDeny ? 'DENEGADO' : 'PERMITIDO'}» a ${
          usuarioSel?.email ?? 'el usuario'
        } sobre ${etiqueta}.\n\n${
          esDeny
            ? 'El DENY es explícito y gana sobre cualquier permiso heredado del artista o del sello.'
            : 'Si existía una concesión previa para este mismo elemento, se revocará automáticamente para no duplicar registros.'
        }`,
        confirmLabel: esDeny ? 'Denegar acceso' : 'Otorgar acceso',
        tone: esDeny ? 'danger' : 'success',
        ejecutar: () =>
          ejecutar(
            () => api.otorgarConcesion({ usuarioId, tipoEntidad, entidadId, efecto }),
            esDeny
              ? `Acceso denegado correctamente sobre ${etiqueta}.`
              : `Acceso otorgado correctamente sobre ${etiqueta}.`,
          ),
      });
    },
    [usuarioId, usuarioSel, ejecutar],
  );

  /** Revocar una concesión existente. */
  const revocar = useCallback(
    (concesion: Concesion, etiqueta: string) => {
      setAccionPendiente({
        titulo: 'Revocar acceso',
        descripcion: `Se revocará el permiso ${concesion.efecto} de ${
          usuarioSel?.email ?? 'el usuario'
        } sobre ${etiqueta}.\n\nLa concesión no se borra: queda marcada como revocada y el acceso se resuelve de nuevo por herencia (artista → sello), o se deniega por defecto si no hay ninguna otra concesión.`,
        confirmLabel: 'Revocar acceso',
        tone: 'danger',
        ejecutar: () =>
          ejecutar(
            () => api.revocarConcesion(concesion.id),
            `Acceso revocado correctamente sobre ${etiqueta}.`,
          ),
      });
    },
    [usuarioSel, ejecutar],
  );

  /**
   * Operación masiva: otorgar o revocar todos los elementos de un tipo,
   * o el catálogo completo (nivel ARTISTA / SELLO).
   * Siempre pasa por confirmación explícita (implementation_plan §7.5).
   */
  const accionMasiva = useCallback(
    (alcance: 'CATALOGO_COMPLETO' | 'ALBUM' | 'CANCION' | 'VIDEO') => {
      if (usuarioId == null || !usuarioSel?.artista) return;

      const nombreArtista = usuarioSel.artista.nombre;

      if (alcance === 'CATALOGO_COMPLETO') {
        const artistaId = usuarioSel.artista.id;
        const yaTiene = concesionArtista;

        if (yaTiene) {
          revocar(yaTiene, `el catálogo completo de ${nombreArtista}`);
          return;
        }

        setAccionPendiente({
          titulo: 'Otorgar el catálogo completo',
          descripcion: `Se otorgará acceso PERMITIDO a ${usuarioSel.email} sobre TODO el catálogo de ${nombreArtista} (nivel artista).\n\nEsto habilita todos sus álbumes, canciones y videos, incluidos los que se registren en el futuro.`,
          confirmLabel: 'Otorgar todo el catálogo',
          tone: 'success',
          ejecutar: () =>
            ejecutar(
              () =>
                api.otorgarConcesion({
                  usuarioId,
                  tipoEntidad: 'ARTISTA',
                  entidadId: artistaId,
                  efecto: 'ALLOW',
                }),
              `Acceso otorgado al catálogo completo de ${nombreArtista}.`,
            ),
        });
        return;
      }

      // Masiva sobre los elementos de un tipo concreto
      const items = itemsPorTipo[alcance];
      if (items.length === 0) return;

      const activas = items
        .map((i) => mapaConcesiones.get(`${alcance}:${i.id}`))
        .filter((c): c is Concesion => Boolean(c) && c!.efecto === 'ALLOW');

      // Si ya están todos otorgados, la acción masiva es revocarlos.
      if (activas.length === items.length) {
        setAccionPendiente({
          titulo: `Revocar todos los ${ETIQUETA_TIPO[alcance].toLowerCase()}s`,
          descripcion: `Se revocarán ${activas.length} permisos de ${usuarioSel.email} sobre los ${items.length} elementos de tipo ${ETIQUETA_TIPO[alcance]} de ${nombreArtista}.\n\nEsta es una revocación masiva: el usuario podría perder acceso a la mayoría de su catálogo. Revisa que sea intencional.`,
          confirmLabel: `Revocar ${activas.length} accesos`,
          tone: 'danger',
          ejecutar: () =>
            ejecutar(
              async () => {
                for (const c of activas) await api.revocarConcesion(c.id);
              },
              `${activas.length} accesos revocados sobre ${ETIQUETA_TIPO[alcance]}s.`,
            ),
        });
        return;
      }

      // En caso contrario, otorgar los que falten
      const faltantes = items.filter(
        (i) => mapaConcesiones.get(`${alcance}:${i.id}`)?.efecto !== 'ALLOW',
      );

      setAccionPendiente({
        titulo: `Otorgar todos los ${ETIQUETA_TIPO[alcance].toLowerCase()}s`,
        descripcion: `Se otorgará acceso PERMITIDO a ${usuarioSel.email} sobre ${faltantes.length} elemento(s) de tipo ${ETIQUETA_TIPO[alcance]} de ${nombreArtista}.\n\nLos elementos que ya tengan un DENY explícito se sobrescribirán con ALLOW.`,
        confirmLabel: `Otorgar ${faltantes.length} accesos`,
        tone: 'success',
        ejecutar: () =>
          ejecutar(
            async () => {
              for (const item of faltantes) {
                await api.otorgarConcesion({
                  usuarioId,
                  tipoEntidad: alcance,
                  entidadId: item.id,
                  efecto: 'ALLOW',
                });
              }
            },
            `${faltantes.length} accesos otorgados sobre ${ETIQUETA_TIPO[alcance]}s.`,
          ),
      });
    },
    [usuarioId, usuarioSel, concesionArtista, itemsPorTipo, mapaConcesiones, ejecutar, revocar],
  );

  const etiquetaDe = useCallback(
    (c: Concesion) => {
      if (c.tipoEntidad === 'ARTISTA') {
        return `el artista ${artistas.find((a) => a.id === c.entidadId)?.nombre ?? c.entidadId}`;
      }
      if (c.tipoEntidad === 'SELLO') {
        return `el sello #${c.entidadId}`;
      }
      const item = catalogo.find((i) => i.id === c.entidadId && i.tipo === c.tipoEntidad);
      return item
        ? `${ETIQUETA_TIPO[item.tipo]} ${item.nombre || item.referenciaIdFonarte2}`
        : `${ETIQUETA_NIVEL[c.tipoEntidad]} #${c.entidadId}`;
    },
    [artistas, catalogo],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminNavbar
        title="Asignación de Permisos"
        subtitle="Concede o revoca accesos por sello, artista, álbum, canción o video"
      />

      <main className="p-8 space-y-6 flex-1">
        {/* Avisos */}
        {error && (
          <div className="p-3.5 rounded-xl bg-fonarte-danger/10 border border-fonarte-danger/30 text-fonarte-danger text-sm flex items-start gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
        {aviso && (
          <div className="p-3.5 rounded-xl bg-fonarte-success/10 border border-fonarte-success/30 text-fonarte-success text-sm flex items-center gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{aviso}</span>
          </div>
        )}

        {/* Selector de usuario */}
        <div className="glass-panel p-6 rounded-2xl border border-fonarte-border">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Selecciona la cuenta del artista
          </label>
          {loading ? (
            <div className="flex items-center gap-3 py-3">
              <div className="w-4 h-4 border-2 border-fonarte-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-fonarte-textMuted">Cargando cuentas...</span>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-fonarte-border">
              <p className="text-sm text-fonarte-textMuted">
                No hay cuentas de artista registradas. Crea y activa una cuenta primero en{' '}
                <a href="/admin/usuarios" className="text-fonarte-primary hover:underline font-medium">
                  Usuarios e Invitaciones
                </a>
                .
              </p>
            </div>
          ) : (
            <select
              value={usuarioId ?? ''}
              onChange={(e) => setUsuarioId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-fonarte-border text-white focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition text-sm"
            >
              <option value="">— Elige un usuario —</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} · {u.artista?.nombre} ({u.artista?.sello?.nombre})
                  {u.activo ? '' : ' — INACTIVO'}
                </option>
              ))}
            </select>
          )}
        </div>

        {usuarioSel && usuarioSel.artista && (
          <>
            {/* Contexto y acción sobre el catálogo completo */}
            <div className="glass-panel p-6 rounded-2xl border border-fonarte-border">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">
                    {usuarioSel.artista.nombre}
                  </h2>
                  <p className="text-xs text-fonarte-textMuted mt-1">
                    Sello: <span className="text-slate-300">{usuarioSel.artista.sello?.nombre}</span>
                    {' · '}
                    {usuarioSel.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-[11px] text-fonarte-textMuted">Acceso actual:</span>
                    {concesionArtista ? (
                      <BadgeEfecto efecto={concesionArtista.efecto} />
                    ) : concesionSello ? (
                      <BadgeHeredado nivel="SELLO" />
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/40 text-slate-300 border border-slate-600/40">
                        Sin acceso (default deny)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/portal?artistaId=${usuarioSel.artista.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-fonarte-border hover:bg-slate-800/60 transition"
                    title="Abre el portal del artista tal como lo verá esta cuenta"
                  >
                    Ver su portal ↗
                  </a>
                  <button
                    onClick={() => accionMasiva('CATALOGO_COMPLETO')}
                    disabled={ocupado}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition disabled:opacity-50 ${
                      concesionArtista?.efecto === 'ALLOW'
                        ? 'bg-fonarte-danger hover:bg-fonarte-dangerHover text-white shadow-fonarte-danger/30'
                        : 'bg-fonarte-primary hover:bg-fonarte-primaryHover text-white shadow-fonarte-primary/30'
                    }`}
                  >
                    {concesionArtista?.efecto === 'ALLOW'
                      ? 'Revocar todo el catálogo'
                      : 'Otorgar todo el catálogo'}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-fonarte-textMuted mt-4 leading-relaxed border-t border-fonarte-border pt-4">
                Regla aplicada: <span className="text-slate-300">«lo más específico gana»</span>. Un
                DENY explícito sobre un álbum, canción o video siempre gana sobre el acceso
                heredado del artista o del sello. Sin ninguna concesión, el acceso se deniega por
                defecto.
              </p>
            </div>

            {/* Catálogo por tipo */}
            {cargandoCatalogo ? (
              <div className="glass-panel p-8 rounded-2xl border border-fonarte-border flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-fonarte-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-fonarte-textMuted">Cargando catálogo...</span>
              </div>
            ) : catalogo.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-fonarte-border text-center">
                <p className="text-sm text-fonarte-textMuted">
                  Este artista todavía no tiene elementos de catálogo registrados.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(['ALBUM', 'CANCION', 'VIDEO'] as const).map((tipo) => {
                  const items = itemsPorTipo[tipo];
                  if (items.length === 0) return null;

                  const abierto = expandido[tipo];
                  const otorgados = items.filter(
                    (i) => mapaConcesiones.get(`${tipo}:${i.id}`)?.efecto === 'ALLOW',
                  ).length;
                  const denegados = items.filter(
                    (i) => mapaConcesiones.get(`${tipo}:${i.id}`)?.efecto === 'DENY',
                  ).length;
                  const todosOtorgados = otorgados === items.length;

                  return (
                    <div
                      key={tipo}
                      className="glass-panel rounded-2xl border border-fonarte-border overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                        <button
                          onClick={() => setExpandido((s) => ({ ...s, [tipo]: !s[tipo] }))}
                          className="flex items-center gap-3 text-left group"
                        >
                          <svg
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              abierto ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-fonarte-primary transition-colors">
                              {ETIQUETA_TIPO[tipo]}s
                              <span className="ml-2 text-xs font-normal text-fonarte-textMuted">
                                ({items.length})
                              </span>
                            </h3>
                            <p className="text-[11px] text-fonarte-textMuted mt-0.5">
                              {otorgados} con acceso explícito
                              {denegados > 0 ? ` · ${denegados} denegado(s)` : ''}
                              {otorgados === 0 && denegados === 0 && nivelHeredado
                                ? ' · todos heredan del ' + ETIQUETA_NIVEL[nivelHeredado].toLowerCase()
                                : ''}
                            </p>
                          </div>
                        </button>

                        <button
                          onClick={() => accionMasiva(tipo)}
                          disabled={ocupado}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition disabled:opacity-50 ${
                            todosOtorgados
                              ? 'text-fonarte-danger border-fonarte-danger/30 hover:bg-fonarte-danger/10'
                              : 'text-fonarte-success border-fonarte-success/30 hover:bg-fonarte-success/10'
                          }`}
                        >
                          {todosOtorgados
                            ? `Revocar los ${items.length}`
                            : `Otorgar los ${items.length}`}
                        </button>
                      </div>

                      {abierto && (
                        <div className="px-5 pb-5 space-y-2 border-t border-fonarte-border pt-4">
                          {items.map((item) => (
                            <FilaCatalogo
                              key={item.id}
                              item={item}
                              concesion={mapaConcesiones.get(`${item.tipo}:${item.id}`)}
                              nivelHeredado={nivelHeredado}
                              ocupado={ocupado}
                              onOtorgar={(t, id, efecto) =>
                                otorgar(
                                  t,
                                  id,
                                  efecto,
                                  `${ETIQUETA_TIPO[t].toLowerCase()} ${
                                    item.nombre || item.referenciaIdFonarte2
                                  }`,
                                )
                              }
                              onRevocar={(c) => revocar(c, etiquetaDe(c))}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Historial de concesiones */}
            <div className="glass-panel p-6 rounded-2xl border border-fonarte-border">
              <div className="mb-5">
                <h2 className="text-base font-bold text-white">Historial de concesiones</h2>
                <p className="text-xs text-fonarte-textMuted mt-0.5">
                  Quién otorgó cada acceso y cuándo. Las concesiones revocadas se conservan como
                  registro de auditoría.
                </p>
              </div>

              {historial.length === 0 ? (
                <p className="text-sm text-fonarte-textMuted text-center py-6">
                  Este usuario no tiene ninguna concesión registrada.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                      <tr>
                        <th className="pb-3 px-3">Nivel</th>
                        <th className="pb-3 px-3">Elemento</th>
                        <th className="pb-3 px-3">Efecto</th>
                        <th className="pb-3 px-3">Otorgado por</th>
                        <th className="pb-3 px-3">Fecha</th>
                        <th className="pb-3 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {historial.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 text-slate-300 font-medium">
                            {ETIQUETA_NIVEL[c.tipoEntidad]}
                          </td>
                          <td className="py-3 px-3 text-slate-400 max-w-xs truncate">
                            {etiquetaDe(c)}
                          </td>
                          <td className="py-3 px-3">
                            <BadgeEfecto efecto={c.efecto} />
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {c.concedente?.email || `#${c.usuarioId}`}
                          </td>
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            {new Date(c.otorgadoEn).toLocaleString('es-MX')}
                          </td>
                          <td className="py-3 px-3">
                            {c.revocadoEn ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/40 text-slate-300 border border-slate-600/40">
                                Revocada
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Vigente
                                </span>
                                <button
                                  onClick={() => revocar(c, etiquetaDe(c))}
                                  disabled={ocupado}
                                  className="text-[11px] font-semibold text-fonarte-danger hover:underline disabled:opacity-50"
                                >
                                  Revocar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Confirmación obligatoria antes de otorgar/revocar (incluye acciones masivas) */}
      <ConfirmModal
        open={accionPendiente !== null}
        title={accionPendiente?.titulo ?? ''}
        description={accionPendiente?.descripcion ?? ''}
        confirmLabel={accionPendiente?.confirmLabel}
        tone={accionPendiente?.tone}
        loading={ocupado}
        onConfirm={async () => {
          const accion = accionPendiente;
          setAccionPendiente(null);
          if (accion) await accion.ejecutar();
        }}
        onCancel={() => setAccionPendiente(null)}
      />
    </div>
  );
}
