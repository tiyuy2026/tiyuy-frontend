'use client';
import React, { useState } from 'react';
import { Input, Button, Spinner } from '@/presentation/components/ui';
import { useKyc } from '@/presentation/hooks';

interface DniInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidated?: (data: any) => void;
  required?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
}

export const DniInput: React.FC<DniInputProps> = ({
  value,
  onChange,
  onValidated,
  required = false,
  disabled = false,
  helperText,
}) => {
  const { validateDni, isValidating, dniValidation } = useKyc();
  const [error, setError] = useState<string>('');

  const handleValidate = async () => {
    if (value.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return;
    }
    try {
      setError('');
      const result = await validateDni(value);
      if (result.success) {
        onValidated?.(result);
      } else {
        setError(result.message || 'DNI no válido');
      }
    } catch (err: any) {
      setError(err.message || 'Error al validar DNI');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = e.target.value.replace(/\D/g, '').slice(0, 8);
    onChange(val);
    setError('');
  };

  return (
    <div className="space-y-2">
      {/* Label manual */}
      <label className="block text-sm font-medium text-gray-700">
        DNI {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="12345678"
            value={value}
            onChange={handleChange}
            error={error}
            required={required}
            maxLength={8}
            disabled={disabled}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            }
          />
          {/* helperText manual */}
          {helperText && (
            <p className="mt-1 text-sm text-gray-500">{helperText}</p>
          )}
          {disabled && (
            <p className="mt-1 text-sm text-gray-500">DNI ya validado y verificado</p>
          )}
        </div>
        <div className="pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleValidate}
            disabled={value.length !== 8 || isValidating}
            isLoading={isValidating}
          >
            {isValidating ? 'Validando...' : 'Validar'}
          </Button>
        </div>
      </div>

      {dniValidation && dniValidation.success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900 mb-1">✓ DNI Verificado</h4>
              <p className="text-sm text-green-800">
                <span className="font-medium">{dniValidation.fullName}</span>
              </p>
              <p className="text-xs text-green-700 mt-1">DNI: {dniValidation.dni}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
