'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, ExternalLink, Info } from 'lucide-react';

interface PlanExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function PlanExpiredModal({ isOpen, onClose, message }: PlanExpiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToPlans = () => {
    onClose();
    router.push('/plans');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Plan Expirado</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-2">
            {message || 'Has alcanzado el límite de publicaciones de tu plan actual.'}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Para seguir publicando, necesitas actualizar tu plan o renovarlo.
          </p>

          {/* Stats info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-amber-800">
              <Info className="w-5 h-5" />
              <span className="text-sm font-medium">Tu publicación se guardó como borrador</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleGoToPlans}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-200"
            >
              <span className="flex items-center justify-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Ver Planes Disponibles
              </span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              Entendido, lo haré después
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
