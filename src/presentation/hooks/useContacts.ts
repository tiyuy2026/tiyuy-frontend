'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { ContactRepository } from '@/infrastructure/repositories/ContactRepository';
import { SendContactData } from '@/core/domain/entities/Contact';
import { toast } from '@/presentation/store/toastStore';

const contactRepo = new ContactRepository();

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🔍 API Call Details:', {
    endpoint: endpoint,
    fullUrl: url,
    method: options.method || 'GET',
    baseUrl: API_BASE_URL
  });
  
  // Obtener token del authStore si está disponible
  let token = null;
  if (typeof window !== 'undefined') {
    try {
      const { useAuthStore } = require('@/presentation/store/authStore');
      const authStore = useAuthStore.getState();
      token = authStore.token;
      
      // Fallback a localStorage si no hay token en store
      if (!token) {
        token = localStorage.getItem('tiyuy-auth-token') || 
               localStorage.getItem('token') || 
               localStorage.getItem('auth-token');
      }
    } catch {
      // Fallback si hay error con el store
      token = localStorage.getItem('tiyuy-auth-token') || 
             localStorage.getItem('token') || 
             localStorage.getItem('auth-token');
    }
  }
  
  console.log(`API Call: ${options.method || 'GET'} ${url}`);
  console.log('Token available:', !!token);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  
  console.log(`API Response: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    let errorText = 'Unknown error';
    try {
      errorText = await response.text();
    } catch (error) {
      console.warn('Could not read error response:', error);
      errorText = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    console.error('API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      url: url,
      errorText: errorText,
      ok: response.ok,
      type: response.type,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Si es 401, limpiar tokens y redirigir
    if (response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tiyuy-auth-token');
        localStorage.removeItem('token');
        localStorage.removeItem('auth-token');
        try {
          const { useAuthStore } = require('@/presentation/store/authStore');
          useAuthStore.getState().logout();
        } catch {}
        window.location.href = '/login';
      }
    }
    
    // Manejar errores de moderación específicos
    if (response.status === 403 && errorText.includes('USER_SUSPENDED')) {
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: 'Usuario suspendido' };
      }
      throw new Error(errorData.message || 'Usuario suspendido');
    }
    
    throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
}

export function useSendContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendContactData) => contactRepo.sendContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', 'sent'] });
      toast.success('¡Mensaje enviado! El propietario te contactará pronto.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
    },
  });
}

export function useSentContacts(page = 0, size = 20) {
  return useQuery({
    queryKey: ['contacts', 'sent', page, size],
    queryFn: () => contactRepo.getSentContacts(page, size),
  });
}

export function useReceivedContacts(page = 0, size = 20) {
  return useQuery({
    queryKey: ['contacts', 'received', page, size],
    queryFn: () => contactRepo.getReceivedContacts(page, size),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['contacts', 'unread-count'],
    queryFn: () => contactRepo.getUnreadCount(),
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: number) => contactRepo.markAsRead(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', 'received'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', 'unread-count'] });
      toast.success('Mensaje marcado como leído');
    },
    onError: () => {
      toast.error('Error al marcar como leído');
    },
  });
}

// ─── NEW HOOKS FOR THE IMPROVED DESIGN ──────────────────────────────────────

// Chats
export function useGetChats(filter: 'all' | 'unread' | 'favorites' = 'all') {
  return useQuery({
    queryKey: ['chats', filter],
    queryFn: async () => {
      const data = await apiCall(`/contacts/extended/chats?filter=${filter}&size=100`);
      // Normalizar siempre a array
      return Array.isArray(data) ? data : (data?.content ?? []);
    },
    staleTime: 1000 * 60,
  });
}

export function useGetChatMessages(chatId: number, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['chat-messages', chatId],
    queryFn: async () => {
      const data = await apiCall(`/contacts/extended/chats/${chatId}/messages?size=100`);
      // Normalizar siempre a array
      return Array.isArray(data) ? data : (data?.content ?? []);
    },
    enabled: !!chatId && (options.enabled !== false),
    staleTime: 1000 * 30,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, content, type = 'TEXT', mediaUrl, replyToMessageId }: {
      chatId: number;
      content: string;
      type?: string;
      mediaUrl?: string;
      replyToMessageId?: string;
    }) => {
      console.log('🚀 Sending message:', { chatId, content, type, timestamp: Date.now() });
      
      // Obtener token directamente aquí para asegurar que existe
      let token = null;
      if (typeof window !== 'undefined') {
        try {
          const { useAuthStore } = require('@/presentation/store/authStore');
          const authStore = useAuthStore.getState();
          token = authStore.token || localStorage.getItem('tiyuy-auth-token') || localStorage.getItem('token');
        } catch {
          token = localStorage.getItem('tiyuy-auth-token') || localStorage.getItem('token');
        }
      }
      
      console.log('🔑 Token en sendMessage:', !!token);
      
      const url = `/contacts/extended/chats/${chatId}/messages?t=${Date.now()}`;
      return apiCall(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ content, type, mediaUrl, replyToMessageId }),
      });
    },
    onMutate: async ({ chatId, content, type }) => {
      // Optimistic update - agregar mensaje inmediatamente
      await queryClient.cancelQueries({ queryKey: ['chat-messages', chatId] });
      
      const previousMessages = queryClient.getQueryData(['chat-messages', chatId]);
      
      const optimisticMessage = {
        id: Date.now(), // ID temporal
        content,
        type,
        senderId: 1, // ID del usuario actual (debería venir del authStore)
        createdAt: new Date().toISOString(),
        isCurrentlyActive: true,
        isDeleted: false,
        isExpired: false,
        sender: {
          id: 1,
          firstName: 'Tú',
          lastName: '',
          email: '',
        }
      };
      
      queryClient.setQueryData(['chat-messages', chatId], (old: any) => {
        const messages = Array.isArray(old) ? old : (old?.content || []);
        return [...messages, optimisticMessage];
      });
      
      return { previousMessages };
    },
    onError: (error: any, variables, context) => {
      console.error('❌ Error sending message:', error);
      
      // Revertir optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat-messages', variables.chatId], context.previousMessages);
      }
      
      if (error.message.includes('⚠️ ADVERTENCIA')) {
        toast.error(error.message);
      } else if (error.message.includes('suspendido') || error.message.includes('suspensión')) {
        toast.error(error.message);
      } else if (error.message.includes('403')) {
        toast.error('❌ Token inválido. Por favor, inicia sesión nuevamente.');
        // Redirigir al login después de un error 403
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        toast.error(error.message || 'Error al enviar mensaje');
      }
    },
    onSuccess: () => {
      toast.success('✅ Mensaje enviado');
      // Invalidar queries para obtener datos actualizados del servidor
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

export function useMarkChatAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (chatId: number) =>
      apiCall(`/contacts/extended/chats/${chatId}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

export function useToggleFavoriteChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (chatId: number) =>
      apiCall(`/contacts/extended/chats/${chatId}/favorite`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast.success('Chat actualizado');
    },
  });
}

