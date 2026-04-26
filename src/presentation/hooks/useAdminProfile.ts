/**
 * Admin Profile Hook
 * Loads and manages current admin user profile with permissions and departments
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
