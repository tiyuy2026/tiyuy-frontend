import { PropertyType, TransactionType, Currency,PropertySummary } from './Property';

export interface PropertyFilter {
  // Tipo y transacción
  type?: PropertyType;
  transactionType?: TransactionType;
  
  // Ubicación
  region?: string;
  province?: string;
  district?: string;
  
  // Precio
  minPrice?: number;
  maxPrice?: number;
  currency?: Currency;
  
  // Características
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  minParkingSpots?: number;
  
  // Filtros adicionales
  isFeatured?: boolean;
  isVerified?: boolean;
  
  // Paginación
  page?: number;
  size?: number;
  sort?: string;
  
  // Búsqueda
  keyword?: string;
}

export interface PropertySearchResult {
  properties: PropertySummary[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  seoMetadata?: {
    titleTag: string;
    metaDescription: string;
    canonicalUrl: string;
    keywords: string;
  };
}
