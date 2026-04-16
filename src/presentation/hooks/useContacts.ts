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
  // Asegurar que no haya doble /api si API_BASE_URL ya lo incluye
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  

  let token = null;

  if (typeof window !== 'undefined') {

    try {

      const { useAuthStore } = require('@/presentation/store/authStore');

      const authStore = useAuthStore.getState();

      token = authStore.token;

      

      if (!token) {

        token = localStorage.getItem('tiyuy-auth-token') || 

               localStorage.getItem('token') || 

               localStorage.getItem('auth-token');

      }

    } catch {

      token = localStorage.getItem('tiyuy-auth-token') || 

             localStorage.getItem('token') || 

             localStorage.getItem('auth-token');

    }

  }

  

  const response = await fetch(url, {

    headers: {

      'Content-Type': 'application/json',

      ...(token && { 'Authorization': `Bearer ${token}` }),

      ...options.headers,

    },

    ...options,

  });

  

  if (!response || !response.ok) {

    let errorText = 'Unknown error';

    let status = response?.status || 'NETWORK_ERROR';

    let statusText = response?.statusText || 'Network Error';

    

    try {

      if (response) {

        errorText = await response.text();

        // Intentar parsear como JSON para mostrar errores estructurados

        try {

          const errorData = JSON.parse(errorText);

          if (errorData.code === 'INTERNAL_ERROR') {

            errorText = `Error interno del backend: ${errorData.message || 'Error no especificado'}`;

          }

        } catch {

          // Si no es JSON, usar el texto original

        }

      }

    } catch (error) {

      errorText = `HTTP ${status}: ${statusText}`;

    }

    

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

    

    if (response?.status === 403 && errorText.includes('USER_SUSPENDED')) {

      let errorData;

      try {

        errorData = JSON.parse(errorText);

      } catch {

        errorData = { message: 'Usuario suspendido' };

      }

      throw new Error(errorData.message || 'Usuario suspendido');

    }

    

    // Para errores 500 internos del backend, devolver un error especial

    if (response?.status === 500 && errorText.includes('INTERNAL_ERROR')) {

      const errorData = JSON.parse(errorText);

      throw new Error(`Error interno del backend: ${errorData.message || 'Error no especificado'}`);

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



async function apiCallWithFallback(url: string, options: RequestInit = {}, fallbackValue: any = null) {

  try {

    return await apiCall(url, options);

  } catch (error: any) {

    console.error("Backend error:", error);

    throw error; // Lanzar el error para que React Query lo capture

  }

}



export function useGetChatMessages(chatId: number, options: { enabled?: boolean } = {}) {

  return useQuery({

    queryKey: ['chat-messages', chatId],

    queryFn: async () => {

      const data = await apiCallWithFallback(

        `/contacts/extended/chats/${chatId}/messages?size=100`,

        {},

        [] // fallback: array vacío

      );

      // Normalizar siempre a array

      return Array.isArray(data) ? data : (data?.content ?? []);

    },

    enabled: !!chatId && (options.enabled !== false),

    staleTime: 1000 * 30,

    retry: false, // Desactivar reintentos para evitar bucles

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

    onMutate: async ({ chatId, content, type, replyToMessageId }) => {
      // Cancelar refetches en curso
      await queryClient.cancelQueries({ queryKey: ['chat-messages', chatId] });

      const previousMessages = queryClient.getQueryData(['chat-messages', chatId]);

      // Agregar mensaje temporal INMEDIATAMENTE
      const tempMessage = {
        id: `temp-${Date.now()}`,
        chatId,
        content,
        type: type || 'TEXT',
        isOwn: true,
        createdAt: new Date().toISOString(),
        replyToMessageId: replyToMessageId || null,
        replyToContent: null,
        replyToSenderName: null,
        sending: true,
      };

      queryClient.setQueryData(['chat-messages', chatId], (old: any) => [
        ...(Array.isArray(old) ? old : []),
        tempMessage,
      ]);

      return { previousMessages, chatId };
    },

    onSuccess: (newMessage, { chatId }) => {
      // Reemplazar el temporal con el real
      queryClient.setQueryData(['chat-messages', chatId], (old: any) =>
        (Array.isArray(old) ? old : []).map((m: any) =>
          String(m.id).startsWith('temp-') ? { ...newMessage, sending: false } : m
        )
      );
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },

    onError: (error: any, _vars, context) => {
      // Revertir si falla
      if (context?.previousMessages !== undefined) {
        queryClient.setQueryData(
          ['chat-messages', context.chatId],
          context.previousMessages
        );
      }

      if (error.message.includes('suspendido') || error.message.includes('suspension')) {
        toast.error(error.message);
      } else if (error.message.includes('403')) {
        toast.error('Token inválido. Por favor, inicia sesión nuevamente.');
        if (typeof window !== 'undefined') window.location.href = '/login';
      } else {
        toast.error(error.message || 'Error al enviar mensaje');
      }
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

      //  Actualizar el estado del post en la cache

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

      const data = await apiCall(`/contacts/extended/status/${statusId}/comments/with-replies`);

      

      let comments = Array.isArray(data) ? data : (data?.content ?? data?.data ?? []);

      return comments;

    },

    enabled: !!statusId,

    staleTime: 1000 * 30,

  });

}

      export function useLikeComment() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: (commentId: number) => apiCall(`/contacts/extended/status/comments/${commentId}/like`, {

      method: 'POST',

    }),

    onSuccess: (data, commentId) => {

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

      

      queryClient.invalidateQueries({ queryKey: ['status-comments'] });

      

      toast.success(data.isCurrentlyActive ? 'Like al comentario!' : 'Like eliminado');

    },

    onError: (error) => {

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

      queryClient.invalidateQueries({ queryKey: ['status-comments'] });

    },

    onError: (error) => {

      toast.error('Error al quitar me gusta al comentario');

    },

  });

}



