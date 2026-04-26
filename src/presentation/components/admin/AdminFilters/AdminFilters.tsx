/**
 * Reusable Admin Filters Component
 * Common filter patterns for admin interfaces
 */

'use client';

import { useState } from 'react';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';

interface FilterOption {
  value: string;
  label: string;
}

interface AdminFiltersProps {
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: Record<string, any>) => void;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    type: 'select' | 'multiselect' | 'date' | 'daterange';
    options?: FilterOption[];
    value?: any;
  }[];
  onClear?: () => void;
}

export function AdminFilters({
  onSearchChange,
  onFilterChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onClear
}: AdminFiltersProps) {
  const [searchValue, setSearchValue] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange(value);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setSearchValue('');
    setFilterValues({});
    onSearchChange('');
    onFilterChange({});
    onClear?.();
  };

  const hasActiveFilters = searchValue || Object.values(filterValues).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      {/* Search Input */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClear} className="px-6 py-3 rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar Filtros
          </Button>
        )}
      </div>

      {/* Additional Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-gray-100">
          {filters.map((filter) => (
            <div key={filter.key} className="min-w-48">
              {filter.type === 'select' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {filter.label}
                  </label>
                  <select
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">Todos los {filter.label}</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {filter.type === 'multiselect' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {filter.label}
                  </label>
                  <select
                    multiple
                    value={filterValues[filter.key] || []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      handleFilterChange(filter.key, values);
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
                  >
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {filter.type === 'date' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {filter.label}
                  </label>
                  <input
                    type="date"
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
              )}

              {filter.type === 'daterange' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {filter.label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      placeholder="Desde"
                      value={filterValues[filter.key]?.from || ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...filterValues[filter.key],
                        from: e.target.value
                      })}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
                    />
                    <input
                      type="date"
                      placeholder="Hasta"
                      value={filterValues[filter.key]?.to || ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...filterValues[filter.key],
                        to: e.target.value
                      })}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
