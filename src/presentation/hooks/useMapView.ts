/**
 * 🎨 PRESENTATION - Hook genérico para el Mapa
 * 
 * Hook único que maneja la lógica del mapa para cualquier tipo de entidad.
 * Recibe un "search function" por inyección de dependencias (Strategy Pattern).
 * 
 * Uso:
 *   const map = useMapView({
 *     searchFn: async (filters) => {
 *       const result = await propertyRepo.searchForMap(filters);
 *       return propertyMapResultToGeneric(result);
 *     }
 *   });
 */

'use client';

import { useCallback } from 'react';
import { useMapViewStore } from '@/presentation/store/mapViewStore';
import { MapFilters, MapSearchResult, MapItem } from '@/core/domain/entities/MapTypes';

interface UseMapViewOptions {
  /** Función de búsqueda que recibe filtros y retorna MapSearchResult */
  searchFn: (filters: MapFilters) => Promise<MapSearchResult>;
}

export function useMapView({ searchFn }: UseMapViewOptions) {
  const store = useMapViewStore();

  const search = useCallback(async (filters: MapFilters) => {
    store.setLoading(true);
    store.setError(null);
    try {
      const result = await searchFn(filters);
      store.setSearchResult(result);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Error al buscar en el mapa');
    }
  }, [store, searchFn]);

  const openMap = useCallback((filters?: MapFilters) => {
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
    selectedItemId: store.selectedItemId,
    filters: store.filters,
    openMap,
    closeMap,
    search,
    selectItem: store.selectItem,
    setFilters: store.setFilters,
    reset: store.reset,
  };
}
