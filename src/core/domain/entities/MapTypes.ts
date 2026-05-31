/**
 * 🧠 CORE DOMAIN - Tipos genéricos para el Mapa
 * 
 * Estos tipos son agnósticos al tipo de entidad (propiedad, proyecto, etc.)
 * Siguen el principio de abstracción de la Arquitectura Hexagonal.
 */

/**
 * Nivel de cobertura geográfica del mapa
 */
export type MapCoverageType = 'EXACT_DISTRICT' | 'NEARBY_DISTRICTS' | 'METRO_AREA' | 'PROVINCE' | 'REGION' | 'NO_RESULTS';

/**
 * Información de cobertura geográfica
 */
export interface MapCoverageInfo {
  coverage: MapCoverageType;
  searchedDistrict: string;
  nearbyDistricts: string[];
  message: string;
}

/**
 * Item genérico para mostrar en el mapa.
 * Cualquier entidad (Property, Project, etc.) debe adaptarse a esta interfaz.
 */
export interface MapItem {
  id: number;
  title: string;
  slug: string;
  price: number;
  currency: 'PEN' | 'USD';
  type: string;
  subType?: string;
  imageUrl?: string;
  district: string;
  province: string;
  region: string;
  latitude: number;
  longitude: number;
  isFeatured?: boolean;
  /** Metadatos adicionales específicos de cada entidad */
  metadata?: Record<string, string | number | boolean | undefined>;
}

/**
 * Resultado de búsqueda para el mapa (genérico)
 */
export interface MapSearchResult<T extends MapItem = MapItem> {
  items: T[];
  requestedArea: string;
  effectiveCoverage: MapCoverageType;
  coverageMessage: string;
  districtsIncluded: string[];
  totalResults: number;
}

/**
 * Filtros para búsqueda en mapa (genérico)
 */
export interface MapFilters {
  transactionType?: string;
  type?: string;
  district?: string;
  province?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  isFeatured?: boolean;
  phase?: string;
}
