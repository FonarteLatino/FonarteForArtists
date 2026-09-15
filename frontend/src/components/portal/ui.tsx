'use client';

import type { ReactNode } from 'react';

/**
 * Primitivos visuales compartidos por las vistas del portal.
 * Todos los valores que muestran son CONTEOS: nunca dinero.
 */

/** Tarjeta de indicador (KPI). */
export function KpiCard({
  etiqueta,
  valor,
  detalle,
  acento = 'primary',
  icono,
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
  acento?: 'primary' | 'secondary' | 'gold' | 'success';
  icono?: ReactNode;
}) {
  const acentos: Record<string, string> = {
    primary: 'bg-fonarte-primary/10 text-fonarte-primary',
    secondary: 'bg-sky-500/10 text-sky-400',
    gold: 'bg-fonarte-gold/10 text-fonarte-gold',
    success: 'bg-fonarte-success/10 text-fonarte-success',
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-fonarte-border">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold text-fonarte-textMuted uppercase tracking-wider">
          {etiqueta}
        </span>
        {icono && (
          <div
            className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center ${acentos[acento]}`}
          >
            {icono}
          </div>
        )}
      </div>
      <p className="text-2xl lg:text-3xl font-bold text-white mt-3 tabular-nums">{valor}</p>
      {detalle && <p className="text-[11px] text-fonarte-textMuted mt-1">{detalle}</p>}
    </div>
  );
}

/** Contenedor con título para gráficas y tablas. */
export function Panel({
  titulo,
  descripcion,
  acciones,
  children,
  className = '',
}: {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass-panel p-6 rounded-2xl border border-fonarte-border ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-white">{titulo}</h2>
          {descripcion && (
            <p className="text-xs text-fonarte-textMuted mt-0.5 leading-relaxed">{descripcion}</p>
          )}
        </div>
        {acciones}
      </div>
      {children}
    </section>
  );
}

/**
 * Estado vacío. El mensaje distingue tres causas, porque llevan a acciones
 * distintas: hay filtros activos, no hay datos cargados, o el catálogo del
 * artista aún no está registrado.
 */
export function EstadoVacio({
  titulo,
  mensaje,
  accion,
}: {
  titulo: string;
  mensaje: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-fonarte-border flex items-center justify-center text-slate-500 mb-4">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.6}
            d="M9 17V9m4 8V5m4 12v-6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-white">{titulo}</h3>
      <p className="text-xs text-fonarte-textMuted mt-1.5 max-w-md leading-relaxed">{mensaje}</p>
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

/** Spinner de carga con mensaje. */
export function Cargando({ mensaje = 'Cargando estadísticas…' }: { mensaje?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16">
      <div className="w-5 h-5 border-2 border-fonarte-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-fonarte-textMuted">{mensaje}</span>
    </div>
  );
}

/** Banner de error. */
export function BannerError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <div className="p-3.5 rounded-xl bg-fonarte-danger/10 border border-fonarte-danger/30 text-fonarte-danger text-sm flex items-start gap-2.5">
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span className="flex-1">{mensaje}</span>
      {onReintentar && (
        <button
          onClick={onReintentar}
          className="text-xs font-semibold underline hover:no-underline whitespace-nowrap"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

/** Barra de proporción reutilizable (para rankings y desgloses). */
export function BarraProporcion({
  valor,
  maximo,
  color = 'from-fonarte-primary to-fonarte-secondary',
}: {
  valor: number;
  maximo: number;
  color?: string;
}) {
  const pct = maximo > 0 ? Math.max((valor / maximo) * 100, 1.5) : 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
