import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '@/infrastructure/api/axios-client';

interface AddReactionRequest {
  emoji: string;
}

interface RemoveReactionRequest {
  emoji: string;
}

export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, messageId, emoji }: {
      chatId: number;
      messageId: number;
      emoji: string;
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
      
      const url = `/contacts/extended/chats/${chatId}/messages/${messageId}/reactions?t=${Date.now()}`;
      return axiosClient.post(url, { emoji }, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });
    },
    onSuccess: (response, variables) => {
      console.log('✅ Reacción añadida:', response);
      // Invalidar cache del chat para refrescar mensajes
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error) => {
      console.error('❌ Error al añadir reacción:', error);
    }
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, messageId, emoji }: {
      chatId: number;
      messageId: number;
      emoji: string;
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
      
      const url = `/contacts/extended/chats/${chatId}/messages/${messageId}/reactions?t=${Date.now()}`;
      return axiosClient.delete(url, {
        data: { emoji },
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });
    },
    onSuccess: (response, variables) => {
      console.log('✅ Reacción eliminada:', response);
      // Invalidar cache del chat para refrescar mensajes
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error) => {
      console.error('❌ Error al eliminar reacción:', error);
    }
  });
}
