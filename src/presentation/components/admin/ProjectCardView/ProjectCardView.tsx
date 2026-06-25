/**
 * ProjectCardView Component
 * Renders a grid of project cards with loading, empty, and error states.
 * Generic container that accepts any data type and a renderCard function.
 */

'use client';

import { Spinner } from '@/presentation/components/ui/Spinner';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationInfo {
  page: number;
  size: number;
  total: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
}

interface EmptyState {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ProjectCardViewProps<T> {
  data: T[];
  loading?: boolean;
  error?: string | null;
  renderCard: (item: T) => React.ReactNode;
  pagination?: PaginationInfo;
  emptyState?: EmptyState;
}

export function ProjectCardView<T>({
  data,
  loading,
  error,
  renderCard,
  pagination,
  emptyState,
}: ProjectCardViewProps<T>) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-medium text-red-600">Error al cargar proyectos</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {emptyState?.title || 'No se encontraron proyectos'}
          </p>
          {emptyState?.description && (
            <p className="text-xs text-gray-500">{emptyState.description}</p>
          )}
          {emptyState?.action && (
            <button
              onClick={emptyState.action.onClick}
              className="mt-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              {emptyState.action.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.size) : 1;
  const startItem = pagination ? (pagination.page - 1) * pagination.size + 1 : 1;
  const endItem = pagination ? Math.min(pagination.page * pagination.size, pagination.total) : data.length;

  return (
    <div className="space-y-4">
      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((item, index) => (
          <div key={index} className="h-full">
            {renderCard(item)}
          </div>
        ))}
      </div>

      {/* Paginación */}
      {pagination && pagination.total > pagination.size && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-500">
            Mostrando <span className="font-medium text-gray-700">{startItem}-{endItem}</span> de{' '}
            <span className="font-medium text-gray-700">{pagination.total}</span> proyectos
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 sm:p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
            </button>
            <span className="text-xs sm:text-sm text-gray-700 px-1 sm:px-2">
              {pagination.page} / {totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-1 sm:p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
