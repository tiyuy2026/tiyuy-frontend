'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FinanceRepository } from '@/infrastructure/repositories/FinanceRepository';
import { toast } from '@/presentation/store/toastStore';

const financeRepo = new FinanceRepository();

export function useWalletBalance() {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: () => financeRepo.getWalletBalance(),
    refetchInterval: 60000,
  });
}

export function useWalletTransactions(page = 0, size = 20) {
  return useQuery({
    queryKey: ['wallet', 'transactions', page, size],
    queryFn: () => financeRepo.getWalletTransactions(page, size),
  });
}

export function useActiveSubscription() {
  return useQuery({
    queryKey: ['subscription', 'active'],
    queryFn: () => financeRepo.getActiveSubscription(),
    staleTime: 0, // Siempre considerar los datos como obsoletos
    refetchOnMount: true, // Siempre refrescar al montar
    refetchOnWindowFocus: true, // Refrescar cuando la ventana gana foco
  });
}

export function useAvailablePlans() {
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: () => financeRepo.getAvailablePlans(),
    retry: 1, // Solo reintentar una vez
    retryDelay: 1000,
    throwOnError: false, // No lanzar errores para no bloquear la UI
  });
}

export function useSubscribeToPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, paymentMethod }: { planId: string; paymentMethod: 'CARD' | 'MERCADOPAGO' }) =>
      financeRepo.subscribeToPlan(planId, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['subscription', 'active'] });
      toast.success('¡Suscripción activada! Ya puedes publicar más propiedades.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al activar suscripción');
    },
  });
}
