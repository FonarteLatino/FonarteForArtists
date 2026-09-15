'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { useStats } from '@/components/portal/StatsProvider';

const navItems = [
  { nombre: 'Resumen', href: '/portal' },
  { nombre: 'Canciones', href: '/portal/canciones' },
  { nombre: 'Álbumes y videos', href: '/portal/albumes' },
  { nombre: 'Plataformas', href: '/portal/plataformas' },
  { nombre: 'Audiencia', href: '/portal/mapa' },
  { nombre: 'Tendencia', href: '/portal/tendencia' },
];

export function PortalNavbar() {
  const pathname = usePathname();
  const { artistaNombre, selloNombre, cargando, hayFiltros } = useStats();

  return (
    <header className="border-b border-fonarte-border glass-panel sticky top-0 z-30">
      <div className="px-6 lg:px-8 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-tr from-fonarte-primary to-fonarte-secondary flex items-center justify-center shadow-md shadow-fonarte-primary/30">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-fonarte-primary tracking-widest uppercase">
                Fonarte For Artists
              </p>
              <h1 className="text-lg font-bold tracking-tight text-white truncate leading-tight">
                {cargando && !artistaNombre ? 'Cargando…' : artistaNombre || 'Portal del artista'}
              </h1>
              {selloNombre && (
                <p className="text-[11px] text-fonarte-textMuted truncate">{selloNombre}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fonarte-primary/10 border border-fonarte-primary/20 text-fonarte-primary text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-fonarte-primary" />
              Solo conteos de reproducciones
            </span>
            <button
              onClick={() => api.logout()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-fonarte-border hover:bg-slate-800/60 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex items-center gap-1 mt-5 overflow-x-auto -mb-px">
          {navItems.map((item) => {
            const activo =
              item.href === '/portal'
                ? pathname === '/portal'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  activo
                    ? 'border-fonarte-primary text-white'
                    : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {item.nombre}
              </Link>
            );
          })}
        </nav>
      </div>

      {hayFiltros && (
        <div className="px-6 lg:px-8 py-2 bg-fonarte-primary/5 border-t border-fonarte-primary/10">
          <p className="text-[11px] text-fonarte-textMuted">
            Hay filtros activos — las cifras mostradas corresponden únicamente al subconjunto
            filtrado.
          </p>
        </div>
      )}
    </header>
  );
}
