/**
 * Support Tickets Hook
 * Centro de Soporte/Incidencias - Hooks para gestión de tickets
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRepository } from '@/infrastructure/repositories/AdminRepository';
import {
  SupportTicket,
  SupportTicketStats,
  CreateSupportTicketRequest,
  UpdateSupportTicketStatusRequest,
} from '@/core/domain/entities/Admin';

// ==================== Queries ====================

export function useSupportTickets(params?: {
  status?: string;
  category?: string;
  severity?: string;
  search?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ['support-tickets', 'list', params],
    queryFn: () => adminRepository.getSupportTickets(params),
    staleTime: 30000,
  });
}

/**
 * Hook separado para la gráfica de actividad de tickets.
 * Usa un queryKey diferente para evitar conflictos con useSupportTickets.
 */
export function useSupportTicketsForChart(params?: {
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ['support-tickets', 'chart', params],
    queryFn: () => adminRepository.getSupportTickets(params),
    staleTime: 60000,
  });
}

export function useSupportTicketById(ticketId: number | null) {
  return useQuery({
    queryKey: ['support-tickets', 'detail', ticketId],
    queryFn: () => adminRepository.getSupportTicketById(ticketId!),
    enabled: !!ticketId,
    staleTime: 30000,
  });
}

export function useSupportTicketStats() {
  return useQuery({
    queryKey: ['support-tickets', 'stats'],
    queryFn: () => adminRepository.getSupportTicketStats(),
    staleTime: 60000,
    placeholderData: (previousData) => previousData,
  });
}

// ==================== Mutations ====================

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateSupportTicketRequest) =>
      adminRepository.createSupportTicket(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });
}

export function useUpdateSupportTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ticketId,
      request,
    }: {
      ticketId: number;
      request: UpdateSupportTicketStatusRequest;
    }) => adminRepository.updateSupportTicketStatus(ticketId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });
}

export function useNotifyTicketUser() {
  return useMutation({
    mutationFn: ({
      ticketId,
      data,
    }: {
      ticketId: number;
      data: { subject: string; message: string; sendEmail: boolean; sendInApp: boolean };
    }) => adminRepository.notifyTicketUser(ticketId, data),
  });
}
