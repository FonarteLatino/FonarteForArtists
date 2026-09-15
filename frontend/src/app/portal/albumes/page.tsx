'use client';

import { useMemo } from 'react';
import { Disc3, Headphones, Info, Video } from 'lucide-react';
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
import { formatearCompacto, formatearNumero, formatearPorcentaje } from '@/lib/formato';

/**
 * Vista "Álbumes y videos" del portal del artista (Fase 5).
 *
 * Dos desgloses sobre el mismo dataset de reproducciones:
 *  - Álbumes: agregación de las escuchas por álbum (viene de `albums`).
 *  - Videos: el endpoint de estadísticas está indexado por ISRC, así que los
 *    videos se identifican por el catálogo registrado del artista
 *    (`catalogo` con `tipo === 'VIDEO'`) y sus escuchas se cruzan por
 *    `referenciaId` contra las canciones agregadas (pueden ser 0).
 *
 * Todas las cifras son CONTEOS de reproducciones: aquí no existe —ni debe
 * existir— ningún monto, pago, regalía o moneda.
 */

const ESTILO_DESTACADO: string[] = [
  'bg-gradient-to-br from-fonarte-gold/20 via-transparent to-fonarte-gold/5 border-fonarte-gold/40',
  'bg-gradient-to-br from-fonarte-primary/20 via-transparent to-fonarte-primary/5 border-fonarte-primary/30',
  'bg-gradient-to-br from-fonarte-secondary/20 via-transparent to-fonarte-secondary/5 border-fonarte-secondary/30',
];

const COLOR_DESTACADO: string[] = [
  'from-fonarte-gold to-fonarte-gold/40',
  'from-fonarte-primary to-fonarte-primary/40',
  'from-fonarte-secondary to-fonarte-secondary/40',
];

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

/** Tarjeta prominente para los álbumes del podio. */
function AlbumDestacado({
  posicion,
  album,
  canciones,
  streams,
  maximo,
}: {
  posicion: number;
  album: string;
  canciones: number;
  streams: number;
  maximo: number;
}) {
  const indice = Math.min(posicion, 3) - 1;
  return (
    <div className={`glass-card rounded-2xl border p-5 ${ESTILO_DESTACADO[indice]}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-fonarte-textMuted">
          {posicion === 1 ? 'Álbum más escuchado' : `Posición ${posicion}`}
        </span>
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-lg border text-[10px] font-bold tabular-nums ${clasePosicion(
            posicion,
          )}`}
        >
          {posicion}
        </span>
      </div>

      <p className="text-sm font-bold text-white mt-2 truncate" title={album}>
        {album}
      </p>

      <p className="text-2xl lg:text-3xl font-bold text-white mt-2 tabular-nums">
        {formatearCompacto(streams)}
      </p>
      <p className="text-[11px] text-fonarte-textMuted mt-0.5 tabular-nums">
        {formatearNumero(streams)} reproducciones
      </p>

      <div className="mt-3">
        <BarraProporcion valor={streams} maximo={maximo} color={COLOR_DESTACADO[indice]} />
      </div>

      <p className="text-[11px] text-fonarte-textMuted mt-2">
        {canciones === 1 ? '1 canción' : `${canciones} canciones`} con escuchas en este álbum
      </p>
    </div>
  );
}

