import { Favorite, FavoritePropertyCard } from '../entities/Favorite';

export interface IFavoriteRepository {
  toggle(propertyId: number, notes?: string): Promise<Favorite>;
  getMyFavorites(page?: number, size?: number): Promise<{
    content: FavoritePropertyCard[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }>;
  getCount(): Promise<number>;
  check(propertyId: number): Promise<boolean>;
  checkMultiple(propertyIds: number[]): Promise<Record<number, boolean>>;
  deleteByFavoriteId(favoriteId: number): Promise<void>;
}
