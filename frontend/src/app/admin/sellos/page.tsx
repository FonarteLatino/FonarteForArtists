'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AdminNavbar } from '@/components/AdminNavbar';
import { ConfirmModal } from '@/components/ConfirmModal';

interface Sello {
  id: number;
  nombre: string;
  creadoEn: string;
  _count?: { artistas: number };
}

export default function SellosPage() {
  const [sellos, setSellos] = useState<Sello[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [porEliminar, setPorEliminar] = useState<Sello | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSellos();
      setSellos(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar los sellos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = nombre.trim();
    if (limpio.length < 2) {
      setError('El nombre del sello debe tener al menos 2 caracteres.');
      return;
    }

    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      await api.createSello(limpio);
      setNombre('');
      setAviso(`Sello «${limpio}» creado correctamente.`);
      await cargar();
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el sello.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (sello: Sello) => {
    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      await api.deleteSello(sello.id);
      setAviso(`Sello «${sello.nombre}» eliminado.`);
      await cargar();
    } catch (err: any) {
      // El backend rechaza borrar un sello con artistas asignados
      setError(err?.message || 'No se pudo eliminar el sello.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminNavbar
        title="Sellos"
        subtitle="Alta y baja de sellos — nivel superior de la jerarquía de permisos"
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

        {/* Alta de sello */}
        <div className="glass-panel p-6 rounded-2xl border border-fonarte-border">
          <h2 className="text-base font-bold text-white">Nuevo sello</h2>
          <p className="text-xs text-fonarte-textMuted mt-0.5 mb-4">
            El sello agrupa artistas. Otorgar acceso a nivel de sello concede acceso a todos sus
            artistas (regla «lo más específico gana»).
          </p>
          <form onSubmit={crear} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del sello"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 border border-fonarte-border text-white placeholder:text-slate-500 focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition text-sm"
            />
            <button
              type="submit"
              disabled={guardando || nombre.trim().length < 2}
              className="px-5 py-3 rounded-xl bg-fonarte-primary hover:bg-fonarte-primaryHover text-white text-sm font-semibold shadow-lg shadow-fonarte-primary/30 transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {guardando && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Crear sello
            </button>
          </form>
        </div>

        {/* Listado */}
        <div className="glass-panel p-6 rounded-2xl border border-fonarte-border">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Sellos registrados</h2>
              <p className="text-xs text-fonarte-textMuted mt-0.5">
                {sellos.length} sello{sellos.length === 1 ? '' : 's'} en la jerarquía
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
              <span className="text-sm text-fonarte-textMuted">Cargando sellos...</span>
            </div>
          ) : sellos.length === 0 ? (
            <p className="text-sm text-fonarte-textMuted text-center py-10">
              No hay sellos registrados. Crea el primero con el formulario de arriba.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-fonarte-border">
                  <tr>
                    <th className="pb-3 px-3">Nombre</th>
                    <th className="pb-3 px-3">Artistas</th>
                    <th className="pb-3 px-3">Creado</th>
                    <th className="pb-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sellos.map((s) => {
                    const artistas = s._count?.artistas ?? 0;
                    return (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 text-white font-medium">{s.nombre}</td>
                        <td className="py-3 px-3 text-slate-400">
                          {artistas} artista{artistas === 1 ? '' : 's'}
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(s.creadoEn).toLocaleString('es-MX')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setPorEliminar(s)}
                            disabled={guardando}
                            className="text-[11px] font-semibold text-fonarte-danger hover:underline disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ConfirmModal
        open={porEliminar !== null}
        title="Eliminar sello"
        description={`Se eliminará el sello «${porEliminar?.nombre ?? ''}» de forma permanente.\n\nSolo es posible eliminar sellos sin artistas asignados; si tiene artistas, la operación será rechazada.`}
        confirmLabel="Eliminar sello"
        tone="danger"
        loading={guardando}
        onConfirm={async () => {
          const s = porEliminar;
          setPorEliminar(null);
          if (s) await eliminar(s);
        }}
        onCancel={() => setPorEliminar(null)}
      />
    </div>
  );
}
