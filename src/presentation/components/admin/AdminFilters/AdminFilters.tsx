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
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClear}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Additional Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {filters.map((filter) => (
            <div key={filter.key} className="min-w-48">
              {filter.type === 'select' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <select
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All {filter.label}</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <select
                    multiple
                    value={filterValues[filter.key] || []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      handleFilterChange(filter.key, values);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <input
                    type="date"
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {filter.type === 'daterange' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      placeholder="From"
                      value={filterValues[filter.key]?.from || ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...filterValues[filter.key],
                        from: e.target.value
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      placeholder="To"
                      value={filterValues[filter.key]?.to || ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...filterValues[filter.key],
                        to: e.target.value
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
