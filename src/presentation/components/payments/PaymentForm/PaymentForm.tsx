'use client';

import { useEffect, useRef, useState } from 'react';
import { PaymentRequest } from '@/core/domain/entities/Wallet';
import { useProcessPayment } from '@/presentation/hooks/usePayments';
import { useValidateDeveloperDiscountCode, useUseDeveloperDiscountCode } from '@/presentation/hooks/admin/useDevelopers';

interface PaymentFormProps {
  amount: number;
  description: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  planName?: string;
  planCode?: string;
  userId?: number;
}

export function PaymentForm({ 
  amount, 
  description, 
  onPaymentSuccess,
  onPaymentError,
  planName,
  planCode = 'BASIC',
  userId
}: PaymentFormProps) {
  const processPaymentMutation = useProcessPayment();
  const validateDiscountMutation = useValidateDeveloperDiscountCode();
  const useDiscountMutation = useUseDeveloperDiscountCode();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardFormReady, setCardFormReady] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    valid: boolean;
    discountPercentage?: number;
    originalPrice?: number;
    discountedPrice?: number;
    message: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const finalAmount = appliedDiscount?.discountedPrice ?? amount;

  const handleValidateDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setIsValidating(true);
    try {
      const result = await validateDiscountMutation.mutateAsync({
        code: discountCode,
        planCode
      });
      
      setAppliedDiscount(result);
      
      if (!result.valid) {
        onPaymentError(result.message);
      }
    } catch (error: any) {
      onPaymentError(error.message || 'Error al validar el código');
    } finally {
      setIsValidating(false);
    }
  };

  const handleUseDiscount = async () => {
    if (!appliedDiscount?.valid || !userId) return;
    
    try {
      await useDiscountMutation.mutateAsync({
        code: discountCode,
        planCode,
        userId
      });
    } catch (error: any) {
      console.error('Error usando descuento:', error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).MercadoPago) {
      const mp = new (window as any).MercadoPago(
        process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!,
        { locale: 'es-PE' }
      );

      const cardForm = mp.cardForm({
        amount: Number(finalAmount),
        autoMount: true,
        processingMode: 'aggregator',
        callback: {
          onReady: () => {
            setCardFormReady(true);
            console.log('MercadoPago card form ready');
          },
          onSubmit: async (cardData: any) => {
            setIsProcessing(true);
            try {
              // Usar el descuento antes del pago si está aplicado
              if (appliedDiscount?.valid && userId) {
                await handleUseDiscount();
              }

              const result = await processPaymentMutation.mutateAsync({
                token: cardData.token,
                amount: finalAmount,
                description,
              });

              if (result.status === 'APPROVED') {
                onPaymentSuccess(String(result.transactionId || result.id));
              } else {
                onPaymentError(result.errorMessage || 'Pago rechazado');
              }
            } catch (error: any) {
              onPaymentError(error.message || 'Error al procesar el pago');
            } finally {
              setIsProcessing(false);
            }
          },
          onError: (error: any) => {
            console.error('MercadoPago error:', error);
            onPaymentError(error.message || 'Error en el formulario de pago');
            setIsProcessing(false);
          }
        }
      });

      cardForm.mount('cardForm_container');

      return () => {
        cardForm.unmount();
      };
    }
  }, [finalAmount, description]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6z"/>
            <path d="M18 8H6v6h12V8zm-1 2h-2v2h2v-2z"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {planName ? `Suscribirse al ${planName}` : 'Realizar Pago'}
        </h2>
        <p className="text-4xl font-bold text-green-600 mb-2">
          S/ {finalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
        </p>
        {appliedDiscount?.valid && (
          <div className="text-sm text-green-600 mb-1">
            <span className="line-through text-gray-400">
              S/ {amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
            <span className="ml-2 font-semibold">
              {appliedDiscount.discountPercentage}% de descuento aplicado
            </span>
          </div>
        )}
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Discount Code Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm-.88 6.32l-2.06-2.06 1.06-1.06 1 1 2.62-2.62 1.06 1.06-3.68 3.68zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z"/>
          </svg>
          ¿Tienes un código de descuento de tu inmobiliaria?
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            placeholder="Ingresa tu código (ej: DESCUENTO20)"
            className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase"
            disabled={appliedDiscount?.valid || isValidating}
          />
          <button
            onClick={handleValidateDiscount}
            disabled={!discountCode.trim() || isValidating || appliedDiscount?.valid}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              appliedDiscount?.valid
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
          >
            {isValidating ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Validando...
              </span>
            ) : appliedDiscount?.valid ? (
              '✓ Aplicado'
            ) : (
              'Aplicar'
            )}
          </button>
        </div>
        {appliedDiscount?.valid && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            {appliedDiscount.message}
          </p>
        )}
        {appliedDiscount && !appliedDiscount.valid && (
          <p className="text-xs text-red-600 mt-2">{appliedDiscount.message}</p>
        )}
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Credit Card Form */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1l4 4 4-4h1m-6 0l-4-4 4 4m6-4V5a2 2 0 00-2-2H8a2 2 0 00-2 2v6" />
            </svg>
            Tarjeta de Crédito/Débito
          </h3>
          <div 
            id="cardForm_container" 
            className="min-h-[200px] bg-white rounded-lg p-4"
          />
          {!cardFormReady && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Cargando formulario seguro...</p>
            </div>
          )}
        </div>

        {/* Other Payment Methods */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41 1.41L10 14.17l3.59-3.59L15 16l-5-5z"/>
            </svg>
            Otros Métodos de Pago
          </h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 40 20">
                <path fill="#009EE3" d="M11.14 0H7.32c-.68 0-1.3.27-1.78.73l-5.5 7.5c-.48.66-.48 1.54-.48 2.22 0l5.5 7.5c.48.66 1.1.73 1.78.73h3.82c.68 0 1.3-.27 1.78-.73l5.5-7.5C12.44.27 11.82 0 11.14 0zm-1.78 3.5l-2.5 3.5h3.82l2.5-3.5h-3.82z"/>
                <path fill="#009EE3" d="M28.86 0H25.04c-.68 0-1.3.27-1.78.73l-5.5 7.5c-.48.66-.48 1.54-.48 2.22 0l5.5 7.5c.48.66 1.1.73 1.78.73h3.82c.68 0 1.3-.27 1.78-.73l5.5-7.5C30.16.27 29.54 0 28.86 0zm-1.78 3.5l-2.5 3.5h3.82l2.5-3.5h-3.82z"/>
              </svg>
              <span className="font-semibold">Pagar con Mercado Pago</span>
            </button>
            
            <button className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">Yape (Próximamente)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 1.66 1.34 3 3h6c1.66 0 3-1.34 3-3V5l-9-4zm0 16H3v2h9v-2zm0-4H3v2h9v-2zm10-16v6c0 1.66 1.34 3 3h6c1.66 0 3-1.34 3-3V5l-9-4zm0 16h-3v2h9v-2zm0-4h-3V2h9v-2z"/>
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Pago 100% Seguro</p>
            <p>Tu información está protegida con encriptación SSL</p>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {(isProcessing || processPaymentMutation.isPending) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Procesando Pago</h3>
              <p className="text-gray-600">Por favor espera, estamos procesando tu pago de forma segura...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
