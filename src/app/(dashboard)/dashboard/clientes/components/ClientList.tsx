'use client';

import { CRMClient, ClientFilter, SortBy } from '@/core/domain/entities/CRM';
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  MessageSquare,
  Users,
  Calendar,
  TrendingUp,
  ChevronRight,
  Mail,
  Phone
} from 'lucide-react';
import { useState } from 'react';

interface ClientListProps {
  clients: CRMClient[];
  filterClients: (filter: ClientFilter, sortBy: SortBy, searchTerm: string) => CRMClient[];
  selectedClientId?: number;
  onClientSelect: (client: CRMClient) => void;
}

const FILTER_OPTIONS: { value: ClientFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos los Clientes' },
  { value: 'ACTIVE', label: 'Clientes Activos' },
  { value: 'HIGH_INTEREST', label: 'Alto Interés' },
  { value: 'MEDIUM_INTEREST', label: 'Interés Medio' },
  { value: 'LOW_INTEREST', label: 'Bajo Interés' },
  { value: 'AT_RISK', label: 'En Riesgo' },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'INTERACTION_SCORE', label: 'Score de Interacción' },
  { value: 'LAST_ACTIVITY', label: 'Última Actividad' },
  { value: 'MESSAGES', label: 'Total Mensajes' },
  { value: 'ENGAGEMENT', label: 'Tasa de Engagement' },
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
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Alto Interés</span>;
      case 'MEDIUM':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Interés Medio</span>;
      case 'LOW':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Bajo Interés</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">Sin Interés</span>;
    }
  };

  const getActivityStatus = (days: number) => {
    if (days <= 1) return { label: 'Hoy', color: 'text-green-600 bg-green-50' };
    if (days <= 7) return { label: 'Esta semana', color: 'text-blue-600 bg-blue-50' };
    if (days <= 14) return { label: `Hace ${days} días`, color: 'text-yellow-600 bg-yellow-50' };
    return { label: `Hace ${days} días`, color: 'text-red-600 bg-red-50' };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Clientes ({filteredClients.length})
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 space-y-3 pt-4 border-t">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Filtrar por</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ClientFilter)}
                className="w-full mt-1 p-2 border rounded-lg text-sm"
              >
                {FILTER_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full mt-1 p-2 border rounded-lg text-sm"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron clientes</p>
            <p className="text-sm text-gray-400 mt-1">Intenta con otros filtros</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredClients.map(client => {
              const activityStatus = getActivityStatus(client.daysSinceLastActivity);
              const isSelected = selectedClientId === client.id;

              return (
                <div
                  key={client.id}
                  onClick={() => onClientSelect(client)}
                  className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 
                      flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name and Score */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">{client.name}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-blue-600">{client.interactionScore}</span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className={`px-2 py-0.5 rounded ${activityStatus.color}`}>
                          {activityStatus.label}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <MessageSquare className="w-3 h-3" />
                          {client.messageActivity.totalMessages}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Users className="w-3 h-3" />
                          {client.groupActivity.groupsJoined}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {client.channelActivity.eventsAttended}
                        </span>
                      </div>

                      {/* Interest Badge */}
                      <div className="mt-2">
                        {getInterestBadge(client.messageActivity.interestLevel)}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
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
