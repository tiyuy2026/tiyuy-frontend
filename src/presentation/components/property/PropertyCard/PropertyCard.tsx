'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PropertySummary } from '@/core/domain/entities/Property';
import { FavoriteButton } from '../../shared/FavoriteButton/FavoriteButton';

interface PropertyCardProps {
  property: PropertySummary;
}

const PROPERTY_TYPE_LABELS = {
  APARTMENT: 'Departamento',
  HOUSE: 'Casa',
  LAND: 'Terreno',
  OFFICE: 'Oficina',
  COMMERCIAL: 'Local Comercial',
  ROOM: 'Habitación',
};

const TRANSACTION_TYPE_LABELS = {
  SALE: 'Venta',
  RENT: 'Alquiler',
};

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? 'US$' : 'S/';
    return `${symbol} ${price.toLocaleString('es-PE')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200 w-full h-full flex flex-col">
      {/* Imagen */}
      <Link href={`/property/${property.slug}`} className="relative block flex-shrink-0">
        <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
          {property.coverPhotoUrl ? (
            <Image
              src={property.coverPhotoUrl}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
              priority={property.isFeatured}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-gray-400 text-6xl">🏠</span>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            {property.isFeatured && (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ⭐ DESTACADO
              </span>
            )}
            {property.isVerified && (
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ✓ VERIFICADO
              </span>
            )}
          </div>

          {/* Botón de favorito */}
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
              <FavoriteButton propertyId={property.id} />
            </div>
          </div>
        </div>
      </Link>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Tipo de operación */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
            property.transactionType === 'SALE' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {TRANSACTION_TYPE_LABELS[property.transactionType]}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {PROPERTY_TYPE_LABELS[property.type]}
          </span>
        </div>

        {/* Título */}
        <Link href={`/property/${property.slug}`}>
          <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-3 leading-tight">
            {property.title}
          </h3>
        </Link>

        {/* Ubicación */}
        <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
          <span className="text-red-500">📍</span>
          <span className="font-medium">{property.district}</span>
          <span className="text-gray-400">•</span>
          <span>{property.province}</span>
        </p>

        {/* Características */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          {property.bedrooms && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="text-lg">🛏️</span>
              <span className="font-medium">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="text-lg">🚿</span>
              <span className="font-medium">{property.bathrooms}</span>
            </div>
          )}
          {property.totalArea && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <span className="text-lg">📐</span>
              <span className="font-medium">{property.totalArea}m²</span>
            </div>
          )}
        </div>

        {/* Precio */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(property.price, property.currency)}
            </span>
            {property.transactionType === 'RENT' && (
              <span className="text-sm text-gray-500 ml-2">/mes</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>👁️</span>
            <span>{property.viewsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
