'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { ContactRepository } from '@/infrastructure/repositories/ContactRepository';
import { SendContactData } from '@/core/domain/entities/Contact';
import { toast } from '@/presentation/store/toastStore';
import { axiosClient } from '@/infrastructure/api/axios-client';

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
  
  console.log(`API Response: ${response?.status} ${response?.statusText}`);
  
  if (!response || !response.ok) {
    let errorText = 'Unknown error';
    let status = response?.status || 'NETWORK_ERROR';
    let statusText = response?.statusText || 'Network Error';
    
    try {
      if (response) {
        errorText = await response.text();
      }
    } catch (error) {
      console.warn('Could not read error response:', error);
      errorText = `HTTP ${status}: ${statusText}`;
    }
    
    console.error('API Error Details:', {
      status: status,
      statusText: statusText,
      url: url,
      errorText: errorText,
      ok: response?.ok || false,
      type: response?.type || 'unknown',
      headers: response ? Object.fromEntries(response.headers.entries()) : {}
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
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => apiCall(`/contacts/extended/status/${postId}/share`, {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-posts'] });
    },
    onError: (error) => {
      console.error('Error detallado useShareStatusPost:', error);
      toast.error('Error al compartir estado');
    },
  });
}

export function useLikeStatusPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => apiCall(`/contacts/extended/status/${postId}/like`, {
      method: 'POST',
    }),
    onSuccess: (data, postId) => {
      // 🔄 Actualizar el estado del post en la cache
      queryClient.setQueryData(['status-posts'], (old: any) => {
        if (!old?.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) =>
            page.map((post: any) => {
              if (post.id === postId) {
                return {
                  ...post,
                  hasUserLiked: data.isCurrentlyActive,
                  likeCount: data.isCurrentlyActive 
                    ? (post.likeCount || 0) + 1 
                    : Math.max((post.likeCount || 0) - 1, 0)
                };
              }
              return post;
            })
          )
        };
      });
      
      // Invalidar para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['status-posts'] });
      
      toast.success(data.isCurrentlyActive ? '¡Like al comentario!' : 'Like eliminado');
    },
    onError: (error) => {
      console.error('Error detallado useLikeStatusPost:', error);
      toast.error('Error al dar me gusta');
    },
  });
}

export function useUnlikeStatusPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => apiCall(`/contacts/extended/status/${postId}/like`, {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-posts'] });
    },
    onError: (error) => {
      console.error('Error detallado useUnlikeStatusPost:', error);
      toast.error('Error al quitar me gusta');
    },
  });
}

export function useCommentStatusPost(statusPostId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, replyToCommentId }: { content: string; replyToCommentId?: number }) =>
      apiCall(`/contacts/extended/status/${statusPostId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ 
          content,
          ...(replyToCommentId && { replyToCommentId })
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status-comments', statusPostId] });
      queryClient.invalidateQueries({ queryKey: ['status-posts'] }); // ← Lista estados
      toast.success('Comentario publicado');
    },
    onError: () => toast.error('Error al publicar comentario'),
  });
}

export function useStatusComments(statusId: number) {
  return useQuery({
    queryKey: ['status-comments', statusId],
    queryFn: async () => {
      console.log('🔍 GET /status/', statusId, '/comments/with-replies'); // ← DEBUG
      const data = await apiCall(`/contacts/extended/status/${statusId}/comments/with-replies`);
      
      // ✅ FIX: Backend devuelve {content: [...]} → Normalizar
      console.log('📥 Raw data:', data); // ← VER ESTO
      
      let comments = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);
      console.log('📋 Normalized comments:', comments.length, comments); // ← VER ESTO
      
      return comments;
    },
    enabled: !!statusId,
    staleTime: 1000 * 30, // 30s
  });
}
      export function useLikeComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: number) => apiCall(`/contacts/extended/status/comments/${commentId}/like`, {
      method: 'POST',
    }),
    onSuccess: (data, commentId) => {
      // 🔄 Actualizar el estado del comentario en la cache
      queryClient.setQueryData(['status-comments'], (old: any) => {
        if (!Array.isArray(old)) return old;
        
        return old.map((comment: any) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              hasUserLiked: data.isCurrentlyActive,
              likeCount: data.isCurrentlyActive 
                ? (comment.likeCount || 0) + 1 
                : Math.max((comment.likeCount || 0) - 1, 0)
            };
          }
          return comment;
        });
      });
      
      // ✅ Invalidar cache DESPUÉS de actualizar para persistencia
      queryClient.invalidateQueries({ queryKey: ['status-comments'] });
      
      toast.success(data.isCurrentlyActive ? '¡Like al comentario!' : 'Like eliminado');
    },
    onError: (error) => {
      console.error('Error detallado useLikeComment:', error);
      toast.error('Error al dar like al comentario');
    },
  });
}

export function useUnlikeComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: number) => apiCall(`/contacts/extended/status/comments/${commentId}/like`, {
      method: 'POST',
    }),
    onSuccess: (_, variables) => {
      // ✅ Invalidar cache para persistencia
      queryClient.invalidateQueries({ queryKey: ['status-comments'] });
    },
    onError: (error) => {
      console.error('Error detallado useUnlikeComment:', error);
      toast.error('Error al quitar me gusta al comentario');
    },
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
      console.log('📋 Groups API response:', data);
      // Normalizar siempre a array
      const groups = Array.isArray(data) ? data : (data?.content ?? []);
      console.log('🔍 Normalized groups:', groups);
      return groups;
    },
    staleTime: 30 * 1000, // 30 segundos para que se actualice más rápido
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
  console.log('🔧 useJoinGroup: Hook initialized');
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupId: number) => {
      console.log('🚀 useJoinGroup: Starting join process for group:', groupId);
      
      const endpoint = `/contacts/extended/groups/${groupId}/join`;
      const baseURL = axiosClient.defaults.baseURL;
      const fullURL = baseURL + endpoint;
      
      console.log('📍 useJoinGroup: baseURL:', baseURL);
      console.log('📍 useJoinGroup: endpoint:', endpoint);
      console.log('📍 useJoinGroup: FULL URL:', fullURL);
      
      const response = await axiosClient.post(endpoint);
      console.log('✅ useJoinGroup: Backend response received:', response.data);
      return response.data;
    },
    onSuccess: (_, groupId) => {
      console.log('✅ Successfully joined group:', groupId);
      // Forzar recarga completa de grupos para actualizar membresía
      queryClient.refetchQueries({ queryKey: ['groups'] }).then(() => {
        console.log('🔄 Groups refetched after joining');
      });
      // También invalidar posts del grupo para que se actualice la membresía
      queryClient.refetchQueries({ queryKey: ['group-posts', groupId] });
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
    mutationFn: async (groupId: number) => {
      console.log('🚀 useLeaveGroup: Starting leave process for group:', groupId);
      console.log('📍 useLeaveGroup: Endpoint:', `/contacts/extended/groups/${groupId}/leave`);
      
      const response = await axiosClient.post(`/contacts/extended/groups/${groupId}/leave`);
      console.log('✅ useLeaveGroup: Backend response received:', response.data);
      return response.data;
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
