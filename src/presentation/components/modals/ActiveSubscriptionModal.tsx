'use client';

import { ActiveSubscription } from '@/core/domain/entities/Wallet';

interface ActiveSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSubscription: ActiveSubscription | null;
}

export function ActiveSubscriptionModal({ isOpen, onClose, activeSubscription }: ActiveSubscriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icono de éxito */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          ¡Ya tienes un plan activo!
        </h2>

        {/* Mensaje principal */}
        <p className="text-center text-gray-600 mb-6">
          Disfruta de los beneficios de tu suscripción actual. Estás publicando con el plan:
        </p>

        {/* Información del plan actual */}
        {activeSubscription && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {activeSubscription.plan.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {activeSubscription.plan.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-500">Publicaciones</p>
                  <p className="font-bold text-gray-900">
                    {activeSubscription.remainingPublications} / {activeSubscription.plan.maxPublications}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-500">Vence</p>
                  <p className="font-bold text-gray-900">
                    {new Date(activeSubscription.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Opciones */}
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Entendido, gracias
          </button>
          
          {activeSubscription && (
            <button
              onClick={() => {
                // Aquí podrías agregar lógica para upgrade
                onClose();
              }}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Quiero hacer upgrade
            </button>
          )}
        </div>

        {/* Texto de ayuda */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Necesitas ayuda?{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Contacta soporte
          </a>
        </p>
      </div>
    </div>
  );
}
