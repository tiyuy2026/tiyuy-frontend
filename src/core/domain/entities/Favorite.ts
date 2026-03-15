export interface Favorite {
  favoriteId: number;
  isFavorite: boolean;
  propertyId: number;
  notes?: string;
  savedAt?: string;
}

export interface FavoritePropertyCard {
  favoriteId: number;
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
  savedAt: string;
  viewsCount?: number;
}
