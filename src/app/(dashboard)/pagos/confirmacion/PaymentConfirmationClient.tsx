'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePaymentDetails } from '@/presentation/hooks/usePayments';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';

export function PaymentConfirmationClient({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const { data: payment, isLoading, error } = usePaymentDetails(paymentId);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (payment && payment.status === 'SUCCESS') {
      // Redirigir después de 3 segundos para que el usuario vea el éxito
      const timer = setTimeout(() => {
        setIsRedirecting(true);
        router.push('/dashboard?payment_success=true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [payment, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
          <p className="mt-8 text-xl text-gray-600">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41 1.41L10 14.17l3.59-3.59L15 16l-5-5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error en la Confirmación</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard/pagos')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Mis Pagos
          </button>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Pago no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Success Side */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-12 text-white">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2m0 0l-2-2m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold mb-4">¡Pago Exitoso!</h1>
                  <p className="text-xl mb-8 text-green-100">
                    Tu pago ha sido procesado correctamente
                  </p>
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between">
                      <span className="text-green-100">ID del Pago:</span>
                      <span className="font-mono">#{paymentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-100">Monto:</span>
                      <span className="font-bold text-2xl">S/ {payment?.amount?.toLocaleString('es-PE')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-100">Estado:</span>
                      <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                        {payment?.status === 'SUCCESS' ? 'Aprobado' : payment?.status}
                      </span>
                    </div>
                    {payment?.description && (
                      <div className="flex justify-between">
                        <span className="text-green-100">Descripción:</span>
                        <span className="text-green-100">{payment.description}</span>
                      </div>
                    )}
                  </div>
                  {isRedirecting && (
                    <div className="mt-8 text-center">
                      <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                        <span>Redirigiendo al dashboard...</span>
                      </div>
                    </div>
                  )}
              </div>

              {/* Details Side */}
              <div className="p-12 bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen del Pago</h2>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Qué sigue ahora?</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2m0 0l-2-2m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Tus créditos han sido acreditados automáticamente</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2m0 0l-2-2m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Recibirás un email de confirmación</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2m0 0l-2-2m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Puedes empezar a publicar propiedades</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Transacción</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Fecha:</span>
                        <span className="font-medium">{payment?.paidAt ? new Date(payment.paidAt).toLocaleString('es-PE') : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Método:</span>
                        <span className="font-medium">{payment?.paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">ID de Transacción:</span>
                        <span className="font-mono text-xs">{payment?.transactionId || paymentId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Ir al Dashboard
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Imprimir Comprobante
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
