'use client';

interface InvalidUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  selectedPlan?: string;
}

export function InvalidUpgradeModal({ isOpen, onClose, currentPlan, selectedPlan }: InvalidUpgradeModalProps) {
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

        {/* Icono de advertencia */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.148V5.857c0-1.481-.962-3.148-2.502-3.148H5.582c-1.54 0-2.502 1.667-2.502 3.148v8.995c0 1.481.962 3.148 2.502 3.148h13.856z" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Upgrade no disponible
        </h2>

        {/* Mensaje principal */}
        <p className="text-center text-gray-600 mb-6">
          Para hacer upgrade, elige un plan con más beneficios que tu plan actual.
        </p>

        {/* Información de los planes */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tu plan actual:</span>
              <span className="font-bold text-gray-900">{currentPlan || 'Plan Basic'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Plan seleccionado:</span>
              <span className="font-bold text-orange-600">{selectedPlan || 'Plan Gratis'}</span>
            </div>
            <div className="border-t pt-3">
              <p className="text-sm text-orange-700 text-center">
                ⚠️ El plan seleccionado no es superior a tu plan actual
              </p>
            </div>
          </div>
        </div>

        {/* Opciones */}
        <div className="space-y-3">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Entendido, elegir otro plan
          </button>
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
