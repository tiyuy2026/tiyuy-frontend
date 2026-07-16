'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

// Importar estilos CSS de Leaflet (necesario para que los tiles se rendericen correctamente)
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface LeafletMapProps {
  children: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  bounds?: Bounds | null;
  className?: string;
  onMapReady?: (map: L.Map) => void;
}

function MapBoundsUpdater({ bounds }: { bounds: Bounds | null | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      const padding = 0.02;
      map.fitBounds(
        [
          [bounds.minLat - padding, bounds.minLng - padding],
          [bounds.maxLat + padding, bounds.maxLng + padding],
        ],
        { padding: [50, 50], maxZoom: 15 }
      );
    }
  }, [map, bounds]);

  return null;
}

function MapReadyHandler({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }

    // Invalidar tamaño del mapa después de montarse para asegurar
    // que los tiles se rendericen correctamente
    const invalidate = () => {
      map.invalidateSize(true);
    };

    // Múltiples invalidaciones para cubrir diferentes momentos del renderizado
    requestAnimationFrame(() => invalidate());
    setTimeout(() => invalidate(), 100);
    setTimeout(() => invalidate(), 300);

    // Configurar ResizeObserver para invalidar cuando el contenedor cambie de tamaño
    if (typeof ResizeObserver !== 'undefined' && map.getContainer()) {
      const container = map.getContainer();
      const observer = new ResizeObserver(() => {
        map.invalidateSize(true);
      });
      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }
  }, [map, onMapReady]);

  return null;
}

export function LeafletMap({
  children,
  center = [-12.0464, -77.0428],
  zoom = 12,
  bounds,
  className = 'w-full h-full',
  onMapReady,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapBoundsUpdater bounds={bounds} />
      <MapReadyHandler onMapReady={onMapReady} />
      {children}
    </MapContainer>
  );
}
