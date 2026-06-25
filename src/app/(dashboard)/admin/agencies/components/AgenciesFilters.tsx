'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface AgenciesFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | undefined;
  onStatusChange: (value: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | undefined) => void;
  planFilter: string;
  onPlanChange: (value: string) => void;
  discountFilter: string;
  onDiscountChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

interface DropdownOption {
  value: string;
  label: string;
}

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder,
  minWidth = '140px',
}: {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder: string;
  minWidth?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative" style={{ minWidth }}>
      {/* Botón personalizado - reemplaza el select nativo */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 sm:px-4 py-2 sm:py-3 pr-7 sm:pr-10 bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-sm text-left text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all hover:bg-gray-100"
      >
        <span className={`${value ? 'text-gray-900' : 'text-gray-400'} truncate block`}>
          {selectedLabel}
        </span>
      </button>
      <ChevronDown className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />

      {/* Menú desplegable personalizado */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-sm text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                value === option.value ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check className="w-4 h-4 text-teal-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AgenciesFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  planFilter,
  onPlanChange,
  discountFilter,
  onDiscountChange,
  sortBy,
  onSortChange,
}: AgenciesFiltersProps) {
  const statusOptions: DropdownOption[] = [
    { value: '', label: 'Todos los estados' },
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'INACTIVE', label: 'Inactivo' },
    { value: 'SUSPENDED', label: 'Suspendido' },
  ];

  const planOptions: DropdownOption[] = [
    { value: '', label: 'Todos los planes' },
    { value: 'BASIC', label: 'Básico' },
    { value: 'PROFESSIONAL', label: 'Profesional' },
    { value: 'ENTERPRISE', label: 'Empresarial' },
  ];

  const discountOptions: DropdownOption[] = [
    { value: '', label: 'Todos los descuentos' },
    { value: 'with_discount', label: 'Con descuento' },
    { value: 'without_discount', label: 'Sin descuento' },
  ];

  const sortOptions: DropdownOption[] = [
    { value: 'name', label: 'Nombre' },
    { value: 'agents', label: 'Agentes' },
    { value: 'revenue', label: 'Ingresos' },
    { value: 'activity', label: 'Actividad' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-8 bg-white border border-gray-100 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 shadow-sm">
      {/* Search */}
      <div className="flex-1 min-w-[200px] sm:min-w-[280px] w-full sm:w-auto">
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o RUC..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Status Filter */}
      <CustomDropdown
        value={statusFilter || ''}
        options={statusOptions}
        onChange={(value) => onStatusChange(value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | undefined)}
        placeholder="Todos los estados"
        minWidth="120px"
      />

      {/* Plan Filter */}
      <CustomDropdown
        value={planFilter}
        options={planOptions}
        onChange={onPlanChange}
        placeholder="Todos los planes"
        minWidth="120px"
      />

      {/* Discount Filter */}
      <CustomDropdown
        value={discountFilter}
        options={discountOptions}
        onChange={onDiscountChange}
        placeholder="Todos los descuentos"
        minWidth="130px"
      />

      {/* Sort */}
      <CustomDropdown
        value={sortBy}
        options={sortOptions}
        onChange={onSortChange}
        placeholder="Nombre"
        minWidth="100px"
      />
    </div>
  );
}
