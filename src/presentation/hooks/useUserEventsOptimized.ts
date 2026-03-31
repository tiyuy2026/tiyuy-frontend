'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../infrastructure/api/axios-client';

type UserEventSection = 'all' | 'upcoming' | 'saved' | 'past';

interface UserEventsOptions {
  userId: number;
  section?: UserEventSection;
  page?: number;
  size?: number;
}

// Hook optimizado que une toda la lógica de eventos del usuario
export const useUserEventsOptimized = ({ userId, section = 'all', page = 0, size = 10 }: UserEventsOptions) => {
  // Determinar el endpoint según la sección
  const getEndpoint = () => {
    switch (section) {
      case 'upcoming':
        return '/contacts/extended/users/events/upcoming';
      case 'past':
        return '/contacts/extended/users/events/past';
      case 'saved':
        return `/contacts/extended/users/events/saved?page=${page}&size=${size}`;
      default:
        return `/contacts/extended/users/events?page=${page}&size=${size}`;
    }
  };

  return useQuery({
    queryKey: ['userEvents', userId, section, page, size],
    queryFn: async () => {
      const endpoint = getEndpoint();
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 segundos
  });
};

// Hook para obtener todas las secciones de eventos del usuario en una sola llamada
export const useAllUserEventsSections = (userId: number) => {
  const allEvents = useUserEventsOptimized({ userId, section: 'all' });
  const upcomingEvents = useUserEventsOptimized({ userId, section: 'upcoming' });
  const pastEvents = useUserEventsOptimized({ userId, section: 'past' });
  const savedEvents = useUserEventsOptimized({ userId, section: 'saved' });

  return {
    all: allEvents,
    upcoming: upcomingEvents,
    past: pastEvents,
    saved: savedEvents,
    
    // Estados combinados
    isLoading: allEvents.isPending || upcomingEvents.isPending || pastEvents.isPending || savedEvents.isPending,
    error: allEvents.error || upcomingEvents.error || pastEvents.error || savedEvents.error,
    
    // Función para obtener eventos según la sección activa
    getEventsBySection: (activeSection: UserEventSection) => {
      switch (activeSection) {
        case 'upcoming':
          return upcomingEvents.data || [];
        case 'saved':
          return savedEvents.data || [];
        case 'past':
          return pastEvents.data || [];
        default:
          return allEvents.data || [];
      }
    },
    
    // Función para obtener loading según la sección activa
    isLoadingBySection: (activeSection: UserEventSection) => {
      switch (activeSection) {
        case 'upcoming':
          return upcomingEvents.isPending;
        case 'saved':
          return savedEvents.isPending;
        case 'past':
          return pastEvents.isPending;
        default:
          return allEvents.isPending;
      }
    },
  };
};
