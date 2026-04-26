import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { AgentListItem } from '@/core/domain/entities/Admin';

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
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">Crear Descuento Personalizado</h3>
        <p className="text-sm text-gray-600 mb-4">
          Para: <span className="font-semibold text-teal-600">{selectedAgent?.firstName} {selectedAgent?.lastName}</span>
          <span className="text-gray-500 ml-2">(ID: {selectedAgent?.id})</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Codigo de Descuento</label>
            <input
              type="text"
              value={newDiscount.code}
              onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
              placeholder="Ej: AGENTE20OFF"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">Este codigo sera unico para este agente</p>
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
            <p className="text-xs text-gray-500 mt-1">Si el plan cuesta S/100, con 20% de descuento costara S/80</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Limite de Usos (opcional)</label>
            <input
              type="number"
              min="1"
              value={newDiscount.usageLimit}
              onChange={(e) => setNewDiscount({ ...newDiscount, usageLimit: e.target.value })}
              placeholder="Dejar vacio para ilimitado"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">Cuantas veces puede usar este codigo el agente</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            disabled={isPending}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isPending ? 'Creando...' : 'Crear Descuento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
