'use client';

import Link from 'next/link';
import {
  Area,
  AreaChart,
  Cell,
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
  BarraProporcion,
  BannerError,
  Cargando,
  EstadoVacio,
  KpiCard,
  Panel,
} from '@/components/portal/ui';
import {
  banderaPais,
  formatearCompacto,
  formatearNumero,
  formatearPeriodo,
  formatearPorcentaje,
  nombrePais,
} from '@/lib/formato';

const COLORES = ['#8b5cf6', '#38bdf8', '#f59e0b', '#10b981', '#f472b6', '#a78bfa', '#22d3ee'];

const tooltipOscuro = {
  contentStyle: {
    background: '#111726',
    border: '1px solid #1e293b',
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
  },
  labelStyle: { color: '#94a3b8', fontSize: 11, marginBottom: 4 },
  itemStyle: { color: '#fff' },
};

export default function PortalResumenPage() {
  const {
    artistaNombre,
    selloNombre,
    canciones,
    catalogo,
    cargando,
    error,
    recargar,
    streamsTotales,
    cancionesAgregadas,
    albums,
    tendencia,
    plataformas,
    paises,
    hayFiltros,
    limpiarFiltros,
  } = useStats();

  const topPlataforma = plataformas[0] ?? null;
  const topPais = paises[0] ?? null;
  const topCancion = cancionesAgregadas[0] ?? null;
  const topAlbum = albums[0] ?? null;

  // Variación del último período respecto al anterior (solo conteos)
  const ultimo = tendencia.length > 0 ? tendencia[tendencia.length - 1] : null;
  const anterior = tendencia.length > 1 ? tendencia[tendencia.length - 2] : null;
  const variacion =
    ultimo && anterior && anterior.streams > 0
      ? ((ultimo.streams - anterior.streams) / anterior.streams) * 100
      : null;

  const tieneDatos = streamsTotales > 0 || canciones.length > 0;

  if (cargando) {
    return (
      <div className="space-y-6">
        <FiltrosStats />
        <Cargando mensaje="Cargando tus estadísticas…" />
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

      {!tieneDatos ? (
        <Panel titulo="Sin datos que mostrar">
          <EstadoVacio
            titulo={hayFiltros ? 'Ningún resultado con estos filtros' : 'Aún no hay estadísticas'}
            mensaje={
              hayFiltros
                ? 'No hay reproducciones que coincidan con los filtros aplicados. Prueba ampliar el rango de fechas o quitar la plataforma o el país seleccionados.'
                : catalogo.length === 0
                  ? 'Tu catálogo todavía no está registrado en el portal, por lo que aún no hay estadísticas que mostrar. La administración de Fonarte debe registrar tus canciones y álbumes (por ISRC/UPC) para poder cruzar tus reproducciones.'
                  : 'Tu catálogo ya está registrado, pero todavía no hay reproducciones registradas en el período disponible. Los datos se actualizan mensualmente.'
            }
            accion={
              hayFiltros ? (
                <button
                  onClick={limpiarFiltros}
                  className="px-4 py-2.5 rounded-xl bg-fonarte-primary hover:bg-fonarte-primaryHover text-white text-sm font-medium transition"
                >
                  Limpiar filtros
                </button>
              ) : undefined
            }
          />
        </Panel>
      ) : (
        <>
          {/* ------------------------------------------------------------------
              KPIs
             ------------------------------------------------------------------ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              etiqueta="Reproducciones totales"
              valor={formatearNumero(streamsTotales)}
              detalle={hayFiltros ? 'En el período y filtros seleccionados' : 'Todo el histórico disponible'}
              acento="primary"
              icono={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              }
            />
            <KpiCard
              etiqueta="Último período"
              valor={ultimo ? formatearNumero(ultimo.streams) : '—'}
              detalle={
                ultimo
                  ? `${formatearPeriodo(ultimo.periodo)}${
                      variacion !== null
                        ? ` · ${variacion >= 0 ? '+' : ''}${variacion.toFixed(1)} % vs período anterior`
                        : ''
                    }`
                  : 'Sin períodos con datos'
              }
              acento={variacion !== null && variacion < 0 ? 'gold' : 'success'}
              icono={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <KpiCard
              etiqueta="Plataforma líder"
              valor={topPlataforma ? topPlataforma.plataforma : '—'}
              detalle={
                topPlataforma
                  ? `${formatearNumero(topPlataforma.streams)} reproducciones · ${formatearPorcentaje(
                      topPlataforma.porcentaje,
                    )}`
                  : 'Sin datos de plataformas'
              }
              acento="secondary"
              icono={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  />
                </svg>
              }
            />
            <KpiCard
              etiqueta="País principal"
              valor={topPais ? nombrePais(topPais.codigoPais) : '—'}
              detalle={
                topPais
                  ? `${formatearNumero(topPais.streams)} reproducciones · ${formatearPorcentaje(
                      topPais.porcentaje,
                    )}`
                  : 'Sin datos geográficos'
              }
              acento="gold"
              icono={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* ------------------------------------------------------------------
              Tendencia + plataformas
             ------------------------------------------------------------------ */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Panel
              titulo="Evolución de reproducciones"
              descripcion="Reproducciones por mes en el rango seleccionado."
              className="xl:col-span-2"
              acciones={
                <Link
                  href="/portal/tendencia"
                  className="text-xs font-semibold text-fonarte-primary hover:underline whitespace-nowrap"
                >
                  Ver detalle →
                </Link>
              }
            >
              {tendencia.length < 2 ? (
                <EstadoVacio
                  titulo="Se necesitan al menos dos períodos"
                  mensaje="Con un solo período con datos no se puede dibujar una evolución. Amplía el rango de fechas o espera a que se cargue el siguiente corte mensual."
                />
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tendencia} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradStreams" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="periodo"
                        tickFormatter={(p: string) => formatearPeriodo(p)}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#1e293b' }}
                      />
                      <YAxis
                        tickFormatter={(v: number) => formatearCompacto(v)}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={52}
                      />
                      <Tooltip
                        {...tooltipOscuro}
                        labelFormatter={(p: any) => formatearPeriodo(String(p))}
                        formatter={(valor: any) => [formatearNumero(Number(valor)), 'Reproducciones']}
                      />
                      <Area
                        type="monotone"
                        dataKey="streams"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#gradStreams)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel
              titulo="Por plataforma"
              descripcion="Distribución de reproducciones entre plataformas."
              acciones={
                <Link
                  href="/portal/plataformas"
                  className="text-xs font-semibold text-fonarte-primary hover:underline whitespace-nowrap"
                >
                  Ver detalle →
                </Link>
              }
            >
              {plataformas.length === 0 ? (
                <EstadoVacio
                  titulo="Sin datos de plataformas"
                  mensaje="No hay reproducciones atribuidas a ninguna plataforma con los filtros actuales."
                />
              ) : (
                <>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={plataformas}
                          dataKey="streams"
                          nameKey="plataforma"
                          innerRadius={52}
                          outerRadius={80}
                          paddingAngle={2}
                          stroke="#0b1120"
                        >
                          {plataformas.map((p, i) => (
                            <Cell key={p.plataforma} fill={COLORES[i % COLORES.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          {...tooltipOscuro}
                          formatter={(valor: any, nombre: any) => [
                            formatearNumero(Number(valor)),
                            String(nombre),
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 mt-4">
                    {plataformas.slice(0, 4).map((p, i) => (
                      <div key={p.plataforma}>
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <span className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: COLORES[i % COLORES.length] }}
                            />
                            <span className="truncate">{p.plataforma}</span>
                          </span>
                          <span className="text-xs text-fonarte-textMuted tabular-nums whitespace-nowrap">
                            {formatearPorcentaje(p.porcentaje)}
                          </span>
                        </div>
                        <BarraProporcion
                          valor={p.streams}
                          maximo={plataformas[0].streams}
                          color="from-fonarte-primary to-fonarte-secondary"
                        />
                      </div>
                    ))}
                    {plataformas.length > 4 && (
                      <p className="text-[11px] text-fonarte-textMuted pt-1">
                        y {plataformas.length - 4} plataforma
                        {plataformas.length - 4 === 1 ? '' : 's'} más
                      </p>
                    )}
                  </div>
                </>
              )}
            </Panel>
          </div>

          {/* ------------------------------------------------------------------
              Top canciones + países
             ------------------------------------------------------------------ */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Panel
              titulo="Canciones más escuchadas"
              descripcion="Ranking por reproducciones en el rango seleccionado."
              className="xl:col-span-2"
              acciones={
                <Link
                  href="/portal/canciones"
                  className="text-xs font-semibold text-fonarte-primary hover:underline whitespace-nowrap"
                >
                  Ver todas →
                </Link>
              }
            >
              {cancionesAgregadas.length === 0 ? (
                <EstadoVacio
                  titulo="Sin canciones con reproducciones"
                  mensaje="No hay canciones con datos para los filtros aplicados."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                      <tr>
                        <th className="pb-3 px-3 w-10">#</th>
                        <th className="pb-3 px-3">Canción</th>
                        <th className="pb-3 px-3 hidden sm:table-cell">Álbum</th>
                        <th className="pb-3 px-3 text-right">Reproducciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {cancionesAgregadas.slice(0, 8).map((c, i) => (
                        <tr key={c.isrc} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 text-fonarte-textMuted tabular-nums">{i + 1}</td>
                          <td className="py-3 px-3">
                            <p className="text-white font-medium truncate max-w-[16rem]">
                              {c.titulo}
                            </p>
                            <p className="text-[10px] text-fonarte-textMuted font-mono truncate">
                              {c.isrc}
                            </p>
                          </td>
                          <td className="py-3 px-3 text-slate-400 hidden sm:table-cell">
                            <span className="truncate max-w-[12rem] block">{c.album}</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-white font-semibold tabular-nums">
                              {formatearNumero(c.streams)}
                            </span>
                            <div className="mt-1.5 w-24 ml-auto">
                              <BarraProporcion
                                valor={c.streams}
                                maximo={cancionesAgregadas[0].streams}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            <Panel
              titulo="Audiencia por país"
              descripcion="Dónde se escucha tu música."
              acciones={
                <Link
                  href="/portal/mapa"
                  className="text-xs font-semibold text-fonarte-primary hover:underline whitespace-nowrap"
                >
                  Ver mapa →
                </Link>
              }
            >
              {paises.length === 0 ? (
                <EstadoVacio
                  titulo="Sin datos geográficos"
                  mensaje="No hay información de país para los filtros aplicados."
                />
              ) : (
                <div className="space-y-3">
                  {paises.slice(0, 6).map((p, i) => (
                    <div key={p.codigoPais}>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
                          <span className="flex-shrink-0 w-5 text-center">
                            {banderaPais(p.codigoPais) || (
                              <span className="text-[10px] font-mono text-fonarte-textMuted">
                                {p.codigoPais.slice(0, 2)}
                              </span>
                            )}
                          </span>
                          <span className="truncate">{nombrePais(p.codigoPais)}</span>
                        </span>
                        <span className="text-xs text-fonarte-textMuted tabular-nums whitespace-nowrap">
                          {formatearNumero(p.streams)}
                        </span>
                      </div>
                      <BarraProporcion
                        valor={p.streams}
                        maximo={paises[0].streams}
                        color={i === 0 ? 'from-fonarte-gold to-amber-300' : 'from-slate-500 to-slate-400'}
                      />
                    </div>
                  ))}
                  {paises.length > 6 && (
                    <p className="text-[11px] text-fonarte-textMuted pt-1">
                      y {paises.length - 6} país{paises.length - 6 === 1 ? '' : 'es'} más
                    </p>
                  )}
                </div>
              )}
            </Panel>
          </div>

          {/* ------------------------------------------------------------------
              Ficha rápida del catálogo
             ------------------------------------------------------------------ */}
          <Panel
            titulo="Tu catálogo"
            descripcion="Entidades registradas en el portal que se cruzan con tus reproducciones."
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-fonarte-border">
                <p className="text-[11px] text-fonarte-textMuted uppercase tracking-wider">
                  Álbumes
                </p>
                <p className="text-xl font-bold text-white mt-1 tabular-nums">{albums.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-fonarte-border">
                <p className="text-[11px] text-fonarte-textMuted uppercase tracking-wider">
                  Canciones
                </p>
                <p className="text-xl font-bold text-white mt-1 tabular-nums">
                  {cancionesAgregadas.length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-fonarte-border">
                <p className="text-[11px] text-fonarte-textMuted uppercase tracking-wider">
                  Plataformas
                </p>
                <p className="text-xl font-bold text-white mt-1 tabular-nums">
                  {plataformas.length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-fonarte-border">
                <p className="text-[11px] text-fonarte-textMuted uppercase tracking-wider">
                  Países
                </p>
                <p className="text-xl font-bold text-white mt-1 tabular-nums">{paises.length}</p>
              </div>
            </div>

            {topAlbum && (
              <p className="text-xs text-fonarte-textMuted mt-4 pt-4 border-t border-fonarte-border">
                Álbum con más reproducciones:{' '}
                <span className="text-slate-300 font-medium">{topAlbum.album}</span> con{' '}
                <span className="text-slate-300 font-medium tabular-nums">
                  {formatearNumero(topAlbum.streams)}
                </span>{' '}
                reproducciones en {topAlbum.canciones} canción
                {topAlbum.canciones === 1 ? '' : 'es'}.
              </p>
            )}
            {topCancion && (
              <p className="text-xs text-fonarte-textMuted mt-2">
                Canción más escuchada:{' '}
                <span className="text-slate-300 font-medium">{topCancion.titulo}</span> con{' '}
                <span className="text-slate-300 font-medium tabular-nums">
                  {formatearNumero(topCancion.streams)}
                </span>{' '}
                reproducciones.
              </p>
            )}
          </Panel>

          {/* Recordatorio del alcance de los datos */}
          <div className="p-4 rounded-2xl bg-fonarte-primary/5 border border-fonarte-primary/20">
            <p className="text-[11px] text-fonarte-textMuted leading-relaxed">
              <span className="text-slate-300 font-semibold">
                Todas las cifras de este portal son conteos de reproducciones.
              </span>{' '}
              El portal no muestra montos, regalías ni cálculos de pago: esa información se
              gestiona por separado. Los datos se actualizan con cada corte mensual de las
              plataformas, por lo que el mes en curso puede aparecer incompleto.
              {artistaNombre && selloNombre ? ` Artista: ${artistaNombre} · Sello: ${selloNombre}.` : ''}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