// Channels

export function useGetChannels(userId?: number, page = 0, size = 10) {

  return useQuery({

    queryKey: ['channels', userId, page, size],

    queryFn: async () => {

      const data = await apiCall(`/contacts/extended/channels?page=${page}&size=${size}&sort=subscriberCount,desc`);

      // Backend devuelve Page<ChannelResponse> → usar .content

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

    onError: (error: any) => {

      // Don't show error if already subscribed - component handles retry

      if (!error.message?.includes('already subscribed') && 

          !error.message?.includes('ya estás suscrito') &&

          !error.message?.includes('ya eres miembro')) {

        toast.error('Error al suscribirse');

      }

    },

  });

}



export function useUnsubscribeFromChannel() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: (channelId: number) =>

      apiCall(`/contacts/extended/channels/${channelId}/subscribe`, { method: 'DELETE' }),

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

      const groups = Array.isArray(data) ? data : (data?.content ?? []);

      return groups;

    },

    staleTime: 30 * 1000,

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

    mutationFn: async (groupId: number) => {

      const response = await axiosClient.post(`/contacts/extended/groups/${groupId}/join`);

      return response.data;

    },

    onSuccess: (_, groupId) => {

      queryClient.refetchQueries({ queryKey: ['groups'] });

      queryClient.refetchQueries({ queryKey: ['group-posts', groupId] });

      toast.success('Te has unido al grupo');

    },

    onError: (error: any) => {

      if (error.message.includes('Failed to fetch')) {

        toast.error('No se puede conectar al servidor. Verifica que el backend este corriendo.');

      } else {

        toast.error(error.message || 'Error al unirse al grupo');

      }

    },

  });

}



// Channel Posts and Interactions

export function useChannelPosts(channelId: number) {

  return useQuery({

    queryKey: ['channel-posts', channelId],

    queryFn: async () => {

      const data = await apiCall(`/contacts/extended/channels/${channelId}/posts?page=0&size=20`);

      return Array.isArray(data) ? data : (data?.content ?? []);

    },

    staleTime: 30 * 1000,

    enabled: !!channelId,

  });

}



