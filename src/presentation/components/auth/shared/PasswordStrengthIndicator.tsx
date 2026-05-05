'use client';
import React, { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

type StrengthLevel = 'empty' | 'weak' | 'medium' | 'strong';

interface StrengthConfig {
  level: StrengthLevel;
  label: string;
  color: string;
  barColor: string;
  filledBars: number;
}

/**
 * Calcula la fortaleza de una contraseña basándose en:
 * - Longitud mínima de 8 caracteres
 * - Presencia de letras minúsculas
 * - Presencia de letras mayúsculas
 * - Presencia de números
 * - Presencia de caracteres especiales
 */
export function getPasswordStrength(password: string): StrengthConfig {
  if (!password) {
    return { level: 'empty', label: '', color: '', barColor: '', filledBars: 0 };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { level: 'weak', label: 'Débil', color: 'text-red-600', barColor: 'bg-red-500', filledBars: 1 };
  }
  if (score <= 3) {
    return { level: 'medium', label: 'Media', color: 'text-yellow-600', barColor: 'bg-yellow-400', filledBars: 2 };
  }
  return { level: 'strong', label: 'Fuerte', color: 'text-green-600', barColor: 'bg-green-500', filledBars: 3 };
}

const REQUIREMENTS = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Una letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Una letra mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un número', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Un carácter especial (!@#$...)', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2" aria-label="Indicador de fortaleza de contraseña">
      {/* Barra de fortaleza */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                bar <= strength.filledBars ? strength.barColor : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>
      </div>

      {/* Checklist de requisitos */}
      <ul className="space-y-1">
        {REQUIREMENTS.map((req) => {
          const passes = req.test(password);
          return (
            <li
              key={req.label}
              className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                passes ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 flex-shrink-0 ${passes ? 'text-green-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                {passes ? (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              <span>{req.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
