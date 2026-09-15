'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import type { PuntoTendencia } from '@/lib/stats-types';
import {
  formatearCompacto,
  formatearNumero,
  formatearPorcentaje,
  formatearPeriodo,
  nombrePlataforma,
} from '@/lib/formato';

/**
 * /portal/tendencia — Evolución de las reproducciones en el tiempo.
 *
 * Requisito del plan (§8): "tendencia en el tiempo" con "filtros por rango de
 * fechas y por plataforma" (barra compartida de filtros).
 *
 * ⚠️ Esta vista muestra EXCLUSIVAMENTE conteos de reproducciones. La variación
 * entre períodos es una variación de ESCUCHAS, no de dinero: no hay montos,
 * pagos, regalías ni moneda en ninguna parte, y no existe formateador de dinero.
 */

/** Paleta de marca para las series por plataforma. */
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

/** Plataformas con serie propia en la gráfica apilada. */
const TOP_PLATAFORMAS = 5;

const ESTILO_TOOLTIP = {
  background: '#111726',
  border: '1px solid #1e293b',
  borderRadius: 12,
  color: '#fff',
  fontSize: 12,
  padding: '8px 12px',
} as const;

const ESTILO_ETIQUETA = { color: '#e2e8f0', fontWeight: 600, marginBottom: 4 } as const;

type TipoGrafica = 'area' | 'linea';
type EscalaEje = 'lineal' | 'logaritmica';

interface DatosTooltip {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name?: string;
    value?: number | string;
    payload?: unknown;
    color?: string;
  }>;
  label?: string | number;
}

interface FilaPeriodo {
  periodo: string;
  streams: number;
  participacion: number;
  variacion: number | null;
  variacionPct: number | null;
}

interface PlataformaSerie {
  plataforma: string;
  streams: number;
}

interface PuntoApilado {
  periodo: string;
  total: number;
  [plataforma: string]: number | string;
}

/** Tooltip de la serie temporal (conteos + participación del rango). */
function TooltipTendencia({ active, payload, label }: DatosTooltip) {
  if (!active || !payload || payload.length === 0) return null;

  const punto = (payload[0]?.payload ?? null) as PuntoTendencia | null;
  if (!punto) return null;

  return (
    <div style={ESTILO_TOOLTIP}>
      <p style={ESTILO_ETIQUETA}>{formatearPeriodo(String(label ?? punto.periodo))}</p>
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: '#8b5cf6' }}
        />
        <span style={{ color: '#94a3b8' }}>Reproducciones</span>
        <span className="tabular-nums font-semibold ml-2">
          {formatearNumero(punto.streams)}
        </span>
      </div>
    </div>
  );
}

/** Tooltip de la gráfica apilada: una fila por plataforma más el total. */
function TooltipApilado({ active, payload, label }: DatosTooltip) {
  if (!active || !payload || payload.length === 0) return null;

  const filas = payload
    .map((entrada, indice) => ({
      clave: `${String(entrada.dataKey ?? indice)}-${indice}`,
      nombre: nombrePlataforma(String(entrada.name ?? entrada.dataKey ?? 'Serie')),
      valor: Number(entrada.value) || 0,
      color: entrada.color ?? PALETA[indice % PALETA.length],
    }))
    .filter((fila) => fila.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  if (filas.length === 0) return null;

  const total = filas.reduce((acc, fila) => acc + fila.valor, 0);

  return (
    <div style={ESTILO_TOOLTIP}>
      <p style={ESTILO_ETIQUETA}>{formatearPeriodo(String(label ?? ''))}</p>
      {filas.map((fila) => (
        <div key={fila.clave} className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: fila.color }}
          />
          <span style={{ color: '#94a3b8' }}>{fila.nombre}</span>
          <span className="tabular-nums font-semibold ml-2">{formatearNumero(fila.valor)}</span>
        </div>
      ))}
      <div className="mt-1 pt-1 border-t border-slate-700/70 flex items-center gap-2">
        <span style={{ color: '#94a3b8' }}>Total del período</span>
        <span className="tabular-nums font-semibold ml-auto">{formatearNumero(total)}</span>
      </div>
    </div>
  );
}

