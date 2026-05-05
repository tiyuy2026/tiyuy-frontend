'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
    <div className="flex items-center gap-4 mb-8 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
      {/* Search */}
      <div className="flex-1 min-w-[280px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar inmobiliaria por nombre o RUC..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Status Filter */}
      <CustomDropdown
        value={statusFilter || ''}
        options={statusOptions}
        onChange={(value) => onStatusChange(value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | undefined)}
        placeholder="Todos los estados"
        minWidth="140px"
      />

      {/* Plan Filter */}
      <CustomDropdown
        value={planFilter}
        options={planOptions}
        onChange={onPlanChange}
        placeholder="Todos los planes"
        minWidth="140px"
      />

      {/* Discount Filter */}
      <CustomDropdown
        value={discountFilter}
        options={discountOptions}
        onChange={onDiscountChange}
        placeholder="Todos los descuentos"
        minWidth="160px"
      />

      {/* Sort */}
      <CustomDropdown
        value={sortBy}
        options={sortOptions}
        onChange={onSortChange}
        placeholder="Nombre"
        minWidth="120px"
      />
    </div>
  );
}
