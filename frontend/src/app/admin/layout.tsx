'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { api } from '@/lib/api';

type Estado = 'verificando' | 'autorizado' | 'denegado';

/**
 * Protección de la ruta /admin por ROL.
 *
 * Requisito del implementation plan (§7): el panel de administración es una
 * "ruta protegida por rol". Un usuario autenticado que NO sea administrador
 * (p. ej. una cuenta de artista) no puede ver el panel — ni siquiera su
 * interfaz — aunque tenga un token válido.
 *
 * La autorización real la impone el backend con @RequireAdmin() en cada
 * endpoint; esta comprobación es la capa de UI que evita renderizar el panel
 * a quien no corresponde (defensa en profundidad, no la única defensa).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>('verificando');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('fonarte_access_token');

    if (!token) {
      router.replace('/login');
      return;
    }

    // Cache del perfil para evitar el parpadeo del spinner entre navegaciones
    const cache = localStorage.getItem('fonarte_user');
    if (cache) {
      try {
        const user = JSON.parse(cache);
        if (user?.esAdmin === true) {
          setEstado('autorizado');
        } else if (user?.esAdmin === false) {
          setEmail(user.email ?? null);
          setEstado('denegado');
        }
      } catch {
        // Cache corrupta: se ignora y se revalida contra el backend
      }
    }

    let vigente = true;

    // Verificación autoritativa contra el backend: no se confía solo en localStorage
    api
      .getMe()
      .then((perfil: any) => {
        if (!vigente) return;
        localStorage.setItem('fonarte_user', JSON.stringify(perfil));

        if (perfil?.esAdmin === true) {
          setEstado('autorizado');
        } else {
          // Autenticado pero sin rol admin → nunca se renderiza el panel
          setEmail(perfil?.email ?? null);
          setEstado('denegado');
        }
      })
      .catch(() => {
        if (!vigente) return;
        // Token inválido/expirado o backend inaccesible: no se autoriza.
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
          <p className="text-xs text-fonarte-textMuted font-medium">
            Verificando credenciales de administrador...
          </p>
        </div>
      </div>
    );
  }

  // Usuario autenticado sin rol admin: se le niega el acceso explícitamente.
  if (estado === 'denegado') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fonarte-bg p-4">
        <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-fonarte-border text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-fonarte-danger/10 border border-fonarte-danger/30 text-fonarte-danger mb-5">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Acceso restringido</h1>
          <p className="text-sm text-fonarte-textMuted mt-2 leading-relaxed">
            Esta sección es exclusiva para administradores de Fonarte.
            {email ? (
              <>
                {' '}
                La cuenta <span className="text-slate-300 font-medium">{email}</span> no tiene
                privilegios de administrador.
              </>
            ) : null}
          </p>
          <button
            onClick={() => api.logout()}
            className="mt-6 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-fonarte-primary to-fonarte-primaryHover text-white font-medium shadow-lg shadow-fonarte-primary/30 hover:opacity-95 active:scale-[0.99] transition text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-fonarte-bg">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
