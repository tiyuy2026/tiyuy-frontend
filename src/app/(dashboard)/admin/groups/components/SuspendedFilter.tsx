'use client';

import { SuspendedFilter as SuspendedFilterType } from '../types';

interface SuspendedFilterProps {
  suspendedFilter: SuspendedFilterType;
  setSuspendedFilter: (filter: SuspendedFilterType) => void;
}

export function SuspendedFilter({ suspendedFilter, setSuspendedFilter }: SuspendedFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-red-50 rounded-lg w-fit mb-4">
      <button
        onClick={() => setSuspendedFilter('all')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
          suspendedFilter === 'all'
            ? 'bg-white text-red-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Todos
      </button>
      <button
        onClick={() => setSuspendedFilter('groups')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
          suspendedFilter === 'groups'
            ? 'bg-white text-red-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Solo Grupos
      </button>
      <button
        onClick={() => setSuspendedFilter('channels')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
          suspendedFilter === 'channels'
            ? 'bg-white text-red-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Solo Canales
      </button>
    </div>
  );
}
