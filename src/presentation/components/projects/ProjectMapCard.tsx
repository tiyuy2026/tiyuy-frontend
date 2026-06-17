'use client';

import React from 'react';
import { ProjectMapSummary } from '@/core/domain/entities/PropertyMapResult';
import Link from 'next/link';
import { Home } from 'lucide-react';

interface ProjectMapCardProps {
  project: ProjectMapSummary;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ProjectMapCard({ project, isSelected, onClick }: ProjectMapCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: project.currency || 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const phaseLabels: Record<string, string> = {
    PRE_SALE: 'Preventa',
    SALE: 'Venta',
    DELIVERY: 'Entrega',
  };

  const typeLabels: Record<string, string> = {
    RESIDENTIAL: 'Residencial',
    COMMERCIAL: 'Comercial',
    MIXED_USE: 'Mixto',
    INDUSTRIAL: 'Industrial',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative h-36 bg-gray-200">
        {project.coverImageUrl ? (
          <img
            src={project.coverImageUrl}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Home className="w-12 h-12" />
          </div>
        )}
        {project.isFeatured && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
            Destacado
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 truncate">{project.name}</h3>
        <p className="text-xs text-gray-500 mt-1">{project.district}, {project.province}</p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            {phaseLabels[project.phase] || project.phase}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {typeLabels[project.type] || project.type}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-xs text-gray-500">Desde</p>
            <p className="text-sm font-bold text-blue-600">{formatPrice(project.priceFrom)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Disp.</p>
            <p className="text-sm font-semibold text-gray-700">{project.availableUnits}/{project.totalUnits}</p>
          </div>
        </div>

        <Link
          href={`/projects/${project.slug}`}
          className="mt-2 block w-full text-center text-xs bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Ver proyecto
        </Link>
      </div>
    </div>
  );
}
