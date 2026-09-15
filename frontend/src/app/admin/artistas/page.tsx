'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { AdminNavbar } from '@/components/AdminNavbar';

interface Sello {
  id: number;
  nombre: string;
}

interface Artista {
  id: number;
  nombre: string;
  sello: Sello;
  _count?: { usuarios: number; entidades: number };
}

interface CatalogoItem {
  id: number;
  artistaId: number;
  tipo: 'ALBUM' | 'CANCION' | 'VIDEO';
  referenciaIdFonarte2: string;
  nombre: string | null;
  creadoEn: string;
}

const ETIQUETA_TIPO: Record<string, string> = {
  ALBUM: 'Álbum',
  CANCION: 'Canción',
  VIDEO: 'Video',
};

export default function ArtistasPage() {
  const [sellos, setSellos] = useState<Sello[]>([]);
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  // Alta de artista
  const [nombre, setNombre] = useState('');
  const [selloId, setSelloId] = useState<number | ''>('');

  // Catálogo (panel expandible por artista)
  const [abierto, setAbierto] = useState<number | null>(null);
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [nuevoItem, setNuevoItem] = useState<{
    tipo: 'ALBUM' | 'CANCION' | 'VIDEO';
    referencia: string;
    nombre: string;
  }>({ tipo: 'ALBUM', referencia: '', nombre: '' });

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([api.getSellos(), api.getArtistas()]);
      setSellos(Array.isArray(s) ? s : []);
      setArtistas(Array.isArray(a) ? a : []);
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar sellos y artistas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crearArtista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length === 0 || selloId === '') {
      setError('Selecciona un sello y captura el nombre del artista.');
      return;
    }

    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      await api.createArtista(nombre.trim(), Number(selloId));
      setAviso(`Artista «${nombre.trim()}» creado correctamente.`);
      setNombre('');
      setSelloId('');
      await cargar();
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el artista.');
    } finally {
      setGuardando(false);
    }
  };

  const abrirCatalogo = async (artistaId: number) => {
    if (abierto === artistaId) {
      setAbierto(null);
      return;
    }
    setAbierto(artistaId);
    setCargandoCatalogo(true);
    setError(null);
    try {
      const data = await api.getCatalogo(artistaId);
      setCatalogo(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar el catálogo del artista.');
      setCatalogo([]);
    } finally {
      setCargandoCatalogo(false);
    }
  };

  const registrarItem = async (e: React.FormEvent, artistaId: number) => {
    e.preventDefault();
    if (nuevoItem.referencia.trim().length === 0) {
      setError('El ISRC (canciones/videos) o UPC (álbumes) es obligatorio.');
      return;
    }

    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      await api.createCatalogoItem({
        artistaId,
        tipo: nuevoItem.tipo,
        referenciaIdFonarte2: nuevoItem.referencia.trim(),
        nombre: nuevoItem.nombre.trim() || undefined,
      });
      setAviso(
        `${ETIQUETA_TIPO[nuevoItem.tipo]} ${nuevoItem.referencia.trim()} registrado en el catálogo.`,
      );
      setNuevoItem({ tipo: 'ALBUM', referencia: '', nombre: '' });
      const data = await api.getCatalogo(artistaId);
      setCatalogo(Array.isArray(data) ? data : []);
      await cargar();
    } catch (err: any) {
      setError(err?.message || 'No se pudo registrar el elemento de catálogo.');
    } finally {
      setGuardando(false);
    }
  };

  const conteoPorArtista = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of catalogo) m.set(c.artistaId, (m.get(c.artistaId) ?? 0) + 1);
    return m;
  }, [catalogo]);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminNavbar
        title="Artistas y Catálogo"
        subtitle="Alta de artistas por sello y registro de su catálogo (ISRC / UPC)"
      />

      <main className="p-8 space-y-6 flex-1">
        {error && (
          <div className="p-3.5 rounded-xl bg-fonarte-danger/10 border border-fonarte-danger/30 text-fonarte-danger text-sm">
            {error}
          </div>
        )}
        {aviso && (
          <div className="p-3.5 rounded-xl bg-fonarte-success/10 border border-fonarte-success/30 text-fonarte-success text-sm">
            {aviso}
          </div>
        )}

        {/* Alta de artista */}
        <div className="glass-panel p-6 rounded-2xl border border-fonarte-border">
          <h2 className="text-base font-bold text-white">Nuevo artista</h2>
          <p className="text-xs text-fonarte-textMuted mt-0.5 mb-4">
            Todo artista pertenece a un sello. Podrás registrar su catálogo justo después.
          </p>

          {sellos.length === 0 && !loading ? (
            <p className="text-sm text-fonarte-textMuted">
              Primero crea al menos un sello en{' '}
              <a href="/admin/sellos" className="text-fonarte-primary hover:underline font-medium">
                Sellos
              </a>
              .
            </p>
          ) : (
            <form onSubmit={crearArtista} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del artista"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 border border-fonarte-border text-white placeholder:text-slate-500 focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition text-sm"
              />
              <select
                value={selloId}
                onChange={(e) => setSelloId(e.target.value ? Number(e.target.value) : '')}
                className="sm:w-64 px-4 py-3 rounded-xl bg-slate-900/80 border border-fonarte-border text-white focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition text-sm"
              >
                <option value="">— Sello —</option>
                {sellos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={guardando || nombre.trim().length === 0 || selloId === ''}
                className="px-5 py-3 rounded-xl bg-fonarte-primary hover:bg-fonarte-primaryHover text-white text-sm font-semibold shadow-lg shadow-fonarte-primary/30 transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {guardando && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Crear artista
              </button>
            </form>
          )}
        </div>

        {/* Listado de artistas */}
        <div className="glass-panel p-6 rounded-2xl border border-fonarte-border">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Artistas registrados</h2>
              <p className="text-xs text-fonarte-textMuted mt-0.5">
                {artistas.length} artista{artistas.length === 1 ? '' : 's'} en la jerarquía
              </p>
            </div>
            <button
              onClick={cargar}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-fonarte-border hover:bg-slate-800/60 transition disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-10">
              <div className="w-5 h-5 border-2 border-fonarte-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-fonarte-textMuted">Cargando artistas...</span>
            </div>
          ) : artistas.length === 0 ? (
            <p className="text-sm text-fonarte-textMuted text-center py-10">
              No hay artistas registrados.
            </p>
          ) : (
            <div className="space-y-2">
              {artistas.map((a) => {
                const estaAbierto = abierto === a.id;
                const items = catalogo.filter((c) => c.artistaId === a.id);

                return (
                  <div
                    key={a.id}
                    className="rounded-xl border border-fonarte-border bg-slate-900/40 overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <button
                        onClick={() => abrirCatalogo(a.id)}
                        className="flex items-center gap-3 text-left group min-w-0"
                      >
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
                            estaAbierto ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white group-hover:text-fonarte-primary transition-colors truncate">
                            {a.nombre}
                          </p>
                          <p className="text-[11px] text-fonarte-textMuted mt-0.5">
                            {a.sello?.nombre} · {a._count?.entidades ?? 0} elemento(s) de catálogo ·{' '}
                            {a._count?.usuarios ?? 0} cuenta(s)
                          </p>
                        </div>
                      </button>
                    </div>

                    {estaAbierto && (
                      <div className="px-4 pb-4 border-t border-fonarte-border pt-4 space-y-4">
                        {/* Registro de elemento de catálogo */}
                        <form
                          onSubmit={(e) => registrarItem(e, a.id)}
                          className="flex flex-col lg:flex-row gap-3"
                        >
                          <select
                            value={nuevoItem.tipo}
                            onChange={(e) =>
                              setNuevoItem((s) => ({
                                ...s,
                                tipo: e.target.value as 'ALBUM' | 'CANCION' | 'VIDEO',
                              }))
                            }
                            className="lg:w-40 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-fonarte-border text-white focus:outline-none focus:border-fonarte-primary transition text-xs"
                          >
                            <option value="ALBUM">Álbum</option>
                            <option value="CANCION">Canción</option>
                            <option value="VIDEO">Video</option>
                          </select>
                          <input
                            type="text"
                            value={nuevoItem.referencia}
                            onChange={(e) =>
                              setNuevoItem((s) => ({ ...s, referencia: e.target.value }))
                            }
                            placeholder={
                              nuevoItem.tipo === 'ALBUM' ? 'UPC del álbum' : 'ISRC de fonarte2'
                            }
                            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-fonarte-border text-white placeholder:text-slate-500 focus:outline-none focus:border-fonarte-primary transition text-xs font-mono"
                          />
                          <input
                            type="text"
                            value={nuevoItem.nombre}
                            onChange={(e) => setNuevoItem((s) => ({ ...s, nombre: e.target.value }))}
                            placeholder="Título (opcional)"
                            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-fonarte-border text-white placeholder:text-slate-500 focus:outline-none focus:border-fonarte-primary transition text-xs"
                          />
                          <button
                            type="submit"
                            disabled={guardando || nuevoItem.referencia.trim().length === 0}
                            className="px-4 py-2.5 rounded-xl bg-fonarte-primary hover:bg-fonarte-primaryHover text-white text-xs font-semibold transition disabled:opacity-50 disabled:pointer-events-none"
                          >
                            Registrar
                          </button>
                        </form>

                        <p className="text-[11px] text-fonarte-textMuted">
                          El catálogo guarda solo la referencia (ISRC/UPC) que existe en{' '}
                          <span className="font-mono">fonarte2</span>; no duplica datos de streaming
                          ni montos.
                        </p>

                        {/* Listado del catálogo */}
                        {cargandoCatalogo ? (
                          <div className="flex items-center gap-3 py-4">
                            <div className="w-4 h-4 border-2 border-fonarte-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-fonarte-textMuted">
                              Cargando catálogo...
                            </span>
                          </div>
                        ) : items.length === 0 ? (
                          <p className="text-xs text-fonarte-textMuted py-3">
                            Este artista todavía no tiene elementos de catálogo.
                            {conteoPorArtista.get(a.id) ? '' : ' Registra el primero arriba.'}
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-950/50 border border-fonarte-border"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-white truncate">
                                    {item.nombre || ETIQUETA_TIPO[item.tipo]}
                                  </p>
                                  <p className="text-[10px] text-fonarte-textMuted font-mono truncate">
                                    {ETIQUETA_TIPO[item.tipo]} · {item.referenciaIdFonarte2}
                                  </p>
                                </div>
                                <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-fonarte-primary/10 text-fonarte-primary border border-fonarte-primary/20">
                                  {ETIQUETA_TIPO[item.tipo]}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
