'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await api.login(email, password);

      // Enrutado por rol:
      //  - Administrador → panel de administración
      //  - Artista       → portal de estadísticas
      if (user?.esAdmin === true) {
        router.push('/admin');
        return;
      }

      const artistaId = user?.artistaId ?? user?.artista?.id ?? null;
      if (artistaId) {
        router.push('/portal');
        return;
      }

      // Cuenta autenticada sin rol admin y sin artista asociado: no hay a dónde
      // llevarla (ni panel ni portal). Se limpian los tokens localmente
      // (api.logout() recargaría la página y perdería este mensaje).
      api.clearTokens();
      setError(
        'Tu cuenta no está asociada a un artista, así que no tiene estadísticas que mostrar ni acceso al panel de administración. Contacta a Fonarte Latino.',
      );
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-fonarte-bg relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-fonarte-primary/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-fonarte-secondary/15 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10 border border-fonarte-border">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-fonarte-primary to-fonarte-secondary shadow-lg shadow-fonarte-primary/30 mb-4">
            <span className="text-2xl font-black tracking-wider text-white">F</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Fonarte For Artists</h1>
          <p className="text-sm text-fonarte-textMuted mt-1">
            Panel administrativo y portal de estadísticas multi-plataforma
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-fonarte-danger/10 border border-fonarte-danger/30 text-fonarte-danger text-sm flex items-start gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@fonartelatino.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-fonarte-border text-white placeholder:text-slate-500 focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-fonarte-border text-white placeholder:text-slate-500 focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-fonarte-primary to-fonarte-primaryHover text-white font-medium shadow-lg shadow-fonarte-primary/30 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            Acceso no autoregistrable. Si eres un artista y necesitas acceso a tus estadísticas, solicita un enlace de activación a la administración de Fonarte Latino.
          </p>
        </div>
      </div>
    </div>
  );
}
