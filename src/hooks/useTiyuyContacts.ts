import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Tipos de datos del backend
export interface Chat {
  id: number;
  participantName: string;
  participantEmail: string;
  participantAvatar?: string;
  isFavorite: boolean;
  groupName?: string;
  groupDescription?: string;
  groupAvatar?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  type: string;
  isGroupAdmin: boolean;
}

export interface ChatMessage {
  id: number;
  chatId: number;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  content: string;
  type: string;
  mediaUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  replyToMessageId?: number;
  isOwn: boolean;
}

export interface StatusPost {
  id: number;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  content: string;
  mediaUrl?: string;
  location?: string;
  propertyType?: string;
  isActive: boolean;
  expiresAt: string;
  viewCount: number;
  shareCount: number;
  isPromoted: boolean;
  shareLink: string;
  createdAt: string;
  timeRemaining: string;
}

export interface Channel {
  id: number;
  name: string;
  city: string;
  description: string;
  avatar?: string;
  adminName: string;
  adminEmail: string;
  adminAvatar?: string;
  isDefault: boolean;
  isActive: boolean;
  subscriberCount: number;
  shareLink: string;
  isSubscribed: boolean;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  avatar?: string;
  adminName: string;
  adminEmail: string;
  adminAvatar?: string;
  isRestrictedByEmail: boolean;
  isActive: boolean;
  memberCount: number;
  shareLink: string;
  isMember: boolean;
  role: string;
}

// Configuración de API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Hook para obtener chats del usuario
export function useUserChats(filter: 'all' | 'unread' | 'favorites' = 'all', page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['user-chats', filter, page],
    queryFn: async (): Promise<{ content: Chat[]; totalPages: number; totalElements: number }> => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/chats?filter=${filter}&page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los chats');
      }
      
      return response.json();
    },
    staleTime: 1000 * 60, // 1 minuto
  });
}

// Hook para obtener mensajes de un chat
export function useChatMessages(chatId: number, page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['chat-messages', chatId, page],
    queryFn: async (): Promise<{ content: ChatMessage[]; totalPages: number; totalElements: number }> => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/chats/${chatId}/messages?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los mensajes');
      }
      
      return response.json();
    },
    enabled: !!chatId,
    staleTime: 1000 * 30, // 30 segundos
  });
}

// Hook para obtener estados (posts de 48h)
export function useStatusPosts(page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: ['status-posts', page],
    queryFn: async (): Promise<{ content: StatusPost[]; totalPages: number; totalElements: number }> => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/status?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los estados');
      }
      
      return response.json();
    },
    staleTime: 1000 * 60, // 1 minuto
  });
}

// Hook para obtener canales
export function useChannels(page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: ['channels', page],
    queryFn: async (): Promise<{ content: Channel[]; totalPages: number; totalElements: number }> => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/channels?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los canales');
      }
      
      return response.json();
    },
    staleTime: 1000 * 60, // 1 minuto
  });
}

// Hook para obtener grupos
export function useGroups(page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: ['groups', page],
    queryFn: async (): Promise<{ content: Group[]; totalPages: number; totalElements: number }> => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/groups?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los grupos');
      }
      
      return response.json();
    },
    staleTime: 1000 * 60, // 1 minuto
  });
}

// Hook para enviar mensaje
export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ chatId, content, type, mediaUrl }: {
      chatId: number;
      content: string;
      type: string;
      mediaUrl?: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ content, type, mediaUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar mensaje');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['user-chats'] });
      toast.success('Mensaje enviado correctamente');
    },
    onError: (error) => {
      toast.error('Error al enviar el mensaje');
    },
  });
}

// Hook para crear estado
export function useCreateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      content: string;
      mediaUrl?: string;
      location?: string;
      propertyType?: string;
      isPromoted?: boolean;
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear estado');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-posts'] });
      toast.success('Estado creado correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear el estado');
    },
  });
}

// Hook para suscribirse a canal
export function useSubscribeChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (channelId: number) => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/channels/${channelId}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al suscribirse al canal');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Suscrito al canal correctamente');
    },
    onError: (error) => {
      toast.error('Error al suscribirse al canal');
    },
  });
}

// Hook para unirse a grupo
export function useJoinGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupId: number) => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al unirse al grupo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Te has unido al grupo correctamente');
    },
    onError: (error) => {
      toast.error('Error al unirse al grupo');
    },
  });
}

// Hook para crear grupo
export function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      isRestrictedByEmail: boolean;
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear grupo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grupo creado correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear el grupo');
    },
  });
}

// Hook para marcar mensaje como leído
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (chatId: number) => {
      const response = await fetch(`${API_BASE_URL}/api/contacts/extended/chats/${chatId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al marcar como leído');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-chats'] });
    },
    onError: (error) => {
      console.error('Error al marcar como leído:', error);
    },
  });
}
