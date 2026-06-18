'use client';

import React from 'react';
import { Image } from 'lucide-react';
import { MapPropertySummary } from '@/core/domain/entities/Property';
import Link from 'next/link';

interface PropertyMapCardProps {
  property: MapPropertySummary;
  isSelected?: boolean;
  onClick?: () => void;
  /** Distrito solicitado originalmente (para mostrar badge de distrito cercano) */
  requestedDistrict?: string;
}

export function PropertyMapCard({ property, isSelected, onClick, requestedDistrict }: PropertyMapCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency || 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const typeLabels: Record<string, string> = {
    APARTMENT: 'Departamento',
    HOUSE: 'Casa',
    LAND: 'Terreno',
    OFFICE: 'Oficina',
    COMMERCIAL: 'Local',
    ROOM: 'Habitación',
  };

  const transactionLabels: Record<string, string> = {
    SALE: 'Venta',
    RENT: 'Alquiler',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      {/* Imagen */}
      <div className="relative h-36 bg-gray-200">
        {property.mainPhotoUrl ? (
          <img
            src={property.mainPhotoUrl}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Image className="w-12 h-12" strokeWidth={1.5} />
          </div>
        )}
        {property.isFeatured && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
            Destacado
          </span>
        )}
        {/* Badge de distrito cercano */}
        {requestedDistrict && property.district?.toLowerCase() !== requestedDistrict.toLowerCase() && (
          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
            {property.district}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 truncate">{property.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{property.district}, {property.province}</p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
            {typeLabels[property.type] || property.type}
          </span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
            {transactionLabels[property.transactionType] || property.transactionType}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-xs text-gray-500">Precio</p>
            <p className="text-sm font-bold text-blue-600">
              {formatPrice(property.price, property.currency)}
            </p>
          </div>
          <div className="flex gap-2 text-xs text-gray-600">
            {property.bedrooms && <span>{property.bedrooms} dorm</span>}
            {property.bathrooms && <span>{property.bathrooms} baños</span>}
            {property.area && <span>{property.area} m²</span>}
          </div>
        </div>

        <Link
          href={`/sale/${property.slug}`}
          className="mt-2 block w-full text-center text-xs bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Ver propiedad
        </Link>
      </div>
    </div>
  );
}
