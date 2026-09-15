'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStats } from '@/components/portal/StatsProvider';
import { FiltrosStats } from '@/components/portal/FiltrosStats';
import {
  BannerError,
  BarraProporcion,
  Cargando,
  EstadoVacio,
  KpiCard,
  Panel,
} from '@/components/portal/ui';
import { formatearCompacto, formatearNumero, formatearPorcentaje, nombrePlataforma } from '@/lib/formato';

/**
 * /portal/plataformas — Desglose de reproducciones por plataforma de distribución.
 *
 * Requisito del plan (§8): "desglose por plataforma de distribución" con
 * "filtros por rango de fechas y por plataforma" (la barra compartida).
 *
 * ⚠️ Esta vista muestra EXCLUSIVAMENTE conteos de reproducciones. No hay montos,
 * pagos, regalías ni moneda de ningún tipo, ni formateador de dinero disponible.
 */

/** Paleta de marca para las rebanadas y barras (violeta, cielo, oro, esmeralda…). */
const PALETA = [
  '#8b5cf6',
  '#38bdf8',
  '#f59e0b',
  '#10b981',
  '#f472b6',
  '#22d3ee',
  '#a3e635',
  '#fb7185',
  '#818cf8',
];

/** Cuántas plataformas se dibujan por separado antes de agrupar el resto. */
const TOP_PLATAFORMAS = 6;

const ESTILO_TOOLTIP = {
  background: '#111726',
  border: '1px solid #1e293b',
  borderRadius: 12,
  color: '#fff',
  fontSize: 12,
  padding: '8px 12px',
} as const;

const ESTILO_ETIQUETA = { color: '#e2e8f0', fontWeight: 600, marginBottom: 4 } as const;
const ESTILO_ITEM = { color: '#cbd5e1' } as const;

interface FilaPlataforma {
  plataforma: string;
  streams: number;
  porcentaje: number;
  /** `true` cuando la fila agrega varias plataformas menores ("Otras"). */
  esAgrupada?: boolean;
}

interface DatosTooltip {
  active?: boolean;
  payload?: Array<{ payload?: unknown; name?: string; value?: number | string }>;
  label?: string | number;
}

/** Tooltip oscuro compartido por las gráficas; siempre formatea conteos. */
function TooltipConteos({ active, payload, label }: DatosTooltip) {
  if (!active || !payload || payload.length === 0) return null;

  const filas = payload.map((entrada, indice) => {
    const dato = (entrada.payload ?? {}) as Partial<FilaPlataforma>;
    const nombre = dato.plataforma ?? entrada.name ?? 'Serie';
    const valor = Number(dato.streams ?? entrada.value ?? 0) || 0;
    const porcentaje = dato.porcentaje;
    return {
      clave: `${nombre}-${indice}`,
      color: PALETA[indice % PALETA.length],
      nombre,
      etiqueta: Number.isFinite(Number(porcentaje))
        ? `${formatearNumero(valor)} · ${formatearPorcentaje(Number(porcentaje))}`
        : formatearNumero(valor),
    };
  });

  return (
    <div style={ESTILO_TOOLTIP}>
      {label !== undefined && label !== '' && <p style={ESTILO_ETIQUETA}>{String(label)}</p>}
      {filas.map((fila) => (
        <div key={fila.clave} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: fila.color }}
          />
          <span style={{ color: '#94a3b8' }}>{fila.nombre}</span>
          <span className="tabular-nums font-semibold ml-2">{fila.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}

/** Tooltip del pastel: recharts entrega la rebanada dentro de `payload[0].payload`. */
function TooltipPastel({ active, payload }: DatosTooltip) {
  if (!active || !payload || payload.length === 0) return null;
  const dato = (payload[0]?.payload ?? null) as FilaPlataforma | null;
  if (!dato) return null;

  return (
    <div style={ESTILO_TOOLTIP}>
      <p style={ESTILO_ETIQUETA}>{dato.plataforma}</p>
      <p className="tabular-nums" style={ESTILO_ITEM}>
        {formatearNumero(dato.streams)} reproducciones
      </p>
      <p className="tabular-nums" style={ESTILO_ITEM}>
        {formatearPorcentaje(dato.porcentaje)} del total filtrado
      </p>
    </div>
  );
}

function BotonAlternar<T extends string>({
  valor,
  opciones,
  onChange,
  etiqueta,
}: {
  valor: T;
  opciones: Array<{ valor: T; texto: string }>;
  onChange: (siguiente: T) => void;
  etiqueta: string;
}) {
  return (
    <div
      role="group"
      aria-label={etiqueta}
      className="inline-flex items-center gap-1 p-1 rounded-xl border border-fonarte-border bg-slate-900/60"
    >
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          onClick={() => onChange(opcion.valor)}
          aria-pressed={valor === opcion.valor}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
            valor === opcion.valor
              ? 'bg-fonarte-primary/20 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {opcion.texto}
        </button>
      ))}
    </div>
  );
}

