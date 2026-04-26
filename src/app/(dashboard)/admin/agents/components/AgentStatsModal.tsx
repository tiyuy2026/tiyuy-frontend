import { AgentListItem } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';

interface AgentStatsModalProps {
  agent: AgentListItem;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
}

export default function AgentStatsModal({ agent, isOpen, onClose, onViewDetails }: AgentStatsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Estadísticas de ${agent.firstName || ''} ${agent.lastName || ''}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Ingresos Semana</p>
            <p className="text-xl font-bold text-blue-600">${(agent.weekRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Ingresos Mes</p>
            <p className="text-xl font-bold text-green-600">${(agent.monthRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Ingresos Año</p>
            <p className="text-xl font-bold text-purple-600">${(agent.yearRevenue || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Tasa de Conversión</span>
            <span className="text-lg font-bold text-teal-600">{(agent.conversionRate || 0).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min(agent.conversionRate || 0, 100)}%` }}></div>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
          <span className="text-sm text-gray-700">Propiedades Publicadas</span>
          <span className="text-xl font-bold text-yellow-600">{agent.propertiesCount || 0}</span>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button onClick={onViewDetails}>Ver Detalle Completo</Button>
        </div>
      </div>
    </Modal>
  );
}
