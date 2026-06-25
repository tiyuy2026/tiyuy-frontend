/**
 * Projects Table Component
 * Table with project rows, checkboxes, and action icons matching screenshot
 */

'use client';

import { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, Eye, MapPin, Pause, Pencil, Star, Trash2 } from 'lucide-react';;
import { ProjectAdminItem } from '@/core/domain/entities/Admin';

interface ProjectsTableProps {
  projects: ProjectAdminItem[];
  isLoading?: boolean;
  selectedProjects: ProjectAdminItem[];
  onSelectionChange?: (selected: ProjectAdminItem[]) => void;
  onSelectProject?: (project: ProjectAdminItem, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onViewProject: (project: ProjectAdminItem) => void;
  onEditProject?: (project: ProjectAdminItem) => void;
  onPauseProject?: (project: ProjectAdminItem) => void;
  onDeleteProject?: (project: ProjectAdminItem) => void;
  onModerateProject?: (project: ProjectAdminItem) => void;
  onToggleFeatured?: (project: ProjectAdminItem) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  canModerate?: boolean;
  canDelete?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  numberOfElements?: number;
  onPageChange?: (page: number) => void;
}

export function ProjectsTable({
  projects,
  isLoading,
  selectedProjects,
  onSelectionChange,
  onSelectProject,
  onSelectAll,
  onViewProject,
  onEditProject,
  onPauseProject,
  onDeleteProject,
  onModerateProject,
  onToggleFeatured,
  sortColumn,
  sortDirection,
  onSort,
  canModerate,
  canDelete,
  currentPage,
  totalPages,
  totalElements,
  numberOfElements,
  onPageChange,
}: ProjectsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const isAllSelected = projects.length > 0 && selectedProjects.length === projects.length;
  const isIndeterminate = selectedProjects.length > 0 && selectedProjects.length < projects.length;

  const handleSelectAll = () => {
    const newSelected = !isAllSelected;
    if (onSelectAll) {
      onSelectAll(newSelected);
    } else if (onSelectionChange) {
      onSelectionChange(newSelected ? [...projects] : []);
    }
  };

  const handleSelectRow = (project: ProjectAdminItem) => {
    const isSelected = selectedProjects.some((p) => p.id === project.id);
    if (onSelectProject) {
      onSelectProject(project, !isSelected);
    } else if (onSelectionChange) {
      onSelectionChange(
        isSelected
          ? selectedProjects.filter((p) => p.id !== project.id)
          : [...selectedProjects, project]
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PUBLISHED: 'bg-green-100 text-green-700 border-green-200',
      ACTIVE: 'bg-green-100 text-green-700 border-green-200',
      PAUSED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
      SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const translateStatus = (status: string): string => {
    const translations: Record<string, string> = {
      PUBLISHED: 'Publicado',
      ACTIVE: 'Activo',
      PAUSED: 'Pausado',
      DRAFT: 'Borrador',
      SUSPENDED: 'Suspendido',
      COMPLETED: 'Completado',
    };
    return translations[status] || status;
  };

  const translateType = (type: string): string => {
    const translations: Record<string, string> = {
      RESIDENTIAL: 'Residencial',
      COMMERCIAL: 'Comercial',
      INDUSTRIAL: 'Industrial',
      MIXED: 'Mixto',
    };
    return translations[type] || type;
  };

  const translateLifecycle = (lifecycle: string): string => {
    if (!lifecycle) return '-';
    const upperLifecycle = lifecycle.toUpperCase();
    const translations: Record<string, string> = {
      PRE_SALE: 'Pre Venta',
      SALE: 'En Venta',
      CONSTRUCTION: 'En Construcción',
      COMPLETED: 'Completado',
      DRAFT: 'Borrador',
      PUBLISHED: 'Publicado',
      ACTIVE: 'Activo',
      PAUSED: 'Pausado',
      SUSPENDED: 'Suspendido',
    };
    return translations[upperLifecycle] || lifecycle?.replace('_', ' ') || '';
  };

  const translatePhase = (phase: string): string => {
    const translations: Record<string, string> = {
      PLANNING: 'Planificación',
      PRE_SALE: 'Pre Venta',
      SALE: 'En Venta',
      CONSTRUCTION: 'En Construcción',
    };
    return translations[phase] || phase?.replace('_', ' ') || '';
  };

  const getLifecycleBadge = (lifecycle: string) => {
    const styles: Record<string, string> = {
      PRE_SALE: 'bg-blue-100 text-blue-700 border-blue-200',
      SALE: 'bg-green-100 text-green-700 border-green-200',
      CONSTRUCTION: 'bg-orange-100 text-orange-700 border-orange-200',
      COMPLETED: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return styles[lifecycle] || 'bg-gray-100 text-gray-700';
  };

  const getPhaseBadge = (phase: string) => {
    const styles: Record<string, string> = {
      PLANNING: 'bg-gray-100 text-gray-700 border-gray-200',
      PRE_SALE: 'bg-blue-100 text-blue-700 border-blue-200',
      SALE: 'bg-green-100 text-green-700 border-green-200',
      CONSTRUCTION: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return styles[phase] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (min: number, max: number) => {
    const format = (val: number) => {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
      return `$${val}`;
    };
    return `${format(min)} - ${format(max)}`;
  };

  const SortHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onSort?.(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortColumn === column && (
          sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 animate-pulse">
              <div className="w-5 h-5 bg-gray-200 rounded" />
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="w-48 h-4 bg-gray-200 rounded" />
                <div className="w-32 h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto overflow-y-visible max-w-full" style={{ scrollbarWidth: 'thin' }}>
        <table className="w-full min-w-[1400px]">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </th>
            <SortHeader column="name">Proyecto</SortHeader>
            <SortHeader column="developer">Desarrollador</SortHeader>
            <SortHeader column="status">Estado</SortHeader>
            <SortHeader column="type">Tipo</SortHeader>
            <SortHeader column="phase">Fase</SortHeader>
            <SortHeader column="price">Precio</SortHeader>
            <SortHeader column="units">Unidades</SortHeader>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fecha Inicio
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fecha Entrega
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {projects.map((project) => {
            const isSelected = selectedProjects.some((p) => p.id === project.id);
            const isHovered = hoveredRow === project.id;

            return (
              <tr
                key={project.id}
                className={`transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                onMouseEnter={() => setHoveredRow(project.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectRow(project)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {project.coverImageUrl ? (
                        <img
                          src={project.coverImageUrl}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          N/A
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {project.name}
                        {project.isFeatured && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" title="Destacado" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">ID: PRY-{project.id.toString().padStart(3, '0')}</div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {project.district || project.city || 'Sin ubicacion'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{project.developerName}</div>
                  <div className="text-xs text-gray-500">{project.developerEmail}</div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(project.status)}`}>
                    {translateStatus(project.status)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {translateType(project.type)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getPhaseBadge(project.phase)}`}>
                    {translatePhase(project.phase)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(project.priceRange.min, project.priceRange.max)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">{project.totalUnits}</div>
                  <div className="text-xs text-gray-500">
                    {project.soldUnits} vendidas / {project.availableUnits} disp.
                  </div>
                  {project.constructionProgress > 0 && (
                    <div className="mt-1.5 w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${project.constructionProgress}%` }}
                      />
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('es-ES') : '-'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {project.estimatedDeliveryDate ? new Date(project.estimatedDeliveryDate).toLocaleDateString('es-ES') : '-'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewProject(project)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all"
                      title="Ver detalles del proyecto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver</span>
                    </button>
                    {onEditProject && (
                      <button
                        onClick={() => onEditProject(project)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all"
                        title="Editar proyecto"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    )}
                    {(canModerate || onModerateProject) && (
                      <button
                        onClick={() => onModerateProject?.(project)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all"
                        title="Moderar proyecto"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Moderar</span>
                      </button>
                    )}
                    {onToggleFeatured && (
                      <button
                        onClick={() => onToggleFeatured(project)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          project.isFeatured
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-gray-200'
                        }`}
                        title={project.isFeatured ? 'Quitar destacado' : 'Marcar como destacado'}
                      >
                        <Star className={`w-3.5 h-3.5 ${project.isFeatured ? 'fill-amber-400' : ''}`} />
                        <span>{project.isFeatured ? 'Destacado' : 'Destacar'}</span>
                      </button>
                    )}
                    {onPauseProject && (
                      <button
                        onClick={() => onPauseProject(project)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all"
                        title="Pausar proyecto"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pausar</span>
                      </button>
                    )}
                    {(canDelete || onDeleteProject) && (
                      <button
                        onClick={() => onDeleteProject?.(project)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {/* Pagination - Siempre visible para verificar conexión backend */}
      {totalElements !== undefined && totalElements > 0 && (
        <div className="px-3 sm:px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 bg-gray-50/50">
          <div className="text-xs sm:text-sm text-gray-500">
            Mostrando <span className="font-medium text-gray-700">{projects.length}</span> de <span className="font-medium text-gray-700">{totalElements}</span> proyectos
            {totalPages && totalPages > 1 && (
              <span className="ml-1 sm:ml-2">(Pág. {currentPage || 1} de {totalPages})</span>
            )}
          </div>
          {totalPages && totalPages > 1 && onPageChange && currentPage && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <span className="hidden sm:inline">Anterior</span>
                <span className="sm:hidden">{'<'}</span>
              </button>
              <span className="text-xs sm:text-sm text-gray-700 px-1 sm:px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <span className="sm:hidden">{'>'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