export default function PortalPlataformasPage() {
  const { plataformas, streamsTotales, cargando, error, recargar, hayFiltros, limpiarFiltros } =
    useStats();

  const [orden, setOrden] = useState<'streams' | 'alfabetico'>('streams');

  // ---------------------------------------------------------------------------
  // Series derivadas
  // ---------------------------------------------------------------------------
  const totales = useMemo(
    () => plataformas.reduce((acc, p) => acc + (Number(p.streams) || 0), 0),
    [plataformas],
  );

  /**
   * Serie de las gráficas: las `TOP_PLATAFORMAS` mayores y, si sobran dos o más,
   * el resto agrupado como "Otras". La tabla siempre lista todas las plataformas.
   */
  const serieGrafica = useMemo<FilaPlataforma[]>(() => {
    const base = plataformas.map((p) => ({
      plataforma: nombrePlataforma(p.plataforma),
      streams: Number(p.streams) || 0,
      porcentaje: Number(p.porcentaje) || 0,
    }));

    if (base.length <= TOP_PLATAFORMAS) return base;

    const visibles = base.slice(0, TOP_PLATAFORMAS - 1);
    const resto = base.slice(TOP_PLATAFORMAS - 1);

    // Con una sola plataforma restante no vale la pena agrupar: se muestra tal cual.
    if (resto.length === 1) return base;

    const streamsResto = resto.reduce((acc, p) => acc + p.streams, 0);
    return [
      ...visibles,
      {
        plataforma: `Otras (${resto.length})`,
        streams: streamsResto,
        porcentaje: totales > 0 ? Math.round((streamsResto / totales) * 10000) / 100 : 0,
        esAgrupada: true,
      },
    ];
  }, [plataformas, totales]);

  const filasTabla = useMemo<FilaPlataforma[]>(() => {
    const base = plataformas.map((p) => ({
      plataforma: nombrePlataforma(p.plataforma),
      streams: Number(p.streams) || 0,
      porcentaje: Number(p.porcentaje) || 0,
    }));

    if (orden === 'alfabetico') {
      return [...base].sort((a, b) => a.plataforma.localeCompare(b.plataforma, 'es-MX'));
    }
    return [...base].sort((a, b) => b.streams - a.streams);
  }, [plataformas, orden]);

  const lider = plataformas.length > 0 ? plataformas[0] : null;
  const maximoTabla = filasTabla.reduce((max, fila) => Math.max(max, fila.streams), 0);
  const hayDatos = plataformas.length > 0;

  // ---------------------------------------------------------------------------
  // Estados
  // ---------------------------------------------------------------------------
  if (cargando) {
    return (
      <div className="space-y-6">
        <FiltrosStats />
        <Cargando mensaje="Cargando el desglose por plataforma…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <FiltrosStats />
        <BannerError mensaje={error} onReintentar={recargar} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FiltrosStats />

      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Distribución por plataforma
          </h1>
          <p className="text-xs text-fonarte-textMuted mt-0.5 leading-relaxed">
            Reproducciones agrupadas por plataforma de distribución. Solo se cuentan escuchas: esta
            vista no incluye pagos ni regalías.
          </p>
        </div>
        {hayFiltros && hayDatos && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fonarte-primary/10 border border-fonarte-primary/30 text-fonarte-primary text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-fonarte-primary" />
            Cifras del subconjunto filtrado
          </span>
        )}
      </div>

      {!hayDatos ? (
        <Panel titulo="Sin datos que mostrar">
          {hayFiltros ? (
            <EstadoVacio
              titulo="Ninguna plataforma coincide con los filtros"
              mensaje="Los filtros activos (rango de fechas, plataforma o país) dejan el conjunto sin reproducciones. Ajusta el rango o limpia los filtros para ver el desglose completo."
              accion={
                <button
                  onClick={limpiarFiltros}
                  className="px-4 py-2.5 rounded-xl bg-fonarte-primary hover:bg-fonarte-primaryHover text-white text-sm font-medium transition"
                >
                  Limpiar filtros
                </button>
              }
            />
          ) : (
            <EstadoVacio
              titulo="Aún no hay reproducciones registradas"
              mensaje="Cuando tus distribuciones empiecen a reportar escuchas, aquí verás el desglose por plataforma con su participación sobre el total."
            />
          )}
        </Panel>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              etiqueta="Plataformas activas"
              valor={formatearNumero(plataformas.length)}
              detalle={
                plataformas.length === 1
                  ? 'Una sola plataforma reportando en el rango'
                  : 'Plataformas con al menos una reproducción'
              }
              acento="primary"
              icono={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M4 6h16M4 12h10M4 18h7"
                  />
                </svg>
              }
            />
            <KpiCard
              etiqueta="Plataforma líder"
              valor={lider ? nombrePlataforma(lider.plataforma) : '—'}
              detalle={
                lider
                  ? `${formatearNumero(lider.streams)} reproducciones · ${formatearPorcentaje(
                      lider.porcentaje,
                    )} del total`
                  : 'Sin datos en el rango seleccionado'
              }
              acento="gold"
              icono={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.2l5.9-.9L12 3z"
                  />
                </svg>
              }
            />
            <KpiCard
              etiqueta="Reproducciones totales"
              valor={formatearNumero(streamsTotales)}
              detalle="Suma de todas las plataformas del conjunto filtrado"
              acento="secondary"
              icono={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
                  />
                </svg>
              }
            />
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Panel
              titulo="Participación por plataforma"
              descripcion="Porcentaje de reproducciones de cada plataforma sobre el total del conjunto filtrado."
            >
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serieGrafica}
                      dataKey="streams"
                      nameKey="plataforma"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={104}
                      paddingAngle={2}
                      stroke="#0f172a"
                      strokeWidth={2}
                    >
                      {serieGrafica.map((fila, indice) => (
                        <Cell
                          key={fila.plataforma}
                          fill={fila.esAgrupada ? '#475569' : PALETA[indice % PALETA.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<TooltipPastel />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel
              titulo="Reproducciones por plataforma"
              descripcion="Conteo absoluto de escuchas en cada plataforma del conjunto filtrado."
            >
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serieGrafica}
                    layout="vertical"
                    margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
                  >
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(valor: number) => formatearCompacto(valor)}
                    />
                    <YAxis
                      type="category"
                      dataKey="plataforma"
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      width={104}
                    />
                    <Tooltip content={<TooltipConteos />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                    <Bar dataKey="streams" name="Reproducciones" radius={[0, 6, 6, 0]}>
                      {serieGrafica.map((fila, indice) => (
                        <Cell
                          key={fila.plataforma}
                          fill={fila.esAgrupada ? '#475569' : PALETA[indice % PALETA.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          {/* Tabla completa */}
          <Panel
            titulo="Todas las plataformas"
            descripcion={`La tabla lista las ${plataformas.length} ${
              plataformas.length === 1 ? 'plataforma' : 'plataformas'
            } del conjunto filtrado. Las gráficas solo dibujan las ${Math.min(
              TOP_PLATAFORMAS,
              plataformas.length,
            )} principales${
              plataformas.length > TOP_PLATAFORMAS ? ', agrupando el resto como "Otras"' : ''
            }.`}
            acciones={
              <BotonAlternar
                etiqueta="Orden de la tabla"
                valor={orden}
                onChange={setOrden}
                opciones={[
                  { valor: 'streams', texto: 'Por reproducciones' },
                  { valor: 'alfabetico', texto: 'A–Z' },
                ]}
              />
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                  <tr>
                    <th className="pb-3 px-3 w-10">#</th>
                    <th className="pb-3 px-3">Plataforma</th>
                    <th className="pb-3 px-3 text-right">Reproducciones</th>
                    <th className="pb-3 px-3 text-right">Participación</th>
                    <th className="pb-3 px-3 w-48 hidden md:table-cell">Proporción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filasTabla.map((fila, indice) => (
                    <tr key={fila.plataforma} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-500 tabular-nums">{indice + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              background:
                                indice < TOP_PLATAFORMAS
                                  ? PALETA[indice % PALETA.length]
                                  : '#475569',
                            }}
                          />
                          <span className="text-slate-200 font-medium">{fila.plataforma}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-white font-semibold tabular-nums">
                        {formatearNumero(fila.streams)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                        {formatearPorcentaje(fila.porcentaje)}
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <BarraProporcion
                          valor={fila.streams}
                          maximo={maximoTabla}
                          color={
                            indice === 0
                              ? 'from-fonarte-gold to-fonarte-primary'
                              : 'from-fonarte-primary to-fonarte-secondary'
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-fonarte-textMuted mt-4 leading-relaxed">
              La columna «Participación» se calcula sobre el total de reproducciones del conjunto
              filtrado ({formatearNumero(totales)}), no sobre el catálogo completo.
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
