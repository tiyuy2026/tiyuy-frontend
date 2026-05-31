/**
 * 🧠 CORE DOMAIN - Adaptadores para convertir entidades de dominio a MapItem
 * 
 * Sigue el patrón ADAPTER para mantener el Core puro sin depender de implementaciones.
 * Cada entidad (Property, Project) tiene su propio adaptador.
 */

import { MapItem, MapSearchResult as GenericMapSearchResult, MapCoverageType } from '@/core/domain/entities/MapTypes';
import { MapPropertySummary, MapSearchResult as PropertyMapResult } from '@/core/domain/entities/Property';
import { ProjectMapSummary, ProjectMapSearchResult } from '@/core/domain/entities/PropertyMapResult';

/**
 * Adaptador para convertir MapPropertySummary (Property) a MapItem genérico
 */
export function propertyToMapItem(p: MapPropertySummary): MapItem {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    currency: p.currency as 'PEN' | 'USD',
    type: p.transactionType,
    subType: p.type,
    imageUrl: p.mainPhotoUrl,
    district: p.district,
    province: p.province,
    region: p.region,
    latitude: p.latitude,
    longitude: p.longitude,
    isFeatured: p.isFeatured,
    metadata: {
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
    },
  };
}

/**
 * Adaptador para convertir PropertyMapResult a MapSearchResult genérico
 */
export function propertyMapResultToGeneric(result: PropertyMapResult): GenericMapSearchResult {
  return {
    items: result.properties.map(propertyToMapItem),
    requestedArea: result.requestedArea,
    effectiveCoverage: result.effectiveCoverage as MapCoverageType,
    coverageMessage: result.coverageMessage,
    districtsIncluded: result.districtsIncluded,
    totalResults: result.totalResults,
  };
}

/**
 * Adaptador para convertir ProjectMapSummary a MapItem genérico
 */
export function projectToMapItem(p: ProjectMapSummary): MapItem {
  return {
    id: p.id,
    title: p.name,
    slug: p.slug,
    price: p.priceFrom,
    currency: p.currency as 'PEN' | 'USD',
    type: 'PROJECT',
    subType: p.type,
    imageUrl: p.coverImageUrl,
    district: p.district,
    province: p.province,
    region: p.region,
    latitude: p.latitude,
    longitude: p.longitude,
    isFeatured: p.isFeatured,
    metadata: {
      phase: p.phase,
      priceTo: p.priceTo,
      areaFrom: p.areaFrom,
      areaTo: p.areaTo,
      totalUnits: p.totalUnits,
      availableUnits: p.availableUnits,
    },
  };
}

/**
 * Adaptador para convertir ProjectMapSearchResult a MapSearchResult genérico
 */
export function projectMapResultToGeneric(result: ProjectMapSearchResult): GenericMapSearchResult {
  return {
    items: result.projects.map(projectToMapItem),
    requestedArea: result.requestedArea,
    effectiveCoverage: result.effectiveCoverage as MapCoverageType,
    coverageMessage: result.coverageMessage,
    districtsIncluded: result.districtsIncluded,
    totalResults: result.totalResults,
  };
}
