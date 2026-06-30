'use client';

import React, { useState } from 'react';
import { ProjectMapSummary } from '@/core/domain/entities/PropertyMapResult';
import Link from 'next/link';
import { Home, MapPin, ChevronRight, Star, Building, BedDouble, Bath, Square } from 'lucide-react';
import { LazyImage } from '@/presentation/components/ui/LazyImage/LazyImage';

interface ProjectMapCardProps {
  project: ProjectMapSummary;
  isSelected?: boolean;
  onClick?: () => void;
}

const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  PRE_SALE: { label: 'Preventa', color: 'bg-purple-100 text-purple-700' },
  SALE: { label: 'En venta', color: 'bg-green-100 text-green-700' },
  DELIVERY: { label: 'Entrega inmediata', color: 'bg-blue-100 text-blue-700' },
};

const TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: 'Residencial',
  COMMERCIAL: 'Comercial',
  MIXED_USE: 'Mixto',
  INDUSTRIAL: 'Industrial',
};

export function ProjectMapCard({ project, isSelected, onClick }: ProjectMapCardProps) {
  const [imgError, setImgError] = useState(false);
  const phaseInfo = PHASE_LABELS[project.phase] || { label: project.phase, color: 'bg-gray-100 text-gray-600' };

  const formatPrice = (price: number) => {
    if (!price) return '';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: project.currency || 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={`w-full bg-white rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md border ${
        isSelected ? 'border-brand ring-1 ring-brand shadow-md' : 'border-gray-100 shadow-sm hover:border-brand/40'
      }`}
      onClick={onClick}
    >
      <Link href={`/projects/${project.slug}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex">
          {/* Imagen - lado izquierdo */}
          <div className="relative w-28 sm:w-32 h-24 sm:h-28 flex-shrink-0 bg-gray-100 overflow-hidden">
            {project.coverImageUrl && !imgError ? (
              <img
                src={project.coverImageUrl}
                alt={project.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                <Building className="w-8 h-8" />
              </div>
            )}
            {project.isFeatured && (
              <div className="absolute top-1 left-1 bg-amber-400 text-amber-900 rounded-md px-1.5 py-0.5">
                <Star className="w-2.5 h-2.5 fill-current" />
              </div>
            )}
          </div>

          {/* Contenido - lado derecho */}
          <div className="flex-1 min-w-0 p-2.5 sm:p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                {project.phase && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${phaseInfo.color}`}>
                    {phaseInfo.label}
                  </span>
                )}
                {project.type && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    {TYPE_LABELS[project.type] || project.type}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">{project.name}</h3>
              
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{project.district}{project.province ? `, ${project.province}` : ''}</span>
              </p>

              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500 flex-wrap">
                {project.areaFrom && (
                  <span className="flex items-center gap-0.5">
                    <Square className="w-3 h-3" />
                    {project.areaFrom} m²
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  <Building className="w-3 h-3" />
                  {project.availableUnits}/{project.totalUnits} uds
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-50">
              <div>
                <p className="text-[10px] text-gray-400">Desde</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900">{formatPrice(project.priceFrom)}</p>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-white bg-brand px-2 py-1 rounded-md hover:bg-brand-dark transition-colors">
                Ver <ChevronRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