export function useChannelInteractions(channelId: number, currentUserId?: number) {

  const queryClient = useQueryClient();

  

  const likePost = useMutation({

    mutationFn: (postId: number) =>

      apiCall(`/contacts/extended/channels/${channelId}/posts/${postId}/like`, { method: 'POST' }),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['channel-posts'] });

    },

    onError: () => {

      toast.error('Error al dar like');

    },

  });



  const sharePost = useMutation({

    mutationFn: ({ postId, message }: { postId: number; message?: string }) =>

      apiCall(`/contacts/extended/channels/${channelId}/posts/${postId}/share`, {

        method: 'POST',

        body: JSON.stringify({ shareMessage: message }),

      }),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['channel-posts'] });

      toast.success('Post compartido');

    },

    onError: () => {

      toast.error('Error al compartir post');

    },

  });



  return {

    likePost: likePost.mutate,

    sharePost: sharePost.mutate,

    isLikingPost: likePost.isPending,

    isSharingPost: sharePost.isPending,

  };

}



export function useCreateChannelPost() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ channelId, postData }: { channelId: number; postData: any }) => {

      return await apiCall(`/contacts/extended/channels/${channelId}/posts`, {

        method: 'POST',

        body: JSON.stringify(postData),

      });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['channel-posts'] });

      toast.success('Post creado exitosamente');

    },

    onError: (error: any) => {

      toast.error(error.message || 'Error al crear post');

    },

  });

}



export function useCreateChannel() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async (data: { name: string; city: string; description: string; avatar?: string }) =>

      apiCall('/contacts/extended/channels', {

        method: 'POST',

        body: JSON.stringify(data),

      }),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['channels'] });

    },

    onError: (error: any) => {

      if (error.message.includes('403')) {

        toast.error('No tienes permiso para crear canales');

      } else {

        toast.error(error.message || 'Error al crear canal');

      }

    },

  });

}



export function useLeaveGroup() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async (groupId: number) => {

      const response = await axiosClient.post(`/contacts/extended/groups/${groupId}/leave`);

      return response.data;

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['groups'] });

      toast.success('Has abandonado el grupo');

    },

    onError: (error: any) => {

      if (error.message.includes('Failed to fetch')) {

        toast.error('No se puede conectar al servidor. Verifica que el backend este corriendo.');

      } else {

        toast.error(error.message || 'Error al abandonar el grupo');

      }

    },

  });

}



// ==================== CHANNEL EVENTS ====================



// ==================== CHANNEL EVENTS WITH DYNAMIC FILTERS ====================



export function useChannelEventsWithFilters(

  channelId: number, 

  filters: {

    eventType?: string;

    city?: string;

    featured?: boolean;

    dateFilter?: string;

    location?: string;

  } = {},

  page = 0, 

  size = 9

) {

  // Build query string from filters

  const params = new URLSearchParams();

  if (filters.eventType) params.append('eventType', filters.eventType);

  if (filters.city) params.append('city', filters.city);

  if (filters.featured !== undefined) params.append('featured', filters.featured.toString());

  if (filters.dateFilter) params.append('dateFilter', filters.dateFilter);

  if (filters.location) params.append('location', filters.location);

  params.append('page', page.toString());

  params.append('size', size.toString());

  

  const queryString = params.toString();

  

  return useQuery({

    queryKey: ['channelEvents', channelId, filters, page, size],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/channels/${channelId}/events?${queryString}`);

      

      // Spring Data Page devuelve los datos en .content

      if (response.data && typeof response.data === 'object' && 'content' in response.data) {

        return response.data;

      }

      

      return response.data;

    },

    enabled: !!channelId,

    staleTime: 1000 * 30, // 30 seconds

  });

}



export function useChannelEventsForSubscribedUser(channelId: number, page = 0, size = 9) {

  return useQuery({

    queryKey: ['channelEventsSubscribed', channelId, page, size],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/channels/${channelId}/events/subscribed?page=${page}&size=${size}`);

      

      // Spring Data Page devuelve los datos en .content

      if (response.data && typeof response.data === 'object' && 'content' in response.data) {

        return response.data;

      }

      

      return response.data;

    },

    enabled: !!channelId,

    staleTime: 1000 * 30, // 30 seconds

  });

}



