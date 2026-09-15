'use client';

import { useMemo, useState } from 'react';
import { BarChart3, Headphones, Info, Music2, Search, X } from 'lucide-react';
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
import { formatearNumero, formatearPorcentaje } from '@/lib/formato';

/**
 * Vista "Canciones" del portal del artista (Fase 5).
 *
 * Ranking de las canciones más escuchadas. Todas las cifras son CONTEOS de
 * reproducciones: en esta vista no existe —ni debe existir— ningún monto,
 * pago, regalía o moneda.
 *
 * La carga de datos, los permisos y los filtros viven en `StatsProvider` y
 * `FiltrosStats`; aquí solo se presenta y se filtra/ordena en cliente.
 */

type Limite = 25 | 50 | 0;

const OPCIONES_LIMITE: Array<{ valor: Limite; etiqueta: string }> = [
  { valor: 25, etiqueta: 'Top 25' },
  { valor: 50, etiqueta: 'Top 50' },
  { valor: 0, etiqueta: 'Todas' },
];

/** Color del distintivo de posición: el podio se resalta, el resto es neutro. */
function clasePosicion(posicion: number): string {
  if (posicion === 1) return 'bg-fonarte-gold/15 text-fonarte-gold border-fonarte-gold/30';
  if (posicion === 2) return 'bg-slate-400/10 text-slate-200 border-slate-400/30';
  if (posicion === 3)
    return 'bg-fonarte-secondary/10 text-fonarte-secondary border-fonarte-secondary/30';
  return 'bg-slate-800/60 text-slate-400 border-fonarte-border';
}

