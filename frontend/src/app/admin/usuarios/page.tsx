'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Link2,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminNavbar } from '@/components/AdminNavbar';
import { ConfirmModal } from '@/components/ConfirmModal';

// ============================================================================
// Tipos (el backend devuelve JSON crudo)
// ============================================================================

interface Sello {
  id: number;
  nombre: string;
}

interface ArtistaAsignado {
  id: number;
  nombre: string;
  sello: Sello;
}

interface Invitacion {
  id: number;
  expiraEn: string;
  usadaEn: string | null;
  creadoEn: string;
}

interface Usuario {
  id: number;
  email: string;
  esAdmin: boolean;
  activo: boolean;
  mfaHabilitado: boolean;
  creadoEn: string;
  artista: ArtistaAsignado | null;
  invitaciones: Invitacion[];
}

interface ArtistaOption {
  id: number;
  nombre: string;
  sello: Sello;
  _count: { usuarios: number; entidades: number };
}

interface InvitacionCreada {
  usuarioId: number;
  email: string;
  token: string;
  expiraEn: string;
}

type EstadoInvitacion = 'sin-invitacion' | 'activada' | 'expirada' | 'pendiente';

interface EstadoInvitacionInfo {
  estado: EstadoInvitacion;
  etiqueta: string;
  /** Fecha relevante: expiración (pendiente/expirada) o activación (activada). */
  fecha: string | null;
  badgeClass: string;
}

// ============================================================================
// Utilidades de presentación
// ============================================================================

const BADGE_BASE =
  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap';

