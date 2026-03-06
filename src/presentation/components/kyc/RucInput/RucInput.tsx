'use client';
import React, { useState } from 'react';
import { Input, Button } from '@/presentation/components/ui';
import { useKyc } from '@/presentation/hooks';

interface RucInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidated?: (data: any) => void;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export const RucInput: React.FC<RucInputProps> = ({
  value,
  onChange,
  onValidated,
  required = false,
  helperText,
  disabled = false,
}) => {
  // Se cambia isValidatingRuc por isValidating que es lo que devuelve el hook
  const { validateRuc, isValidating, rucValidation } = useKyc();
  const [error, setError] = useState<string>('');

  const handleValidate = async () => {
    if (value.length !== 11) {
      setError('El RUC debe tener 11 dígitos');
      return;
    }

    try {
      setError('');
      const result = await validateRuc(value);
      if (result.success) {
        onValidated?.(result);
      } else {
        setError(result.message || 'RUC no válido');
      }
    } catch (err: any) {
      setError(err.message || 'Error al validar RUC');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    onChange(val);
    setError('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        RUC {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="12345678901"
            value={value}
            onChange={handleChange}
            error={error}
            required={required}
            maxLength={11}
            disabled={disabled}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h3V5H5a2 2 0 00-2 2zm11-2v14h3a2 2 0 002-2V7a2 2 0 00-2-2h-3z"
                />
              </svg>
            }
            helperText={
              helperText ??
              (disabled
                ? 'RUC ya validado y verificado'
                : 'Ingresa el RUC de tu empresa (11 dígitos)')
            }
          />
        </div>

        <div className="pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleValidate}
            // Actualizado para usar isValidating
            disabled={value.length !== 11 || isValidating}
            isLoading={isValidating}
          >
            {isValidating ? 'Validando...' : 'Validar'}
          </Button>
        </div>
      </div>

      {rucValidation && rucValidation.success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-800">
            <span className="font-medium">{rucValidation.companyName}</span>
          </p>
          <p className="text-xs text-green-700 mt-1">RUC: {rucValidation.ruc}</p>
        </div>
      )}
    </div>
  );
};