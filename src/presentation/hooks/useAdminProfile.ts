/**
 * Admin Profile Hook
 * Loads and manages current admin user profile with permissions and departments
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { AdminRepository } from '@/infrastructure/repositories/AdminRepository';
import { AdminUser } from '@/core/domain/entities/Admin';
import { useAuthStore } from '@/presentation/store/authStore';

const adminRepository = new AdminRepository();
const ADMIN_PROFILE_KEY = 'admin-profile';

export const useAdminProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    data: adminProfile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [ADMIN_PROFILE_KEY],
    queryFn: async () => {
      if (!user?.id) return null;
      return adminRepository.getAdminByUserId(user.id);
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds - para que los cambios de permisos se reflejen rápido
    refetchOnWindowFocus: true, // Refresca cuando el usuario vuelve a la pestaña
    refetchInterval: 60 * 1000, // Refresca cada 60 segundos en background

  });

  // Invalidate and refetch admin profile
  const refreshProfile = async () => {
    await queryClient.invalidateQueries({ queryKey: [ADMIN_PROFILE_KEY] });
    return refetch();
  };

  return {
    adminProfile,
    isLoading,
    error,
    refetch: refreshProfile,
  };
};
