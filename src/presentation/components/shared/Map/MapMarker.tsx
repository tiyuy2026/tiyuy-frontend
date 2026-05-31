'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { PropertyType, TransactionType } from '@/core/domain/entities/Property';

const TRANSACTION_COLORS: Record<TransactionType, string> = {
  SALE: '#2563eb',
  RENT: '#16a34a',
};


function createMarkerIcon(
  transactionType: TransactionType,
  price: string,
  isHighlighted: boolean
): L.DivIcon {
  const color = TRANSACTION_COLORS[transactionType];
  const size = isHighlighted ? 48 : 40;
  const fontSize = isHighlighted ? 12 : 11;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        display: flex; flex-direction: column; align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: ${color}; color: white;
          padding: 4px 8px; border-radius: 8px;
          font-size: ${fontSize}px; font-weight: 700;
          white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: ${isHighlighted ? '3px solid #fbbf24' : '2px solid white'};
          transform: scale(${isHighlighted ? 1.15 : 1});
          transition: transform 0.2s;
        ">
          ${price}
        </div>
        <div style="
          width: 0; height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
        "></div>
      </div>
    `,
    iconSize: [size, size + 16],
    iconAnchor: [size / 2, size + 16],
    popupAnchor: [0, -(size + 24)],
  });
}

interface MapMarkerProps {
  property: {
    id: number;
    title: string;
    price: number;
    currency: string;
    type: PropertyType;
    transactionType: TransactionType;
    latitude: number;
    longitude: number;
    mainPhotoUrl?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    district: string;
  };
  isHighlighted?: boolean;
  onHover?: (id: number | null) => void;
  formatPrice: (price: number, currency: string) => string;
}

export function MapMarker({
  property,
  isHighlighted = false,
  onHover,
  formatPrice,
}: MapMarkerProps) {
  const priceLabel = formatPrice(property.price, property.currency);
  const icon = createMarkerIcon(property.transactionType, priceLabel, isHighlighted);

  return (
    <Marker
      position={[property.latitude, property.longitude]}
      icon={icon}
      eventHandlers={{
        mouseover: () => onHover?.(property.id),
        mouseout: () => onHover?.(null),
      }}
    >
      <Popup>
        <div className="min-w-[200px]">
          {property.mainPhotoUrl && (
            <img
              src={property.mainPhotoUrl}
              alt={property.title}
              className="w-full h-28 object-cover rounded-t-lg mb-2"
            />
          )}
          <h3 className="font-semibold text-sm text-gray-900 truncate">
            {property.title}
          </h3>
          <p className="text-brand font-bold text-sm mt-1">
            {priceLabel}
          </p>
          <p className="text-xs text-gray-500 mt-1">{property.district}</p>
          {(property.bedrooms || property.bathrooms || property.area) && (
            <div className="flex gap-3 mt-2 text-xs text-gray-600">
              {property.bedrooms && <span>{property.bedrooms} dorm</span>}
              {property.bathrooms && <span>{property.bathrooms} baños</span>}
              {property.area && <span>{property.area} m²</span>}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
