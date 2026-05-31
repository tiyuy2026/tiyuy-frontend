import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeveloperRepository } from '@/infrastructure/repositories/DeveloperRepository';
import { useAuthStore } from '@/presentation/store/authStore';
import toast from 'react-hot-toast';

const developerRepo = new DeveloperRepository();

const DEVELOPER_MARKETING_KEY = ['developer', 'marketing'];

function handleCampaignError(error: any, defaultMsg: string) {
  const code = error.response?.data?.code;
  const message = error.response?.data?.message;
  
  if (code === 'CAMPAIGN_LIMIT_REACHED') {
    const msg = message || 'Has llegado al límite de tu plan actual.';
    toast.error(msg, { duration: 6000 });
    setTimeout(() => {
      toast.success(
        '💡 ¿Quieres más campañas? Haz upgrade en /plans',
        { duration: 8000 }
      );
    }, 1000);
  } else if (code === 'MONTHLY_CAMPAIGN_LIMIT_REACHED') {
    const msg = message || 'Solo puedes publicar 1 campaña por mes.';
    toast.error(msg, { duration: 6000 });
  } else if (code === 'NO_ACTIVE_SUBSCRIPTION') {
    const msg = message || 'No tienes una suscripción activa.';
    toast.error(msg, { duration: 6000 });
    setTimeout(() => {
      toast.success(
        '💡 Adquiere un plan en /plans',
        { duration: 8000 }
      );
    }, 1000);
  } else {
    toast.error(message || defaultMsg);
  }
}

// Marketing hooks
export function useDeveloperMarketingStats() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: [...DEVELOPER_MARKETING_KEY, 'stats'],
    queryFn: () => developerRepo.getMarketingStats(),
    enabled: user?.role === 'DEVELOPER',
    staleTime: 30000,
  });
}

export function useDeveloperMyCampaigns(params?: { page?: number; size?: number }) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: [...DEVELOPER_MARKETING_KEY, 'campaigns', params],
    queryFn: () => developerRepo.getMyCampaigns(params),
    enabled: user?.role === 'DEVELOPER',
    staleTime: 30000,
  });
}

export function useDeveloperCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: import('@/core/domain/entities/Admin').CreatePromotionCampaignRequest) =>
      developerRepo.createMyCampaign(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DEVELOPER_MARKETING_KEY, 'campaigns'] });
      toast.success('Campaña creada exitosamente');
    },
    onError: (error: any) => {
      handleCampaignError(error, 'Error al crear campaña');
    },
  });
}

export function useDeveloperUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: import('@/core/domain/entities/Admin').UpdatePromotionCampaignRequest }) =>
      developerRepo.updateMyCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DEVELOPER_MARKETING_KEY, 'campaigns'] });
      toast.success('Campaña actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar campaña');
    },
  });
}

export function useDeveloperDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => developerRepo.deleteMyCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DEVELOPER_MARKETING_KEY, 'campaigns'] });
      toast.success('Campaña eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar campaña');
    },
  });
}

export function useDeveloperPayCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentRequest }: { id: number; paymentRequest: any }) =>
      developerRepo.payForCampaign(id, paymentRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DEVELOPER_MARKETING_KEY, 'campaigns'] });
      toast.success('Pago procesado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al procesar pago');
    },
  });
}

export function useDeveloperPublishCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => developerRepo.publishMyCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DEVELOPER_MARKETING_KEY, 'campaigns'] });
      toast.success('Campaña enviada para aprobación');
    },
    onError: (error: any) => {
      handleCampaignError(error, 'Error al publicar campaña');
    },
  });
}

export function useDeveloperRenewCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentRequest }: { id: number; paymentRequest: any }) =>
      developerRepo.renewCampaign(id, paymentRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DEVELOPER_MARKETING_KEY, 'campaigns'] });
      toast.success('Campaña renovada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al renovar campaña');
    },
  });
}

export function useDeveloperTargetEntities() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: [...DEVELOPER_MARKETING_KEY, 'target-entities'],
    queryFn: () => developerRepo.getTargetEntities(),
    enabled: user?.role === 'DEVELOPER',
    staleTime: 60000,
  });
}

export function useDeveloperPricingList() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: [...DEVELOPER_MARKETING_KEY, 'pricing'],
    queryFn: () => developerRepo.getPricingList(),
    enabled: user?.role === 'DEVELOPER',
    staleTime: 30000,
  });
}

export function useDeveloperUploadCampaignImage() {
  return useMutation({
    mutationFn: (file: File) => developerRepo.uploadCampaignImage(file),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al subir la imagen');
    },
  });
}
