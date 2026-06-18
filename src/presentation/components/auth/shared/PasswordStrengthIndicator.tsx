'use client';
import React, { useMemo } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

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
              {passes
                ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-green-500" aria-hidden="true" />
                : <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-gray-300" aria-hidden="true" />
              }
              <span>{req.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
