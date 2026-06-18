'use client';
import React, { useEffect } from 'react';
import { CheckCircle, Info, TriangleAlert, XCircle } from 'lucide-react';;

type InfoDialogVariant = 'info' | 'success' | 'warning' | 'error';

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: InfoDialogVariant;
  showRegisterButton?: boolean;
  onRegister?: () => void;
}

const variantStyles: Record<InfoDialogVariant, { icon: React.ReactNode; iconBg: string; titleColor: string; border: string }> = {
  info: {
    icon: (
      <Info className="w-6 h-6 text-blue-600" />
    ),
    iconBg: 'bg-blue-100',
    titleColor: 'text-blue-900',
    border: 'border-blue-100',
  },
  success: {
    icon: (
      <CheckCircle className="w-6 h-6 text-green-600" />
    ),
    iconBg: 'bg-green-100',
    titleColor: 'text-green-900',
    border: 'border-green-100',
  },
  warning: {
    icon: (
      <TriangleAlert className="w-6 h-6 text-yellow-600" />
    ),
    iconBg: 'bg-yellow-100',
    titleColor: 'text-yellow-900',
    border: 'border-yellow-100',
  },
  error: {
    icon: (
      <XCircle className="w-6 h-6 text-red-600" />
    ),
    iconBg: 'bg-red-100',
    titleColor: 'text-red-900',
    border: 'border-red-100',
  },
};

export const InfoDialog: React.FC<InfoDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  showRegisterButton,
  onRegister,
}) => {
  const styles = variantStyles[variant];

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border ${styles.border} animate-in fade-in zoom-in duration-200`}
      >
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
            {styles.icon}
          </div>

          {title && (
            <h3 className={`text-lg font-bold ${styles.titleColor}`}>{title}</h3>
          )}

          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{message}</p>

          <div className="flex flex-col gap-3 w-full">
            {showRegisterButton && onRegister && (
              <button
                onClick={onRegister}
                className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-sm hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Registrarme ahora
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              {showRegisterButton ? 'Cancelar' : 'Aceptar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