/** Variación entre dos períodos, ya calculada y clasificada. */
interface Variacion {
  /** `true` cuando no hay período previo con el que comparar. */
  sinComparacion: boolean;
  /** Diferencia absoluta en reproducciones. */
  delta: number;
  /** Variación relativa en porcentaje, o `null` si el período previo era 0. */
  porcentaje: number | null;
  direccion: 'sube' | 'baja' | 'estable';
  texto: string;
  detalle: string;
  /** Color del indicador (verde sube, rojo baja, gris sin comparación). */
  clase: string;
}

/**
 * Calcula la variación entre los dos últimos períodos.
 * Casos cubiertos: sin datos, un solo período (no hay comparación), período
 * previo en cero (no se puede expresar en porcentaje) y variación negativa.
 */
function calcularVariacion(serie: PuntoTendencia[]): Variacion {
  if (serie.length === 0) {
    return {
      sinComparacion: true,
      delta: 0,
      porcentaje: null,
      direccion: 'estable',
      texto: '—',
      detalle: 'Sin períodos en el rango seleccionado',
      clase: 'text-fonarte-textMuted',
    };
  }

  const actual = serie[serie.length - 1];
  const anterior = serie.length > 1 ? serie[serie.length - 2] : null;

  if (!anterior) {
    return {
      sinComparacion: true,
      delta: 0,
      porcentaje: null,
      direccion: 'estable',
      texto: 'Sin comparación',
      detalle: `Solo hay un período en el rango (${formatearPeriodo(actual.periodo)}); se necesita al menos un mes previo para medir la variación.`,
      clase: 'text-fonarte-textMuted',
    };
  }

  const delta = actual.streams - anterior.streams;
  const porcentaje =
    anterior.streams > 0 ? Math.round((delta / anterior.streams) * 10000) / 100 : null;

  const signo = delta > 0 ? '+' : delta < 0 ? '−' : '';
  const texto =
    porcentaje === null
      ? `${signo}${formatearNumero(Math.abs(delta))}`
      : `${signo}${Math.abs(porcentaje).toFixed(1)} %`;

  const detalle =
    porcentaje === null
      ? `Sin base de comparación: ${formatearPeriodo(anterior.periodo)} acumuló 0 reproducciones.`
      : `${delta >= 0 ? '+' : '−'}${formatearNumero(Math.abs(delta))} reproducciones vs. ${formatearPeriodo(anterior.periodo)}`;

  return {
    sinComparacion: false,
    delta,
    porcentaje,
    direccion: delta > 0 ? 'sube' : delta < 0 ? 'baja' : 'estable',
    texto,
    detalle,
    clase: delta > 0 ? 'text-fonarte-success' : delta < 0 ? 'text-fonarte-danger' : 'text-slate-300',
  };
}

