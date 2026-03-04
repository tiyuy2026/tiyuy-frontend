'use client';
import React, { useState } from 'react';
import { Input, Button } from '@/presentation/components/ui';
import { useKyc } from '@/presentation/hooks';

interface RucInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidated?: (data: any) => void;
  required?: boolean;
}

export const RucInput: React.FC<RucInputProps> = ({
  value,
  onChange,
  onValidated,
  required = false,
}) => {
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
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    onChange(val);
    setError('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            label="RUC"
            placeholder="20123456789"
            value={value}
            onChange={handleChange}
            error={error}
            required={required}
            maxLength={11}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            helperText="RUC de tu empresa (11 dígitos)"
          />
        </div>
        <div className="pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleValidate}
            disabled={value.length !== 11 || isValidating}
            isLoading={isValidating}
          >
            {isValidating ? 'Validando...' : 'Validar'}
          </Button>
        </div>
      </div>

      {/* Resultado de validación */}
      {rucValidation && rucValidation.success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900 mb-1">✓ RUC Verificado</h4>
              <p className="text-sm text-green-800">
                <span className="font-medium">{rucValidation.companyName}</span>
              </p>
              <p className="text-xs text-green-700 mt-1">RUC: {rucValidation.ruc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
