'use client';

import { PropertyLocation as Location } from '@/core/domain/entities/Property';
import { useEffect, useRef, useState } from 'react';

interface EnhancedMapProps {
  location: Location;
  propertyId: number;
}

export function EnhancedMap({ location, propertyId }: EnhancedMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!location.latitude || !location.longitude) return;

    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: Number(location.latitude), lng: Number(location.longitude) },
        zoom: 16,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      new window.google.maps.Circle({
        map: mapInstance,
        center: { lat: Number(location.latitude), lng: Number(location.longitude) },
        radius: 200,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3B82F6',
        fillOpacity: 0.1,
      });

      new window.google.maps.Marker({
        position: { lat: Number(location.latitude), lng: Number(location.longitude) },
        map: mapInstance,
        title: location.fullAddress || `${location.district}, ${location.province}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
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
  }, [location.latitude, location.longitude]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '288px', display: 'block' }}
    />
  );
}