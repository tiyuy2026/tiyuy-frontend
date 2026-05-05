'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function PaymentFailureContent() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de error */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pago Fallido
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Tu pago no pudo ser procesado. Por favor, intenta nuevamente o contacta a soporte.
        </p>

        {/* Detalles del pago */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">Detalles del Intento:</h3>
          
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

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard/plans')}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            Intentar Nuevamente
            <RefreshCw className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            Ir al Dashboard
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Información de soporte */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>¿Necesitas ayuda?</strong> Contacta a soporte@Tiyuy.com o revisa tus métodos de pago.
          </p>
        </div>
      </div>
    </div>
  );
}
