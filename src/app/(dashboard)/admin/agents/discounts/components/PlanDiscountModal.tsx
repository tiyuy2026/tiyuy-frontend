import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { AgentListItem } from '@/core/domain/entities/Admin';
import { X } from 'lucide-react';

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
      <div className="bg-white rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header verde */}
        <div className="bg-[#00E676] px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-green-800 font-bold text-lg">P</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Descuento por Plan</h3>
                <p className="text-xs text-green-700">
                  Para: {selectedAgent?.firstName} {selectedAgent?.lastName}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-green-300 rounded-lg transition-colors text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Plan info */}
          <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
            <div className={`w-12 h-12 ${selectedPlan.color} rounded-lg flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
              {selectedPlan.code[0]}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{selectedPlan.name}</h4>
              <p className="text-lg font-bold text-gray-900">{selectedPlan.price}</p>
              <p className="text-[10px] text-gray-500">Precio original del plan</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Porcentaje de Descuento (%)</label>
            <div className="relative">
              <input
                type="number" min="1" max="100"
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
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-sm">%</span>
            </div>
          </div>

          {planDiscount.discountPercentage && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Precio con descuento:</p>
              <p className="text-lg font-bold text-green-600">S/{planDiscount.customPrice}</p>
              <p className="text-[10px] text-gray-500">
                Ahorro: S/{(parseInt(selectedPlan.price.replace('S/', '')) - (planDiscount.customPrice ? parseFloat(planDiscount.customPrice) : 0)).toFixed(2)}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Duración del Descuento</label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: '12h', hours: 12 },
                { label: '24h', hours: 24 },
                { label: '3d', hours: 72 },
                { label: '7d', hours: 168 },
                { label: '30d', hours: 720 }
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
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-teal-50 hover:border-teal-500 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500">El descuento solo será válido durante este periodo</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Fecha Inicio</label>
              <input
                type="datetime-local"
                value={planDiscount.startDate ? new Date(planDiscount.startDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setPlanDiscount({ ...planDiscount, startDate: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Fecha Fin</label>
              <input
                type="datetime-local"
                value={planDiscount.endDate ? new Date(planDiscount.endDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setPlanDiscount({ ...planDiscount, endDate: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium">
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            disabled={isPending || !planDiscount.discountPercentage}
            className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg text-sm font-medium shadow-lg shadow-teal-500/30"
          >
            {isPending ? 'Aplicando...' : 'Aplicar Descuento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
