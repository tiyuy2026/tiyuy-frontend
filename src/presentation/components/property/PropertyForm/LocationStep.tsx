'use client';

import { useState, useEffect, useRef } from 'react';
import { LocationSearch } from '@/presentation/components/forms/LocationSearch/LocationSearch';
import { useGooglePlaces } from '@/presentation/hooks/useGooglePlaces';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface LocationStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  propertyId?: number;
}

export function LocationStep({ formData, onChange }: LocationStepProps) {
  const [locationInput, setLocationInput] = useState(
    formData.district ? `${formData.district}, ${formData.province}` : ''
  );
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(
    formData.latitude && formData.longitude
      ? { lat: Number(formData.latitude), lng: Number(formData.longitude) }
      : null
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  const { getPlaceDetails, loading, error } = useGooglePlaces();

  // Función para actualizar la dirección completa
  const updateFullAddress = () => {
    const parts = [
      formData.street,
      formData.streetNumber,
      formData.urbanization,
      formData.district,
      formData.province,
      formData.region
    ].filter(Boolean);
    
    const fullAddress = parts.join(', ');
    onChange('fullAddress', fullAddress);
    
    // Si tenemos calle y número, geocodificar para obtener coordenadas exactas
    if (formData.street && formData.streetNumber && formData.district) {
      geocodeAddress(fullAddress);
    }
  };

  // Función para geocodificar dirección y actualizar mapa
  const geocodeAddress = async (address: string) => {
    if (!window.google?.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        onChange('latitude', lat);
        onChange('longitude', lng);
        setMapCenter({ lat, lng });
      }
    });
  };

  // Actualizar dirección cuando cambian los datos del distrito o dirección
  useEffect(() => {
    if (formData.district || formData.province) {
      updateFullAddress();
    }
  }, [formData.district, formData.province, formData.street, formData.streetNumber, formData.urbanization]);

  useEffect(() => {
    if (!mapCenter || !mapRef.current) return;

    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 16,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      const marker = new window.google.maps.Marker({
        position: mapCenter,
        map: mapInstance,
        draggable: true,
        title: formData.district || 'Ubicación seleccionada',
      });

      marker.addListener('dragend', (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onChange('latitude', lat);
        onChange('longitude', lng);
        setMapCenter({ lat, lng });
      });

      setMapReady(true);
    };

    if (window.google?.maps) {
      initializeMap();
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval);
          initializeMap();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    window.initMap = initializeMap;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [mapCenter]);

  const handleLocationSelect = async (location: {
    placeId: string;
    description: string;
    mainText: string;
    secondaryText: string;
  }) => {
    setLocationInput(location.mainText);

    const locationData = await getPlaceDetails(location.placeId);

    if (locationData) {
      const lat = Number(locationData.coordinates.lat);
      const lng = Number(locationData.coordinates.lng);

      onChange('district', locationData.district || location.mainText);
      onChange('province', locationData.province || location.secondaryText);
      onChange('region', locationData.region || 'Perú');
      onChange('latitude', lat);
      onChange('longitude', lng);
      onChange('fullAddress', locationData.place.description);

      // Forzar el mapa con coords válidas
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
      }
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-gray-50 outline-none';

  // El mapa se muestra solo si tenemos coordenadas
  const showMap = mapCenter !== null && !isNaN(mapCenter.lat) && !isNaN(mapCenter.lng);

  return (
    <div className="space-y-8">

      {/* ── BUSCAR ── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          ¿Dónde está ubicado tu inmueble?
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Escribe el nombre del distrito o provincia
        </p>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Buscar ubicación
          </label>
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            placeholder="Ej: Miraflores, San Miguel, Piura..."
            defaultValue={locationInput}
            className="w-full"
          />

          {loading && (
            <div className="mt-2.5 flex items-center gap-2 text-sm" style={{ color: '#00a63e' }}>
              <div
                className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent"
                style={{ borderColor: '#00a63e', borderTopColor: 'transparent' }}
              />
              Obteniendo detalles de la ubicación...
            </div>
          )}

          {error && (
            <div className="mt-2.5 flex items-center gap-2 text-sm text-red-500">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </section>

      {/* ── CAMPOS ── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Distrito</label>
            <input type="text" value={formData.district || ''} readOnly placeholder="Se autocompleta al buscar" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Provincia</label>
            <input type="text" value={formData.province || ''} readOnly placeholder="Se autocompleta al buscar" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Región / Departamento</label>
            <input type="text" value={formData.region || ''} readOnly placeholder="Se autocompleta al buscar" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Urbanización <span className="text-gray-300 font-normal normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.urbanization || ''}
              onChange={(e) => onChange('urbanization', e.target.value)}
              placeholder="Ej: Monterrico, La Molina"
              className={inputClass.replace('bg-gray-50', 'bg-white')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Calle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.street || ''}
              onChange={(e) => onChange('street', e.target.value)}
              placeholder="Ej: Av. Principal, Jr. Lima"
              className={inputClass.replace('bg-gray-50', 'bg-white')}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Número <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.streetNumber || ''}
              onChange={(e) => onChange('streetNumber', e.target.value)}
              placeholder="Ej: 123, 456-A"
              className={inputClass.replace('bg-gray-50', 'bg-white')}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Dirección completa <span className="text-gray-300 font-normal normal-case">(se autocompleta)</span>
          </label>
          <input
            type="text"
            value={formData.fullAddress || ''}
            readOnly
            placeholder="Se autocompleta con calle, número y distrito"
            className={inputClass}
          />
        </div>
      </section>

      {/* ── MAPA ── */}
      {showMap && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">
              ¿Cómo quieres mostrar tu ubicación?
            </h3>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {formData.district}, {formData.province}
            </span>
          </div>

          {/* Radio Exacta / Aproximada */}
          <div className="flex items-center gap-6 mb-4">
            {[{ label: 'Exacta', value: true }, { label: 'Aproximada', value: false }].map((opt) => {
              const isSelected = formData.showExactAddress === opt.value;
              return (
                <label
                  key={opt.label}
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => onChange('showExactAddress', opt.value)}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: isSelected ? '#00a63e' : '#d1d5db',
                      backgroundColor: isSelected ? '#00a63e' : 'white',
                    }}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              );
            })}
          </div>

          {/* Map — mismo estilo que EnhancedMap de detalle */}
          <div className="w-full h-72 rounded-xl overflow-hidden border border-gray-200">
            <div
              ref={mapRef}
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Puedes arrastrar el marcador para ajustar la ubicación exacta
          </p>
        </section>
      )}

      {/* ── TIP ── */}
      <div
        className="rounded-lg p-4 flex items-start gap-3"
        style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
      >
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#00a63e' }}>
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="text-sm" style={{ color: '#166534' }}>
          <p className="font-semibold mb-1">¿Cómo funciona?</p>
          <ul className="space-y-0.5 text-xs opacity-80">
            <li>• Escribe el nombre del distrito o provincia</li>
            <li>• Selecciona la opción correcta de la lista</li>
            <li>• Los datos y el mapa se autocompletarán automáticamente</li>
            <li>• Funciona con todos los distritos del Perú</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
