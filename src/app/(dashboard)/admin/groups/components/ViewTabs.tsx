'use client';

import { ViewType } from '../types';

interface ViewTabsProps {
  viewType: ViewType;
  setViewType: (type: ViewType) => void;
}

export function ViewTabs({ viewType, setViewType }: ViewTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg w-fit">
      <button
        onClick={() => setViewType('groups')}
        className={`px-4 py-2 rounded-md font-medium transition ${
          viewType === 'groups'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Grupos Sociales
      </button>
      <button
        onClick={() => setViewType('channels')}
        className={`px-4 py-2 rounded-md font-medium transition ${
          viewType === 'channels'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Canales por Ciudad
      </button>
      <button
        onClick={() => setViewType('suspended')}
        className={`px-4 py-2 rounded-md font-medium transition ${
          viewType === 'suspended'
            ? 'bg-white text-red-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Suspendidos/Bloqueados
      </button>
    </div>
  );
}
