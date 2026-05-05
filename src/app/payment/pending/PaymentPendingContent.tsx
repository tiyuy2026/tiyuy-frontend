'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';

export default function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get('payment_id');
  const subscriptionId = searchParams.get('subscription_id');

  useEffect(() => {
    // Eliminar cookies de MercadoPago para evitar loop de redirecciones
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name && name.startsWith('MP_')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });

    // Solo mostrar información, NO llamar al backend
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de pendiente */}
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 rounded-full p-4">
            <Clock className="h-16 w-16 text-yellow-600" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pago en Proceso
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Tu pago está siendo procesado. Esto puede tardar unos minutos. Recibirás una confirmación por email.
        </p>

        {/* Detalles del pago */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">Detalles del Proceso:</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">ID de Pago:</span>
              <span className="font-mono text-sm">{paymentId || 'N/A'}</span>
            </div>
            
            {subscriptionId && (
              <div className="flex justify-between">
                <span className="text-gray-600">ID de Suscripción:</span>
                <span className="font-mono text-sm">{subscriptionId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botón de acción */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
        >
          Ir al Dashboard
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Importante:</strong> No cierres esta página. El proceso continuará en segundo plano.
          </p>
        </div>

        {/* Indicador de progreso */}
        <div className="mt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse bg-yellow-400 h-2 w-2 rounded-full"></div>
            <div className="animate-pulse bg-yellow-400 h-2 w-2 rounded-full" style={{ animationDelay: '0.2s' }}></div>
            <div className="animate-pulse bg-yellow-400 h-2 w-2 rounded-full" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Procesando...</p>
        </div>
      </div>
    </div>
  );
}
