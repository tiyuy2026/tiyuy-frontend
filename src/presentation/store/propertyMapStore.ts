import { create } from 'zustand';
import { MapSearchResult } from '@/core/domain/entities/Property';

interface PropertyMapState {
  isOpen: boolean;
  searchResult: MapSearchResult | null;
  isLoading: boolean;
  error: string | null;
  selectedPropertyId: number | null;
  filters: {
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
  };

  // Actions
  open: (filters?: PropertyMapState['filters']) => void;
  close: () => void;
  setSearchResult: (result: MapSearchResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectProperty: (id: number | null) => void;
  setFilters: (filters: Partial<PropertyMapState['filters']>) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  searchResult: null,
  isLoading: false,
  error: null,
  selectedPropertyId: null,
  filters: {},
};

export const usePropertyMapStore = create<PropertyMapState>((set) => ({
  ...initialState,

  open: (filters) =>
    set({ isOpen: true, filters: filters || {}, searchResult: null, error: null }),

  close: () => set({ isOpen: false }),

  setSearchResult: (result) =>
    set({ searchResult: result, isLoading: false, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  selectProperty: (id) => set({ selectedPropertyId: id }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  reset: () => set(initialState),
}));
