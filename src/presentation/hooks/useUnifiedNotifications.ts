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
  type: 'CONTACT' | 'FAVORITE' | 'PROPERTY_PUBLISHED' | 'SUBSCRIPTION_EXPIRING' | 'MARKETING';
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
        const { data } = await apiClient.get<GeneralNotification[]>('/notifications/general');
        return data;
      } catch (error) {
        // Fallback a datos mock
        return getMockGeneralNotifications(user);
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
        const { data } = await apiClient.get<EventNotification[]>('/notifications/events');
        return data;
      } catch (error) {
        // Fallback a datos mock
        return getMockEventNotifications(user);
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
        // Intentar marcar en el backend
        await apiClient.put(`/notifications/${notificationId}/read`);
      } catch (error) {
        // Si falla, solo logueamos
        console.log('Marking notification as read:', notificationId);
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
        await apiClient.put('/notifications/read-all');
      } catch (error) {
        console.log('Marking all notifications as read');
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

// Mock data para notificaciones generales
function getMockGeneralNotifications(user: any): GeneralNotification[] {
  const notifications: GeneralNotification[] = [];

  // Notificación de bienvenida
  notifications.push({
    id: `user-${user.id}-welcome`,
    title: '¡Bienvenido a TIYUY!',
    message: `Gracias por unirte a nuestra plataforma, ${user.firstName || 'usuario'}. Encuentra la propiedad de tus sueños.`,
    type: 'MARKETING',
    read: false,
    createdAt: new Date().toISOString()
  });

  // Notificación de nuevas propiedades
  if (user.role === 'USER' || user.role === 'AGENT') {
    notifications.push({
      id: `user-${user.id}-new-properties`,
      title: '🏠 Nuevas propiedades disponibles',
      message: 'Hemos encontrado 5 nuevas propiedades que coinciden con tus criterios de búsqueda.',
      type: 'PROPERTY_PUBLISHED',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    });
  }

  return notifications;
}

// Mock data para notificaciones de eventos
function getMockEventNotifications(user: any): EventNotification[] {
  const notifications: EventNotification[] = [];

  // Notificación de nuevo evento
  notifications.push({
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

  // Notificación de recordatorio
  notifications.push({
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

  // Notificación de actualización
  notifications.push({
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

  // Notificación de unión a evento (solo para agentes)
  if (user.role === 'AGENT' || user.role === 'INMOBILIARIA') {
    notifications.push({
      id: `event-${user.id}-joined`,
      title: '👥 Nuevo participante en tu evento',
      message: 'Carlos Rodríguez se ha unido a tu Open House este sábado.',
      type: 'EVENT_JOINED',
      read: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      eventId: 123,
      channelId: 1,
      eventTitle: 'Open House San Isidro',
      channelName: 'Inmobiliarias Lima'
    });
  }

  return notifications;
}
