'use client';
import { useMutation } from '@tanstack/react-query';
import { SearchTrackingRepository, SearchTrackingData } from '../../infrastructure/repositories/SearchTrackingRepository';

const repo = new SearchTrackingRepository();

export const useSearchTracking = () => {
  const trackSearchMutation = useMutation({
    mutationFn: (searchData: SearchTrackingData) => repo.trackSearch(searchData),
    onError: (error) => {
      console.error('Error tracking search:', error);
    },
  });

  const trackSearch = (searchData: SearchTrackingData) => {
    // Solo hacer tracking si el usuario está autenticado
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        trackSearchMutation.mutate(searchData);
      }
    }
  };

  return {
    trackSearch,
    isTracking: trackSearchMutation.isPending,
  };
};
