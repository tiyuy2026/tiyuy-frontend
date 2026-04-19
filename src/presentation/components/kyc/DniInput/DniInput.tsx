'use client';
import React, { useState } from 'react';
import { Input, Button, Spinner } from '@/presentation/components/ui';
import { useKyc } from '@/presentation/hooks';
import { XCircle } from 'lucide-react';

interface DniInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidated?: (data: any) => void;
  required?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  externalError?: string;
}

export const DniInput: React.FC<DniInputProps> = ({
  value,
  onChange,
  onValidated,
  required = false,
  disabled = false,
  helperText,
  externalError,
}) => {
  const { validateDni, isValidating, dniValidation } = useKyc();
  const [error, setError] = useState<string>('');
  const displayError = error || externalError || '';
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('Su DNI no puede ser validado. Corrobore los digitos.');

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
      const errorMsg = err.message || '';
      if (errorMsg.includes('no disponible') || errorMsg.includes('servicio') || errorMsg.includes('Error al validar')) {
        setModalMessage('Servicio de validacion no disponible. Intente mas tarde.');
      } else if (errorMsg.includes('no encontrado') || errorMsg.includes('DNI no')) {
        setModalMessage('Su DNI no puede ser validado. Corrobore los digitos.');
      } else {
        setModalMessage(errorMsg || 'Su DNI no puede ser validado. Corrobore los digitos.');
      }
      setShowErrorModal(true);
      setError('');
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
            error={displayError}
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

      {/* Modal de error de validacion */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Validacion de DNI</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
