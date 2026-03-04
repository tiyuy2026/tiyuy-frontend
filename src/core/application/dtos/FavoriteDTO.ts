export interface FavoriteToggleResponseDTO {
  favoriteId: number;
  isFavorite: boolean;
  propertyId: number;
  notes?: string;
}

export interface FavoriteCountDTO {
  count: number;
}

export interface FavoriteCheckDTO {
  isFavorite: boolean;
}

export interface FavoriteListItemDTO {
  favoriteId: number;
  savedAt: string;
  notes?: string;
  propertyId: number;
  propertySlug: string;
  propertyTitle: string;
  propertyType: string;
  transactionType: string;
  price: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  totalArea?: number;
  district: string;
  province: string;
  coverPhotoUrl?: string;
  isAvailable: boolean;
  propertyStatus: string;
}

export interface FavoritePageDTO {
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  content: FavoriteListItemDTO[];
}
