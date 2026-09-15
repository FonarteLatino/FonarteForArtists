'use client';

import { useEffect, useState } from 'react';

export function AdminNavbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [email, setEmail] = useState<string>('admin@fonartelatino.com');

  useEffect(() => {
    const userStr = localStorage.getItem('fonarte_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u?.email) setEmail(u.email);
      } catch {}
    }
  }, []);

  return (
    <header className="h-20 border-b border-fonarte-border glass-panel px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="text-xs text-fonarte-textMuted mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Azure SQL fonarte_portal</span>
        </div>

        <div className="h-6 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-fonarte-primary/20 border border-fonarte-primary/40 flex items-center justify-center text-fonarte-primary font-bold text-xs">
            {email.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">{email}</p>
            <p className="text-[10px] text-fonarte-textMuted">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