export function useChannelEventsBySubscriberCount(channelId: number, page = 0, size = 9) {

  return useQuery({

    queryKey: ['channelEventsFeatured', channelId, page, size],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/channels/${channelId}/events/featured?page=${page}&size=${size}`);

      

      // Spring Data Page devuelve los datos en .content

      if (response.data && typeof response.data === 'object' && 'content' in response.data) {

        return response.data;

      }

      

      return response.data;

    },

    enabled: !!channelId,

    staleTime: 1000 * 30, // 30 seconds

  });

}



export function useUserSubscribedEvents(userId: number) {

  return useQuery({

    queryKey: ['userSubscribedEvents', userId],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/users/events/subscribed?page=0&size=50`);

      

      // Spring Data Page devuelve los datos en .content

      if (response.data && typeof response.data === 'object' && 'content' in response.data) {

        return response.data.content;

      }

      

      return Array.isArray(response.data) ? response.data : [];

    },

    enabled: !!userId,

    staleTime: 1000 * 30, // 30 seconds

  });

}



export function useUserEvents(userId?: number, page = 0, size = 10) {

  return useQuery({

    queryKey: ['userEvents', userId, page, size],

    queryFn: async () => {

      console.log('=== useUserEvents API CALL ===');

      console.log('Calling: /contacts/extended/users/events?page=', page, '&size=', size);

      console.log('UserId:', userId);

      

      const response = await axiosClient.get(`/contacts/extended/users/events?page=${page}&size=${size}`);

      

      console.log('=== useUserEvents RESPONSE ===');

      console.log('Response data:', response.data);

      console.log('Response status:', response.status);

      

      if (response.data) {

        console.log('Total elements:', response.data.totalElements);

        console.log('Content length:', response.data.content?.length);

        

        if (response.data.content) {

          console.log('Eventos recibidos:');

          response.data.content.forEach((event: any, index: number) => {

            console.log(`  ${index + 1}. ID: ${event.id}, Title: ${event.title}, Channel: ${event.channelId || event.channel?.id}`);

          });

        }

      }

      console.log('=== END useUserEvents DEBUG ===');

      

      return response.data;

    },

    enabled: !!userId,

    staleTime: 1000 * 30, // 30 seconds

    refetchOnWindowFocus: false,

    refetchOnMount: false,

  });

}



export function useUserUpcomingEvents(userId?: number) {

  return useQuery({

    queryKey: ['userUpcomingEvents', userId],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/users/events/upcoming`);

      return response.data;

    },

    enabled: !!userId,

    staleTime: 1000 * 30,

  });

}



export function useUserPastEvents(userId?: number) {

  return useQuery({

    queryKey: ['userPastEvents', userId],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/users/events/past`);

      return response.data;

    },

    enabled: !!userId,

    staleTime: 1000 * 30,

  });

}



export function useUserSavedEvents(userId?: number) {

  return useQuery({

    queryKey: ['userSavedEvents', userId],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/users/events/saved`);

      return response.data;

    },

    enabled: !!userId,

    staleTime: 1000 * 30,

  });

}



export function useChannelEvents(channelId: number, page = 0, size = 9) {

  return useQuery({

    queryKey: ['channelEvents', channelId, page, size],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/channels/${channelId}/events?page=${page}&size=${size}`);

      return response.data;

    },

    enabled: !!channelId,

  });

}



