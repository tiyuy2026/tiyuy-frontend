/**
 * Projects Filters Component
 * Filter bar with search, dropdowns, and price slider matching screenshot
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, SlidersHorizontal, Download } from 'lucide-react';

interface ProjectsFiltersProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  onLifecycleChange?: (value: string) => void;
  onTypeChange?: (value: string) => void;
  onLocationChange?: (value: string) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  onUnitsChange?: (value: string) => void;
  onMoreFiltersClick?: () => void;
  onClearFilters?: () => void;
  onExport?: () => void;
}

// Custom Dropdown Component con diseño corporativo
interface DropdownOption {
  value: string;
  label: string;
}

function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar',
  width = 'w-full',
}: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div ref={dropdownRef} className={`relative ${width}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[38px] px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors overflow-hidden"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} flex-shrink-0`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-all hover:bg-gradient-to-r hover:from-blue-500 hover:to-teal-500 hover:text-white ${
                  value === option.value
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium'
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectsFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onLifecycleChange,
  onTypeChange,
  onLocationChange,
  onPriceRangeChange,
  onUnitsChange,
  onMoreFiltersClick,
  onClearFilters,
  onExport,
}: ProjectsFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);

  const statusOptions: DropdownOption[] = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'PUBLISHED', label: 'Publicado' },
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'PAUSED', label: 'Pausado' },
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'SUSPENDED', label: 'Suspendido' },
  ];

  const lifecycleOptions: DropdownOption[] = [
    { value: '', label: 'Todos' },
    { value: 'PRE_SALE', label: 'Pre Venta' },
    { value: 'SALE', label: 'En Venta' },
    { value: 'CONSTRUCTION', label: 'En Construcción' },
    { value: 'COMPLETED', label: 'Completado' },
  ];

  const typeOptions: DropdownOption[] = [
    { value: '', label: 'Todos' },
    { value: 'RESIDENTIAL', label: 'Residencial' },
    { value: 'COMMERCIAL', label: 'Comercial' },
    { value: 'INDUSTRIAL', label: 'Industrial' },
    { value: 'MIXED', label: 'Mixto' },
  ];

  const locationOptions: DropdownOption[] = [
    { value: '', label: 'Todas' },
    { value: 'Lima', label: 'Lima' },
    { value: 'Arequipa', label: 'Arequipa' },
    { value: 'Trujillo', label: 'Trujillo' },
    { value: 'Cusco', label: 'Cusco' },
  ];

  const unitsOptions: DropdownOption[] = [
    { value: '', label: 'Todas' },
    { value: '1-10', label: '1 - 10' },
    { value: '11-50', label: '11 - 50' },
    { value: '51-100', label: '51 - 100' },
    { value: '100+', label: '100+' },
  ];

  const handlePriceChange = (value: number) => {
    const newRange: [number, number] = [0, value];
    setPriceRange(newRange);
    onPriceRangeChange?.(newRange);
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <>
      <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm">
        {/* Filtros en una sola línea con etiquetas */}
        <div className="flex items-stretch sm:items-center gap-2 sm:gap-4 flex-wrap pb-2">
        {/* Search Input */}
        <div className="flex-1 min-w-[120px] sm:min-w-[150px] max-w-full sm:max-w-[200px]">
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1 truncate" title="Buscar">Buscar</label>
          <div className="relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery || ''}
              className="w-full h-[34px] sm:h-[38px] pl-8 sm:pl-10 pr-2.5 sm:pr-3 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>

        {/* Estado Dropdown */}
        <div className="w-[calc(50%-0.5rem)] sm:w-[120px]">
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Estado</label>
          <CustomDropdown
            options={statusOptions}
            value={statusFilter || 'all'}
            onChange={(value) => onStatusChange?.(value)}
          />
        </div>

        {/* Ciclo de Vida Dropdown */}
        <div className="w-[calc(50%-0.5rem)] sm:w-[120px]">
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Ciclo</label>
          <CustomDropdown
            options={lifecycleOptions}
            value=""
            onChange={(value) => onLifecycleChange?.(value)}
          />
        </div>

        {/* Tipo Dropdown */}
        <div className="w-[calc(50%-0.5rem)] sm:w-[120px]">
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <CustomDropdown
            options={typeOptions}
            value=""
            onChange={(value) => onTypeChange?.(value)}
          />
        </div>

        {/* Ubicacion Dropdown */}
        <div className="w-[calc(50%-0.5rem)] sm:w-[120px]">
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Ubicación</label>
          <CustomDropdown
            options={locationOptions}
            value=""
            onChange={(value) => onLocationChange?.(value)}
          />
        </div>

        {/* Price Range Slider */}
        <div className="w-full sm:w-[180px] flex-shrink-0">
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Precio</label>
          <div className="flex items-center gap-2 h-[34px] sm:h-[38px]">
            <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">{formatPrice(priceRange[1])}+</span>
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Unidades Dropdown */}
        <div className="w-full sm:w-[150px] flex-shrink-0">
          <label className="block text-[10px] sm:text-xs font-medium text-gray-500 mb-1">Unidades</label>
          <CustomDropdown
            options={unitsOptions}
            value=""
            onChange={(value) => onUnitsChange?.(value)}
          />
        </div>

      </div>
    </div>
    </>
  );
}
