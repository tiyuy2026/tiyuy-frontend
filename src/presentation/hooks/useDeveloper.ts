import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeveloperRepository } from '@/infrastructure/repositories/DeveloperRepository';
import { useAuthStore } from '@/presentation/store/authStore';
import toast from 'react-hot-toast';

const developerRepo = new DeveloperRepository();

const DEVELOPER_MARKETING_KEY = ['developer', 'marketing'];

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
      toast.error(error.response?.data?.message || 'Error al crear campaña');
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

export function useDeveloperMyBanners() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: [...DEVELOPER_MARKETING_KEY, 'banners'],
    queryFn: () => developerRepo.getMyBanners(),
    enabled: user?.role === 'DEVELOPER',
    staleTime: 30000,
  });
}

export function useDeveloperCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: import('@/core/domain/entities/Admin').CreateBannerRequest) =>
      developerRepo.createMyBanner(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DEVELOPER_MARKETING_KEY, 'banners'] });
      toast.success('Banner creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear banner');
    },
  });
}

export function useDeveloperUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: import('@/core/domain/entities/Admin').CreateBannerRequest }) =>
      developerRepo.updateMyBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DEVELOPER_MARKETING_KEY, 'banners'] });
      toast.success('Banner actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar banner');
    },
  });
}

export function useDeveloperDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => developerRepo.deleteMyBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DEVELOPER_MARKETING_KEY, 'banners'] });
      toast.success('Banner eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar banner');
    },
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
