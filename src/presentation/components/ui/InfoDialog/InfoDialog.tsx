'use client';
import React, { useEffect } from 'react';

type InfoDialogVariant = 'info' | 'success' | 'warning' | 'error';

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: InfoDialogVariant;
}

const variantStyles: Record<InfoDialogVariant, { icon: React.ReactNode; iconBg: string; titleColor: string; border: string }> = {
  info: {
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-blue-100',
    titleColor: 'text-blue-900',
    border: 'border-blue-100',
  },
  success: {
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-green-100',
    titleColor: 'text-green-900',
    border: 'border-green-100',
  },
  warning: {
    icon: (
      <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    iconBg: 'bg-yellow-100',
    titleColor: 'text-yellow-900',
    border: 'border-yellow-100',
  },
  error: {
    icon: (
      <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
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

          <button
            onClick={onClose}
            className="mt-1 w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
