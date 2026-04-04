'use client';

import React from 'react';
import { useTrialStatus } from '@/presentation/hooks/useTrialStatus';
import { AlertTriangle, Clock, Crown } from 'lucide-react';

export function TrialWarningBanner() {
  const { isTrialUser, isTrialActive, daysRemaining } = useTrialStatus();

  // Solo mostrar para usuarios de trial activos
  if (!isTrialUser || !isTrialActive || daysRemaining === null) {
    return null;
  }

  // Si quedan 7 días o menos, mostrar banner de advertencia
  if (daysRemaining <= 7) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-orange-800">
                Tu período de prueba está por finalizar
              </h3>
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                {daysRemaining} días restantes
              </span>
            </div>
            <p className="text-sm text-orange-700">
              Tu proyecto gratuito de 30 días finaliza pronto. 
              Suscríbete a un plan para continuar publicando sin interrupciones.
            </p>
            <div className="flex gap-2 mt-2">
              <a
                href="/plans"
                className="inline-flex items-center gap-1 bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
              >
                <Crown className="w-3 h-3" />
                Ver Planes
              </a>
              <a
                href="/my-projects/new"
                className="inline-flex items-center gap-1 bg-gray-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                <Clock className="w-3 h-3" />
                Publicar Proyecto
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si quedan más de 7 días, mostrar banner informativo
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Clock className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-green-800">
              Disfrutando tu período de prueba
            </h3>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
              {daysRemaining} días restantes
            </span>
          </div>
          <p className="text-sm text-green-700">
            Tu proyecto gratuito está activo. Publica todas las unidades que necesites 
            antes de que finalice el período de prueba.
          </p>
        </div>
      </div>
    </div>
  );
}