function BadgePosicion({ posicion }: { posicion: number }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border text-[11px] font-bold tabular-nums ${clasePosicion(
        posicion,
      )}`}
    >
      {posicion}
    </span>
  );
}

export default function PortalCancionesPage() {
  const {
    cancionesAgregadas,
    streamsTotales,
    cargando,
    error,
    recargar,
    hayFiltros,
    limpiarFiltros,
    artistaNombre,
  } = useStats();

  const [busqueda, setBusqueda] = useState<string>('');
  const [limite, setLimite] = useState<Limite>(25);

  // Búsqueda libre en cliente sobre título, álbum e ISRC.
  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return cancionesAgregadas;
    return cancionesAgregadas.filter(
      (c) =>
        c.titulo.toLowerCase().includes(q) ||
        c.album.toLowerCase().includes(q) ||
        c.isrc.toLowerCase().includes(q),
    );
  }, [cancionesAgregadas, busqueda]);

  const visibles = useMemo(
    () => (limite === 0 ? filtradas : filtradas.slice(0, limite)),
    [filtradas, limite],
  );

  // La barra de cada fila se mide contra la canción más escuchada del ranking
  // completo (sin búsqueda), para que la comparación sea estable.
  const maxStreams = cancionesAgregadas.length > 0 ? cancionesAgregadas[0].streams : 0;
  const promedio =
    cancionesAgregadas.length > 0 ? Math.round(streamsTotales / cancionesAgregadas.length) : 0;
  const top = cancionesAgregadas.length > 0 ? cancionesAgregadas[0] : null;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-white">Canciones más escuchadas</h2>
        <p className="text-xs text-fonarte-textMuted leading-relaxed">
          Ranking de las canciones{artistaNombre ? ` de ${artistaNombre}` : ''} por número de
          reproducciones, con el álbum al que pertenecen y las plataformas en las que aparecen.
        </p>
      </div>

      {/* Filtros compartidos */}
      <FiltrosStats />

      {cargando ? (
        <Cargando mensaje="Cargando reproducciones por canción…" />
      ) : error ? (
        <BannerError mensaje={error} onReintentar={recargar} />
      ) : (
        <>
          {/* KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              etiqueta="Canciones con reproducciones"
              valor={formatearNumero(cancionesAgregadas.length)}
              detalle="Canciones distintas con al menos una escucha registrada"
              acento="primary"
              icono={<Music2 className="w-4 h-4" />}
            />
            <KpiCard
              etiqueta="Reproducciones totales"
              valor={formatearNumero(streamsTotales)}
              detalle="Escuchas acumuladas en el período y filtros vigentes"
              acento="secondary"
              icono={<Headphones className="w-4 h-4" />}
            />
            <KpiCard
              etiqueta="Promedio por canción"
              valor={formatearNumero(promedio)}
              detalle="Escuchas promedio entre las canciones con datos"
              acento="gold"
              icono={<BarChart3 className="w-4 h-4" />}
            />
          </section>

          {/* Ranking */}
          <Panel
            titulo="Ranking de canciones"
            descripcion="Ordenado de mayor a menor número de reproducciones. La barra compara cada canción contra la más escuchada."
            acciones={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-fonarte-textMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar título, álbum o ISRC"
                    aria-label="Buscar canción"
                    className="w-56 rounded-xl bg-slate-900/80 border border-fonarte-border pl-8 pr-8 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition"
                  />
                  {busqueda.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setBusqueda('')}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-500 hover:text-slate-200 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={limite}
                  onChange={(e) => setLimite(Number(e.target.value) as Limite)}
                  aria-label="Número de canciones mostradas"
                  className="rounded-xl bg-slate-900/80 border border-fonarte-border px-3 py-2.5 text-xs text-white focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition"
                >
                  {OPCIONES_LIMITE.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
            }
          >
            {cancionesAgregadas.length === 0 ? (
              <EstadoVacio
                titulo={
                  hayFiltros
                    ? 'Sin reproducciones con los filtros aplicados'
                    : 'Todavía no hay reproducciones registradas'
                }
                mensaje={
                  hayFiltros
                    ? 'Ninguna canción registra escuchas en el período, la plataforma o el país seleccionados. Limpia los filtros para consultar el catálogo completo del artista.'
                    : 'Aún no se han procesado reportes de reproducciones para este artista: el catálogo de este artista aún no está registrado o sus datos todavía no se han cargado.'
                }
                accion={
                  hayFiltros ? (
                    <button
                      type="button"
                      onClick={limpiarFiltros}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold border border-fonarte-border bg-fonarte-card text-slate-300 hover:bg-slate-800/30 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      Limpiar filtros
                    </button>
                  ) : undefined
                }
              />
            ) : visibles.length === 0 ? (
              <EstadoVacio
                titulo="Ninguna canción coincide con la búsqueda"
                mensaje="La búsqueda revisa el título, el álbum y el ISRC de las canciones con reproducciones. Borra el texto para volver al ranking completo."
                accion={
                  <button
                    type="button"
                    onClick={() => setBusqueda('')}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold border border-fonarte-border bg-fonarte-card text-slate-300 hover:bg-slate-800/30 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpiar búsqueda
                  </button>
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                      <tr>
                        <th className="pb-3 px-3 w-14">#</th>
                        <th className="pb-3 px-3">Canción</th>
                        <th className="pb-3 px-3">Álbum</th>
                        <th className="pb-3 px-3 text-right">Plataformas</th>
                        <th className="pb-3 px-3 text-right min-w-[12rem]">Reproducciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {visibles.map((c, i) => {
                        const posicion = i + 1;
                        const participacion =
                          streamsTotales > 0 ? (c.streams / streamsTotales) * 100 : 0;
                        return (
                          <tr key={`${c.isrc}-${i}`} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-3 align-middle">
                              <BadgePosicion posicion={posicion} />
                            </td>

                            <td className="py-3 px-3 align-middle max-w-md">
                              <span className="block font-medium text-slate-100 truncate" title={c.titulo}>
                                {c.titulo}
                              </span>
                              <span
                                className="block font-mono text-[10px] text-fonarte-textMuted truncate"
                                title={c.isrc}
                              >
                                {c.isrc}
                              </span>
                            </td>

                            <td className="py-3 px-3 align-middle text-slate-400 max-w-xs">
                              <span className="block truncate" title={c.album}>
                                {c.album}
                              </span>
                            </td>

                            <td className="py-3 px-3 align-middle text-right text-slate-300 tabular-nums whitespace-nowrap">
                              {c.plataformas === 1 ? '1 plataforma' : `${c.plataformas} plataformas`}
                            </td>

                            <td className="py-3 px-3 align-middle text-right">
                              <span className="font-semibold text-slate-100 tabular-nums">
                                {formatearNumero(c.streams)}
                              </span>
                              <span className="block text-[10px] text-fonarte-textMuted tabular-nums mt-0.5">
                                {formatearPorcentaje(participacion)} del total
                              </span>
                              <div className="flex justify-end mt-1.5">
                                <div className="w-36">
                                  <BarraProporcion
                                    valor={c.streams}
                                    maximo={maxStreams}
                                    color={
                                      posicion === 1
                                        ? 'from-fonarte-gold to-fonarte-secondary'
                                        : 'from-fonarte-primary to-fonarte-secondary'
                                    }
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-fonarte-textMuted mt-4">
                  Mostrando {visibles.length} de {filtradas.length}{' '}
                  {filtradas.length === 1 ? 'canción' : 'canciones'}
                  {busqueda.trim() ? ' que coinciden con la búsqueda' : ''}
                  {top && !busqueda.trim()
                    ? ` · La más escuchada es «${top.titulo}» con ${formatearNumero(top.streams)} reproducciones.`
                    : ''}
                </p>
              </>
            )}
          </Panel>

          {/* Nota: solo conteos */}
          <div className="glass-panel p-4 rounded-2xl border border-fonarte-border flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-fonarte-primary/10 text-fonarte-primary flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-xs text-fonarte-textMuted leading-relaxed">
              <span className="font-semibold text-slate-300">Solo conteos de reproducciones.</span>{' '}
              Las cifras de esta vista son número de escuchas por canción, agregadas a partir de los
              reportes de las plataformas. Este portal no muestra montos, pagos ni regalías.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
