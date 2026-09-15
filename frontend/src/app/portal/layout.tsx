'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { StatsProvider } from '@/components/portal/StatsProvider';
import { PortalNavbar } from '@/components/portal/PortalNavbar';

type Estado = 'verificando' | 'autorizado' | 'sinArtista';

/**
 * Layout del portal del artista (Fase 5).
 *
 * Requiere una sesión válida. A diferencia de /admin, aquí NO se exige el rol
 * de administrador: el portal es precisamente para las cuentas de artista. Una
 * cuenta sin artista asociado (p. ej. un administrador sin artista) recibe un
 * aviso en vez de un portal vacío.
 *
 * La autorización real de los datos la impone el backend en cada endpoint con
 * `@RequireAccess(ARTISTA, 'artistaId')`: aunque alguien manipule la URL con
 * `?artistaId=` de otro artista, la API le negará los datos.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>('verificando');

  useEffect(() => {
    const token = localStorage.getItem('fonarte_access_token');
    if (!token) {
      router.replace('/login');
      return;
    }

    // Un administrador puede abrir el portal de un artista concreto con
    // ?artistaId=… (útil desde el panel de permisos). En ese caso no se exige
    // que su propia cuenta tenga artista asociado.
    const tieneArtistaEnUrl =
      typeof window !== 'undefined' &&
      Boolean(new URLSearchParams(window.location.search).get('artistaId'));

    let vigente = true;
    api
      .getMe()
      .then((perfil: any) => {
        if (!vigente) return;
        localStorage.setItem('fonarte_user', JSON.stringify(perfil));
        const artistaId = perfil?.artistaId ?? perfil?.artista?.id ?? null;
        if (artistaId || tieneArtistaEnUrl) {
          setEstado('autorizado');
        } else {
          setEstado('sinArtista');
        }
      })
      .catch(() => {
        if (!vigente) return;
        api.clearTokens();
        router.replace('/login');
      });

    return () => {
      vigente = false;
    };
  }, [router]);

  if (estado === 'verificando') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fonarte-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-fonarte-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-fonarte-textMuted font-medium">Cargando tu portal…</p>
        </div>
      </div>
    );
  }

  if (estado === 'sinArtista') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fonarte-bg p-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-fonarte-border text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-fonarte-primary/10 border border-fonarte-primary/30 text-fonarte-primary mb-5">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Cuenta sin artista asociado</h1>
          <p className="text-sm text-fonarte-textMuted mt-2 leading-relaxed">
            Tu cuenta no tiene un artista asignado, así que no hay estadísticas que mostrar. Si
            eres administrador, abre el portal desde el panel de permisos eligiendo un artista.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <a
              href="/admin/permisos"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-fonarte-primary to-fonarte-primaryHover text-white font-medium shadow-lg shadow-fonarte-primary/30 hover:opacity-95 transition text-sm text-center"
            >
              Ir al panel de permisos
            </a>
            <button
              onClick={() => api.logout()}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-slate-300 border border-fonarte-border hover:bg-slate-800/60 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StatsProvider>
      <div className="min-h-screen bg-fonarte-bg">
        <PortalNavbar />
        <main className="px-6 lg:px-8 py-6">{children}</main>
        <footer className="px-6 lg:px-8 py-8 border-t border-fonarte-border mt-8">
          <p className="text-[11px] text-fonarte-textMuted text-center leading-relaxed">
            Fonarte For Artists — estadísticas de reproducciones por plataforma.
            <br />
            Este portal muestra únicamente conteos de escuchas. No incluye información de pagos ni
            regalías.
          </p>
        </footer>
      </div>
    </StatsProvider>
  );
}
