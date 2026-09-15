'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

/**
 * Activación de cuenta por invitación (implementation_plan §5.3).
 *
 * Punto final del flujo "sin autoregistro": el administrador crea la cuenta y
 * comparte este enlace de un solo uso; el artista define aquí su propia
 * contraseña. El administrador nunca ve ni transmite la contraseña.
 */
function ActivacionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(
        'El enlace de activación está incompleto o no es válido. Solicita un nuevo enlace a la administración de Fonarte Latino.',
      );
    }
  }, [token]);

  const requisitos = [
    { texto: 'Al menos 8 caracteres', cumple: password.length >= 8 },
    { texto: 'Al menos una letra', cumple: /[a-zA-Z]/.test(password) },
    { texto: 'Al menos un número', cumple: /\d/.test(password) },
  ];

  const puedeEnviar =
    Boolean(token) &&
    requisitos.every((r) => r.cumple) &&
    password === confirmacion &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!requisitos.every((r) => r.cumple)) {
      setError('La contraseña no cumple los requisitos mínimos de seguridad.');
      return;
    }
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await api.acceptInvitation(token, password);
      setListo(true);
      // La sesión ya quedó iniciada por acceptInvitation; se envía al inicio.
      setTimeout(() => router.push('/'), 2500);
    } catch (err: any) {
      setError(
        err?.message ||
          'No se pudo activar la cuenta. El enlace pudo haber expirado o ya haber sido utilizado. Solicita uno nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (listo) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-fonarte-success/10 border border-fonarte-success/30 text-fonarte-success mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">Cuenta activada</h1>
        <p className="text-sm text-fonarte-textMuted mt-2 leading-relaxed">
          Tu contraseña quedó establecida correctamente. Ya puedes iniciar sesión con tu correo.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-6 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-fonarte-primary to-fonarte-primaryHover text-white font-medium shadow-lg shadow-fonarte-primary/30 hover:opacity-95 active:scale-[0.99] transition text-sm"
        >
          Ir a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-fonarte-primary to-fonarte-secondary shadow-lg shadow-fonarte-primary/30 mb-4">
          <span className="text-2xl font-black tracking-wider text-white">F</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Activa tu cuenta</h1>
        <p className="text-sm text-fonarte-textMuted mt-1">
          Define tu contraseña para acceder a tus estadísticas
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-fonarte-danger/10 border border-fonarte-danger/30 text-fonarte-danger text-sm flex items-start gap-2.5">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Nueva contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••••••"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-fonarte-border text-white placeholder:text-slate-500 focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Confirma la contraseña
          </label>
          <input
            type="password"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••••••"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-fonarte-border text-white placeholder:text-slate-500 focus:outline-none focus:border-fonarte-primary focus:ring-2 focus:ring-fonarte-primary/20 transition text-sm"
          />
        </div>

        {/* Requisitos en vivo */}
        <ul className="space-y-1.5">
          {requisitos.map((r) => (
            <li key={r.texto} className="flex items-center gap-2 text-[11px]">
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                  r.cumple
                    ? 'bg-fonarte-success/20 border-fonarte-success/50 text-fonarte-success'
                    : 'bg-slate-800/60 border-slate-600 text-slate-500'
                }`}
              >
                {r.cumple && (
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={r.cumple ? 'text-fonarte-success' : 'text-fonarte-textMuted'}>
                {r.texto}
              </span>
            </li>
          ))}
          {confirmacion.length > 0 && (
            <li className="flex items-center gap-2 text-[11px]">
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                  password === confirmacion
                    ? 'bg-fonarte-success/20 border-fonarte-success/50 text-fonarte-success'
                    : 'bg-fonarte-danger/20 border-fonarte-danger/50 text-fonarte-danger'
                }`}
              />
              <span
                className={password === confirmacion ? 'text-fonarte-success' : 'text-fonarte-danger'}
              >
                {password === confirmacion ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </span>
            </li>
          )}
        </ul>

        <button
          type="submit"
          disabled={!puedeEnviar}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-fonarte-primary to-fonarte-primaryHover text-white font-medium shadow-lg shadow-fonarte-primary/30 hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Activando cuenta...</span>
            </>
          ) : (
            <span>Establecer contraseña y activar</span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-500 leading-relaxed">
          Este enlace es de un solo uso y tiene fecha de expiración. Si ya expiró, solicita uno
          nuevo a la administración de Fonarte Latino.
        </p>
      </div>
    </div>
  );
}

export default function InvitacionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-fonarte-bg relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-fonarte-primary/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-fonarte-secondary/15 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10 border border-fonarte-border">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="w-10 h-10 border-4 border-fonarte-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-fonarte-textMuted font-medium">Cargando invitación...</p>
            </div>
          }
        >
          <ActivacionForm />
        </Suspense>
      </div>
    </div>
  );
}
