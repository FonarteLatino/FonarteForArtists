'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { AdminNavbar } from '@/components/AdminNavbar';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [sellosCount, setSellosCount] = useState<number>(0);
  const [artistasCount, setArtistasCount] = useState<number>(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [auditStats, sellos, artistas, logsRes] = await Promise.all([
          api.getAuditStats().catch(() => null),
          api.getSellos().catch(() => []),
          api.getArtistas().catch(() => []),
          api.getAuditLogs({ limit: 6 }).catch(() => ({ logs: [] })),
        ]);

        setStats(auditStats);
        setSellosCount(Array.isArray(sellos) ? sellos.length : 0);
        setArtistasCount(Array.isArray(artistas) ? artistas.length : 0);
        setRecentLogs(logsRes?.logs || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminNavbar
        title="Panel de Administración"
        subtitle="Control general de sellos, catálogo, artistas, permisos y seguridad"
      />

      <main className="p-8 space-y-8 flex-1">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-fonarte-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fonarte-textMuted uppercase tracking-wider">Sellos</span>
              <div className="w-8 h-8 rounded-lg bg-fonarte-primary/10 flex items-center justify-center text-fonarte-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-3">{sellosCount}</p>
            <p className="text-xs text-fonarte-textMuted mt-1">Sellos registrados en la jerarquía</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-fonarte-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fonarte-textMuted uppercase tracking-wider">Artistas</span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-3">{artistasCount}</p>
            <p className="text-xs text-fonarte-textMuted mt-1">Artistas asociados a Fonarte</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-fonarte-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fonarte-textMuted uppercase tracking-wider">Usuarios Activos</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mt-3">{stats?.usuariosActivos ?? 0}</p>
            <p className="text-xs text-fonarte-textMuted mt-1">Cuentas con acceso habilitado</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-fonarte-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-fonarte-textMuted uppercase tracking-wider">Logins (24h)</span>
              <div className="w-8 h-8 rounded-lg bg-fonarte-gold/10 flex items-center justify-center text-fonarte-gold">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-bold text-white">{stats?.ultimas24Horas?.loginsExitosos ?? 0}</span>
              {stats?.ultimas24Horas?.loginsFallidos > 0 && (
                <span className="text-xs text-fonarte-danger font-semibold">
                  ({stats.ultimas24Horas.loginsFallidos} fallidos)
                </span>
              )}
            </div>
            <p className="text-xs text-fonarte-textMuted mt-1">Sesiones iniciadas hoy</p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/usuarios"
            className="glass-card p-6 rounded-2xl border border-fonarte-border group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-fonarte-primary/10 text-fonarte-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Proveer Cuenta / Enviar Invitación</h3>
              <p className="text-xs text-fonarte-textMuted mt-1 leading-relaxed">
                Genera un enlace criptográfico de un solo uso para que el artista active su cuenta sin autoregistro.
              </p>
            </div>
            <span className="text-xs font-semibold text-fonarte-primary mt-6 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Gestionar Usuarios &rarr;
            </span>
          </Link>

          <Link
            href="/admin/permisos"
            className="glass-card p-6 rounded-2xl border border-fonarte-border group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Asignación Granular de Permisos</h3>
              <p className="text-xs text-fonarte-textMuted mt-1 leading-relaxed">
                Concede o revoca accesos por Sello, Artista, Álbum o Canción individual ("lo más específico gana").
              </p>
            </div>
            <span className="text-xs font-semibold text-sky-400 mt-6 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Configurar Accesos &rarr;
            </span>
          </Link>

          <Link
            href="/admin/auditoria"
            className="glass-card p-6 rounded-2xl border border-fonarte-border group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-fonarte-gold/10 text-fonarte-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white">Registro de Auditoría</h3>
              <p className="text-xs text-fonarte-textMuted mt-1 leading-relaxed">
                Trazabilidad inmutable de quién otorgó cada acceso, cambios de contraseña y logins del sistema.
              </p>
            </div>
            <span className="text-xs font-semibold text-fonarte-gold mt-6 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Ver Historial Completo &rarr;
            </span>
          </Link>
        </div>

        {/* Recent Audit Activity */}
        <div className="glass-panel p-6 rounded-2xl border border-fonarte-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Actividad Reciente del Sistema</h2>
              <p className="text-xs text-fonarte-textMuted mt-0.5">Últimos eventos registrados en la tabla inmutable de auditoría</p>
            </div>
            <Link
              href="/admin/auditoria"
              className="text-xs font-semibold text-fonarte-primary hover:underline"
            >
              Ver todos &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                <tr>
                  <th className="pb-3 px-3">Evento</th>
                  <th className="pb-3 px-3">Usuario</th>
                  <th className="pb-3 px-3">Detalle</th>
                  <th className="pb-3 px-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.evento.includes('LOGIN_OK')
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.evento.includes('FAIL')
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : log.evento.includes('PERMISO')
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        {log.evento}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {log.usuario?.email || 'Anónimo / Sistema'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 max-w-xs truncate">
                      {log.detalle || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.fecha).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {recentLogs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No hay eventos registrados recientemente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
