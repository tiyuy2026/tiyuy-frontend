'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccessContent() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de éxito */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Tu pago ha sido procesado correctamente. La suscripción será activada en los próximos minutos.
        </p>

        {/* Detalles del pago */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">Detalles de la Transacción:</h3>
          
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
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          Ir al Dashboard
          <ArrowRight className="h-5 w-5" />
        </button>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Importante:</strong> Recibirás un email de confirmación cuando la suscripción esté completamente activa.
          </p>
        </div>
      </div>
    </div>
  );
}
