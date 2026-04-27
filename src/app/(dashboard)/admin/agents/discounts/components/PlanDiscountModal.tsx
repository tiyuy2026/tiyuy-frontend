import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { AgentListItem } from '@/core/domain/entities/Admin';

interface PlanDiscountData {
  discountPercentage: string;
  customPrice: string;
  startDate: string;
  endDate: string;
}

interface SelectedPlan {
  code: string;
  name: string;
  price: string;
  color: string;
}

interface PlanDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgent: AgentListItem | null;
  selectedPlan: SelectedPlan | null;
  planDiscount: PlanDiscountData;
  setPlanDiscount: (data: PlanDiscountData) => void;
  onCreate: () => Promise<void>;
  isPending: boolean;
}

export default function PlanDiscountModal({
  isOpen,
  onClose,
  selectedAgent,
  selectedPlan,
  planDiscount,
  setPlanDiscount,
  onCreate,
  isPending
}: PlanDiscountModalProps) {
  if (!selectedPlan) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-xl w-full">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">Aplicar Descuento a Plan</h3>
        <p className="text-sm text-gray-600 mb-4">
          Para: <span className="font-semibold text-teal-600">{selectedAgent?.firstName} {selectedAgent?.lastName}</span>
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-center gap-4">
          <div className={`w-16 h-16 ${selectedPlan.color} rounded-lg flex items-center justify-center text-white text-2xl font-bold`}>
            {selectedPlan.code[0]}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{selectedPlan.name}</h4>
            <p className="text-2xl font-bold text-gray-900">{selectedPlan.price}</p>
            <p className="text-sm text-gray-500">Precio original del plan</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Porcentaje de Descuento (%)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={planDiscount.discountPercentage}
                onChange={(e) => {
                  const newDiscountPercentage = e.target.value;
                  const originalPrice = parseInt(selectedPlan.price.replace('S/', ''));
                  const discount = parseFloat(newDiscountPercentage) || 0;
                  const discountedPrice = originalPrice * (1 - discount / 100);
                  setPlanDiscount({
                    ...planDiscount,
                    discountPercentage: newDiscountPercentage,
                    customPrice: discountedPrice > 0 ? discountedPrice.toFixed(2) : ''
                  });
                }}
                placeholder="Ej: 20"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
              />
              <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
            </div>
          </div>

          {planDiscount.discountPercentage && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Precio con descuento:</p>
              <p className="text-2xl font-bold text-green-600">
                S/{planDiscount.customPrice}
              </p>
              <p className="text-xs text-gray-500">
                Ahorro: S/{(parseInt(selectedPlan.price.replace('S/', '')) - (planDiscount.customPrice ? parseFloat(planDiscount.customPrice) : 0)).toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duracion del Descuento</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: '12 horas', hours: 12 },
                { label: '24 horas', hours: 24 },
                { label: '3 dias', hours: 72 },
                { label: '7 dias', hours: 168 },
                { label: '30 dias', hours: 720 }
              ].map((option) => (
                <button
                  key={option.hours}
                  type="button"
                  onClick={() => {
                    const start = new Date();
                    const end = new Date(start.getTime() + option.hours * 60 * 60 * 1000);
                    setPlanDiscount({
                      ...planDiscount,
                      startDate: start.toISOString().split('T')[0],
                      endDate: end.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-teal-50 hover:border-teal-500 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              El descuento solo sera valido durante este periodo. Despues el agente paga precio normal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="datetime-local"
                value={planDiscount.startDate ? new Date(planDiscount.startDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setPlanDiscount({ ...planDiscount, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="datetime-local"
                value={planDiscount.endDate ? new Date(planDiscount.endDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setPlanDiscount({ ...planDiscount, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            disabled={isPending || !planDiscount.discountPercentage}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? 'Aplicando...' : 'Aplicar Descuento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
