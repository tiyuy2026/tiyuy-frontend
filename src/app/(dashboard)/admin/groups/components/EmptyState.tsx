'use client';

import { ViewType } from '../types';

interface EmptyStateProps {
  viewType: ViewType;
}

export function EmptyState({ viewType }: EmptyStateProps) {
  const getItemType = () => {
    if (viewType === 'groups') return 'grupos';
    if (viewType === 'channels') return 'canales';
    return 'elementos';
  };

  return (
    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
      <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-lg font-medium text-gray-600 mb-1">
        No se encontraron {getItemType()}
      </p>
      <p className="text-sm text-gray-500">
        Intenta ajustar los filtros o realizar una nueva búsqueda
      </p>
    </div>
  );
}
