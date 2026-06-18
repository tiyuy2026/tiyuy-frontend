'use client';

import { ViewType } from '../types';
import { AlertCircle } from 'lucide-react';

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
      <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-600 mb-1">
        No se encontraron {getItemType()}
      </p>
      <p className="text-sm text-gray-500">
        Intenta ajustar los filtros o realizar una nueva búsqueda
      </p>
    </div>
  );
}
