import { axiosClient, publicApiClient } from '../api/axios-client';
import { ENDPOINTS } from '../api/endpoints';
import { IFavoriteRepository } from '@/core/domain/repositories/IFavoriteRepository';
import { Favorite, FavoritePropertyCard } from '@/core/domain/entities/Favorite';
import {
  FavoriteToggleResponseDTO,
  FavoritePageDTO,
  FavoriteCountDTO,
  FavoriteCheckDTO,
} from '@/core/application/dtos/FavoriteDTO';

export class FavoriteRepository implements IFavoriteRepository {
  async toggle(propertyId: number, notes?: string): Promise<Favorite> {
    const res = await axiosClient.post<FavoriteToggleResponseDTO>(
      ENDPOINTS.FAVORITES.TOGGLE(propertyId),
      notes ? { notes } : {}
    );
    return {
      favoriteId: res.data.favoriteId,
      isFavorite: res.data.isFavorite,
      propertyId: res.data.propertyId,
      notes: res.data.notes,
    };
  }

  async getMyFavorites(page = 0, size = 12): Promise<{
    content: FavoritePropertyCard[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }> {
    const res = await axiosClient.get<FavoritePageDTO>(ENDPOINTS.FAVORITES.BASE, {
      params: { page, size, sort: 'savedAt,desc' },
    });

    return {
      content: res.data.content.map((item) => ({
        favoriteId: item.favoriteId,
        propertyId: item.propertyId,
        propertySlug: item.propertySlug,
        propertyTitle: item.propertyTitle,
        propertyType: item.propertyType,
        transactionType: item.transactionType,
        price: item.price,
        currency: item.currency,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        totalArea: item.totalArea,
        district: item.district,
        province: item.province,
        coverPhotoUrl: item.coverPhotoUrl,
        isAvailable: item.isAvailable,
        propertyStatus: item.propertyStatus,
        savedAt: item.savedAt,
      })),
      totalElements: res.data.totalElements,
      totalPages: res.data.totalPages,
      page: res.data.number,
      size: res.data.size,
    };
  }

  async getCount(): Promise<number> {
    const res = await axiosClient.get<FavoriteCountDTO>(ENDPOINTS.FAVORITES.COUNT);
    return res.data.count;
  }

  async check(propertyId: number): Promise<boolean> {
    try {
      const res = await axiosClient.get<FavoriteCheckDTO>(
        ENDPOINTS.FAVORITES.CHECK(propertyId)
      );
      return res.data.isFavorite;
    } catch (error: any) {
      // Si es 401 (no autenticado), devolver false silenciosamente
      if (error?.response?.status === 401) {
        return false;
      }
      throw error;
    }
  }

  async checkMultiple(propertyIds: number[]): Promise<Record<number, boolean>> {
    const res = await axiosClient.post<Record<string, boolean>>(
      ENDPOINTS.FAVORITES.CHECK_MULTIPLE,
      propertyIds
    );
    const map: Record<number, boolean> = {};
    Object.entries(res.data).forEach(([key, value]) => {
      map[Number(key)] = value;
    });
    return map;
  }

  async deleteByFavoriteId(favoriteId: number): Promise<void> {
    await axiosClient.delete(`${ENDPOINTS.FAVORITES.BASE}/${favoriteId}`);
  }
}
