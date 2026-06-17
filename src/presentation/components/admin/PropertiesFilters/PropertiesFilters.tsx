/**
 * Properties Filters Component
 * Sección de filtros con buscador y dropdowns personalizados
 */

import { Search, X } from 'lucide-react';
import { CustomDropdown } from '../CustomDropdown/CustomDropdown';

interface PropertiesFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

const statusOptions = [
  { value: 'all', label: 'Todos los Estados' },
  { value: 'PUBLISHED', label: 'Publicada' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PAUSED', label: 'Pausada' },
  { value: 'REJECTED', label: 'Rechazada' },
  { value: 'RENTED', label: 'Alquilada' },
  { value: 'SOLD', label: 'Vendida' },
  { value: 'EXPIRED', label: 'Expirada' },
  { value: 'SUSPENDED', label: 'Suspendida' },
  { value: 'DISABLED_BY_ADMIN', label: 'Deshabilitada por Admin' },
];

export function PropertiesFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClear,
}: PropertiesFiltersProps) {
  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex flex-col lg:flex-row gap-3 items-center">
        {/* Buscador elegante */}
        <div className="flex-1 w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por título, propietario o ubicación..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <CustomDropdown
            value={statusFilter}
            onChange={onStatusChange}
            options={statusOptions}
            placeholder="Todos los Estados"
            minWidth="180px"
          />
        </div>

        {(searchQuery || statusFilter !== 'all') && (
          <button
            onClick={onClear}
            className="px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-1 text-sm"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
