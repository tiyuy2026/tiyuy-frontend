'use client';

import { CRMClient, ClientFilter, SortBy } from '@/core/domain/entities/CRM';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';
import { 
  Search, 
  Filter, 
  MessageSquare,
  Users,
  Calendar,
  TrendingUp,
  ChevronRight,
  Mail,
  Phone,
  X
} from 'lucide-react';
import { useState } from 'react';

interface ClientListProps {
  clients: CRMClient[];
  filterClients: (filter: ClientFilter, sortBy: SortBy, searchTerm: string) => CRMClient[];
  selectedClientId?: number;
  onClientSelect: (client: CRMClient) => void;
}

const FILTER_OPTIONS: { value: ClientFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'HIGH_INTEREST', label: 'Alto Interés' },
  { value: 'MEDIUM_INTEREST', label: 'Interés Medio' },
  { value: 'LOW_INTEREST', label: 'Bajo Interés' },
  { value: 'AT_RISK', label: 'En Riesgo' },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'INTERACTION_SCORE', label: 'Score' },
  { value: 'LAST_ACTIVITY', label: 'Última Actividad' },
  { value: 'MESSAGES', label: 'Mensajes' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
  { value: 'NAME', label: 'Nombre' },
];

export function ClientList({ clients, filterClients, selectedClientId, onClientSelect }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<ClientFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('INTERACTION_SCORE');
  const [showFilters, setShowFilters] = useState(false);

  const filteredClients = filterClients(filter, sortBy, searchTerm);

  const getInterestBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">Alto</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[10px] font-medium">Medio</span>;
      case 'LOW':
        return <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">Bajo</span>;
      default:
        return <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded text-[10px] font-medium">Ninguno</span>;
    }
  };

  const getActivityStatus = (days: number) => {
    if (days <= 1) return { label: 'Hoy', color: 'text-green-600 bg-green-50' };
    if (days <= 7) return { label: 'Esta semana', color: 'text-blue-600 bg-blue-50' };
    if (days <= 14) return { label: `Hace ${days} días`, color: 'text-yellow-600 bg-yellow-50' };
    return { label: `Hace ${days} días`, color: 'text-red-600 bg-red-50' };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Clientes <span className="text-gray-400 font-normal">({filteredClients.length})</span>
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ClientFilter)}
                className="flex-1 p-1.5 border border-gray-200 rounded-lg text-xs"
              >
                {FILTER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="flex-1 p-1.5 border border-gray-200 rounded-lg text-xs"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredClients.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No se encontraron clientes</p>
            <p className="text-xs text-gray-400 mt-0.5">Intenta con otros filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
              {filteredClients.map(client => {
              const activityStatus = getActivityStatus(client.daysSinceLastActivity);
              const isSelected = selectedClientId === client.id;
              const displayName = client.name && client.name !== 'Sin nombre' && client.name.length > 2 
                ? client.name 
                : (client.email || client.phone || `Cliente #${client.id}`);

              return (
                <div
                  key={client.id}
                  onClick={() => onClientSelect(client)}
                  className={`p-3 cursor-pointer transition-all hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <UserAvatar 
                      user={{ firstName: displayName, lastName: '' }} 
                      size="sm" 
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{displayName}</h3>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs font-semibold text-blue-600">{client.interactionScore}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        {client.email && (
                          <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                            <Mail className="w-3 h-3 shrink-0" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            {client.phone}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${activityStatus.color}`}>
                          {activityStatus.label}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <MessageSquare className="w-3 h-3" />
                          {client.messageActivity.totalMessages}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <Users className="w-3 h-3" />
                          {client.groupActivity.groupsJoined}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {client.channelActivity.eventsAttended}
                        </span>
                      </div>

                      <div className="mt-1">
                        {getInterestBadge(client.messageActivity.interestLevel)}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}