function formatFecha(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatSoloFecha(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-MX', { dateStyle: 'medium' });
}

/**
 * Deriva el estado de invitación del usuario a partir de la invitación más
 * reciente (el backend las devuelve ordenadas de la más nueva a la más vieja).
 */
function derivarEstadoInvitacion(usuario: Usuario): EstadoInvitacionInfo {
  const invitaciones = Array.isArray(usuario.invitaciones) ? usuario.invitaciones : [];

  if (invitaciones.length === 0) {
    return {
      estado: 'sin-invitacion',
      etiqueta: 'Sin invitación',
      fecha: null,
      badgeClass: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
    };
  }

  const masReciente = invitaciones[0];

  if (masReciente.usadaEn) {
    return {
      estado: 'activada',
      etiqueta: 'Activada',
      fecha: masReciente.usadaEn,
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
  }

  const expira = new Date(masReciente.expiraEn);
  const expirada = !Number.isNaN(expira.getTime()) && expira.getTime() < Date.now();

  if (expirada) {
    return {
      estado: 'expirada',
      etiqueta: 'Expirada',
      fecha: masReciente.expiraEn,
      badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
  }

  return {
    estado: 'pendiente',
    etiqueta: 'Pendiente',
    fecha: masReciente.expiraEn,
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
}

function etiquetaArtista(artista: ArtistaOption | ArtistaAsignado): string {
  return `${artista.nombre} — ${artista.sello?.nombre ?? 'Sin sello'}`;
}

// ============================================================================
// Página
// ============================================================================

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [artistas, setArtistas] = useState<ArtistaOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cargandoArtistas, setCargandoArtistas] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  // --- Formulario de provisión / invitación ---
  const [email, setEmail] = useState<string>('');
  const [esAdmin, setEsAdmin] = useState<boolean>(false);
  const [artistaId, setArtistaId] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [invitacion, setInvitacion] = useState<InvitacionCreada | null>(null);
  const [linkInvitacion, setLinkInvitacion] = useState<string>('');
  const [copiado, setCopiado] = useState<boolean>(false);

  // --- Confirmación de cambio de estado ---
  const [usuarioPendiente, setUsuarioPendiente] = useState<Usuario | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState<boolean>(false);
  const [filaCargando, setFilaCargando] = useState<number | null>(null);

  // --------------------------------------------------------------------------
  // Carga de datos
  // --------------------------------------------------------------------------
  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await api.getUsuarios()) as Usuario[] | null;
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(
        e?.message ||
          'No se pudo cargar la lista de usuarios. Verifica la conexión con el servidor.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarArtistas = useCallback(async () => {
    setCargandoArtistas(true);
    try {
      const data = (await api.getArtistas()) as ArtistaOption[] | null;
      setArtistas(Array.isArray(data) ? data : []);
    } catch {
      // El listado de artistas es auxiliar: no bloquea la vista principal.
      setArtistas([]);
    } finally {
      setCargandoArtistas(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
    cargarArtistas();
  }, [cargarUsuarios, cargarArtistas]);

  // --------------------------------------------------------------------------
  // Filtro por correo (client-side)
  // --------------------------------------------------------------------------
  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => (u.email || '').toLowerCase().includes(q));
  }, [usuarios, busqueda]);

  // --------------------------------------------------------------------------
  // Provisión de cuenta: genera la invitación de un solo uso
  // --------------------------------------------------------------------------
  const handleCrearInvitacion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const correo = email.trim();
    if (!correo) {
      setFormError('El correo electrónico es obligatorio.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }
    if (!esAdmin && !artistaId) {
      setFormError('Selecciona el artista al que se asociará la cuenta.');
      return;
    }

    setEnviando(true);
    try {
      const res = (await api.createInvitation(
        correo,
        esAdmin ? undefined : Number(artistaId),
        esAdmin
      )) as InvitacionCreada;

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const link = `${origin}/invitacion?token=${res.token}`;

      setInvitacion(res);
      setLinkInvitacion(link);
      setCopiado(false);
      setEmail('');
      setArtistaId('');
      setEsAdmin(false);

      // La lista se refresca para reflejar la nueva invitación pendiente.
      await cargarUsuarios();
    } catch (err: any) {
      setFormError(
        err?.message ||
          'No se pudo generar la invitación. Revisa el correo e inténtalo de nuevo.'
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleCopiar = async () => {
    if (!linkInvitacion) return;
    try {
      await navigator.clipboard.writeText(linkInvitacion);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setFormError(
        'No se pudo copiar automáticamente. Selecciona el enlace y cópialo manualmente.'
      );
    }
  };

  // --------------------------------------------------------------------------
  // Activación / desactivación de cuentas (siempre vía ConfirmModal)
  // --------------------------------------------------------------------------
  const handleConfirmarCambioEstado = async () => {
    if (!usuarioPendiente) return;
    const objetivo = usuarioPendiente;
    const nuevoEstado = !objetivo.activo;

    setCambiandoEstado(true);
    setFilaCargando(objetivo.id);
    setError(null);
    try {
      await api.updateUsuarioStatus(objetivo.id, nuevoEstado);
      setUsuarioPendiente(null);
      await cargarUsuarios();
    } catch (e: any) {
      setError(
        e?.message ||
          `No se pudo ${nuevoEstado ? 'reactivar' : 'desactivar'} la cuenta de ${objetivo.email}.`
      );
    } finally {
      setCambiandoEstado(false);
      setFilaCargando(null);
    }
  };

  const totalActivos = usuarios.filter((u) => u.activo).length;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminNavbar
        title="Gestión de Usuarios"
        subtitle="Provisión de cuentas por invitación de un solo uso. Las cuentas nunca se autoregistran."
      />

      <main className="p-8 space-y-8 flex-1">
        {/* Banner de error global */}
        {error && (
          <div className="bg-fonarte-danger/10 border border-fonarte-danger/30 text-fonarte-danger rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Ocurrió un error</p>
              <p className="text-xs mt-0.5 leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-semibold text-fonarte-danger/80 hover:text-fonarte-danger transition"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Proveer cuenta / enviar invitación                                */}
        {/* ---------------------------------------------------------------- */}
        <section className="glass-panel p-6 rounded-2xl border border-fonarte-border">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-fonarte-primary/10 text-fonarte-primary flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Proveer Cuenta / Enviar Invitación</h2>
              <p className="text-xs text-fonarte-textMuted mt-0.5 leading-relaxed">
                El administrador crea la cuenta y el sistema genera un enlace de un solo uso para
                que la persona defina su propia contraseña. Ninguna cuenta se autoregistra.
              </p>
            </div>
          </div>

          <form onSubmit={handleCrearInvitacion} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Correo */}
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2"
                >
                  Correo electrónico <span className="text-fonarte-danger">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="artista@ejemplo.com"
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-fonarte-border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-fonarte-primary/60 focus:ring-1 focus:ring-fonarte-primary/40 transition"
                  />
                </div>
              </div>

              {/* Tipo de cuenta */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Tipo de cuenta <span className="text-fonarte-danger">*</span>
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEsAdmin(false);
                      setFormError(null);
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                      !esAdmin
                        ? 'bg-fonarte-primary/15 border-fonarte-primary/50 text-white'
                        : 'bg-slate-900/60 border-fonarte-border text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Artista
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEsAdmin(true);
                      setArtistaId('');
                      setFormError(null);
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                      esAdmin
                        ? 'bg-fonarte-primary/15 border-fonarte-primary/50 text-white'
                        : 'bg-slate-900/60 border-fonarte-border text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Administrador
                  </button>
                </div>
              </div>
            </div>

            {/* Artista asociado (solo para cuentas de artista) */}
            {!esAdmin && (
              <div>
                <label
                  htmlFor="artista"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2"
                >
                  Artista asociado <span className="text-fonarte-danger">*</span>
                </label>
                <select
                  id="artista"
                  value={artistaId}
                  onChange={(e) => setArtistaId(e.target.value)}
                  disabled={cargandoArtistas}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-fonarte-border text-sm text-white focus:outline-none focus:border-fonarte-primary/60 focus:ring-1 focus:ring-fonarte-primary/40 transition disabled:opacity-50"
                >
                  <option value="">
                    {cargandoArtistas ? 'Cargando artistas…' : 'Selecciona un artista…'}
                  </option>
                  {artistas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {etiquetaArtista(a)}
                    </option>
                  ))}
                </select>
                {!cargandoArtistas && artistas.length === 0 && (
                  <p className="text-xs text-fonarte-gold mt-2">
                    No hay artistas registrados. Crea primero un artista en el módulo de catálogo
                    para poder proveer una cuenta de artista.
                  </p>
                )}
                <p className="text-xs text-fonarte-textMuted mt-2">
                  Una cuenta de artista solo verá la analítica del artista y sello seleccionados.
                </p>
              </div>
            )}

            {esAdmin && (
              <div className="rounded-xl bg-fonarte-gold/10 border border-fonarte-gold/30 text-fonarte-gold p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs leading-relaxed">
                  Una cuenta de <strong>Administrador</strong> tiene acceso total al portal
                  (sellos, catálogo, permisos y auditoría). Otorga este rol solo a personal de
                  confianza.
                </p>
              </div>
            )}

            {/* Nota de seguridad */}
            <div className="rounded-xl bg-slate-900/50 border border-fonarte-border p-4 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-fonarte-success mt-0.5 flex-shrink-0" />
              <p className="text-xs text-fonarte-textMuted leading-relaxed">
                El sistema <strong className="text-white">nunca muestra ni almacena</strong> la
                contraseña en texto plano. El enlace de invitación es{' '}
                <strong className="text-white">de un solo uso</strong> y expira automáticamente;
                por seguridad no se puede reutilizar ni compartir.
              </p>
            </div>

            {formError && (
              <div className="bg-fonarte-danger/10 border border-fonarte-danger/30 text-fonarte-danger rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs leading-relaxed">{formError}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={enviando || (!esAdmin && !artistaId)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fonarte-primary hover:bg-fonarte-primaryHover text-sm font-semibold text-white shadow-lg shadow-fonarte-primary/30 transition disabled:opacity-50 disabled:pointer-events-none"
              >
                {enviando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {enviando ? 'Generando enlace…' : 'Generar enlace de invitación'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('');
                  setArtistaId('');
                  setEsAdmin(false);
                  setFormError(null);
                  setInvitacion(null);
                  setLinkInvitacion('');
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-fonarte-border hover:bg-slate-800/60 transition"
              >
                Limpiar
              </button>
            </div>
          </form>

          {/* Enlace generado */}
          {invitacion && linkInvitacion && (
            <div className="mt-6 rounded-2xl border border-fonarte-success/30 bg-fonarte-success/5 p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-fonarte-success/10 text-fonarte-success flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white">
                    Invitación generada para {invitacion.email}
                  </h3>
                  <p className="text-xs text-fonarte-textMuted mt-0.5 leading-relaxed">
                    Copia este enlace y{' '}
                    <strong className="text-white">envíaselo a la persona por un canal seguro</strong>
                    . El sistema no envía el enlace automáticamente.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-4">
                <div className="relative flex-1">
                  <Link2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    readOnly
                    value={linkInvitacion}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border border-fonarte-border text-xs text-slate-200 font-mono focus:outline-none focus:border-fonarte-primary/60"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopiar}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-lg ${
                    copiado
                      ? 'bg-fonarte-success shadow-fonarte-success/30'
                      : 'bg-fonarte-secondary hover:brightness-110 shadow-fonarte-secondary/30'
                  }`}
                >
                  {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiado ? 'Copiado' : 'Copiar enlace'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[11px] text-fonarte-textMuted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-fonarte-gold" />
                  Expira el {formatFecha(invitacion.expiraEn)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-fonarte-secondary" />
                  Enlace de un solo uso
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-fonarte-success" />
                  La contraseña la define la persona invitada
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Listado de usuarios                                               */}
        {/* ---------------------------------------------------------------- */}
        <section className="glass-panel p-6 rounded-2xl border border-fonarte-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Cuentas del Portal</h2>
              <p className="text-xs text-fonarte-textMuted mt-0.5">
                {usuarios.length} {usuarios.length === 1 ? 'cuenta registrada' : 'cuentas registradas'}{' '}
                · {totalActivos} {totalActivos === 1 ? 'activa' : 'activas'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por correo…"
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-fonarte-border text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-fonarte-primary/60 focus:ring-1 focus:ring-fonarte-primary/40 transition"
                />
              </div>
              <button
                type="button"
                onClick={() => cargarUsuarios()}
                disabled={loading}
                title="Actualizar lista"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-fonarte-border hover:bg-slate-800/60 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                <tr>
                  <th className="pb-3 px-3">Correo</th>
                  <th className="pb-3 px-3">Rol</th>
                  <th className="pb-3 px-3">Artista / Sello</th>
                  <th className="pb-3 px-3">Estado</th>
                  <th className="pb-3 px-3">Invitación</th>
                  <th className="pb-3 px-3">Creado</th>
                  <th className="pb-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {/* Estado de carga */}
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center">
                      <span className="inline-flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cargando usuarios…
                      </span>
                    </td>
                  </tr>
                )}

                {/* Lista */}
                {!loading &&
                  usuariosFiltrados.map((u) => {
                    const invitacionInfo = derivarEstadoInvitacion(u);
                    const ocupada = filaCargando === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white truncate max-w-[220px]">
                            {u.email}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {u.mfaHabilitado ? 'MFA habilitado' : 'MFA deshabilitado'}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`${BADGE_BASE} ${
                              u.esAdmin
                                ? 'bg-fonarte-primary/10 text-fonarte-primary border-fonarte-primary/20'
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            }`}
                          >
                            {u.esAdmin ? 'Administrador' : 'Artista'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {u.artista ? (
                            <>
                              <div className="text-slate-200 font-medium truncate max-w-[220px]">
                                {u.artista.nombre}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {u.artista.sello?.nombre ?? 'Sin sello'}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-500">— Acceso global —</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`${BADGE_BASE} ${
                              u.activo
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.activo ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            />
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`${BADGE_BASE} ${invitacionInfo.badgeClass}`}>
                            {invitacionInfo.etiqueta}
                          </span>
                          {invitacionInfo.fecha && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              {invitacionInfo.estado === 'pendiente' && 'Expira: '}
                              {invitacionInfo.estado === 'expirada' && 'Expiró: '}
                              {invitacionInfo.estado === 'activada' && 'Activada: '}
                              {formatFecha(invitacionInfo.fecha)}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {formatSoloFecha(u.creadoEn)}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            disabled={ocupada}
                            onClick={() => setUsuarioPendiente(u)}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold border transition disabled:opacity-50 ${
                              u.activo
                                ? 'border-fonarte-danger/40 text-fonarte-danger hover:bg-fonarte-danger/10'
                                : 'border-fonarte-success/40 text-fonarte-success hover:bg-fonarte-success/10'
                            }`}
                          >
                            {ocupada ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : u.activo ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                            {u.activo ? 'Desactivar' : 'Reactivar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                {/* Sin resultados de búsqueda */}
                {!loading && usuarios.length > 0 && usuariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      No se encontraron cuentas que coincidan con “{busqueda}”.
                    </td>
                  </tr>
                )}

                {/* Estado vacío */}
                {!loading && usuarios.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/60 text-slate-500 flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-slate-400 font-medium">
                          No hay usuarios registrados
                        </p>
                        <p className="text-xs text-slate-500">
                          Genera la primera invitación para proveer una cuenta de artista o
                          administrador.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {busqueda.trim() && usuariosFiltrados.length > 0 && (
            <p className="text-[11px] text-slate-500 mt-4">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} cuentas.
            </p>
          )}
        </section>
      </main>

      {/* Confirmación de activación / desactivación */}
      <ConfirmModal
        open={usuarioPendiente !== null}
        title={
          usuarioPendiente?.activo ? 'Desactivar cuenta' : 'Reactivar cuenta'
        }
        description={
          usuarioPendiente?.activo
            ? `La cuenta ${usuarioPendiente?.email} perderá acceso inmediato al portal. Sus sesiones activas dejarán de ser válidas y no podrá iniciar sesión hasta que se reactive. Esta acción no elimina sus datos ni sus permisos.`
            : `La cuenta ${usuarioPendiente?.email} recuperará acceso al portal con los mismos permisos que tenía asignados.`
        }
        confirmLabel={usuarioPendiente?.activo ? 'Desactivar cuenta' : 'Reactivar cuenta'}
        cancelLabel="Cancelar"
        tone={usuarioPendiente?.activo ? 'danger' : 'primary'}
        loading={cambiandoEstado}
        onConfirm={handleConfirmarCambioEstado}
        onCancel={() => {
          if (!cambiandoEstado) setUsuarioPendiente(null);
        }}
      />
    </div>
  );
}
