/**
 * Reusable Admin Table Component
 * Supports pagination, filtering, sorting, and bulk operations
 */

'use client';

import { useState } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState } from '@/presentation/components/admin/AdminUIStates';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  pagination?: {
    page: number;
    size: number;
    total: number;
    onPageChange: (page: number) => void;
    onSizeChange: (size: number) => void;
  };
  selection?: {
    selectedItems: T[];
    onSelectionChange: (items: T[]) => void;
    getRowId: (item: T) => string | number;
  };
  filters?: React.ReactNode;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: (item: T) => boolean;
  }[];
  emptyState?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

export function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error,
  pagination,
  selection,
  filters,
  actions,
  emptyState
}: AdminTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const handleSort = (key: keyof T) => {
    if (!columns.find(col => col.key === key)?.sortable) return;
    
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (!selection) return;
    
    if (checked) {
      selection.onSelectionChange(data);
    } else {
      selection.onSelectionChange([]);
    }
  };

  const handleSelectItem = (item: T, checked: boolean) => {
    if (!selection) return;
    
    const itemId = selection.getRowId(item);
    const currentSelected = selection.selectedItems;
    
    if (checked) {
      selection.onSelectionChange([...currentSelected, item]);
    } else {
      selection.onSelectionChange(currentSelected.filter(i => selection.getRowId(i) !== itemId));
    }
  };

  const isItemSelected = (item: T) => {
    if (!selection) return false;
    const itemId = selection.getRowId(item);
    return selection.selectedItems.some(i => selection.getRowId(i) === itemId);
  };

  const isAllSelected = selection ? data.length > 0 && data.every(isItemSelected) : false;

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return <LoadingState message="Loading data..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyState?.title || 'No data found'}
        description={emptyState?.description}
        action={emptyState?.action}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {filters && (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          {filters}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {/* Selection column */}
                {selection && (
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded-lg"
                    />
                  </th>
                )}

                {/* Data columns */}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-200/50 transition-colors' : ''
                    }`}
                    style={{ width: column.width, minWidth: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <svg
                            className={`w-3 h-3 ${
                              sortConfig.key === column.key && sortConfig.direction === 'asc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          <svg
                            className={`w-3 h-3 -mt-1 ${
                              sortConfig.key === column.key && sortConfig.direction === 'desc'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </th>
                ))}

                {/* Actions column */}
                {actions && actions.length > 0 && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedData.map((item, index) => (
                <tr key={selection ? selection.getRowId(item) : index} className="hover:bg-blue-50/50 transition-colors">
                  {/* Selection cell */}
                  {selection && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isItemSelected(item)}
                        onChange={(e) => handleSelectItem(item, e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded-lg"
                      />
                    </td>
                  )}

                  {/* Data cells */}
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}

                  {/* Actions cell */}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(item)}
                            disabled={action.disabled?.(item)}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                              action.variant === 'primary'
                                ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600 shadow-sm hover:shadow-md' :
                              action.variant === 'danger'
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' :
                              'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Mostrando {((pagination.page - 1) * pagination.size) + 1} a{' '}
              {Math.min(pagination.page * pagination.size, pagination.total)} de{' '}
              {pagination.total} resultados
            </span>

            <select
              value={pagination.size}
              onChange={(e) => pagination.onSizeChange(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 rounded-lg border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </Button>

            <span className="text-sm font-medium text-gray-700 px-3 py-2 bg-gray-50 rounded-lg">
              Página {pagination.page} de {Math.ceil(pagination.total / pagination.size)}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.size)}
              className="px-4 py-2 rounded-lg border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              Siguiente
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
