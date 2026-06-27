'use client';

import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FavoriteRepository } from '@/infrastructure/repositories/FavoriteRepository';
import { useFavoriteStore } from '../store/favoriteStore';
import { toast } from '@/presentation/store/toastStore';

const repo = new FavoriteRepository();

export function useFavoriteStatus(propertyId: number) {
  const { favoritesMap, setFavorite } = useFavoriteStore();

  const query = useQuery({
    queryKey: ['favorite', propertyId],
    queryFn: () => repo.check(propertyId),
    enabled: !!propertyId,
    // En v5: usa placeholderData para inicializar desde store
    placeholderData: favoritesMap[propertyId] ?? false,
  });

  // useEffect desde React, NO TanStack Query
  React.useEffect(() => {
    if (query.data !== undefined) {
      setFavorite(propertyId, query.data);
    }
  }, [query.data, propertyId, setFavorite]);

  return {
    isFavorite: query.data ?? false,
    isLoading: query.isLoading,
  };
}

export function useToggleFavorite(propertyId: number) {
  const queryClient = useQueryClient();
  const { setFavorite } = useFavoriteStore();

  return useMutation({
    mutationFn: (notes?: string) => repo.toggle(propertyId, notes),
    onSuccess: (data: { isFavorite: boolean }) => {
      setFavorite(propertyId, data.isFavorite);
      // Invalida múltiples queries optimizadas
      queryClient.invalidateQueries({ 
        queryKey: ['favorite', propertyId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['favorites', 'list'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['favorites', 'count'] 
      });
      toast.success(
        data.isFavorite 
          ? 'Agregado a favoritos' 
          : 'Eliminado de favoritos'
      );
    },
    onError: () => {
      toast.error('No se pudo actualizar el favorito');
    },
  });
}

export function useFavoritesList(page = 0, size = 12) {
  return useQuery({
    queryKey: ['favorites', 'list', page, size],
    queryFn: () => repo.getMyFavorites(page, size),
  });
}

export function useFavoritesCount() {
  return useQuery({
    queryKey: ['favorites', 'count'],
    queryFn: () => repo.getCount(),
  });
}