export function useChannelUpcomingEvents(channelId: number) {

  return useQuery({

    queryKey: ['channelUpcomingEvents', channelId],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/channels/${channelId}/events/upcoming`);

      return response.data;

    },

    enabled: !!channelId,

  });

}



export function useGetChannelEvent(channelId: number, eventId: number) {

  return useQuery({

    queryKey: ['channel-event', channelId, eventId],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/channels/${channelId}/events/${eventId}`);

      return response.data;

    },

    enabled: !!channelId && !!eventId,

  });

}



export function useCreateChannelEvent() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async (data: any) => {

      const response = await axiosClient.post(`/contacts/extended/channels/${data.channelId}/events`, data);

      return response.data;

    },

    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ['channelEvents', variables.channelId] });

      queryClient.invalidateQueries({ queryKey: ['channelUpcomingEvents', variables.channelId] });

      toast.success('Evento creado exitosamente');

    },

    onError: (error: any) => {

      toast.error(error.message || 'Error al crear evento');

    },

  });

}



export function useRespondToEvent(channelId: number) {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ eventId, responseStatus, responseMessage, numberOfGuests }: { 

      eventId: number; 

      responseStatus: string;

      responseMessage?: string;

      numberOfGuests?: number;

    }) => {

      const response = await axiosClient.post(

        `/contacts/extended/channels/${channelId}/events/${eventId}/respond`, 

        { responseStatus, responseMessage, numberOfGuests }

      );

      return response.data;

    },

    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ['channelEvents', channelId] });

      queryClient.invalidateQueries({ queryKey: ['channelUpcomingEvents', channelId] });

      queryClient.invalidateQueries({ queryKey: ['channel-event-attendees', channelId, variables.eventId] });

      queryClient.invalidateQueries({ queryKey: ['channel-event', channelId, variables.eventId] });

      toast.success('Respuesta registrada exitosamente');

    },

    onError: (error: any) => {

      toast.error(error.message || 'Error al responder al evento');

    },

  });

}



export function useDeleteChannelEvent() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ channelId, eventId }: { channelId: number; eventId: number }) => {

      await axiosClient.delete(`/contacts/extended/channels/${channelId}/events/${eventId}`);

    },

    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ['channelEvents', variables.channelId] });

      queryClient.invalidateQueries({ queryKey: ['channelUpcomingEvents', variables.channelId] });

      toast.success('Evento eliminado exitosamente');

    },

    onError: (error: any) => {

      toast.error(error.message || 'Error al eliminar evento');

    },

  });

}



export function useUpdateChannelEvent() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ channelId, eventId, eventData }: { channelId: number; eventId: number; eventData: any }) => {

      const response = await axiosClient.put(`/contacts/extended/channels/${channelId}/events/${eventId}`, eventData);

      return response.data;

    },

    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ['channelEvents', variables.channelId] });

      queryClient.invalidateQueries({ queryKey: ['channelUpcomingEvents', variables.channelId] });

      queryClient.invalidateQueries({ queryKey: ['userEvents', variables.eventId] });

      toast.success('Evento actualizado exitosamente');

    },

    onError: (error: any) => {

      toast.error(error.message || 'Error al actualizar evento');

    },

  });

}



// ==================== CHANNEL SUBSCRIBERS ====================



