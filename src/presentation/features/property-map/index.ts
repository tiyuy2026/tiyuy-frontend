/**
 *  PRESENTATION - Barrel export del Mapa
 * 
 * Exporta componentes genéricos que funcionan con cualquier MapItem
 * (propiedades, proyectos, etc.) mediante inyección de searchFn.
 */

export { PropertyMapModal } from './components/PropertyMapModal';
export { PropertyMapView } from './components/PropertyMapView';
export { PropertyMapSidebar } from './components/PropertyMapSidebar';
export { PropertyMapCard } from './components/PropertyMapCard';
export { MapCoverageMessage } from './components/MapCoverageMessage';
export { PropertyMapWrapper } from './components/PropertyMapWrapper';
export { ViewMapButton } from './components/ViewMapButton';
export { useMapView } from '@/presentation/hooks/useMapView';
export type { MapItem, MapSearchResult, MapCoverageType, MapFilters } from '@/core/domain/entities/MapTypes';
