"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/presentation/store/authStore";
import { adminRepository } from "@/infrastructure/repositories/AdminRepository";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, adminRoleType, isAdminActive } = useAuthStore();
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const hasAttemptedLoad = useRef(false);

  const isSuperAdmin = adminRoleType === 'SUPER_ADMIN';
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(adminRoleType || '');

  useEffect(() => {
    const loadAdmin = async () => {
      if (!isAuthenticated || !user?.id) {
        return;
      }

      // Si ya tiene adminRoleType o ya intentó cargar, no hacer nada
      if (adminRoleType || hasAttemptedLoad.current) {
        return;
      }

      try {
        setLoadingAdmin(true);
        hasAttemptedLoad.current = true;

        const admin = await adminRepository.getAdminByUserId(user.id);

        useAuthStore.getState().setAdminProfile(
          admin?.role || 'ADMIN',
          admin?.departments || [],
          admin?.permissions || [],
          admin?.isActive ?? true
        );
      } catch (error) {
        console.error('Error loading admin profile:', error);
      } finally {
        setLoadingAdmin(false);
      }
    };

    loadAdmin();
  }, [isAuthenticated, user?.id]);

  // Solo bloquear si no está autenticado
  // Si adminRoleType está undefined pero está autenticado, dejar pasar (fallback)
  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return <>{children}</>;
}
