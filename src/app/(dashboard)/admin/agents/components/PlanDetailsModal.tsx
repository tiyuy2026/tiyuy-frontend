import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';

interface PlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planDistribution?: {
    labels: string[];
    values: number[];
    total: number;
  };
}

export default function PlanDetailsModal({ isOpen, onClose, planDistribution }: PlanDetailsModalProps) {
  const planNames: Record<string, string> = {
    'ENTERPRISE': 'Empresarial',
    'PRO': 'Pro',
    'BASIC': 'Básico',
    'FREE': 'Gratis'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de Monetización por Plan"
      size="lg"
    >
      <div className="space-y-4">
        {(planDistribution?.labels || []).map((label: string, index: number) => {
          const count = planDistribution?.values[index] || 0;
          const total = planDistribution?.total || 1;
          const percentage = ((count / total) * 100).toFixed(1);
          const colors = ['#0d9488', '#f59e0b', '#9ca3af'];

          return (
            <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[index] || '#9ca3af' }}></span>
                <div>
                  <p className="font-medium text-gray-900">{planNames[label] || label}</p>
                  <p className="text-xs text-gray-500">{count} agentes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{percentage}%</p>
                <p className="text-xs text-gray-500">del total</p>
              </div>
            </div>
          );
        })}

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total de Agentes</span>
            <span className="text-xl font-bold text-gray-900">{planDistribution?.total || 0}</span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
