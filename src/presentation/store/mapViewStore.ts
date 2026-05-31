/**
 * 🎨 PRESENTATION - Store genérico para el Mapa
 * 
 * Store único que maneja el estado del mapa para cualquier tipo de entidad
 * (propiedades, proyectos, etc.). Sigue el principio DRY.
 */

import { create } from 'zustand';
import { MapItem, MapSearchResult, MapFilters } from '@/core/domain/entities/MapTypes';

interface MapViewState {
  // Estado
  isOpen: boolean;
  searchResult: MapSearchResult | null;
  isLoading: boolean;
  error: string | null;
  selectedItemId: number | null;
  filters: MapFilters;

  // Actions
  open: (filters?: MapFilters) => void;
  close: () => void;
  setSearchResult: (result: MapSearchResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectItem: (id: number | null) => void;
  setFilters: (filters: Partial<MapFilters>) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  searchResult: null,
  isLoading: false,
  error: null,
  selectedItemId: null,
  filters: {},
};

export const useMapViewStore = create<MapViewState>((set) => ({
  ...initialState,

  open: (filters) =>
    set({ isOpen: true, filters: filters || {}, searchResult: null, error: null }),

  close: () => set({ isOpen: false }),

  setSearchResult: (result) =>
    set({ searchResult: result, isLoading: false, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  selectItem: (id) => set({ selectedItemId: id }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  reset: () => set(initialState),
}));
