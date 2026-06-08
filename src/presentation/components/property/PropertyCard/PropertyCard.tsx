'use client';

import React from 'react';
import Link from 'next/link';
import { BadgeCheck, Star, AlertCircle, Clock, MessageCircle } from 'lucide-react';
import type { Property, PropertySummary } from '@/core/domain/entities/Property';
import { FavoriteButton } from '@/presentation/components/shared/FavoriteButton';
import { LazyImage } from '@/presentation/components/ui/LazyImage/LazyImage';

interface PropertyCardProps {
  property: Property | PropertySummary;
}

// Type guard to check if property is full Property (has seo)
function isFullProperty(property: Property | PropertySummary): property is Property {
  return 'seo' in property && property.seo !== undefined;
}

// Get the slug from either Property or PropertySummary
function getPropertySlug(property: Property | PropertySummary): string {
  if (isFullProperty(property)) {
    return property.seo?.slug ?? String(property.id);
  }
  return property.slug ?? String(property.id);
}

export function PropertyCard({ property }: PropertyCardProps) {
  // Rating y comentarios se obtienen desde el backend en endpoints públicos
  // cuando estén disponibles. Por ahora se muestran valores por defecto.
  const commentCount: number | null = null;

  const PROPERTY_TYPE_LABELS: Record<string, string> = {
    APARTMENT: 'Departamento',
    HOUSE: 'Casa',
    LAND: 'Terreno',
    OFFICE: 'Oficina',
    COMMERCIAL: 'Local Comercial',
    ROOM: 'Habitacion',
  };

  const TRANSACTION_TYPE_LABELS: Record<string, string> = {
    SALE: 'Venta',
    RENT: 'Alquiler',
  };
  
  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? 'US$' : 'S/';
    return `${symbol} ${price.toLocaleString('es-PE')}`;
  };

  // Helper to render lifecycle status badge
  const renderLifecycleBadge = () => {
    const lifecycleStatus = property.lifecycleStatus;
    const remainingDays = property.remainingGraceDays;

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
          <span>Propiedad eliminada</span>
        </div>
      );
    }

    if (property.status === 'PAUSED') {
      return (
        <div className="absolute bottom-3 left-3 right-3 bg-gray-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Inactiva - requiere renovacion</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="group flex flex-col w-full h-full cursor-pointer">
      {/* Imagen */}
      <Link href={`/property/${getPropertySlug(property)}`} className="relative w-full aspect-square rounded-xl overflow-hidden mb-3">
        {property.coverPhotoUrl ? (
          <LazyImage
            src={`/api/images/proxy?url=${encodeURIComponent(property.coverPhotoUrl)}`}
            alt={property.title || ''}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-6xl">🏠</span>
          </div>
        )}

        {/* Overlay gradient - reducido para un look más limpio */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent opacity-50" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {property.isFeatured && (
            <div className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              Destacado
            </div>
          )}
          {property.isVerified && (
            <div className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
              Verificado
            </div>
          )}
        </div>

        {/* Botón de favorito */}
        <div className="absolute top-3 right-3 z-10">
          <div className="hover:scale-110 transition-transform drop-shadow-md">
            <FavoriteButton propertyId={property.id} />
          </div>
        </div>

        {/* Lifecycle status badge */}
        {renderLifecycleBadge()}
      </Link>

      {/* Contenido Minimalista estilo Airbnb */}
      <Link href={`/property/${getPropertySlug(property)}`} className="flex flex-col flex-grow mt-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-1">
            {PROPERTY_TYPE_LABELS[property.type] || 'Propiedad'} en {'location' in property ? property.location?.district : property.district || 'Ubicación'}
          </h3>
          <div className="flex items-center gap-1 text-[14px] text-gray-900 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-gray-900 fill-gray-900" />
            <span>Nuevo</span>
          </div>
        </div>

        <p className="text-[14px] text-gray-500 truncate mt-0.5">
          {[
            property.bedrooms && `${property.bedrooms} camas`,
            property.bathrooms && `${property.bathrooms} baños`,
            property.totalArea && `${property.totalArea} m²`
          ].filter(Boolean).join(' · ')}
        </p>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-semibold text-gray-900">
              {formatPrice(property.price, property.currency)}
            </span>
            <span className="text-[15px] text-gray-900">
              {property.transactionType === 'RENT' ? ' / mes' : ''}
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
