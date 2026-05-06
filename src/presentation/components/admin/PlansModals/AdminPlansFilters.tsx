'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/presentation/components/ui/Button';

interface AdminPlansFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onClear: () => void;
  placeholder: string;
  options: { value: string; label: string }[];
}

export const AdminPlansFilters: React.FC<AdminPlansFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onClear,
  placeholder,
  options
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClear}
          className="rounded-xl border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          Limpiar
        </Button>
      </div>
    </div>
  );
};
