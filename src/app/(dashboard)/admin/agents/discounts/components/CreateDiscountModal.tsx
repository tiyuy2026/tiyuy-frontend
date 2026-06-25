import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { AgentListItem } from '@/core/domain/entities/Admin';
import { X } from 'lucide-react';

interface NewDiscount {
  code: string;
  discountPercentage: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
}

interface CreateDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgent: AgentListItem | null;
  newDiscount: NewDiscount;
  setNewDiscount: (discount: NewDiscount) => void;
  onCreate: () => void;
  isPending: boolean;
}

export default function CreateDiscountModal({
  isOpen,
  onClose,
  selectedAgent,
  newDiscount,
  setNewDiscount,
  onCreate,
  isPending
}: CreateDiscountModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col mx-2 sm:mx-0">
        {/* Header verde */}
        <div className="bg-[#00E676] px-3 sm:px-5 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-200 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-green-800 font-bold text-base sm:text-lg">D</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-bold text-gray-800 truncate">Crear Descuento Personalizado</h3>
                <p className="text-[10px] sm:text-xs text-green-700 truncate">
                  Para: {selectedAgent?.firstName} {selectedAgent?.lastName} (ID: {selectedAgent?.id})
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 sm:p-1.5 hover:bg-green-300 rounded-lg transition-colors text-gray-600 flex-shrink-0">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Form scrolleable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-700">Código de Descuento</label>
            <input
              type="text"
              value={newDiscount.code}
              onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
              placeholder="Ej: AGENTE20OFF"
              className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="text-[8px] sm:text-[10px] text-gray-500">Este código será único para este agente</p>
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-700">Porcentaje de Descuento (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0.01" max="100" step="0.01"
                value={newDiscount.discountPercentage}
                onChange={(e) => setNewDiscount({ ...newDiscount, discountPercentage: e.target.value })}
                placeholder="Ej: 20"
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-8 sm:pr-10"
              />
              <span className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-gray-400 font-bold text-[10px] sm:text-sm">%</span>
            </div>
            <p className="text-[8px] sm:text-[10px] text-gray-500">Si el plan cuesta S/100, con 20% descuento costará S/80</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-[10px] sm:text-xs font-semibold text-gray-700">Fecha Inicio</label>
              <input
                type="date"
                value={newDiscount.startDate}
                onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <label className="text-[10px] sm:text-xs font-semibold text-gray-700">Fecha Fin</label>
              <input
                type="date"
                value={newDiscount.endDate}
                onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-700">Límite de Usos (opcional)</label>
            <input
              type="number" min="1"
              value={newDiscount.usageLimit}
              onChange={(e) => setNewDiscount({ ...newDiscount, usageLimit: e.target.value })}
              placeholder="Dejar vacío para ilimitado"
              className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[8px] sm:text-[10px] text-gray-500">Cuántas veces puede usar este código el agente</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 py-2 sm:py-2.5 text-[10px] sm:text-sm font-medium">
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            disabled={isPending}
            className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg text-[10px] sm:text-sm font-medium shadow-lg shadow-teal-500/30"
          >
            {isPending ? 'Creando...' : 'Crear Descuento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
