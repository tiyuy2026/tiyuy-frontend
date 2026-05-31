import { create } from 'zustand';
import { ProjectMapSearchResult } from '@/core/domain/entities/PropertyMapResult';

interface ProjectMapState {
  isOpen: boolean;
  searchResult: ProjectMapSearchResult | null;
  isLoading: boolean;
  error: string | null;
  selectedProjectId: number | null;
  filters: {
    district?: string;
    province?: string;
    region?: string;
    type?: string;
    phase?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    isFeatured?: boolean;
  };

  // Actions
  open: (filters?: ProjectMapState['filters']) => void;
  close: () => void;
  setSearchResult: (result: ProjectMapSearchResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectProject: (id: number | null) => void;
  setFilters: (filters: Partial<ProjectMapState['filters']>) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  searchResult: null,
  isLoading: false,
  error: null,
  selectedProjectId: null,
  filters: {},
};

export const useProjectMapStore = create<ProjectMapState>((set) => ({
  ...initialState,

  open: (filters) =>
    set({ isOpen: true, filters: filters || {}, searchResult: null, error: null }),

  close: () => set({ isOpen: false }),

  setSearchResult: (result) =>
    set({ searchResult: result, isLoading: false, error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  selectProject: (id) => set({ selectedProjectId: id }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  reset: () => set(initialState),
}));
