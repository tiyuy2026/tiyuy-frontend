'use client';
import React, { useEffect, useRef } from 'react';
import { X, XCircle } from 'lucide-react';

interface AuthErrorBannerProps {
  /** Mensaje de error a mostrar. Si es null/undefined, el banner no se renderiza. */
  error: string | null | undefined;
  /** Callback para cerrar/limpiar el error manualmente. */
  onClose?: () => void;
  /** Segundos antes de que el banner desaparezca automáticamente. 0 = no auto-dismiss. */
  autoDismissSeconds?: number;
}

/**
 * Banner de error estandarizado para todos los formularios de autenticación.
 * Incluye ícono, botón de cierre opcional y auto-dismiss configurable.
 */
export const AuthErrorBanner: React.FC<AuthErrorBannerProps> = ({
  error,
  onClose,
  autoDismissSeconds = 0,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (error && autoDismissSeconds > 0 && onClose) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, autoDismissSeconds * 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [error, autoDismissSeconds, onClose]);

  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="relative animate-in slide-in-from-top-2 fade-in-0 duration-300"
    >
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 shadow-sm">
        {/* Ícono de error */}
        <div className="flex-shrink-0 w-5 h-5 mt-0.5 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="w-3 h-3 text-red-600" />
        </div>

        {/* Mensaje */}
        <div className="flex-1">
          <p className="text-sm font-medium">{error}</p>
          {autoDismissSeconds > 0 && (
            <p className="text-xs text-red-500 mt-0.5 opacity-75">
              Este mensaje desaparecerá en {autoDismissSeconds} segundos
            </p>
          )}
        </div>

        {/* Botón cerrar */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-100"
            aria-label="Cerrar mensaje de error"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
