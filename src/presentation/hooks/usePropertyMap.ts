'use client';

import { useCallback } from 'react';
import { usePropertyMapStore } from '@/presentation/store/propertyMapStore';
import { SearchPropertiesForMapUseCase } from '@/core/domain/use-cases/SearchPropertiesForMapUseCase';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';
import { PropertyFilter } from '@/core/domain/entities/PropertyFilter';

const propertyRepository = new PropertyRepository();
const searchPropertiesForMapUseCase = new SearchPropertiesForMapUseCase(propertyRepository);

export function usePropertyMap() {
  const store = usePropertyMapStore();

  const search = useCallback(async (filters: PropertyFilter) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const result = await searchPropertiesForMapUseCase.execute(filters);
      store.setSearchResult(result);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Error al buscar propiedades en el mapa');
    }
  }, [store]);

  const openMap = useCallback((filters?: PropertyFilter) => {
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
    selectedPropertyId: store.selectedPropertyId,
    filters: store.filters,
    openMap,
    closeMap,
    search,
    selectProperty: store.selectProperty,
    setFilters: store.setFilters,
    reset: store.reset,
  };
}
