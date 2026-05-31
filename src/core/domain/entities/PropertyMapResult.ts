export type MapCoverageLevel = 'EXACT_DISTRICT' | 'NEARBY_DISTRICTS' | 'NO_RESULTS';

export interface PropertyMapCoverageInfo {
  coverage: MapCoverageLevel;
  searchedDistrict: string;
  nearbyDistricts: string[];
  message: string;
}

export interface PropertyMapSearchResult {
  properties: PropertyMapSummary[];
  requestedArea: string;
  effectiveCoverage: MapCoverageLevel;
  coverageMessage: string;
  districtsIncluded: string[];
  totalResults: number;
}

export interface PropertyMapSummary {
  id: number;
  title: string;
  price: number;
  currency: string;
  type: string;
  transactionType: string;
  district: string;
  province: string;
  region: string;
  latitude: number;
  longitude: number;
  mainPhotoUrl?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  isFeatured: boolean;
  slug: string;
}

export interface ProjectMapSearchResult {
  projects: ProjectMapSummary[];
  requestedArea: string;
  effectiveCoverage: MapCoverageLevel;
  coverageMessage: string;
  districtsIncluded: string[];
  totalResults: number;
}

export interface ProjectMapSummary {
  id: number;
  slug: string;
  name: string;
  type: string;
  phase: string;
  priceFrom: number;
  priceTo?: number;
  currency: string;
  district: string;
  province: string;
  region: string;
  latitude: number;
  longitude: number;
  areaFrom?: number;
  areaTo?: number;
  totalUnits: number;
  availableUnits: number;
  coverImageUrl?: string;
  isFeatured: boolean;
}
