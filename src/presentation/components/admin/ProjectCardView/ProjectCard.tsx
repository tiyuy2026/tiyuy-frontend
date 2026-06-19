/**
 * ProjectCard Component
 * Renders a single project as a card with cover image, status, price range, and key details.
 */

'use client';

import { ProjectAdminItem } from '@/core/domain/entities/Admin';
import { MapPin, Eye, Star, Building, Calendar, Users, TrendingUp } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectAdminItem;
  onClick?: (project: ProjectAdminItem) => void;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  'PUBLISHED': { label: 'Publicado', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'ACTIVE': { label: 'Activo', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'PAUSED': { label: 'Pausado', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'DRAFT': { label: 'Borrador', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  'SUSPENDED': { label: 'Suspendido', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'COMPLETED': { label: 'Completado', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'CANCELLED': { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
};

const lifecycleConfig: Record<string, { label: string; bg: string; text: string }> = {
  'PRE_SALE': { label: 'Pre Venta', bg: 'bg-blue-50', text: 'text-blue-700' },
  'SALE': { label: 'En Venta', bg: 'bg-green-50', text: 'text-green-700' },
  'CONSTRUCTION': { label: 'En Construcción', bg: 'bg-orange-50', text: 'text-orange-700' },
  'COMPLETED': { label: 'Completado', bg: 'bg-purple-50', text: 'text-purple-700' },
  'ACTIVE': { label: 'Activo', bg: 'bg-teal-50', text: 'text-teal-700' },
  'PAST': { label: 'Pasado', bg: 'bg-gray-50', text: 'text-gray-600' },
  'ENDING_SOON': { label: 'Por Terminar', bg: 'bg-yellow-50', text: 'text-yellow-700' },
};

const typeConfig: Record<string, { label: string; icon: string }> = {
  'RESIDENTIAL': { label: 'Residencial', icon: '🏠' },
  'COMMERCIAL': { label: 'Comercial', icon: '🏢' },
  'INDUSTRIAL': { label: 'Industrial', icon: '🏭' },
  'MIXED': { label: 'Mixto', icon: '🏬' },
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig['DRAFT'];
  const lifecycle = lifecycleConfig[project.lifecycleStatus];
  const type = typeConfig[project.type] || { label: project.type, icon: '📋' };
  
  const formatPrice = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const soldPercentage = project.totalUnits > 0
    ? Math.round((project.soldUnits / project.totalUnits) * 100)
    : 0;

  return (
    <div
      onClick={() => onClick?.(project)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
    >
      {/* Cover Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {project.coverImageUrl ? (
          <img
            src={project.coverImageUrl}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="text-center">
              <div className="text-4xl mb-1">{type.icon}</div>
              <span className="text-xs text-gray-400">Sin imagen</span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${status.bg} ${status.text} ${status.border} shadow-sm`}>
            {status.label}
          </span>
          {lifecycle && (
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${lifecycle.bg} ${lifecycle.text} shadow-sm`}>
              {lifecycle.label}
            </span>
          )}
        </div>

        {/* Featured Badge */}
        {project.isFeatured && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3" />
              Destacado
            </span>
          </div>
        )}

        {/* Price Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-base drop-shadow-sm">
              {formatPrice(project.priceRange.min)} - {formatPrice(project.priceRange.max)}
            </span>
            <span className="text-white/80 text-xs">{type.label}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 space-y-2.5">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-purple-600 transition-colors">
          {project.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {[project.district, project.city, project.country].filter(Boolean).join(', ')}
          </span>
        </div>

        {/* Developer */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{project.developerName}</span>
        </div>

        {/* Progress Bar */}
        {project.constructionProgress > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Avance</span>
              <span className="font-medium text-gray-700">{project.constructionProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${project.constructionProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Units Stats */}
        <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1" title="Unidades totales">
              <Building className="w-3 h-3" />
              {project.totalUnits}
            </span>
            <span className="flex items-center gap-1" title="Vendidas">
              <TrendingUp className="w-3 h-3" />
              {project.soldUnits}
            </span>
            <span className="flex items-center gap-1" title="Vistas">
              <Eye className="w-3 h-3" />
              {project.viewsCount ?? 0}
            </span>
          </div>
          {formattedDate && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          )}
        </div>

        {/* Sold Percentage */}
        {soldPercentage > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
            <span className="text-emerald-600 font-medium whitespace-nowrap">
              {soldPercentage}% vendido
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
