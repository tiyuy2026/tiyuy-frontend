'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ViewMapButton } from './ViewMapButton';
import { MapFilters, MapSearchResult } from '@/core/domain/entities/MapTypes';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';
import { propertyMapResultToGeneric } from '@/core/domain/adapters/MapItemAdapters';
import { mapSpanishPropertyType, mapTransactionType } from '@/core/application/mappers/PropertyTypeMapper';

// Cargar PropertyMapModal dinámicamente (solo cliente, sin SSR)
const PropertyMapModal = dynamic(
  () => import('./PropertyMapModal').then((mod) => mod.PropertyMapModal),
  { ssr: false }
);

interface PropertyMapWrapperProps {
  /** Tipo de entidad: 'property' (default) o 'project' */
  entityType?: 'property' | 'project';
  /** Tipo de transacción para filtrar en el mapa (solo para properties) */
  transactionType?: 'SALE' | 'RENT';
  /** Tipo de propiedad/proyecto (opcional) */
  entitySubType?: string;
  /** Filtros para pasar al mapa */
  filters: MapFilters;
  /** Número total de items para mostrar en el botón */
  totalItems: number;
  /** Etiqueta para el tipo de item (ej: "propiedad", "proyecto") */
  itemLabel?: string;
  itemLabelPlural?: string;
  /** URL base para los links de detalle */
  detailBaseUrl?: string;
  children?: React.ReactNode;
}

export function PropertyMapWrapper({
  entityType = 'property',
  transactionType,
  entitySubType,
  filters,
  totalItems,
  itemLabel,
  itemLabelPlural,
  detailBaseUrl,
  children,
}: PropertyMapWrapperProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleOpenMap = useCallback(() => {
    setIsMapOpen(true);
  }, []);

  const handleCloseMap = useCallback(() => {
    setIsMapOpen(false);
  }, []);

  // Crear searchFn internamente usando el repositorio correspondiente
  // Los filtros iniciales (filters prop) se usan como base y se combinan
  // con cualquier filtro adicional que el usuario aplique desde el mapa
  const searchFn = useMemo<(filters: MapFilters) => Promise<MapSearchResult>>(
    () => async (mapFilters: MapFilters) => {
      if (entityType === 'project') {
        // Usar repositorio de proyectos
        const { ProjectRepository } = await import('@/infrastructure/repositories/ProjectRepository');
        const { projectMapResultToGeneric } = await import('@/core/domain/adapters/MapItemAdapters');
        const repo = new ProjectRepository();
        const mapResult = await repo.searchForMap({
          type: entitySubType,
          district: mapFilters.district || filters.district,
          province: mapFilters.province || filters.province,
          region: mapFilters.region || filters.region,
          minPrice: mapFilters.minPrice ?? filters.minPrice,
          maxPrice: mapFilters.maxPrice ?? filters.maxPrice,
          minArea: mapFilters.minArea ?? filters.minArea,
          maxArea: mapFilters.maxArea ?? filters.maxArea,
          isFeatured: mapFilters.isFeatured ?? filters.isFeatured,
        });
        return projectMapResultToGeneric(mapResult);
      } else {
        // Usar repositorio de propiedades
        // Combinar filtros iniciales (de la URL/página) con filtros del mapa
        const repo = new PropertyRepository();
        const mapResult = await repo.searchForMap({
          transactionType: mapTransactionType(transactionType || 'SALE') as any,
          type: mapSpanishPropertyType(entitySubType || '') as any,
          // Distrito: priorizar filtro del mapa, sino usar el de la página
          district: mapFilters.district || filters.district,
          province: mapFilters.province || filters.province,
          region: mapFilters.region || filters.region,
          // Precios: combinar filtros de mapa y página
          minPrice: mapFilters.minPrice ?? filters.minPrice,
          maxPrice: mapFilters.maxPrice ?? filters.maxPrice,
          // Área: combinar filtros de mapa y página
          minArea: mapFilters.minArea ?? filters.minArea,
          maxArea: mapFilters.maxArea ?? filters.maxArea,
          // Dormitorios y baños: el mapa usa 'bedrooms'/'bathrooms', el repo espera 'minBedrooms'/'minBathrooms'
          minBedrooms: mapFilters.bedrooms ?? filters.bedrooms,
          minBathrooms: mapFilters.bathrooms ?? filters.bathrooms,
          // Destacados
          isFeatured: mapFilters.isFeatured ?? filters.isFeatured,
        });
        return propertyMapResultToGeneric(mapResult);
      }
    },
    [entityType, transactionType, entitySubType, filters]
  );

  return (
    <>
      {/* Botón "Ver mapa" */}
      <div className="flex items-center gap-3">
        {children}
        <ViewMapButton onClick={handleOpenMap} totalProperties={totalItems} />
      </div>

      {/* Modal del mapa (se renderiza solo cuando está abierto) */}
      {isMapOpen && (
        <PropertyMapModal
          searchFn={searchFn}
          initialFilters={filters}
          itemLabel={itemLabel}
          itemLabelPlural={itemLabelPlural}
          detailBaseUrl={detailBaseUrl}
        />
      )}
    </>
  );
}
