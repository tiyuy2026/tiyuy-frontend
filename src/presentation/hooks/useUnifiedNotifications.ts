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

// Hook unificado para todas las notificaciones
export const useUnifiedNotifications = (type?: 'all' | 'general' | 'events') => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  // Query para notificaciones generales
  const generalNotificationsQuery = useQuery({
    queryKey: ['notifications', 'general'],
    queryFn: async () => {
      if (!isAuthenticated || !user) return [];
      
      try {
        // Intentar obtener del backend
        const { data } = await apiClient.get<{content: GeneralNotification[]}>('/notifications/in-app');
        return data.content || [];
      } catch (error) {
        // Sin fallback - si el API falla, devuelve array vacío
        console.error('Error fetching general notifications:', error);
        return [];
      }
    },
    enabled: isAuthenticated && !!user && (type === 'all' || type === 'general' || !type),
    staleTime: 1000 * 60, // 1 minuto
  });

  // Query para notificaciones de eventos
  const eventNotificationsQuery = useQuery({
    queryKey: ['notifications', 'events'],
    queryFn: async () => {
      if (!isAuthenticated || !user) return [];
      
      try {
        const { data } = await apiClient.get<{content: EventNotification[]}>('/notifications/events');
        return data.content || [];
      } catch (error) {
        // Sin fallback - si el API falla, devuelve array vacío
        console.error('Error fetching event notifications:', error);
        return [];
      }
    },
    enabled: isAuthenticated && !!user && (type === 'all' || type === 'events' || !type),
    staleTime: 1000 * 60,
  });

  // Combinar notificaciones según el tipo solicitado
  const allNotifications = [...(generalNotificationsQuery.data || []), ...(eventNotificationsQuery.data || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const notifications = type === 'general' 
    ? generalNotificationsQuery.data || []
    : type === 'events'
    ? eventNotificationsQuery.data || []
    : allNotifications;

  const isLoading = type === 'general' 
    ? generalNotificationsQuery.isPending
    : type === 'events'
    ? eventNotificationsQuery.isPending
    : generalNotificationsQuery.isPending || eventNotificationsQuery.isPending;

  // Mutación para marcar como leído
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        // Backend usa PATCH /notifications/{id}/read
        await apiClient.patch(`/notifications/${notificationId}/read`);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutación para marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      try {
        // Backend usa PATCH /notifications/read-all
        await apiClient.patch('/notifications/read-all');
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