export function useChannelSubscribers(channelId: number) {

  return useQuery({

    queryKey: ['channelSubscribers', channelId],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/channels/${channelId}/subscribers?size=5`);

      return response.data;

    },

    enabled: !!channelId,

  });

}



export function useGetChannelEventAttendees(channelId: number, eventId: number) {

  return useQuery({

    queryKey: ['channel-event-attendees', channelId, eventId],

    queryFn: () => apiCall(`/contacts/extended/channels/${channelId}/events/${eventId}/attendees`),

    enabled: !!channelId && !!eventId,

  });

}



export function useGetChannelEventResponses(channelId: number, eventId: number) {

  return useQuery({

    queryKey: ['channel-event-responses', channelId, eventId],

    queryFn: () => apiCall(`/contacts/extended/channels/${channelId}/events/${eventId}/responses`),

    enabled: !!channelId && !!eventId,

  });

}



export function useRsvpChannelEvent(channelId: number) {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: (eventId: number) =>

      apiCall(`/contacts/extended/channels/${channelId}/events/${eventId}/respond`, { 

        method: 'POST',

        body: JSON.stringify({ responseStatus: 'ATTENDING' })

      }),

    onSuccess: (_, eventId) => {

      qc.invalidateQueries({ queryKey: ['channelEvents', channelId] });

      qc.invalidateQueries({ queryKey: ['channel-event-attendees', channelId, eventId] });

      qc.invalidateQueries({ queryKey: ['channel-event', channelId, eventId] });

      toast.success('Asistencia confirmada');

    },

    onError: (error: any) => {

      // Don't show toast for subscription errors - handled by component

      if (!error.message?.includes('must be subscribed') && !error.message?.includes('403')) {

        toast.error(error.message || 'Error al confirmar asistencia');

      }

    },

  });

}



export function useCancelRsvpChannelEvent(channelId: number) {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: (eventId: number) =>

      apiCall(`/contacts/extended/channels/${channelId}/events/${eventId}/responses`, { 

        method: 'DELETE'

      }),

    onSuccess: (_, eventId) => {

      qc.invalidateQueries({ queryKey: ['channelEvents', channelId] });

      qc.invalidateQueries({ queryKey: ['channel-event-attendees', channelId, eventId] });

      qc.invalidateQueries({ queryKey: ['channel-event', channelId, eventId] });

      toast.success('Asistencia cancelada');

    },

    onError: (error: any) => {

      toast.error(error.message || 'Error al cancelar asistencia');

    },

  });

}



export function useInterestedChannelEvent(channelId: number) {

  const qc = useQueryClient();

  return useMutation({

    mutationFn: (eventId: number) =>

      apiCall(`/contacts/extended/channels/${channelId}/events/${eventId}/respond`, { 

        method: 'POST',

        body: JSON.stringify({ responseStatus: 'INTERESTED' })

      }),

    onSuccess: (_, eventId) => {

      qc.invalidateQueries({ queryKey: ['channelEvents', channelId] });

      qc.invalidateQueries({ queryKey: ['channel-event-attendees', channelId, eventId] });

      qc.invalidateQueries({ queryKey: ['channel-event', channelId, eventId] });

      toast.success('Interés registrado');

    },

    onError: (error: any) => {

      toast.error(error.message || 'Error al registrar interés');

    },

  });

}



// ==================== USER CREATED EVENTS ====================



export function useGetMyCreatedEvents(userId?: number, page = 0, size = 20) {

  return useQuery({

    queryKey: ['my-created-events', userId, page, size],

    queryFn: async () => {

      if (!userId) return [];

      const response = await axiosClient.get(`/contacts/extended/users/${userId}/events?page=${page}&size=${size}`);

      const data = response.data;

      return Array.isArray(data) ? data : (data?.content ?? []);

    },

    enabled: !!userId,

    staleTime: 1000 * 30, // 30 seconds

  });

}



// ==================== CHANNEL EVENT IMAGES ====================



export function useUploadChannelEventImages() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ channelId, eventId, files }: { channelId: number; eventId: number; files: File[] }) => {

      const formData = new FormData();

      files.forEach(file => formData.append('files', file));

      

      const response = await fetch(`${API_BASE_URL}/contacts/extended/channels/${channelId}/events/${eventId}/upload-images`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${localStorage.getItem('tiyuy-auth-token') || localStorage.getItem('token')}`,

        },

        body: formData,

      });

      

      if (!response.ok) {

        throw new Error('Error uploading images');

      }

      

      return response.json();

    },

    onSuccess: (_, variables) => {

      // Invalidate all paginated queries for this channel

      queryClient.invalidateQueries({ 

        queryKey: ['channelEvents', variables.channelId],

        exact: false  // This will match all query keys that start with this prefix

      });

      queryClient.invalidateQueries({ queryKey: ['channelUpcomingEvents', variables.channelId] });

      queryClient.invalidateQueries({ queryKey: ['channel-event', variables.channelId, variables.eventId] });

    },

    onError: () => {

      toast.error('Error al subir imagenes');

    },

  });

}



