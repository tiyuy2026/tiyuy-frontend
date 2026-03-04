import { create } from 'zustand';

interface FavoriteState {
  favoritesMap: Record<number, boolean>;
  setFavoritesMap: (map: Record<number, boolean>) => void;
  setFavorite: (propertyId: number, isFavorite: boolean) => void;
}

export const useFavoriteStore = create<FavoriteState>((set) => ({
  favoritesMap: {},
  setFavoritesMap: (map) => set({ favoritesMap: map }),
  setFavorite: (propertyId, isFavorite) =>
    set((state) => ({
      favoritesMap: { ...state.favoritesMap, [propertyId]: isFavorite },
    })),
}));
