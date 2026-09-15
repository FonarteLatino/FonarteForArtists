'use client';

import { useStats } from '@/components/portal/StatsProvider';
import { formatearPeriodo, nombrePais } from '@/lib/formato';

/**
 * Barra de filtros compartida por todas las vistas del portal.
 *
 * Filtros del plan §8: rango de fechas y plataforma. Se añade país porque la
 * vista geográfica lo necesita y el backend ya lo soporta.
 *
 * Los filtros se traducen a los parámetros que acepta `StatsFiltroDto`
 * (periODOInicio/periodoFin en formato YYYY-MM, plataforma, pais).
 */
export function FiltrosStats() {
  const {
    filtros,
    setFiltros,
    limpiarFiltros,
    hayFiltros,
    opcionesPlataforma,
    opcionesPais,
    rangoPeriodos,
    cargando,
  } = useStats();

  const actualizar = (parcial: Partial<typeof filtros>) => {
    setFiltros({ ...filtros, ...parcial });
  };

  const claseInput =
    'px-3 py-2.5 rounded-xl bg-slate-900/80 border border-fonarte-border text-white text-xs focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition';

  return (
    <div className="glass-panel p-4 rounded-2xl border border-fonarte-border">
      <div className="flex flex-wrap items-end gap-3">
        {/* Rango de fechas */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Desde
          </label>
          <input
            type="month"
            value={filtros.periodoInicio ?? ''}
            min={rangoPeriodos.min ?? undefined}
            max={filtros.periodoFin ?? rangoPeriodos.max ?? undefined}
            onChange={(e) => actualizar({ periodoInicio: e.target.value || undefined })}
            className={claseInput}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Hasta
          </label>
          <input
            type="month"
            value={filtros.periodoFin ?? ''}
            min={filtros.periodoInicio ?? rangoPeriodos.min ?? undefined}
            max={rangoPeriodos.max ?? undefined}
            onChange={(e) => actualizar({ periodoFin: e.target.value || undefined })}
            className={claseInput}
          />
        </div>

        {/* Plataforma */}
        <div className="flex flex-col gap-1.5 min-w-[10rem]">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Plataforma
          </label>
          <select
            value={filtros.plataforma ?? ''}
            onChange={(e) => actualizar({ plataforma: e.target.value || undefined })}
            disabled={opcionesPlataforma.length === 0}
            className={`${claseInput} disabled:opacity-50`}
          >
            <option value="">Todas</option>
            {opcionesPlataforma.map((p) => (
              <option key={p.plataforma} value={p.plataforma}>
                {p.plataforma}
              </option>
            ))}
          </select>
        </div>

        {/* País */}
        <div className="flex flex-col gap-1.5 min-w-[10rem]">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            País
          </label>
          <select
            value={filtros.pais ?? ''}
            onChange={(e) => actualizar({ pais: e.target.value || undefined })}
            disabled={opcionesPais.length === 0}
            className={`${claseInput} disabled:opacity-50`}
          >
            <option value="">Todos</option>
            {opcionesPais.map((p) => (
              <option key={p.codigoPais} value={p.codigoPais}>
                {nombrePais(p.codigoPais)}
              </option>
            ))}
          </select>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 ml-auto">
          {rangoPeriodos.min && rangoPeriodos.max && (
            <span className="text-[10px] text-fonarte-textMuted whitespace-nowrap">
              Datos de {formatearPeriodo(rangoPeriodos.min)} a{' '}
              {formatearPeriodo(rangoPeriodos.max)}
            </span>
          )}
          <button
            onClick={limpiarFiltros}
            disabled={!hayFiltros || cargando}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 border border-fonarte-border hover:bg-slate-800/60 transition disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
