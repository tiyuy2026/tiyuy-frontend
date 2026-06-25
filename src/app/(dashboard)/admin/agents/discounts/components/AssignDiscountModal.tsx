import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { format } from 'date-fns';
import { AgentListItem, DiscountCode } from '@/core/domain/entities/Admin';
import { X } from 'lucide-react';

interface AssignDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgent: AgentListItem | null;
  availableDiscounts?: DiscountCode[];
  onAssign: (discountId: number) => void;
  isPending: boolean;
}

export default function AssignDiscountModal({
  isOpen,
  onClose,
  selectedAgent,
  availableDiscounts,
  onAssign,
  isPending
}: AssignDiscountModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col mx-2 sm:mx-0">
        {/* Header verde */}
        <div className="bg-[#00E676] px-3 sm:px-5 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-200 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-green-800 font-bold text-base sm:text-lg">A</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-bold text-gray-800 truncate">Asignar Descuento Existente</h3>
                <p className="text-[10px] sm:text-xs text-green-700 truncate">
                  Para: {selectedAgent?.firstName} {selectedAgent?.lastName}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 sm:p-1.5 hover:bg-green-300 rounded-lg transition-colors text-gray-600 flex-shrink-0">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content scrolleable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1.5 sm:mb-2">Códigos de Descuento Disponibles</label>
          <div className="max-h-48 sm:max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {availableDiscounts && availableDiscounts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {availableDiscounts.map((discount) => (
                  <div key={discount.id} className="p-2 sm:p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-mono font-semibold text-teal-700 bg-teal-50 inline-block px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-xs">{discount.code}</div>
                        <div className="text-green-600 font-bold text-[10px] sm:text-sm mt-0.5">-{discount.discountPercentage}%</div>
                        <div className="text-[8px] sm:text-[10px] text-gray-500 mt-0.5">
                          Válido: {format(discount.startDate, 'dd/MM')} - {format(discount.endDate, 'dd/MM/yyyy')}
                        </div>
                      </div>
                      <Button
                        onClick={() => onAssign(discount.id)}
                        disabled={isPending}
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 text-[9px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 flex-shrink-0"
                      >
                        Asignar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 sm:p-6 text-center text-gray-500">
                <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">🎫</div>
                <p className="text-[10px] sm:text-sm">No hay códigos de descuento disponibles para asignar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center p-3 sm:p-4 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 sm:px-8 py-2 sm:py-2.5 text-[10px] sm:text-sm font-medium"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
