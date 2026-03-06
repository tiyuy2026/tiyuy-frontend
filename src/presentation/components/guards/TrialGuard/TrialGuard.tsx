'use client';

import React from 'react';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { useAuthStore } from '@/presentation/store/authStore';
import { Lock, Clock, Crown, CreditCard } from 'lucide-react';

interface TrialGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function TrialGuard({ children, fallback }: TrialGuardProps) {
  const { user } = useAuthStore();
  const { data: activeSubscription } = useActiveSubscription();

  // Si no hay usuario o no es DEVELOPER, permitir acceso
  if (!user || user.role !== 'DEVELOPER') {
    return <>{children}</>;
  }

  // Si no hay suscripción activa, verificar si está en período de trial
  if (!activeSubscription) {
    return <>{children}</>; // Permitir acceso, el backend debe manejar el trial
  }

  // Verificar si la suscripción está expirada
  const now = new Date();
  const expiresAt = new Date(activeSubscription.expiresAt);
  const isExpired = now > expiresAt;

  // Si está expirada, mostrar pantalla de bloqueo
  // TEMPORALMENTE DESACTIVADO PARA PRUEBAS
  if (false && isExpired) {
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

          {/* Información del plan expirado */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
              <Clock className="w-4 h-4" />
              <span>
                Período finalizado: {expiresAt.toLocaleDateString('es-PE')}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Crown className="w-4 h-4" />
              <span>
                Plan utilizado: {activeSubscription.plan?.name || 'FREE TRIAL'}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <a
              href="/dashboard/planes"
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <Crown className="w-4 h-4" />
              Ver Planes Disponibles
            </a>
            
            <a
              href="/dashboard/billetera/recargar"
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Recargar Créditos
            </a>
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

  // Si no está expirada, permitir acceso normal
  return <>{children}</>;
}
