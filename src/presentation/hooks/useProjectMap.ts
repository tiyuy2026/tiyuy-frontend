'use client';

import { useCallback } from 'react';
import { useProjectMapStore } from '@/presentation/store/projectMapStore';
import { SearchProjectsForMapUseCase } from '@/core/domain/use-cases/SearchProjectsForMapUseCase';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';

const projectRepository = new ProjectRepository();
const searchProjectsForMapUseCase = new SearchProjectsForMapUseCase(projectRepository);

export function useProjectMap() {
  const store = useProjectMapStore();

  const search = useCallback(async (filters: {
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
  }) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const result = await searchProjectsForMapUseCase.execute(filters);
      store.setSearchResult(result);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Error al buscar proyectos en el mapa');
    }
  }, [store]);

  const openMap = useCallback((filters?: {
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
  }) => {
    store.open(filters);
    if (filters) {
      search(filters);
    }
  }, [store, search]);

  const closeMap = useCallback(() => {
    store.close();
  }, [store]);

  return {
    isOpen: store.isOpen,
    searchResult: store.searchResult,
    isLoading: store.isLoading,
    error: store.error,
    selectedProjectId: store.selectedProjectId,
    filters: store.filters,
    openMap,
    closeMap,
    search,
    selectProject: store.selectProject,
    setFilters: store.setFilters,
    reset: store.reset,
  };
}
