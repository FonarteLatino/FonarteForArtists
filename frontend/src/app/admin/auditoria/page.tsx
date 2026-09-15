'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AdminNavbar } from '@/components/AdminNavbar';

// ============================================================================
// Tipos
// ============================================================================

interface AuditUsuario {
  id: number;
  email: string;
  esAdmin: boolean;
}

interface AuditLog {
  id: number;
  usuarioId: number | null;
  evento: string;
  detalle: string | null;
  ipOrigen: string | null;
  userAgent: string | null;
  fecha: string;
  usuario: AuditUsuario | null;
}

interface AuditLogsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  logs: AuditLog[];
}

interface AuditStats {
  ultimas24Horas: {
    loginsExitosos: number;
    loginsFallidos: number;
    permisosModificados: number;
  };
  usuariosActivos: number;
}

// ============================================================================
// Catálogo de eventos (comparación EXACTA por valor, nunca por substring:
// "LOGIN_OK" y "LOGIN_FAIL" comparten prefijo y no deben colisionar)
// ============================================================================

const EVENT_ORDER: string[] = [
  'LOGIN_OK',
  'LOGIN_FAIL',
  'LOGOUT',
  'PERMISO_OTORGADO',
  'PERMISO_REVOCADO',
  'DATOS_CONSULTADOS',
  'CUENTA_CREADA',
  'CUENTA_DESACTIVADA',
  'INVITACION_CREADA',
];

const EVENT_LABELS: Record<string, string> = {
  LOGIN_OK: 'Inicio de sesión exitoso',
  LOGIN_FAIL: 'Intento de sesión fallido',
  LOGOUT: 'Cierre de sesión',
  PERMISO_OTORGADO: 'Permiso otorgado',
  PERMISO_REVOCADO: 'Permiso revocado',
  DATOS_CONSULTADOS: 'Datos consultados',
  CUENTA_CREADA: 'Cuenta creada',
  CUENTA_DESACTIVADA: 'Cuenta desactivada',
  INVITACION_CREADA: 'Invitación creada',
};

const BADGE_BASE =
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap';

const BADGE_SUCCESS = 'bg-fonarte-success/10 text-fonarte-success border-fonarte-success/20';
const BADGE_DANGER = 'bg-fonarte-danger/10 text-fonarte-danger border-fonarte-danger/30';
const BADGE_NEUTRAL = 'bg-slate-700/40 text-slate-300 border-slate-600/40';

/**
 * Los eventos de permisos se pintan en violeta (identidad de "permisos"),
 * con un punto de color que indica la dirección: verde al otorgar, rojo al
 * revocar.
 */
const EVENT_BADGE_CLASS: Record<string, string> = {
  LOGIN_OK: BADGE_SUCCESS,
  CUENTA_CREADA: BADGE_SUCCESS,
  LOGIN_FAIL: BADGE_DANGER,
  CUENTA_DESACTIVADA: BADGE_DANGER,
  PERMISO_OTORGADO: 'bg-fonarte-primary/10 text-violet-300 border-fonarte-primary/30',
  PERMISO_REVOCADO: 'bg-fonarte-primary/10 text-violet-300 border-fonarte-primary/30',
  LOGOUT: BADGE_NEUTRAL,
  DATOS_CONSULTADOS: BADGE_NEUTRAL,
  INVITACION_CREADA: BADGE_NEUTRAL,
};

const EVENT_DOT_CLASS: Record<string, string> = {
  PERMISO_OTORGADO: 'bg-fonarte-success',
  PERMISO_REVOCADO: 'bg-fonarte-danger',
};

const EVENT_FALLBACK_BADGE = BADGE_NEUTRAL;

const LOGS_PER_PAGE = 25;

// ============================================================================
// Utilidades
// ============================================================================

function labelForEvento(evento: string): string {
  return EVENT_LABELS[evento] ?? evento;
}

function badgeClassForEvento(evento: string): string {
  return EVENT_BADGE_CLASS[evento] ?? EVENT_FALLBACK_BADGE;
}

