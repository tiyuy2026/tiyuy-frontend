'use client';
import React, { useState, useEffect } from 'react';
import { useAuth, useKyc } from '@/presentation/hooks';
import { OnboardingStepper } from '../OnboardingStepper';
import { Button, Badge } from '@/presentation/components/ui';

export const KycScreen: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const { validateDni, completeKyc, isValidating, dniValidation } = useKyc();
  const [isDniValidated, setIsDniValidated] = useState(false);
  const [error, setError] = useState('');
  const [dniValue, setDniValue] = useState('');  // ← Estado local DNI

  useEffect(() => {
    checkAuth();
  }, []); // ← Array vacío para que se ejecute solo una vez

  const handleDniChange = (value: string) => {
    setDniValue(value);
  };

  const handleValidateDni = async () => {
    if (dniValue.length !== 8) {
      setError('DNI debe tener 8 dígitos');
      return;
    }
    try {
      setError('');
      await validateDni(dniValue);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCompleteKyc = async () => {
    if (!user || !dniValidation?.success) {
      setError('Primero valida tu DNI');
      return;
    }

    try {
      await completeKyc(user.id.toString(), dniValue);  // ← 2 args SOLO
      setError('');
      setIsDniValidated(true);
      
      // Redirigir al dashboard después de completar KYC
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Error al completar KYC');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Verificación de Identidad</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Confirma tu identidad con RENIEC
        </p>
        <Badge variant="info" size="lg" className="px-4 py-2">
          API oficial RENIEC
        </Badge>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* DNI Input */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 mb-8">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={dniValue}
              onChange={(e) => handleDniChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="12345678"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={8}
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleValidateDni}
              disabled={dniValue.length !== 8 || isValidating}
              isLoading={isValidating}
            >
              Validar
            </Button>
          </div>
        </div>

        {/* Resultado */}
        {dniValidation?.success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">✓ Verificado</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div><span className="text-gray-600">DNI:</span> <div className="font-semibold">{dniValidation.dni}</div></div>
              <div><span className="text-gray-600">Nombre:</span> <div className="font-semibold">{dniValidation.fullName}</div></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
            {error}
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleCompleteKyc}
          isLoading={isValidating}
          disabled={!dniValidation?.success}
        >
          Completar KYC
        </Button>
      </div>

      <OnboardingStepper />
    </div>
  );
};
