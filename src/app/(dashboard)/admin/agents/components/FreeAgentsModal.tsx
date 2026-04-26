import { useState } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';

interface FreeAgentItem {
  agentId: number;
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
  potentialRevenue: number;
  createdAt: string;
}

interface FreeAgentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  freeAgentList?: FreeAgentItem[];
  lostPotentialRevenue?: number;
  freeAgentsCount?: number;
}

export default function FreeAgentsModal({
  isOpen,
  onClose,
  freeAgentList,
  lostPotentialRevenue,
  freeAgentsCount
}: FreeAgentsModalProps) {
  const [freeAgentsPage, setFreeAgentsPage] = useState(1);
  const [freeAgentsDateRange, setFreeAgentsDateRange] = useState<{ start?: Date; end?: Date }>({});

  const filteredAgents = (freeAgentList || []).filter((agent) => {
    if (!freeAgentsDateRange.start && !freeAgentsDateRange.end) return true;
    const agentDate = new Date(agent.createdAt);
    if (freeAgentsDateRange.start && agentDate < freeAgentsDateRange.start) return false;
    if (freeAgentsDateRange.end && agentDate > freeAgentsDateRange.end) return false;
    return true;
  });

  const filteredCount = filteredAgents.length;
  const totalPages = Math.ceil(filteredCount / 5);
  const paginatedAgents = filteredAgents.slice((freeAgentsPage - 1) * 5, freeAgentsPage * 5);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agentes Free - Potencial Perdido"
      size="lg"
    >
      <div className="space-y-4">
        {/* Date Filter */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Filtrar por fecha:</span>
          <input
            type="date"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            onChange={(e) => setFreeAgentsDateRange((prev: any) => ({ ...prev, start: e.target.value ? new Date(e.target.value) : undefined }))}
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            onChange={(e) => setFreeAgentsDateRange((prev: any) => ({ ...prev, end: e.target.value ? new Date(e.target.value) : undefined }))}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setFreeAgentsDateRange({}); setFreeAgentsPage(1); }}
          >
            Limpiar
          </Button>
        </div>

        {/* Free Agents List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {paginatedAgents.map((agent) => (
            <div key={agent.agentId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                  {agent.initials}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{agent.firstName} {agent.lastName}</p>
                  <p className="text-xs text-gray-500">{agent.email}</p>
                  <p className="text-xs text-gray-400">Sin plan activo</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${agent.potentialRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">potencial</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-gray-500">
              Mostrando {Math.min((freeAgentsPage - 1) * 5 + 1, filteredCount)} - {Math.min(freeAgentsPage * 5, filteredCount)} de {filteredCount}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFreeAgentsPage((prev: number) => Math.max(1, prev - 1))}
                disabled={freeAgentsPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {freeAgentsPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFreeAgentsPage((prev: number) => Math.min(totalPages, prev + 1))}
                disabled={freeAgentsPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Potencial Total Perdido</span>
            <span className="text-xl font-bold text-gray-900">
              ${(lostPotentialRevenue || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