function IconoDireccion({ direccion }: { direccion: Variacion['direccion'] }) {
  if (direccion === 'sube') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  if (direccion === 'baja') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
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

export default function PortalTendenciaPage() {
  const { tendencia, canciones, streamsTotales, cargando, error, recargar, hayFiltros, limpiarFiltros } =
    useStats();

  const [tipoGrafica, setTipoGrafica] = useState<TipoGrafica>('area');
  const [escala, setEscala] = useState<EscalaEje>('lineal');

  // ---------------------------------------------------------------------------
  // Series derivadas
  // ---------------------------------------------------------------------------
  /** Serie ascendente por período; el proveedor ya la entrega ordenada. */
  const serie = useMemo<PuntoTendencia[]>(
    () =>
      [...tendencia]
        .map((p) => ({ periodo: p.periodo, streams: Number(p.streams) || 0 }))
        .sort((a, b) => a.periodo.localeCompare(b.periodo)),
    [tendencia],
  );

  const totalRango = useMemo(
    () => serie.reduce((acc, punto) => acc + punto.streams, 0),
    [serie],
  );

  const ultimo = serie.length > 0 ? serie[serie.length - 1] : null;
  const variacion = useMemo(() => calcularVariacion(serie), [serie]);

  /** Desglose período a período, del más reciente al más antiguo. */
  const filasPeriodo = useMemo<FilaPeriodo[]>(() => {
    const conVariacion: FilaPeriodo[] = serie.map((punto, indice) => {
      const previo = indice > 0 ? serie[indice - 1] : null;
      const delta = previo ? punto.streams - previo.streams : null;
      const deltaPct =
        previo && previo.streams > 0 && delta !== null
          ? Math.round((delta / previo.streams) * 10000) / 100
          : null;

      return {
        periodo: punto.periodo,
        streams: punto.streams,
        participacion: totalRango > 0 ? Math.round((punto.streams / totalRango) * 10000) / 100 : 0,
        variacion: delta,
        variacionPct: deltaPct,
      };
    });

    return conVariacion.reverse();
  }, [serie, totalRango]);

  const maximoPeriodo = filasPeriodo.reduce((max, fila) => Math.max(max, fila.streams), 0);
  const maximoStreams = serie.reduce((max, punto) => Math.max(max, punto.streams), 0);

  /**
   * La escala logarítmica no puede representar el cero: si algún período tiene 0
   * reproducciones se avisa y se mantiene la escala lineal.
   */
  const hayCeros = serie.some((punto) => punto.streams <= 0);
  const escalaEfectiva: EscalaEje = escala === 'logaritmica' && !hayCeros ? 'logaritmica' : 'lineal';

  const dominioY: [number | string, number | string] =
    escalaEfectiva === 'logaritmica'
      ? [Math.max(1, Math.floor(maximoStreams / 100)), 'auto']
      : [0, 'auto'];

  // ---------------------------------------------------------------------------
  // Tendencia por plataforma (derivada del dataset plano)
  // ---------------------------------------------------------------------------
  const plataformasTop = useMemo<PlataformaSerie[]>(() => {
    const mapa = new Map<string, number>();

    for (const cancion of canciones) {
      const plataforma = nombrePlataforma(cancion.plataforma);
      mapa.set(plataforma, (mapa.get(plataforma) || 0) + (Number(cancion.streams) || 0));
    }

    return Array.from(mapa.entries())
      .map(([plataforma, streams]) => ({ plataforma, streams }))
      .sort((a, b) => b.streams - a.streams)
      .slice(0, TOP_PLATAFORMAS);
  }, [canciones]);

  const tieneOtrasPlataformas = useMemo(() => {
    const total = new Set(canciones.map((c) => nombrePlataforma(c.plataforma)));
    return total.size > plataformasTop.length;
  }, [canciones, plataformasTop]);

  const datosApilados = useMemo<PuntoApilado[]>(() => {
    if (plataformasTop.length === 0 || serie.length === 0) return [];

    const nombres = plataformasTop.map((p) => p.plataforma);
    const porPeriodo = new Map<string, Map<string, number>>();

    for (const cancion of canciones) {
      if (!cancion.periodo) continue;
      const plataforma = nombrePlataforma(cancion.plataforma);
      if (!nombres.includes(plataforma)) continue;

      const fila = porPeriodo.get(cancion.periodo) ?? new Map<string, number>();
      fila.set(plataforma, (fila.get(plataforma) || 0) + (Number(cancion.streams) || 0));
      porPeriodo.set(cancion.periodo, fila);
    }

    return serie.map((punto) => {
      const fila = porPeriodo.get(punto.periodo);
      const acumulado: PuntoApilado = { periodo: punto.periodo, total: punto.streams };
      for (const nombre of nombres) {
        acumulado[nombre] = fila?.get(nombre) ?? 0;
      }
      return acumulado;
    });
  }, [canciones, plataformasTop, serie]);

  const hayDatos = serie.length > 0;
  const hayApilado = datosApilados.length > 0;

  // ---------------------------------------------------------------------------
  // Estados
  // ---------------------------------------------------------------------------
  if (cargando) {
    return (
      <div className="space-y-6">
        <FiltrosStats />
        <Cargando mensaje="Cargando la evolución en el tiempo…" />
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

  /** Props compartidas por las gráficas de serie temporal. */
  const ejeX = (
    <XAxis
      dataKey="periodo"
      stroke="#94a3b8"
      tick={{ fill: '#94a3b8', fontSize: 11 }}
      tickFormatter={(valor: string) => formatearPeriodo(valor)}
      minTickGap={12}
    />
  );

  const ejeY = (
    <YAxis
      stroke="#94a3b8"
      tick={{ fill: '#94a3b8', fontSize: 11 }}
      width={64}
      scale={escalaEfectiva === 'logaritmica' ? 'log' : 'linear'}
      domain={dominioY}
      allowDataOverflow={false}
      tickFormatter={(valor: number) => formatearCompacto(valor)}
    />
  );

  return (
    <div className="space-y-6">
      <FiltrosStats />

      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            Evolución en el tiempo
          </h1>
          <p className="text-xs text-fonarte-textMuted mt-0.5 leading-relaxed">
            Reproducciones por período, variación contra el mes anterior y aporte de cada
            plataforma. Solo se cuentan escuchas: no se muestran pagos ni regalías.
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
              titulo="Ningún período coincide con los filtros"
              mensaje="Los filtros activos (rango de fechas, plataforma o país) dejan el conjunto sin reproducciones. Amplía el rango de fechas o limpia los filtros para ver la evolución completa."
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
              titulo="Aún no hay períodos registrados"
              mensaje="Cuando tus distribuciones reporten escuchas por mes, aquí verás la evolución, la variación entre períodos y el aporte de cada plataforma."
            />
          )}
        </Panel>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              etiqueta={`Último período · ${formatearPeriodo(ultimo?.periodo)}`}
              valor={formatearNumero(ultimo?.streams ?? 0)}
              detalle="Reproducciones del período más reciente del rango"
              acento="primary"
              icono={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />
            <KpiCard
              etiqueta="Total del rango"
              valor={formatearNumero(totalRango)}
              detalle={`${serie.length} ${serie.length === 1 ? 'período' : 'períodos'} · coincide con las reproducciones totales (${formatearNumero(streamsTotales)})`}
              acento="secondary"
              icono={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 17l6-6 4 4 8-8M21 7v5h-5"
                  />
                </svg>
              }
            />
            <div className="glass-card p-5 rounded-2xl border border-fonarte-border">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-semibold text-fonarte-textMuted uppercase tracking-wider">
                  Variación vs. período anterior
                </span>
                <div
                  className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center ${
                    variacion.direccion === 'sube'
                      ? 'bg-fonarte-success/10 text-fonarte-success'
                      : variacion.direccion === 'baja'
                        ? 'bg-fonarte-danger/10 text-fonarte-danger'
                        : 'bg-slate-700/40 text-slate-300'
                  }`}
                >
                  <IconoDireccion direccion={variacion.direccion} />
                </div>
              </div>
              <p className={`text-2xl lg:text-3xl font-bold mt-3 tabular-nums ${variacion.clase}`}>
                {variacion.texto}
              </p>
              <p className="text-[11px] text-fonarte-textMuted mt-1 leading-relaxed">
                {variacion.detalle}
              </p>
            </div>
          </div>

          {/* Nota de rango degenerado */}
          {serie.length === 1 && (
            <div className="glass-panel p-4 rounded-2xl border border-fonarte-border flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-fonarte-gold/10 text-fonarte-gold flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"
                  />
                </svg>
              </div>
              <p className="text-xs text-fonarte-textMuted leading-relaxed">
                <span className="font-semibold text-slate-300">
                  El rango seleccionado contiene un solo período
                  {' '}({formatearPeriodo(serie[0].periodo)}).
                </span>{' '}
                No hay serie que dibujar ni mes previo con el que comparar: amplía el rango de
                fechas para ver la evolución.
              </p>
            </div>
          )}

          {/* Gráfica principal */}
          {serie.length > 1 && (
            <Panel
              titulo="Reproducciones por período"
              descripcion="Serie mensual ascendente del conjunto filtrado. Pasa el cursor por un punto para ver el conteo exacto."
              acciones={
                <div className="flex flex-wrap items-center gap-2">
                  <BotonAlternar
                    etiqueta="Tipo de gráfica"
                    valor={tipoGrafica}
                    onChange={setTipoGrafica}
                    opciones={[
                      { valor: 'area', texto: 'Área' },
                      { valor: 'linea', texto: 'Línea' },
                    ]}
                  />
                  <BotonAlternar
                    etiqueta="Escala del eje vertical"
                    valor={escala}
                    onChange={setEscala}
                    opciones={[
                      { valor: 'lineal', texto: 'Lineal' },
                      { valor: 'logaritmica', texto: 'Logarítmica' },
                    ]}
                  />
                </div>
              }
            >
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {tipoGrafica === 'area' ? (
                    <AreaChart data={serie} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                      <defs>
                        <linearGradient id="degradadoTendencia" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.55} />
                          <stop offset="60%" stopColor="#38bdf8" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                      {ejeX}
                      {ejeY}
                      <Tooltip content={<TooltipTendencia />} />
                      <Area
                        type="monotone"
                        dataKey="streams"
                        name="Reproducciones"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fill="url(#degradadoTendencia)"
                        dot={{ r: 3, fill: '#0f172a', stroke: '#8b5cf6', strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  ) : (
                    <LineChart data={serie} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                      <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                      {ejeX}
                      {ejeY}
                      <Tooltip content={<TooltipTendencia />} />
                      <Line
                        type="monotone"
                        dataKey="streams"
                        name="Reproducciones"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-fonarte-textMuted mt-3 leading-relaxed">
                {escala === 'logaritmica' && hayCeros
                  ? 'Algunos períodos tienen 0 reproducciones, que la escala logarítmica no puede representar; se mantiene la escala lineal.'
                  : 'La escala logarítmica ayuda a distinguir los meses con menos reproducciones cuando la diferencia entre períodos es muy grande. La escala es solo una forma de dibujar el eje: los conteos no cambian.'}
              </p>
            </Panel>
          )}

          {/* Tendencia por plataforma */}
          <Panel
            titulo="Tendencia por plataforma"
            descripcion={`Reproducciones por período desglosadas por plataforma. Se dibujan únicamente las ${plataformasTop.length} plataformas con más reproducciones${
              tieneOtrasPlataformas ? '; el resto se agrupa en el total del período' : ''
            }.`}
            acciones={
              <span className="text-[11px] text-fonarte-textMuted">
                Total del período: {formatearNumero(totalRango)}
              </span>
            }
          >
            {!hayApilado || serie.length < 2 ? (
              <EstadoVacio
                titulo="Sin serie por plataforma que dibujar"
                mensaje={
                  serie.length < 2
                    ? 'La gráfica apilada necesita al menos dos períodos. Amplía el rango de fechas para comparar plataformas a lo largo del tiempo.'
                    : 'El conjunto filtrado no tiene plataformas asociadas a los períodos. Prueba a quitar el filtro de plataforma.'
                }
              />
            ) : (
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={datosApilados} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="periodo"
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(valor: string) => formatearPeriodo(valor)}
                      minTickGap={12}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      width={64}
                      tickFormatter={(valor: number) => formatearCompacto(valor)}
                    />
                    <Tooltip content={<TooltipApilado />} />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
                    />
                    {plataformasTop.map((plataforma, indice) => (
                      <Area
                        key={plataforma.plataforma}
                        type="monotone"
                        dataKey={plataforma.plataforma}
                        name={plataforma.plataforma}
                        stackId="plataformas"
                        stroke={PALETA[indice % PALETA.length]}
                        strokeWidth={1.5}
                        fill={PALETA[indice % PALETA.length]}
                        fillOpacity={0.45}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Comparación por período */}
          <Panel
            titulo="Comparación período a período"
            descripcion="Del período más reciente al más antiguo. La variación se calcula contra el período inmediatamente anterior."
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                  <tr>
                    <th className="pb-3 px-3">Período</th>
                    <th className="pb-3 px-3 text-right">Reproducciones</th>
                    <th className="pb-3 px-3 text-right">Participación</th>
                    <th className="pb-3 px-3 text-right">Variación</th>
                    <th className="pb-3 px-3 w-48 hidden md:table-cell">Proporción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filasPeriodo.map((fila, indice) => {
                    const esReciente = indice === 0;
                    return (
                      <tr
                        key={fila.periodo}
                        className={
                          esReciente
                            ? 'bg-fonarte-primary/10 border-l-2 border-fonarte-primary'
                            : 'hover:bg-slate-800/30 transition-colors'
                        }
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                esReciente
                                  ? 'text-white font-bold'
                                  : 'text-slate-200 font-medium'
                              }
                            >
                              {formatearPeriodo(fila.periodo)}
                            </span>
                            {esReciente && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-fonarte-primary/20 text-violet-300 border border-fonarte-primary/30">
                                Más reciente
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-white font-semibold tabular-nums">
                          {formatearNumero(fila.streams)}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                          {formatearPorcentaje(fila.participacion)}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums">
                          {fila.variacion === null ? (
                            <span className="text-slate-500 italic">Sin período previo</span>
                          ) : (
                            <span
                              className={
                                fila.variacion > 0
                                  ? 'text-fonarte-success font-semibold'
                                  : fila.variacion < 0
                                    ? 'text-fonarte-danger font-semibold'
                                    : 'text-slate-300'
                              }
                              title={
                                fila.variacionPct === null
                                  ? 'El período previo registró 0 reproducciones: no hay base porcentual'
                                  : undefined
                              }
                            >
                              {fila.variacion > 0 ? '+' : fila.variacion < 0 ? '−' : ''}
                              {formatearNumero(Math.abs(fila.variacion))}
                              {fila.variacionPct !== null && (
                                <span className="ml-1 text-[10px] opacity-80">
                                  ({fila.variacion > 0 ? '+' : fila.variacion < 0 ? '−' : ''}
                                  {Math.abs(fila.variacionPct).toFixed(1)} %)
                                </span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <BarraProporcion
                            valor={fila.streams}
                            maximo={maximoPeriodo}
                            color={
                              esReciente
                                ? 'from-fonarte-gold to-fonarte-primary'
                                : 'from-fonarte-primary to-fonarte-secondary'
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-fonarte-textMuted mt-4 leading-relaxed">
              La participación se calcula sobre las {formatearNumero(totalRango)} reproducciones del
              rango filtrado. Una variación positiva o negativa indica únicamente la dirección del
              cambio en escuchas entre un período y el anterior.
            </p>
          </Panel>

          {/* Refuerzo numérico: barras por período */}
          {serie.length > 1 && (
            <Panel
              titulo="Comparativa visual por período"
              descripcion="Misma serie, en barras, para comparar la altura de cada período de un vistazo."
            >
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serie} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    {ejeX}
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      width={64}
                      tickFormatter={(valor: number) => formatearCompacto(valor)}
                    />
                    <Tooltip content={<TooltipTendencia />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                    <Bar
                      dataKey="streams"
                      name="Reproducciones"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          )}
        </>
      )}

      <p className="text-[11px] text-fonarte-textMuted leading-relaxed">
        Nota: todas las cifras de esta vista son conteos de reproducciones ({formatearNumero(streamsTotales)} en
        total para el conjunto filtrado). No incluyen información de pagos, ingresos ni regalías.
      </p>
    </div>
  );
}
