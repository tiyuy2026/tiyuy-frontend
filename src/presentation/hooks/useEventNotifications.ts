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
        // Si el endpoint no existe, usamos datos mock
        return getMockEventNotifications(user);
      }
    },
    enabled: isAuthenticated && !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        await apiClient.put(`/notifications/events/${notificationId}/read`);
      } catch (error) {
        // Si el endpoint no existe, simulamos éxito
        console.log('Marking notification as read:', notificationId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'events'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiClient.put('/notifications/events/mark-all-read');
      } catch (error) {
        // Si el endpoint no existe, simulamos éxito
        console.log('Marking all event notifications as read');
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

// Función para generar notificaciones mock mientras el endpoint no está disponible
function getMockEventNotifications(user: any): EventNotification[] {
  const mockNotifications: EventNotification[] = [];

  // Notificación de nuevo evento en canal suscrito
  mockNotifications.push({
    id: `event-${user.id}-new-event`,
    title: '🎉 Nuevo evento en "Inmobiliarias Lima"',
    message: 'Open House: Departamento de 3 ambientes en San Isidro. No te lo pierdas este sábado.',
    type: 'EVENT_CREATED',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    eventId: 123,
    channelId: 1,
    eventTitle: 'Open House San Isidro',
    channelName: 'Inmobiliarias Lima'
  });

  // Notificación de recordatorio de evento
  mockNotifications.push({
    id: `event-${user.id}-reminder`,
    title: '⏰ Recordatorio: Evento mañana',
    message: 'La Feria Inmobiliaria 2024 comienza mañana a las 10:00 AM. ¡Prepárate!',
    type: 'EVENT_REMINDER',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    eventId: 456,
    channelId: 2,
    eventTitle: 'Feria Inmobiliaria 2024',
    channelName: 'Eventos Inmobiliarios'
  });

  // Notificación de actualización de evento
  mockNotifications.push({
    id: `event-${user.id}-updated`,
    title: '📝 Evento actualizado',
    message: 'El Webinar "Marketing Digital para Agentes" ha cambiado de horario a las 4:00 PM.',
    type: 'EVENT_UPDATED',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    eventId: 789,
    channelId: 3,
    eventTitle: 'Marketing Digital para Agentes',
    channelName: 'Capacitaciones'
  });

  // Notificación de que alguien se unió a tu evento
  if (user.role === 'AGENT' || user.role === 'INMOBILIARIA') {
    mockNotifications.push({
      id: `event-${user.id}-joined`,
      title: '👥 Nuevo participante en tu evento',
      message: 'Carlos Rodríguez se ha unido a tu Open House. Contacta a los participantes.',
      type: 'EVENT_JOINED',
      read: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      eventId: 101,
      channelId: 1,
      eventTitle: 'Open House Miraflores',
      channelName: 'Inmobiliarias Lima'
    });
  }

  return mockNotifications;
}
