'use client';

import { Eye, MoreVertical, MessageSquare } from 'lucide-react';
import { InmobiliariaWithStats } from '@/core/domain/entities/Admin';

interface AgenciesTableProps {
  agencies: InmobiliariaWithStats[];
  onSelectAgency: (agency: InmobiliariaWithStats) => void;
  onNotifyAgency?: (agency: InmobiliariaWithStats) => void;
  selectedAgencyId?: number;
  recentlyUpdatedAgencyId?: number | null;
}

export default function AgenciesTable({ agencies, onSelectAgency, onNotifyAgency, selectedAgencyId, recentlyUpdatedAgencyId }: AgenciesTableProps) {
  const getStatusBadgeClass = (status?: string, enabled?: boolean) => {
    if (enabled === false) return 'bg-gray-100 text-gray-800';
    if (status === 'ACTIVE') return 'bg-emerald-100 text-emerald-800';
    if (status === 'SUSPENDED') return 'bg-yellow-100 text-yellow-800';
    if (status === 'BLOCKED') return 'bg-rose-100 text-rose-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Inmobiliaria</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Gerente</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Contacto</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Ciudad</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Proyectos</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Agentes</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Estado</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Última actividad</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((agency) => (
              <tr
                key={agency.id}
                onClick={() => onSelectAgency(agency)}
                className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                  selectedAgencyId === agency.id ? 'bg-blue-50' : ''
                } ${
                  recentlyUpdatedAgencyId === agency.id
                    ? 'ring-2 ring-emerald-400 ring-inset bg-emerald-50 animate-pulse'
                    : ''
                }`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold text-sm">
                      {agency.name?.[0] || 'I'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{agency.name}</p>
                      <p className="text-xs text-gray-500">RUC: {agency.ruc || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {agency.managerName || '-'}
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <p className="text-gray-900">{agency.email || '-'}</p>
                    <p className="text-xs text-gray-500">{agency.phone || '-'}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">
                  {agency.city || '-'}
                </td>
                <td className="py-4 px-4 text-sm text-gray-900">
                  <span className="font-medium">{agency.totalProjects || 0}</span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-900">
                  <span className="font-medium">{agency.totalAgents || 0}</span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      agency.status,
                      agency.enabled
                    )}`}
                  >
                    {agency.enabled === false ? 'INACTIVO' : agency.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {(agency as any).lastActivity || (agency as any).lastLoginAt || (agency as any).updatedAt || (agency as any).createdAt
                    ? new Date((agency as any).lastActivity || (agency as any).lastLoginAt || (agency as any).updatedAt || (agency as any).createdAt).toLocaleDateString()
                    : 'Sin actividad'}
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAgency(agency);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNotifyAgency?.(agency);
                      }}
                      className="p-1.5 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition"
                      title="Notificar inmobiliaria"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAgency(agency);
                      }}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Más opciones"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {agencies.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron inmobiliarias
          </div>
        )}
      </div>
    </div>
  );
}
