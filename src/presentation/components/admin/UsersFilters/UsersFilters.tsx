/**
 * Users Filters Component
 * Sección de filtros con buscador y dropdowns personalizados
 */

import { CustomDropdown } from '../CustomDropdown/CustomDropdown';

interface UsersFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  onClear: () => void;
}

const statusOptions = [
  { value: 'all', label: 'Todos los Estados' },
  { value: 'enabled', label: 'Activo' },
  { value: 'disabled', label: 'Desactivado' },
];

const roleOptions = [
  { value: '', label: 'Todos los Roles' },
  { value: 'USER', label: 'Usuario' },
  { value: 'AGENT', label: 'Agente' },
  { value: 'DEVELOPER', label: 'Desarrollador' },
  { value: 'ADMIN', label: 'Admin' },
];

export function UsersFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange,
  onClear,
}: UsersFiltersProps) {
  return (
    <div className="p-4 border-b border-gray-100">
      <div className="flex flex-col lg:flex-row gap-3 items-center">
        {/* Buscador */}
        <div className="flex-1 w-full">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por email, nombre o DNI..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-sm"
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
            minWidth="160px"
          />
          <CustomDropdown
            value={roleFilter}
            onChange={onRoleChange}
            options={roleOptions}
            placeholder="Todos los Roles"
            minWidth="160px"
          />
        </div>

        {(searchQuery || statusFilter !== 'all' || roleFilter) && (
          <button
            onClick={onClear}
            className="px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-1 text-sm"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
