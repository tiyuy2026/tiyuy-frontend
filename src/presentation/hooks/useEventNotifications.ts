'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../../infrastructure/api/axios-client';

interface EventNotification {
  id: string;
  title: string;
  message: string;
  type: 'EVENT_CREATED' | 'EVENT_UPDATED' | 'EVENT_REMINDER' | 'EVENT_JOINED';
  read: boolean;
  createdAt: string;
  eventId?: number;
  channelId?: number;
  eventTitle?: string;
  channelName?: string;
}

export const useEventNotifications = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'events'],
    queryFn: async () => {
      if (!isAuthenticated || !user) return [];
      
      try {
        const { data } = await apiClient.get<EventNotification[]>('/notifications/events');
        return data;
      } catch (error) {
        console.error('Error fetching event notifications:', error);
        return [];
      }
    },
    enabled: isAuthenticated && !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        // Backend de eventos espera PUT (no PATCH como las notificaciones generales)
        await apiClient.put(`/notifications/events/${notificationId}/read`);
      } catch (error) {
        console.error('Error marking event notification as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'events'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      try {
        // Backend de eventos espera PUT
        await apiClient.put('/notifications/events/mark-all-read');
      } catch (error) {
        console.error('Error marking all event notifications as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'events'] });
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isPending,
    error: notificationsQuery.error,
    
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    
    unreadCount: notificationsQuery.data?.filter((n: EventNotification) => !n.read).length || 0,
  };
};