/** "2025-03-01" -> ISO a las 00:00:00 locales */
function toIsoStart(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** "2025-03-01" -> ISO a las 23:59:59.999 locales */
function toIsoEnd(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function formatFecha(fecha: string): string {
  const date = new Date(fecha);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('es-MX');
}

// ============================================================================
// Sub-componentes locales
// ============================================================================

function KpiCard({
  label,
  value,
  caption,
  icon,
  tone = 'default',
}: {
  label: string;
  value: number | null;
  caption: string;
  icon: React.ReactNode;
  tone?: 'default' | 'danger';
}) {
  const isDanger = tone === 'danger';
  return (
    <div className="glass-card p-6 rounded-2xl border border-fonarte-border transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isDanger
              ? 'bg-fonarte-danger/10 text-fonarte-danger'
              : 'bg-fonarte-primary/10 text-fonarte-primary'
          }`}
        >
          {icon}
        </div>
      </div>
      <p
        className={`text-3xl font-bold mt-3 ${isDanger ? 'text-fonarte-danger' : 'text-white'}`}
      >
        {value === null ? '—' : value}
      </p>
      <p className={`text-xs mt-1 ${isDanger ? 'text-fonarte-danger/80' : 'text-fonarte-textMuted'}`}>
        {caption}
      </p>
    </div>
  );
}

function EventoBadge({ evento }: { evento: string }) {
  const dotClass = EVENT_DOT_CLASS[evento];
  return (
    <span className={`${BADGE_BASE} ${badgeClassForEvento(evento)}`} title={evento}>
      {dotClass && <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />}
      {labelForEvento(evento)}
    </span>
  );
}

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-10 h-10 border-4 border-fonarte-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-fonarte-textMuted font-medium">{label}</p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 bg-fonarte-danger/10 border border-fonarte-danger/30 text-fonarte-danger rounded-xl px-4 py-3">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-xs font-medium leading-relaxed">{message}</p>
    </div>
  );
}

// ============================================================================
// Página
// ============================================================================

export default function AdminAuditoriaPage() {
  // --- KPIs ---
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // --- Bitácora paginada ---
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  // --- Filtros ---
  // Búsqueda libre: se aplica en el cliente sobre la página visible.
  const [search, setSearch] = useState<string>('');
  // Filtros servidor (reinician a la página 1 al cambiar).
  const [evento, setEvento] = useState<string>('');
  const [desde, setDesde] = useState<string>('');
  const [hasta, setHasta] = useState<string>('');

  // --------------------------------------------------------------------------
  // Carga de KPIs
  // --------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const res: AuditStats = await api.getAuditStats();
        if (!cancelled) setStats(res ?? null);
      } catch {
        if (!cancelled) {
          setStats(null);
          setStatsError('No fue posible cargar el resumen de actividad de las últimas 24 horas.');
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // --------------------------------------------------------------------------
  // Carga de bitácora (filtros servidor + paginación)
  // --------------------------------------------------------------------------
  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: AuditLogsResponse = await api.getAuditLogs({
        page,
        limit: LOGS_PER_PAGE,
        evento: evento || undefined,
        desde: toIsoStart(desde),
        hasta: toIsoEnd(hasta),
      });
      setLogs(res?.logs ?? []);
      setTotal(res?.total ?? 0);
      setTotalPages(res?.totalPages ?? 0);
    } catch {
      setLogs([]);
      setTotal(0);
      setTotalPages(0);
      setError(
        'No fue posible cargar el registro de auditoría. Verifica tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, evento, desde, hasta]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs, reloadKey]);

  // --------------------------------------------------------------------------
  // Búsqueda libre en el cliente (solo sobre la página actual)
  // --------------------------------------------------------------------------
  const filteredLogs = useMemo<AuditLog[]>(() => {
    const query = search.trim().toLowerCase();
    if (!query) return logs;
    return logs.filter((log) => {
      const detalle = (log.detalle ?? '').toLowerCase();
      const email = (log.usuario?.email ?? '').toLowerCase();
      return detalle.includes(query) || email.includes(query);
    });
  }, [logs, search]);

  const hasActiveFilters =
    search.trim().length > 0 || evento !== '' || desde !== '' || hasta !== '';

  // --------------------------------------------------------------------------
  // Manejadores de filtros: todo cambio de filtro servidor vuelve a página 1
  // --------------------------------------------------------------------------
  const handleEventoChange = (value: string) => {
    setEvento(value);
    setPage(1);
  };

  const handleDesdeChange = (value: string) => {
    setDesde(value);
    setPage(1);
  };

  const handleHastaChange = (value: string) => {
    setHasta(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setEvento('');
    setDesde('');
    setHasta('');
    setPage(1);
  };

  const refresh = () => {
    setReloadKey((key) => key + 1);
  };

  const goPrev = () => {
    if (!loading && page > 1) setPage((current) => Math.max(1, current - 1));
  };

  const goNext = () => {
    if (loading) return;
    setPage((current) => {
      const max = totalPages > 0 ? totalPages : current;
      return Math.min(max, current + 1);
    });
  };

  const canGoPrev = page > 1 && !loading;
  const canGoNext = totalPages > 0 && page < totalPages && !loading;

  const stats24h = stats?.ultimas24Horas;
  const loginsFallidos = stats24h?.loginsFallidos ?? 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminNavbar
        title="Registro de Auditoría"
        subtitle="Trazabilidad inmutable de inicios de sesión, permisos y acciones administrativas"
      />

      <main className="p-8 space-y-8 flex-1">
        {/* Encabezado / sello de solo lectura */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Bitácora del sistema</h2>
            <p className="text-xs text-fonarte-textMuted mt-0.5">
              Consulta de eventos registrados por el portal. Esta vista es de solo lectura.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fonarte-primary/10 border border-fonarte-primary/30 text-fonarte-primary text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Solo lectura
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={loading || statsLoading}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 border border-fonarte-border bg-fonarte-card hover:bg-slate-800/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Aviso de registro inmutable */}
        <div className="glass-panel p-4 rounded-2xl border border-fonarte-border flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-fonarte-gold/10 text-fonarte-gold flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <p className="text-xs text-fonarte-textMuted leading-relaxed">
            <span className="font-semibold text-slate-300">Registro inmutable de auditoría.</span>{' '}
            Cada entrada se conserva tal como fue escrita y no puede editarse ni eliminarse desde el
            portal. Este historial garantiza la trazabilidad de quién otorgó cada acceso, quién lo
            revocó y quién inició sesión, incluyendo los intentos fallidos.
          </p>
        </div>

        {/* KPIs */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-fonarte-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Resumen de las últimas 24 horas
            </h2>
          </div>

          {statsError && <ErrorBanner message={statsError} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              label="Logins exitosos (24h)"
              value={statsLoading ? null : (stats24h?.loginsExitosos ?? 0)}
              caption="Sesiones iniciadas correctamente"
              icon={<Clock className="w-4 h-4" />}
            />
            <KpiCard
              label="Logins fallidos (24h)"
              value={statsLoading ? null : loginsFallidos}
              caption={
                loginsFallidos > 0
                  ? 'Señal de seguridad: revisa los intentos de sesión fallidos'
                  : 'Sin intentos de sesión fallidos'
              }
              icon={<ShieldAlert className="w-4 h-4" />}
              tone="danger"
            />
            <KpiCard
              label="Permisos modificados (24h)"
              value={statsLoading ? null : (stats24h?.permisosModificados ?? 0)}
              caption="Otorgamientos y revocaciones registradas"
              icon={<KeyRound className="w-4 h-4" />}
            />
            <KpiCard
              label="Usuarios activos"
              value={statsLoading ? null : (stats?.usuariosActivos ?? 0)}
              caption="Cuentas con acceso habilitado"
              icon={<Users className="w-4 h-4" />}
            />
          </div>
        </section>

        {/* Filtros */}
        <section className="glass-panel p-6 rounded-2xl border border-fonarte-border space-y-5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-fonarte-secondary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Filtros de búsqueda
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Búsqueda libre (cliente, página actual) */}
            <div className="space-y-1.5">
              <label
                htmlFor="auditoria-search"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Buscar
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-fonarte-textMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auditoria-search"
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Detalle o correo del usuario"
                  className="w-full rounded-xl bg-fonarte-card border border-fonarte-border pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-fonarte-borderHighlight focus:ring-1 focus:ring-fonarte-primary/40 transition"
                />
              </div>
              <p className="text-[10px] text-fonarte-textMuted">
                Filtra sobre los eventos de la página actual (&laquo;en esta página&raquo;).
              </p>
            </div>

            {/* Evento (servidor) */}
            <div className="space-y-1.5">
              <label
                htmlFor="auditoria-evento"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Evento
              </label>
              <select
                id="auditoria-evento"
                value={evento}
                onChange={(event) => handleEventoChange(event.target.value)}
                className="w-full rounded-xl bg-fonarte-card border border-fonarte-border px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-fonarte-borderHighlight focus:ring-1 focus:ring-fonarte-primary/40 transition"
              >
                <option value="">Todos los eventos</option>
                {EVENT_ORDER.map((value) => (
                  <option key={value} value={value}>
                    {labelForEvento(value)}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-fonarte-textMuted">
                Se aplica en el servidor sobre todo el historial.
              </p>
            </div>

            {/* Desde (servidor) */}
            <div className="space-y-1.5">
              <label
                htmlFor="auditoria-desde"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Desde
              </label>
              <input
                id="auditoria-desde"
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(event) => handleDesdeChange(event.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full rounded-xl bg-fonarte-card border border-fonarte-border px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-fonarte-borderHighlight focus:ring-1 focus:ring-fonarte-primary/40 transition"
              />
            </div>

            {/* Hasta (servidor) */}
            <div className="space-y-1.5">
              <label
                htmlFor="auditoria-hasta"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Hasta
              </label>
              <input
                id="auditoria-hasta"
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(event) => handleHastaChange(event.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full rounded-xl bg-fonarte-card border border-fonarte-border px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-fonarte-borderHighlight focus:ring-1 focus:ring-fonarte-primary/40 transition"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-fonarte-textMuted">
              {hasActiveFilters
                ? 'Filtros activos. Los filtros de evento y fecha se aplican en el servidor; la búsqueda de texto, en la página visible.'
                : 'Sin filtros activos: se muestran los eventos más recientes.'}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold border border-fonarte-border bg-fonarte-card text-slate-300 hover:bg-slate-800/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </button>
          </div>
        </section>

        {/* Bitácora */}
        <section className="glass-panel p-6 rounded-2xl border border-fonarte-border space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Eventos registrados</h2>
              <p className="text-xs text-fonarte-textMuted mt-0.5">
                {loading
                  ? 'Consultando la tabla inmutable de auditoría...'
                  : `Página ${page} de ${totalPages > 0 ? totalPages : 1} · ${total} ${
                      total === 1 ? 'registro' : 'registros'
                    } en total`}
              </p>
            </div>
            {!loading && (
              <p className="text-[11px] text-fonarte-textMuted">
                Mostrando {filteredLogs.length} de {logs.length} eventos de esta página
              </p>
            )}
          </div>

          {error && <ErrorBanner message={error} />}

          {loading ? (
            <LoadingSpinner label="Cargando registro de auditoría..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                  <tr>
                    <th className="pb-3 px-3">Fecha y hora</th>
                    <th className="pb-3 px-3">Evento</th>
                    <th className="pb-3 px-3">Usuario</th>
                    <th className="pb-3 px-3">Detalle</th>
                    <th className="pb-3 px-3">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap align-top">
                        {formatFecha(log.fecha)}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <EventoBadge evento={log.evento} />
                      </td>
                      <td className="py-3 px-3 align-top">
                        {log.usuario ? (
                          <div className="flex flex-col">
                            <span className="text-slate-200 font-medium">{log.usuario.email}</span>
                            <span className="text-[10px] text-fonarte-textMuted">
                              {log.usuario.esAdmin ? 'Administrador' : 'Usuario'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-fonarte-textMuted italic">Anónimo / Sistema</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 align-top max-w-md">
                        {log.detalle ? (
                          <span className="block break-words">{log.detalle}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap align-top font-mono text-[11px]">
                        <span title={log.userAgent ?? undefined}>{log.ipOrigen ?? '—'}</span>
                      </td>
                    </tr>
                  ))}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800/60 text-slate-500 flex items-center justify-center">
                            <Search className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-medium text-slate-300">
                            {logs.length === 0
                              ? 'No hay eventos que coincidan con los filtros'
                              : 'Ningún evento de esta página coincide con la búsqueda'}
                          </p>
                          <p className="text-xs text-fonarte-textMuted max-w-sm">
                            {logs.length === 0
                              ? 'Ajusta el rango de fechas, el tipo de evento o limpia los filtros para consultar el historial completo.'
                              : 'La búsqueda de texto solo revisa la página actual. Limpia el campo de búsqueda o cambia de página para ver más resultados.'}
                          </p>
                          {hasActiveFilters && (
                            <button
                              type="button"
                              onClick={clearFilters}
                              className="mt-1 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold border border-fonarte-border bg-fonarte-card text-slate-300 hover:bg-slate-800/30 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                              Limpiar filtros
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-fonarte-border pt-4">
            <p className="text-xs text-fonarte-textMuted">
              Página <span className="font-semibold text-slate-300">{page}</span> de{' '}
              <span className="font-semibold text-slate-300">{totalPages > 0 ? totalPages : 1}</span>{' '}
              · <span className="font-semibold text-slate-300">{total}</span>{' '}
              {total === 1 ? 'registro' : 'registros'}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canGoPrev}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border border-fonarte-border bg-fonarte-card text-slate-300 hover:bg-slate-800/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border border-fonarte-border bg-fonarte-card text-slate-300 hover:bg-slate-800/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
