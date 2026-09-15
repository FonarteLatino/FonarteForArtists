import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fonarte For Artists — Portal y Administración',
  description:
    'Portal de analíticas y estadísticas multi-plataforma de Fonarte Latino con control granular de permisos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-fonarte-bg text-slate-100 antialiased selection:bg-fonarte-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
