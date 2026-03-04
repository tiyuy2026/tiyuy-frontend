'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ModerationRepository } from '@/infrastructure/repositories/ModerationRepository';
import { ReportPropertyRequest, ReviewReportRequest } from '@/core/domain/entities/Moderation';
import { toast } from '@/presentation/store/toastStore';

const moderationRepo = new ModerationRepository();

export function useReportProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ReportPropertyRequest) => moderationRepo.reportProperty(request),
    onSuccess: () => {
      toast.success('Reporte enviado. Será revisado por nuestro equipo.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al enviar reporte');
    },
  });
}

export function useReviewReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ReviewReportRequest) => moderationRepo.reviewReport(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation', 'pending'] });
      toast.success('Reporte revisado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al revisar reporte');
    },
  });
}

export function usePendingReports(page = 0, size = 20) {
  return useQuery({
    queryKey: ['moderation', 'pending', page, size],
    queryFn: () => moderationRepo.getPendingReports(page, size),
  });
}
