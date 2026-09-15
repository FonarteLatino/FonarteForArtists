'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('fonarte_access_token');
    const userStr = localStorage.getItem('fonarte_user');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const user = userStr ? JSON.parse(userStr) : null;

      // Enrutado por rol: administradores al panel, artistas al portal.
      if (user?.esAdmin === true) {
        router.replace('/admin');
        return;
      }

      const artistaId = user?.artistaId ?? user?.artista?.id ?? null;
      if (artistaId) {
        router.replace('/portal');
        return;
      }

      // Cuenta sin rol admin y sin artista: no hay destino válido.
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-fonarte-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-fonarte-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-fonarte-textMuted text-sm font-medium">Cargando Fonarte For Artists...</p>
      </div>
    </div>
  );
}
