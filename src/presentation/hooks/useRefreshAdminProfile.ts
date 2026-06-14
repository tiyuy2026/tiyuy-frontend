/**
 * Hook para refrescar los datos del perfil admin (permisos, departamentos, roleType)
 * desde el backend. Util cuando SUPER_ADMIN actualiza los permisos de ADMIN/SUPPORT
 * y necesitamos que los cambios se reflejen sin cerrar sesion.
 */
import { useCallback } from 'react';
import { useAuthStore } from '@/presentation/store/authStore';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import axiosClient from '@/infrastructure/api/axios-client';

export function useRefreshAdminProfile() {
  const { setAdminProfile } = useAuthStore();

  const refreshAdminProfile = useCallback(async () => {
    try {
      const response = await axiosClient.get(ENDPOINTS.AUTH.ADMIN_PROFILE);
      const data = response.data;

      if (data.adminRoleType) {
        setAdminProfile(
          data.adminRoleType,
          data.departments || [],
          data.permissions || [],
          data.isActive ?? true
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing admin profile:', error);
      return false;
    }
  }, [setAdminProfile]);

  return { refreshAdminProfile };
}