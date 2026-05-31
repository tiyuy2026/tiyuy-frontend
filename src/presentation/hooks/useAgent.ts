'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgentRepository } from '@/infrastructure/repositories/AgentRepository';
import { UpdateAgentProfileRequest, Agent } from '@/core/domain/entities/Agent';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

const agentRepo = new AgentRepository();

export function useAgentProfile() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['agent', 'profile'],
    queryFn: () => agentRepo.getProfile(),
    enabled: user?.role === 'AGENT',
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAgentProfileRequest) => agentRepo.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', 'profile'] });
      toast.success('Perfil actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
    },
  });

  return {
    profile,
    isLoading,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useAgentDashboard() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['agent', 'dashboard'],
    queryFn: () => agentRepo.getDashboard(),
    enabled: user?.role === 'AGENT',
  });
}

export function usePublicAgentProfile(slug: string) {
  return useQuery({
    queryKey: ['agent', 'public', slug],
    queryFn: () => agentRepo.getPublicProfile(slug),
    enabled: !!slug,
  });
}

// ================== Agent Marketing Hooks ==================

const AGENT_MARKETING_KEY = ['agent', 'marketing'];

export function useAgentMarketingStats() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: [...AGENT_MARKETING_KEY, 'stats'],
    queryFn: () => agentRepo.getMarketingStats(),
    enabled: user?.role === 'AGENT',
    staleTime: 30000,
  });
}

export function useAgentMyCampaigns(params?: { page?: number; size?: number }) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: [...AGENT_MARKETING_KEY, 'campaigns', params],
    queryFn: () => agentRepo.getMyCampaigns(params),
    enabled: user?.role === 'AGENT',
    staleTime: 30000,
  });
}

export function useAgentCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: import('@/core/domain/entities/Admin').CreatePromotionCampaignRequest) =>
      agentRepo.createMyCampaign(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...AGENT_MARKETING_KEY, 'campaigns'] });
      toast.success('Campaña creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear campaña');
    },
  });
}

export function useAgentUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: import('@/core/domain/entities/Admin').UpdatePromotionCampaignRequest }) =>
      agentRepo.updateMyCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...AGENT_MARKETING_KEY, 'campaigns'] });
      toast.success('Campaña actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar campaña');
    },
  });
}

export function useAgentDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => agentRepo.deleteMyCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...AGENT_MARKETING_KEY, 'campaigns'] });
      toast.success('Campaña eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar campaña');
    },
  });
}


export function useAgentMyBanners() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: [...AGENT_MARKETING_KEY, 'banners'],
    queryFn: () => agentRepo.getMyBanners(),
    enabled: user?.role === 'AGENT',
    staleTime: 30000,
  });
}

export function useAgentCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: import('@/core/domain/entities/Admin').CreateBannerRequest) =>
      agentRepo.createMyBanner(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...AGENT_MARKETING_KEY, 'banners'] });
      toast.success('Banner creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear banner');
    },
  });
}

export function useAgentUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: import('@/core/domain/entities/Admin').CreateBannerRequest }) =>
      agentRepo.updateMyBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...AGENT_MARKETING_KEY, 'banners'] });
      toast.success('Banner actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar banner');
    },
  });
}

export function useAgentDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => agentRepo.deleteMyBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...AGENT_MARKETING_KEY, 'banners'] });
      toast.success('Banner eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar banner');
    },
  });
}

export function useAgentPublishCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => agentRepo.publishMyCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...AGENT_MARKETING_KEY, 'campaigns'] });
      toast.success('Campaña publicada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al publicar campaña');
    },
  });
}

export function useAgentRenewCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentRequest }: { id: number; paymentRequest: { paymentMethod: string } }) =>
      agentRepo.renewMyCampaign(id, paymentRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...AGENT_MARKETING_KEY, 'campaigns'] });
      toast.success('Campaña renovada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al renovar campaña');
    },
  });
}

export function useAgentTargetEntities() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: [...AGENT_MARKETING_KEY, 'targetEntities'],
    queryFn: () => agentRepo.getMyTargetEntities(),
    enabled: user?.role === 'AGENT',
    staleTime: 30000,
  });
}

export type { TargetEntity } from '@/core/domain/repositories/IAgentRepository';

// Re-export Agent type for use in components
export type { Agent };
