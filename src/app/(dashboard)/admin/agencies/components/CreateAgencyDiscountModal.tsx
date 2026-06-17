import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { InmobiliariaWithStats } from '@/core/domain/entities/Admin';
import { X } from 'lucide-react';

interface NewDiscount {
  code: string;
  discountPercentage: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
}

interface CreateAgencyDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgency: InmobiliariaWithStats | null;
  newDiscount: NewDiscount;
  setNewDiscount: (discount: NewDiscount) => void;
  onCreate: () => void;
  isPending: boolean;
}

export default function CreateAgencyDiscountModal({
  isOpen,
  onClose,
  selectedAgency,
  newDiscount,
  setNewDiscount,
  onCreate,
  isPending
}: CreateAgencyDiscountModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">
                Crear Código de Descuento
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Para: {selectedAgency?.name} (RUC: {selectedAgency?.ruc})
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Código de Descuento</label>
            <input
              type="text"
              value={newDiscount.code}
              onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
              placeholder="Ej: INMO20OFF"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">Este código será único para esta inmobiliaria</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Porcentaje de Descuento (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                value={newDiscount.discountPercentage}
                onChange={(e) => setNewDiscount({ ...newDiscount, discountPercentage: e.target.value })}
                placeholder="Ej: 20"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 pr-12"
              />
              <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Si el plan cuesta S/100, con 20% de descuento costará S/80</p>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={newDiscount.startDate}
                onChange={(e) => setNewDiscount({ ...newDiscount, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={newDiscount.endDate}
                onChange={(e) => setNewDiscount({ ...newDiscount, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Límite de Usos (opcional)</label>
            <input
              type="number"
              min="1"
              value={newDiscount.usageLimit}
              onChange={(e) => setNewDiscount({ ...newDiscount, usageLimit: e.target.value })}
              placeholder="Dejar vacío para ilimitado"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">Cuántas veces puede usar este código la inmobiliaria</p>
          </div>
        </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            disabled={isPending}
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium"
          >
            {isPending ? 'Creando...' : 'Crear Descuento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