// ==================== CHANNEL POSTS IMAGES ====================



export function useUploadChannelDocuments() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ channelId, postId, files }: { channelId: number; postId: number; files: File[] }) => {

      const formData = new FormData();

      files.forEach(file => formData.append('files', file));

      

      const response = await fetch(`${API_BASE_URL}/contacts/extended/channels/${channelId}/posts/${postId}/documents`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${localStorage.getItem('tiyuy-auth-token') || localStorage.getItem('token')}`,

        },

        body: formData,

      });

      

      if (!response.ok) {

        throw new Error('Error uploading documents');

      }

      

      return response.json();

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['channel-posts'] });

    },

    onError: () => {

      toast.error('Error al subir documentos');

    },

  });

}



export function useGetChannelPostDocuments(channelId: number, postId: number) {

  return useQuery({

    queryKey: ['channel-post-documents', channelId, postId],

    queryFn: async () => {

      const response = await axiosClient.get(`/contacts/extended/channels/${channelId}/posts/${postId}/documents`);

      return response.data;

    },

    enabled: !!channelId && !!postId,

  });

}



export function useUploadChannelPostImages() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ postId, files }: { postId: number; files: File[] }) => {

      const formData = new FormData();

      files.forEach(file => formData.append('files', file));

      

      const response = await fetch(`${API_BASE_URL}/contacts/extended/channels/posts/${postId}/upload-images`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${localStorage.getItem('tiyuy-auth-token') || localStorage.getItem('token')}`,

        },

        body: formData,

      });

      

      if (!response.ok) {

        throw new Error('Error uploading images');

      }

      

      return response.json();

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['channel-posts'] });

      toast.success('Imágenes subidas exitosamente');

    },

    onError: () => {

      toast.error('Error al subir imágenes');

    },

  });

}



// ==================== CHANNEL COMMENTS ====================



export function useChannelComments(channelId: number, postId: number) {

  return useQuery({

    queryKey: ['channel-comments', channelId, postId],

    queryFn: async () => {

      const data = await apiCall(`/contacts/extended/channels/${channelId}/posts/${postId}/comments`);

      const comments = Array.isArray(data) ? data : (data?.content ?? []);

      console.log('📋 Comentarios recibidos:', comments);

      return comments;

    },

    staleTime: 30 * 1000,

    enabled: !!postId,

  });

}



export function useCreateChannelComment() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ channelId, postId, content, replyToCommentId }: { channelId: number; postId: number; content: string; replyToCommentId?: number }) => {

      const body: any = { content };

      if (replyToCommentId) {

        body.replyToCommentId = replyToCommentId;

      }

      return await apiCall(`/contacts/extended/channels/${channelId}/posts/${postId}/comments`, {

        method: 'POST',

        body: JSON.stringify(body),

      });

    },

    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ['channel-comments', variables.channelId, variables.postId] });

      queryClient.invalidateQueries({ queryKey: ['channel-posts'] });

      toast.success('Comentario agregado');

    },

    onError: () => {

      toast.error('Error al agregar comentario');

    },

  });

}



export function useLikeChannelComment() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async (commentId: number) => {

      return await apiCall(`/contacts/extended/channels/comments/${commentId}/like`, { method: 'POST' });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['channel-comments'] });

    },

  });

}



