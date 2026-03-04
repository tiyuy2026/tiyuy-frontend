'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentRepository } from '@/infrastructure/repositories/PaymentRepository';
import { PaymentRequest } from '@/core/domain/entities/Wallet';
import { toast } from '@/presentation/store/toastStore';

const paymentRepo = new PaymentRepository();

export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PaymentRequest) => paymentRepo.processPayment(request),
    onSuccess: (payment) => {
      if (payment.status === 'APPROVED') {
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        toast.success('¡Pago exitoso! Créditos agregados.');
      } else if (payment.status === 'FAILED') {
        toast.error(payment.errorMessage || 'Pago rechazado. Intenta nuevamente.');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al procesar pago');
    },
  });
}

export function useMyPayments(page = 0, size = 20) {
  return useQuery({
    queryKey: ['payments', 'my-payments', page, size],
    queryFn: () => paymentRepo.getMyPayments(page, size),
  });
}

export function useTotalPaid() {
  return useQuery({
    queryKey: ['payments', 'total-paid'],
    queryFn: () => paymentRepo.getTotalPaid(),
  });
}

export function usePaymentById(paymentId: number) {
  return useQuery({
    queryKey: ['payments', paymentId],
    queryFn: () => paymentRepo.getPaymentById(paymentId),
    enabled: !!paymentId,
  });
}
