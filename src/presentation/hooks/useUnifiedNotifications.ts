'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../../infrastructure/api/axios-client';

// Tipos unificados de notificaciones
type NotificationType = 
  | 'CONTACT' 
  | 'FAVORITE' 
  | 'PROPERTY_PUBLISHED' 
  | 'SUBSCRIPTION_EXPIRING' 
  | 'MARKETING'
  | 'ADMIN_NOTIFICATION'
  | 'EVENT_CREATED' 
  | 'EVENT_UPDATED' 
  | 'EVENT_REMINDER' 
  | 'EVENT_JOINED';

interface BaseNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

interface GeneralNotification extends BaseNotification {
  type: 'CONTACT' | 'FAVORITE' | 'PROPERTY_PUBLISHED' | 'SUBSCRIPTION_EXPIRING' | 'MARKETING' | 'ADMIN_NOTIFICATION';
}

interface EventNotification extends BaseNotification {
  type: 'EVENT_CREATED' | 'EVENT_UPDATED' | 'EVENT_REMINDER' | 'EVENT_JOINED';
  eventId?: number;
  channelId?: number;
  eventTitle?: string;
  channelName?: string;
}

type UnifiedNotification = GeneralNotification | EventNotification;

interface PageResponse<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number;
}

// Hook unificado para todas las notificaciones
export const useUnifiedNotifications = (type?: 'all' | 'general' | 'events') => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  // Query para notificaciones generales - devuelve el objeto completo con content[]
  const generalNotificationsQuery = useQuery({
    queryKey: ['notifications', 'general'],
    queryFn: async (): Promise<PageResponse<GeneralNotification>> => {
      if (!isAuthenticated || !user) return { content: [] };
      
      try {
        const { data } = await apiClient.get<PageResponse<GeneralNotification>>('/notifications/in-app');
        return data || { content: [] };
      } catch (error) {
        console.error('Error fetching general notifications:', error);
        return { content: [] };
      }
    },
    enabled: isAuthenticated && !!user && (type === 'all' || type === 'general' || !type),
    staleTime: 1000 * 60, // 1 minuto
  });

  // Query para notificaciones de eventos
  const eventNotificationsQuery = useQuery({
    queryKey: ['notifications', 'events'],
    queryFn: async (): Promise<PageResponse<EventNotification>> => {
      if (!isAuthenticated || !user) return { content: [] };
      
      try {
        const { data } = await apiClient.get<PageResponse<EventNotification>>('/channel-events');
        return data || { content: [] };
      } catch (error) {
        console.error('Error fetching event notifications:', error);
        return { content: [] };
      }
    },
    enabled: isAuthenticated && !!user && (type === 'all' || type === 'events' || !type),
    staleTime: 1000 * 60,
  });

  // Extraer arrays de forma segura
  const generalNotifications: GeneralNotification[] = generalNotificationsQuery.data?.content ?? [];
  const eventNotifications: EventNotification[] = eventNotificationsQuery.data?.content ?? [];

  // Combinar notificaciones según el tipo solicitado
  const allNotifications: UnifiedNotification[] = [...generalNotifications, ...eventNotifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const notifications: UnifiedNotification[] = type === 'general' 
    ? generalNotifications
    : type === 'events'
    ? eventNotifications
    : allNotifications;

  const isLoading = type === 'general' 
    ? generalNotificationsQuery.isPending
    : type === 'events'
    ? eventNotificationsQuery.isPending
    : generalNotificationsQuery.isPending || eventNotificationsQuery.isPending;

  // Mutación para marcar como leído - SIN optimistic update, espera respuesta real del backend
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await apiClient.post(`/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      // Solo cuando el backend confirma, recargamos los datos reales
      queryClient.invalidateQueries({ queryKey: ['notifications', 'general'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'events'] });
    },
  });

  // Mutación para marcar todas como leídas - SIN optimistic update
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'general'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'events'] });
    },
  });

  // Contador de no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    isLoading,
    error: generalNotificationsQuery.error || eventNotificationsQuery.error,
    unreadCount,
    
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