// Status Posts
export function useGetActiveStatusPosts(params: { location?: string } = {}) {
  return useInfiniteQuery({
    queryKey: ['status-posts', params],
    queryFn: ({ pageParam = 0 }) => 
      apiCall(`/contacts/extended/status?page=${pageParam}&size=15${params.location ? `&location=${params.location}` : ''}`),
    getNextPageParam: (lastPage: any) => {
      if (lastPage.last) return undefined;
      return (lastPage.number || 0) + 1;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60,
  });
}

export function useCreateStatusPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { content: string; location?: string; propertyType?: string; isPromoted?: boolean }) =>
      apiCall('/contacts/extended/status', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-posts'] });
      toast.success('Estado publicado');
    },
    onError: () => {
      toast.error('Error al publicar estado');
    },
  });
}

export function useShareStatusPost() {
  return useMutation({
    mutationFn: (postId: number) => apiCall(`/contacts/extended/status/${postId}/share`),
  });
}

export function useCommentStatusPost() {
  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      apiCall(`/contacts/extended/status/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  });
}

export function useStatusComments(statusId: number) {
  return useQuery({
    queryKey: ['status-comments', statusId],
    queryFn: () => apiCall(`/contacts/extended/status/${statusId}/comments`),
    enabled: !!statusId,
    staleTime: 1000 * 60, // 1 minuto
  });
}

// Channels
export function useGetChannels(userId?: number, page = 0, size = 10) {
  return useQuery({
    queryKey: ['channels', userId, page, size],
    queryFn: async () => {
      const data = await apiCall(`/contacts/extended/channels?page=${page}&size=${size}`);
      // Normalizar siempre a array
      return Array.isArray(data) ? data : (data?.content ?? []);
    },
    staleTime: 1000 * 60,
  });
}

export function useSubscribeToChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (channelId: number) =>
      apiCall(`/contacts/extended/channels/${channelId}/subscribe`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Suscrito al canal');
    },
    onError: () => {
      toast.error('Error al suscribirse');
    },
  });
}

export function useUnsubscribeFromChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (channelId: number) =>
      apiCall(`/contacts/extended/channels/${channelId}/unsubscribe`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Suscripción cancelada');
    },
  });
}

// Groups
export function useGetGroups(page = 0, size = 10) {
  return useQuery({
    queryKey: ['groups', page, size],
    queryFn: async () => {
      const data = await apiCall(`/contacts/extended/groups?page=${page}&size=${size}`);
      // Normalizar siempre a array
      return Array.isArray(data) ? data : (data?.content ?? []);
    },
    staleTime: 1000 * 60,
    retry: (failureCount, error: any) => {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; description: string; isRestrictedByEmail: boolean }) =>
      apiCall('/contacts/extended/groups', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grupo creado');
    },
    onError: () => {
      toast.error('Error al crear grupo');
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupId: number) => {
      console.log('Joining group:', groupId);
      return apiCall(`/contacts/extended/groups/${groupId}/join`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Te has unido al grupo');
    },
    onError: (error: any) => {
      console.error('Error joining group:', error);
      if (error.message.includes('Failed to fetch')) {
        toast.error('No se puede conectar al servidor. Verifica que el backend esté corriendo.');
      } else {
        toast.error(error.message || 'Error al unirse al grupo');
      }
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupId: number) => {
      console.log('Leaving group:', groupId);
      return apiCall(`/contacts/extended/groups/${groupId}/leave`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Has abandonado el grupo');
    },
    onError: (error: any) => {
      console.error('Error leaving group:', error);
      if (error.message.includes('Failed to fetch')) {
        toast.error('No se puede conectar al servidor. Verifica que el backend esté corriendo.');
      } else {
        toast.error(error.message || 'Error al abandonar el grupo');
      }
    },
  });
}