export function useDeleteChannelPost() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ channelId, postId }: { channelId: number; postId: number }) => {

      return await apiCall(`/contacts/extended/channels/${channelId}/posts/${postId}`, { method: 'DELETE' });

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['channel-posts'] });

      toast.success('Post eliminado');

    },

    onError: () => {

      toast.error('Error al eliminar post');

    },

  });

}



// ==================== CHANNEL COLLABORATORS & DELEGATION ====================



export interface ChannelCollaborator {

  id: number;

  userId: number;

  firstName: string;

  lastName: string;

  email: string;

  dni?: string;

  userAvatar?: string;

  role?: string;

  grantedAt: string;

  grantedBy?: {

    id: number;

    firstName: string;

    lastName: string;

  };

}



export interface ChannelStatistics {

  subscriberCount: number;

  collaboratorCount: number;

  totalPosts: number;

  postsLast30Days: number;

  postsLast7Days: number;

  totalComments: number;

  commentsLast30Days: number;

  commentsLast7Days: number;

  activeUsersLast7Days: number;

  dailyActivity: Array<{

    date: string;

    posts: number;

    comments: number;

    interactions: number;

  }>;

}



// Buscar usuarios para delegación de acceso (por nombre, email, DNI - como en chat)

export function useSearchUsersForDelegation() {

  return useMutation({

    mutationFn: async (query: string) => {

      // Usar el endpoint de búsqueda general como en el chat

      const data = await apiCall(`/contacts/extended/search/users?keyword=${encodeURIComponent(query)}`);

      return data as Array<{

        id: number;

        email: string;

        firstName: string;

        lastName: string;

        dni?: string;

        avatar?: string;

        role?: string;

      }>;

    },

  });

}



// Obtener colaboradores del canal (publishers)

export function useChannelCollaborators(channelId: number) {

  return useQuery({

    queryKey: ['channel-collaborators', channelId],

    queryFn: async () => {

      const data = await apiCall(`/contacts/extended/channels/${channelId}/publishers`);

      return (Array.isArray(data) ? data : []) as ChannelCollaborator[];

    },

    staleTime: 30 * 1000,

    enabled: !!channelId,

  });

}



// Asignar permiso de publicación a un usuario

export function useGrantPublishingPermission() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ channelId, userId }: { channelId: number; userId: number }) => {

      return await apiCall(`/contacts/extended/channels/${channelId}/publishers/${userId}/grant`, {

        method: 'POST',

      });

    },

    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ['channel-collaborators', variables.channelId] });

      toast.success('Permiso de publicación otorgado exitosamente');

    },

    onError: (error: any) => {

      toast.error(error?.message || 'Error al otorgar permiso');

    },

  });

}



// Revocar permiso de publicación

export function useRevokePublishingPermission() {

  const queryClient = useQueryClient();

  

  return useMutation({

    mutationFn: async ({ channelId, userId }: { channelId: number; userId: number }) => {

      return await apiCall(`/contacts/extended/channels/${channelId}/publishers/${userId}/revoke`, {

        method: 'POST',

      });

    },

    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ['channel-collaborators', variables.channelId] });

      toast.success('Permiso de publicación revocado');

    },

    onError: (error: any) => {

      toast.error(error?.message || 'Error al revocar permiso');

    },

  });

}



// Verificar si el usuario actual puede publicar

export function useCanUserPublish(channelId: number) {

  return useQuery({

    queryKey: ['can-publish', channelId],

    queryFn: async () => {

      const data = await apiCall(`/contacts/extended/channels/${channelId}/can-publish`);

      return data?.canPublish as boolean;

    },

    staleTime: 60 * 1000,

    enabled: !!channelId,

  });

}



// Obtener estadísticas del canal

export function useChannelStatistics(channelId: number) {

  return useQuery({

    queryKey: ['channel-statistics', channelId],

    queryFn: async () => {

      const data = await apiCall(`/contacts/extended/channels/${channelId}/statistics`);

      return data as ChannelStatistics;

    },

    staleTime: 60 * 1000,

    enabled: !!channelId,

  });

}

