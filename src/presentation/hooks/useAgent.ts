'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AgentRepository } from '@/infrastructure/repositories/AgentRepository';
import { UpdateAgentProfileRequest } from '@/core/domain/entities/Agent';
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
