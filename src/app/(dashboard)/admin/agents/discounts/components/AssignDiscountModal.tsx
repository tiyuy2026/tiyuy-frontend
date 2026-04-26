import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { format } from 'date-fns';
import { AgentListItem, DiscountCode } from '@/core/domain/entities/Admin';

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
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">Asignar Descuento Existente</h3>
        <p className="text-gray-600 mb-4">
          Para: <span className="font-semibold text-teal-600">{selectedAgent?.firstName} {selectedAgent?.lastName}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Codigos de Descuento Disponibles</label>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {availableDiscounts && availableDiscounts.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {availableDiscounts.map((discount) => (
                    <div key={discount.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono font-semibold text-teal-700 bg-teal-50 inline-block px-2 py-1 rounded">{discount.code}</div>
                          <div className="text-green-600 font-bold mt-1">-{discount.discountPercentage}%</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Valido: {format(discount.startDate, 'dd/MM')} - {format(discount.endDate, 'dd/MM/yyyy')}
                          </div>
                        </div>
                        <Button
                          onClick={() => onAssign(discount.id)}
                          disabled={isPending}
                          size="sm"
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          Asignar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-2">🎫</div>
                  <p>No hay codigos de descuento disponibles para asignar.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
