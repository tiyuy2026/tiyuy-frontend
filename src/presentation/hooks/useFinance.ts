'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FinanceRepository } from '@/infrastructure/repositories/FinanceRepository';
import { toast } from '@/presentation/store/toastStore';
import { authStorage } from '@/infrastructure/storage/auth-storage';

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
    mutationFn: ({ planId, paymentMethod, discountCode }: { planId: string; paymentMethod: 'CARD' | 'MERCADOPAGO'; discountCode?: string }) =>
      financeRepo.subscribeToPlan(planId, paymentMethod, discountCode),
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

export function useAvailableDeveloperDiscountCodes() {
  console.log('🔍 HOOK: useAvailableDeveloperDiscountCodes INICIANDO');
  return useQuery({
    queryKey: ['developer', 'discount-codes'],
    queryFn: async () => {
      console.log('🔍 HOOK: queryFn ejecutándose');
      const userData = authStorage.getUser();
      console.log('🔍 HOOK: userData obtenido:', userData);
      if (!userData || (userData.role !== 'AGENT' && userData.role !== 'DEVELOPER')) {
        console.log('🚫 HOOK: Usuario no es agente ni developer - no se obtienen descuentos, rol:', userData?.role);
        return [];
      }
      console.log('✅ HOOK: Usuario es agente o developer - obteniendo descuentos, rol:', userData.role);
      console.log('🔍 HOOK: Usuario agencyId:', userData.agencyId);
      try {
        const result = await financeRepo.getAvailableDeveloperDiscountCodes();
        console.log('✅ HOOK: Descuentos obtenidos exitosamente:', result);
        return result;
      } catch (error) {
        console.error('❌ HOOK: Error obteniendo descuentos:', error);
        throw error;
      }
    },
    retry: 1,
    throwOnError: false,
  });
}
