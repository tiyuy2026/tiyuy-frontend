'use client';

import Link from 'next/link';
import { MapItem } from '@/core/domain/entities/MapTypes';
import { formatPrice } from '../utils/mapUtils';
import { BedDouble, Bath, Maximize, MapPin } from 'lucide-react';

interface PropertyMapCardProps {
  item: MapItem;
  isSelected: boolean;
  onSelect: (id: number) => void;
  /** URL base para el link de detalle (ej: /property/ o /projects/) */
  detailBaseUrl?: string;
}

/**
 * PRESENTATION - Tarjeta genérica para items del mapa
 * 
 * Funciona con cualquier MapItem (propiedades, proyectos, etc.)
 * Los metadatos específicos se muestran desde item.metadata
 */
export function PropertyMapCard({
  item,
  isSelected,
  onSelect,
  detailBaseUrl = '/property/',
}: PropertyMapCardProps) {
  const isProject = item.type === 'PROJECT';
  const slug = String(item.slug || item.id);
  const detailUrl = isProject ? '/projects/detail/' + slug : '/property/' + slug;
  const iconEmoji = isProject ? '' : '';

  return (
    <div
      className={'flex gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ' + (isSelected ? 'bg-blue-50 border-2 border-blue-500 shadow-md' : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm')}
      onClick={() => onSelect(item.id)}
    >
      <Link href={detailUrl} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl">{iconEmoji}</div>
        )}
        {item.isFeatured && <div className="absolute top-1 left-1 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Destacado</div>}
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={detailUrl} className="block" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h3>
        </Link>
        <p className="text-xs text-gray-500 truncate mt-0.5">{item.district}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
          {!isProject && item.metadata?.bedrooms ? <span>{item.metadata.bedrooms} hab</span> : null}
          {!isProject && item.metadata?.bathrooms ? <span>{item.metadata.bathrooms} baños</span> : null}
          {item.metadata?.area ? <span>{item.metadata.area}m²</span> : null}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-gray-900">{formatPrice(item.price, item.currency)}</span>
          <Link href={detailUrl} className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg" onClick={(e) => e.stopPropagation()}>
            Ver
          </Link>
        </div>
      </div>
    </div>
  );
}
