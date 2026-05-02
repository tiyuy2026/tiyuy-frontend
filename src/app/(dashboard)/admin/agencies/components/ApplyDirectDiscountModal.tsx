import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { InmobiliariaWithStats } from '@/core/domain/entities/Admin';

interface DirectDiscount {
  discountPercentage: string;
  reason: string;
  notifyAgency: boolean;
  applyToAllAgents: boolean;
  maxAgents: string;
  expiresAt: string;
}

interface ApplyDirectDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgency: InmobiliariaWithStats | null;
  directDiscount: DirectDiscount;
  setDirectDiscount: (discount: DirectDiscount) => void;
  onApply: () => void;
  isPending: boolean;
}

export default function ApplyDirectDiscountModal({
  isOpen,
  onClose,
  selectedAgency,
  directDiscount,
  setDirectDiscount,
  onApply,
  isPending
}: ApplyDirectDiscountModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">
                Aplicar Descuento Directo
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Para: {selectedAgency?.name} (RUC: {selectedAgency?.ruc})
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Nota:</strong> Este descuento se aplicará directamente al plan actual de la inmobiliaria. 
            El descuento será inmediato y afectará el próximo cobro.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Porcentaje de Descuento (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                value={directDiscount.discountPercentage}
                onChange={(e) => setDirectDiscount({ ...directDiscount, discountPercentage: e.target.value })}
                placeholder="Ej: 15"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
              />
              <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Plan actual: <span className="font-semibold">{selectedAgency?.currentPlan || 'Sin plan'}</span>
              <br />
              Ingresos últimos 30 días: <span className="font-semibold">S/ {selectedAgency?.revenue30Days?.toLocaleString() || '0'}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo del Descuento</label>
            <textarea
              value={directDiscount.reason}
              onChange={(e) => setDirectDiscount({ ...directDiscount, reason: e.target.value })}
              placeholder="Ej: Descuento por fidelidad, compensación por servicio, promoción especial..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Este motivo quedará registrado en el historial de la inmobiliaria</p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyAgency"
              checked={directDiscount.notifyAgency}
              onChange={(e) => setDirectDiscount({ ...directDiscount, notifyAgency: e.target.checked })}
              className="mr-2 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            <label htmlFor="notifyAgency" className="text-sm text-gray-700">
              Notificar a la inmobiliaria por email
            </label>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="applyToAllAgents"
                checked={directDiscount.applyToAllAgents}
                onChange={(e) => setDirectDiscount({ ...directDiscount, applyToAllAgents: e.target.checked })}
                className="mt-1 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <div className="flex-1">
                <label htmlFor="applyToAllAgents" className="text-sm font-medium text-gray-700 block">
                  Aplicar descuento a todos los agentes de esta inmobiliaria
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  El descuento se asignará automáticamente a cada agente activo de la inmobiliaria
                </p>
              </div>
            </div>

            {directDiscount.applyToAllAgents && (
              <>
                <div className="mt-4 ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad máxima de agentes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={directDiscount.maxAgents}
                    onChange={(e) => setDirectDiscount({ ...directDiscount, maxAgents: e.target.value })}
                    placeholder="Ej: 15 (dejar vacío para todos los agentes)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo número de agentes que pueden acceder a este descuento. Los primeros {directDiscount.maxAgents || 'N'} agentes obtendrán el {directDiscount.discountPercentage || '0'}% de descuento (solo usable 1 vez por agente).
                  </p>
                </div>

                <div className="mt-4 ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de expiración
                  </label>
                  <input
                    type="datetime-local"
                    value={directDiscount.expiresAt}
                    onChange={(e) => setDirectDiscount({ ...directDiscount, expiresAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Después de esta fecha, el descuento no podrá ser usado por ningún agente. Ej: 3 horas, 1 día, etc.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onApply}
            disabled={isPending || !directDiscount.discountPercentage || !directDiscount.reason}
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium"
          >
            {isPending ? 'Aplicando...' : 'Aplicar Descuento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