export default function PortalAlbumesPage() {
  const {
    albums,
    catalogo,
    cancionesAgregadas,
    streamsTotales,
    cargando,
    error,
    recargar,
    hayFiltros,
    limpiarFiltros,
    artistaNombre,
  } = useStats();

  /**
   * Videos registrados por el artista. El catálogo se indexa por `referenciaId`
   * (ISRC/UPC) y sus escuchas se buscan en las canciones agregadas del período
   * filtrado; si no hay datos, el conteo es 0.
   */
  const videos = useMemo(() => {
    const streamsPorReferencia = new Map<string, number>();
    for (const c of cancionesAgregadas) {
      if (!c.isrc) continue;
      streamsPorReferencia.set(c.isrc.trim().toUpperCase(), c.streams);
    }

    return catalogo
      .filter((c) => c.tipo === 'VIDEO')
      .map((c) => {
        const referencia = (c.referenciaId ?? '').trim();
        return {
          id: c.id,
          nombre: c.nombre || 'Video sin título',
          referencia: referencia || '—',
          streams: streamsPorReferencia.get(referencia.toUpperCase()) ?? 0,
        };
      })
      .sort((a, b) => b.streams - a.streams);
  }, [catalogo, cancionesAgregadas]);

  const maxAlbum = albums.length > 0 ? albums[0].streams : 0;
  const streamsVideos = videos.reduce((acc, v) => acc + v.streams, 0);
  const maxVideo = videos.length > 0 ? videos[0].streams : 0;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-white">Álbumes y videos</h2>
        <p className="text-xs text-fonarte-textMuted leading-relaxed">
          Desglose de reproducciones por álbum{artistaNombre ? ` de ${artistaNombre}` : ''} y
          seguimiento de los videos registrados en el catálogo del artista.
        </p>
      </div>

      {/* Filtros compartidos */}
      <FiltrosStats />

      {cargando ? (
        <Cargando mensaje="Cargando álbumes y videos…" />
      ) : error ? (
        <BannerError mensaje={error} onReintentar={recargar} />
      ) : (
        <>
          {/* KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              etiqueta="Álbumes con reproducciones"
              valor={formatearNumero(albums.length)}
              detalle="Álbumes con al menos una escucha en los filtros vigentes"
              acento="primary"
              icono={<Disc3 className="w-4 h-4" />}
            />
            <KpiCard
              etiqueta="Videos registrados"
              valor={formatearNumero(videos.length)}
              detalle="Videos declarados en el catálogo del artista"
              acento="secondary"
              icono={<Video className="w-4 h-4" />}
            />
            <KpiCard
              etiqueta="Reproducciones totales"
              valor={formatearNumero(streamsTotales)}
              detalle="Escuchas acumuladas en el período y filtros vigentes"
              acento="gold"
              icono={<Headphones className="w-4 h-4" />}
            />
          </section>

          {/* Álbumes */}
          <Panel
            titulo="Álbumes"
            descripcion="Reproducciones agrupadas por álbum, de mayor a menor. La barra compara cada álbum contra el más escuchado."
          >
            {albums.length === 0 ? (
              <EstadoVacio
                titulo={
                  hayFiltros
                    ? 'Sin álbumes con reproducciones en los filtros aplicados'
                    : 'Todavía no hay álbumes con reproducciones'
                }
                mensaje={
                  hayFiltros
                    ? 'Ningún álbum registra escuchas en el período, la plataforma o el país seleccionados. Limpia los filtros para consultar el catálogo completo del artista.'
                    : 'Aún no se han procesado reportes de reproducciones para este artista: el catálogo de este artista aún no está registrado o sus datos todavía no se han cargado.'
                }
                accion={
                  hayFiltros ? (
                    <button
                      type="button"
                      onClick={limpiarFiltros}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold border border-fonarte-border bg-fonarte-card text-slate-300 hover:bg-slate-800/30 transition"
                    >
                      Limpiar filtros
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <>
                {/* Podio: los álbumes más escuchados, visualmente prominentes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {albums.slice(0, 3).map((a, i) => (
                    <AlbumDestacado
                      key={a.album}
                      posicion={i + 1}
                      album={a.album}
                      canciones={a.canciones}
                      streams={a.streams}
                      maximo={maxAlbum}
                    />
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                      <tr>
                        <th className="pb-3 px-3 w-14">#</th>
                        <th className="pb-3 px-3">Álbum</th>
                        <th className="pb-3 px-3 text-right">Canciones</th>
                        <th className="pb-3 px-3 text-right min-w-[12rem]">Reproducciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {albums.map((a, i) => {
                        const posicion = i + 1;
                        const participacion =
                          streamsTotales > 0 ? (a.streams / streamsTotales) * 100 : 0;
                        return (
                          <tr key={a.album} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-3 align-middle">
                              <BadgePosicion posicion={posicion} />
                            </td>

                            <td className="py-3 px-3 align-middle text-slate-100 max-w-md">
                              <span className="block font-medium truncate" title={a.album}>
                                {a.album}
                              </span>
                            </td>

                            <td className="py-3 px-3 align-middle text-right text-slate-300 tabular-nums whitespace-nowrap">
                              {a.canciones === 1 ? '1 canción' : `${a.canciones} canciones`}
                            </td>

                            <td className="py-3 px-3 align-middle text-right">
                              <span className="font-semibold text-slate-100 tabular-nums">
                                {formatearNumero(a.streams)}
                              </span>
                              <span className="block text-[10px] text-fonarte-textMuted tabular-nums mt-0.5">
                                {formatearPorcentaje(participacion)} del total
                              </span>
                              <div className="flex justify-end mt-1.5">
                                <div className="w-36">
                                  <BarraProporcion
                                    valor={a.streams}
                                    maximo={maxAlbum}
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
                  {albums.length === 1
                    ? '1 álbum con reproducciones en el período consultado.'
                    : `${albums.length} álbumes con reproducciones en el período consultado.`}
                </p>
              </>
            )}
          </Panel>

          {/* Videos */}
          <Panel
            titulo="Videos"
            descripcion="Videos registrados en el catálogo del artista. Sus reproducciones se cruzan por ISRC/UPC; el mismo desglose por período, plataforma y país aplica a los videos cuando tienen datos."
          >
            {videos.length === 0 ? (
              <EstadoVacio
                titulo="Aún no hay videos registrados"
                mensaje="No hay videos registrados para este artista en el catálogo. Cuando se registren, aquí aparecerán sus reproducciones y se les aplicará el mismo desglose por período, plataforma y país que a las canciones."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                      <tr>
                        <th className="pb-3 px-3 w-14">#</th>
                        <th className="pb-3 px-3">Video</th>
                        <th className="pb-3 px-3">ISRC / UPC</th>
                        <th className="pb-3 px-3 text-right min-w-[12rem]">Reproducciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {videos.map((v, i) => {
                        const posicion = i + 1;
                        const participacion =
                          streamsVideos > 0 ? (v.streams / streamsVideos) * 100 : 0;
                        return (
                          <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-3 align-middle">
                              {/* Sin escuchas no hay posición que mostrar */}
                              {v.streams > 0 ? (
                                <BadgePosicion posicion={posicion} />
                              ) : (
                                <span className="inline-flex items-center justify-center w-7 h-7 text-slate-600">
                                  —
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 align-middle text-slate-100 max-w-md">
                              <span className="block font-medium truncate" title={v.nombre}>
                                {v.nombre}
                              </span>
                            </td>

                            <td className="py-3 px-3 align-middle text-slate-400 font-mono text-[10px] max-w-[12rem]">
                              <span className="block truncate" title={v.referencia}>
                                {v.referencia}
                              </span>
                            </td>

                            <td className="py-3 px-3 align-middle text-right">
                              {v.streams > 0 ? (
                                <>
                                  <span className="font-semibold text-slate-100 tabular-nums">
                                    {formatearNumero(v.streams)}
                                  </span>
                                  <span className="block text-[10px] text-fonarte-textMuted tabular-nums mt-0.5">
                                    {formatearPorcentaje(participacion)} del total de videos
                                  </span>
                                </>
                              ) : (
                                <span className="text-fonarte-textMuted">Sin datos aún</span>
                              )}
                              <div className="flex justify-end mt-1.5">
                                <div className="w-36">
                                  <BarraProporcion
                                    valor={v.streams}
                                    maximo={maxVideo}
                                    color="from-fonarte-secondary to-fonarte-primary"
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

                <p className="text-[11px] text-fonarte-textMuted mt-4 leading-relaxed">
                  {streamsVideos === 0
                    ? `${videos.length === 1 ? 'El video registrado no tiene' : 'Los ' + videos.length + ' videos registrados no tienen'} reproducciones en el período ni los filtros vigentes. Los conteos se actualizan cuando las plataformas reportan datos para su ISRC.`
                    : `Se muestran ${videos.length} ${videos.length === 1 ? 'video registrado' : 'videos registrados'} con sus reproducciones acumuladas.`}{' '}
                  El mismo desglose por período, plataforma y país aplica a los videos cuando tienen
                  datos.
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
              Tanto el desglose por álbum como el de videos expresan número de escuchas. Este portal
              no muestra montos, pagos ni regalías.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
