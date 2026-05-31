'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Clock, AlertCircle, Star, MessageCircle } from 'lucide-react';
import type { Project, ProjectSummary } from '@/core/domain/entities/Project';

interface ProjectCardProps {
  project: Project | ProjectSummary;
}

interface RatingData {
  averageRating: number;
  totalRatings: number;
}

// Get slug from either Project or ProjectSummary
function getProjectSlug(project: Project | ProjectSummary): string {
  return project.slug ?? String(project.id);
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: 'Proyecto Residencial',
  COMMERCIAL: 'Proyecto Comercial',
  MIXED_USE: 'Proyecto Mixto',
  INDUSTRIAL: 'Proyecto Industrial',
};

const PHASE_LABELS: Record<string, string> = {
  PRE_SALE: 'Preventa',
  SALE: 'En venta',
  DELIVERY: 'Entrega inmediata',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const [rating, setRating] = useState<RatingData | null>(null);
  const [commentCount, setCommentCount] = useState<number | null>(null);

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : 'S/';
    return `${symbol} ${price.toLocaleString('es-PE')}`;
  };

  // Helper to render lifecycle status badge
  const renderLifecycleBadge = () => {
    const lifecycleStatus = project.lifecycleStatus;
    const remainingDays = project.remainingGraceDays;

    if (lifecycleStatus === 'GRACE_PERIOD' && remainingDays !== undefined && remainingDays > 0) {
      return (
        <div className="absolute bottom-3 left-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Plan vencido - {remainingDays} dias para renovar</span>
        </div>
      );
    }

    if (lifecycleStatus === 'PENDING_DELETION' || lifecycleStatus === 'DELETED') {
      return (
        <div className="absolute bottom-3 left-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Proyecto eliminado</span>
        </div>
      );
    }

    if (project.status === 'PAUSED') {
      return (
        <div className="absolute bottom-3 left-3 right-3 bg-gray-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Inactivo - requiere renovacion</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="group flex flex-col w-full h-full cursor-pointer">
      {/* Imagen */}
      <Link href={`/projects/${getProjectSlug(project)}`} className="relative w-full aspect-square rounded-xl overflow-hidden mb-3">
        {project.coverImageUrl ? (
          <img
            src={`/api/images/proxy?url=${encodeURIComponent(project.coverImageUrl)}`}
            alt={project.name || ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              console.error('Error loading cover image:', project.coverImageUrl);
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
              e.currentTarget.parentElement!.innerHTML = '<span class="text-6xl">🏗️</span>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-6xl">🏗️</span>
          </div>
        )}

        {/* Overlay gradient - reducido para un look más limpio */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent opacity-50" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {project.isFeatured && (
            <div className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              Destacado
            </div>
          )}
          {project.isVerified && (
            <div className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
              Verificado
            </div>
          )}
        </div>

        {/* Lifecycle status badge */}
        {renderLifecycleBadge()}
      </Link>

      {/* Contenido Minimalista estilo Airbnb */}
      <Link href={`/projects/${getProjectSlug(project)}`} className="flex flex-col flex-grow mt-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-1">
            {project.name}
          </h3>
          <div className="flex items-center gap-1 text-[14px] text-gray-900 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-gray-900 fill-gray-900" />
            <span>{rating && rating.averageRating > 0 ? rating.averageRating.toFixed(2) : 'Nuevo'}</span>
          </div>
        </div>

        <p className="text-[14px] text-gray-500 line-clamp-1 mt-0.5">
          {PROJECT_TYPE_LABELS[project.type] || 'Proyecto'} en {project.district}
        </p>

        <p className="text-[14px] text-gray-500 truncate mt-0.5">
          {PHASE_LABELS[project.phase] || project.phase}
          {' · '}
          {project.availableUnits} unid. disponibles
        </p>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-semibold text-gray-900">
              {formatPrice(project.priceFrom, project.currency)}
            </span>
          </div>
          
          {/* Contador de comentarios pequeño */}
          {commentCount !== null && commentCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MessageCircle className="w-3 h-3" />
              <span>{commentCount}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
