import { MapPin } from 'lucide-react';
import { PropertyLocation as Location } from '@/core/domain/entities/Property';
import { EnhancedMap } from './EnhancedMap';
import { PropertyComments } from './PropertyComments';

interface PropertyLocationProps {
  location: Location;
  propertyId: number;
}

export function PropertyLocation({ location, propertyId }: PropertyLocationProps) {
  const addressLine = location.showExactAddress
    ? location.fullAddress ||
      [location.street, location.streetNumber, location.urbanization, location.district, location.province]
        .filter(Boolean)
        .join(', ')
    : [location.district, location.province].filter(Boolean).join(', ');

  const pills = [location.district, location.province, location.region].filter(Boolean) as string[];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-2 border-b border-gray-100">
        <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
        <h2 className="text-base font-bold text-gray-900">Ubicación</h2>
      </div>

      {/* Mapa — altura fija, el EnhancedMap ahora es solo el mapa */}
      <div className="w-full h-72">
        <EnhancedMap location={location} propertyId={propertyId} />
      </div>

      {/* Info debajo del mapa — separada con divide */}
      <div className="divide-y divide-gray-100">

        {/* Dirección */}
        <div className="px-6 py-4 flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
              Ubicación de la propiedad
            </p>
            <p className="text-sm text-gray-700">{addressLine}</p>
          </div>
        </div>

        {/* Pills */}
        {pills.length > 0 && (
          <div className="px-6 py-4 flex items-center gap-2 flex-wrap">
            {pills.map((pill, index) => (
              <span
                key={`${pill}-${index}`}
                className="inline-flex items-center bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {pill}
              </span>
            ))}
          </div>
        )}

        {/* Coordenadas */}
        {location.latitude && location.longitude && (
          <div className="px-6 py-3">
            <p className="text-xs text-gray-400">
              Coordenadas: {location.latitude}, {location.longitude}
            </p>
          </div>
        )}

      </div>

      {/* Comentarios de la zona — al final, bien separados */}
      <div className="border-t border-gray-100">
        <PropertyComments propertyId={propertyId} location={location} />
      </div>

    </div>
  );
}