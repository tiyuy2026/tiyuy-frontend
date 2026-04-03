'use client';

import Link from 'next/link';
import { Lock, Clock, Crown, CreditCard, ArrowLeft } from 'lucide-react';

export default function TrialExpiredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono de bloqueo */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tu Período de Prueba ha Finalizado
        </h1>

        {/* Descripción */}
        <p className="text-gray-600 mb-6">
          Tu proyecto gratuito de 30 días ha expirado. Para continuar publicando y gestionando tus proyectos, 
          suscríbete a uno de nuestros planes.
        </p>

        {/* Información importante */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-800">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">
              ¡Activa tu suscripción ahora!
            </span>
          </div>
          <p className="text-yellow-700 mt-2 text-xs">
            Al suscribirte, podrás seguir publicando proyectos sin límites y acceder a todas las funciones premium.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            href="/dashboard/planes"
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            <Crown className="w-4 h-4" />
            Ver Planes Disponibles
          </Link>
          
          <Link
            href="/dashboard/billetera/recargar"
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Recargar Créditos
          </Link>

          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
        </div>

        {/* Link de soporte */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a href="/soporte" className="text-purple-600 hover:underline">
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
