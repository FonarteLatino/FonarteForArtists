'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  /** Texto del botón de confirmación. Por defecto "Confirmar". */
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' (rojo, para revocaciones) | 'primary' (violeta) | 'success' (verde) */
  tone?: 'danger' | 'primary' | 'success';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Permite cerrar con clic fuera / tecla Escape. Por defecto true. */
  dismissible?: boolean;
}

/**
 * Modal de confirmación reutilizable.
 *
 * Se usa obligatoriamente antes de acciones destructivas o masivas
 * (revocar accesos a nivel de sello o artista completo, desactivar
 * cuentas, eliminar sellos). Ver implementation_plan.md §7.5.
 */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
  dismissible = true,
}: ConfirmModalProps) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible && !loading) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, dismissible, loading, onCancel]);

  if (!open) return null;

  const toneStyles: Record<string, string> = {
    danger: 'bg-fonarte-danger hover:bg-fonarte-dangerHover shadow-fonarte-danger/30',
    primary: 'bg-fonarte-primary hover:bg-fonarte-primaryHover shadow-fonarte-primary/30',
    success: 'bg-fonarte-success hover:brightness-110 shadow-fonarte-success/30',
  };

  const iconStyles: Record<string, string> = {
    danger: 'bg-fonarte-danger/10 text-fonarte-danger border-fonarte-danger/30',
    primary: 'bg-fonarte-primary/10 text-fonarte-primary border-fonarte-primary/30',
    success: 'bg-fonarte-success/10 text-fonarte-success border-fonarte-success/30',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => dismissible && !loading && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md glass-panel rounded-2xl border border-fonarte-border p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 flex-shrink-0 rounded-xl border flex items-center justify-center ${iconStyles[tone]}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-sm text-fonarte-textMuted mt-1.5 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 border border-fonarte-border hover:bg-slate-800/60 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 ${toneStyles[tone]}`}
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
