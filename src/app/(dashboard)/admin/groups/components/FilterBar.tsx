'use client';

import { Input } from '@/presentation/components/ui/Input';
import { ViewType, ViewMode, StatusFilter, SortBy } from '../types';
import { ChevronDown, Grid, Grid3X3, List, Menu, Search, X } from 'lucide-react';;

interface FilterBarProps {
  viewType: ViewType;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  sortBy: SortBy;
  setSortBy: (value: SortBy) => void;
  viewMode: ViewMode;
  setViewMode: (value: ViewMode) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
}

export function FilterBar({
  viewType,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  cityFilter,
  setCityFilter,
}: FilterBarProps) {
  const hasActiveFilters = statusFilter !== 'all' || cityFilter || searchQuery;

  const clearAllFilters = () => {
    setStatusFilter('all');
    setCityFilter('');
    setSearchQuery('');
  };

  const getStatusLabel = (status: StatusFilter) => {
    switch (status) {
      case 'active': return 'Activos';
      case 'inactive': return 'Inactivos';
      case 'suspended': return 'Suspendidos';
      case 'violations': return 'Con Violaciones';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4 space-y-2 sm:space-y-4">
      {/* Row 1: Search, Status Filter, Sort, View Toggle */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[280px] w-full sm:w-auto">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-400" />
          <Input
            placeholder={viewType === 'groups' ? 'Buscar grupos...' : viewType === 'channels' ? 'Buscar canales...' : 'Buscar suspendidos...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-10 w-full text-xs sm:text-sm"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 pr-7 sm:pr-10 text-[10px] sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Estado: Todos</option>
            <option value="active">Estado: Activos</option>
            <option value="inactive">Estado: Inactivos</option>
            <option value="suspended">Estado: Suspendidos</option>
            <option value="violations">Estado: Con Violaciones</option>
          </select>
          <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 pr-7 sm:pr-10 text-[10px] sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="newest">Ordenar: Más recientes</option>
            <option value="oldest">Ordenar: Más antiguos</option>
            <option value="az">Ordenar: A-Z</option>
            <option value="za">Ordenar: Z-A</option>
            <option value="most_members">Ordenar: Más miembros</option>
            <option value="least_members">Ordenar: Menos miembros</option>
          </select>
          <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* View Toggle (Grid/List) */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 sm:p-2 rounded-md transition ${
              viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Vista de cuadrícula"
          >
            <Grid className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 sm:p-2 rounded-md transition ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Vista de lista"
          >
            <Menu className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Row 2: Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-100">
          <span className="text-[10px] sm:text-sm text-gray-500 font-medium">Filtros activos:</span>
          
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-green-50 text-green-700 text-[9px] sm:text-sm rounded-full border border-green-200">
              Estado: {getStatusLabel(statusFilter)}
              <button 
                onClick={() => setStatusFilter('all')}
                className="ml-0.5 sm:ml-1 hover:text-green-900"
              >
                <X className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
              </button>
            </span>
          )}
          
          {cityFilter && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-blue-50 text-blue-700 text-[9px] sm:text-sm rounded-full border border-blue-200">
              Ciudad: {cityFilter}
              <button 
                onClick={() => setCityFilter('')}
                className="ml-0.5 sm:ml-1 hover:text-blue-900"
              >
                <X className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
              </button>
            </span>
          )}
          
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-purple-50 text-purple-700 text-[9px] sm:text-sm rounded-full border border-purple-200">
              Búsqueda: {searchQuery}
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-0.5 sm:ml-1 hover:text-purple-900"
              >
                <X className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
              </button>
            </span>
          )}
          
          <button
            onClick={clearAllFilters}
            className="ml-1 sm:ml-2 px-1.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}
