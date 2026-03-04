'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContactRepository } from '@/infrastructure/repositories/ContactRepository';
import { SendContactData } from '@/core/domain/entities/Contact';
import { toast } from '@/presentation/store/toastStore';

const contactRepo = new ContactRepository();

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
