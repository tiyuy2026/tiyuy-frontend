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
      <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    ),
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    titleColor: 'text-blue-900 dark:text-blue-300',
    border: 'border-blue-100 dark:border-blue-800',
  },
  success: {
    icon: (
      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
    ),
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    titleColor: 'text-green-900 dark:text-green-300',
    border: 'border-green-100 dark:border-green-800',
  },
  warning: {
    icon: (
      <TriangleAlert className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
    ),
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    titleColor: 'text-yellow-900 dark:text-yellow-300',
    border: 'border-yellow-100 dark:border-yellow-800',
  },
  error: {
    icon: (
      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
    ),
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    titleColor: 'text-red-900 dark:text-red-300',
    border: 'border-red-100 dark:border-red-800',
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
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border ${styles.border} animate-in fade-in zoom-in duration-200`}
      >
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
            {styles.icon}
          </div>

          {title && (
            <h3 className={`text-lg font-bold ${styles.titleColor}`}>{title}</h3>
          )}

          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">{message}</p>

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
