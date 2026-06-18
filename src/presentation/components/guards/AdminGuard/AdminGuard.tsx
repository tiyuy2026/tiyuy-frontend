"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/presentation/store/authStore";
import { adminRepository } from "@/infrastructure/repositories/AdminRepository";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, adminRoleType } = useAuthStore();
  const hasAttemptedLoad = useRef(false);

  useEffect(() => {
    const loadAdmin = async () => {
      if (!isAuthenticated || !user?.id) {
        router.replace('/login');
        return;
      }

      // Si no es un rol admin, redirigir a home
      const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'];
      if (!adminRoles.includes(user.role)) {
        router.replace('/');
        return;
      }

      // Si ya tiene adminRoleType (ya se seteó en el login), no hacer nada
      if (adminRoleType || hasAttemptedLoad.current) {
        return;
      }

      try {
        hasAttemptedLoad.current = true;
        const admin = await adminRepository.getAdminByUserId(user.id);

        if (admin?.roleType) {
          // Mantener los permissions existentes del login (no sobreescribirlos)
          useAuthStore.getState().setAdminProfile(
            admin.roleType,
            admin.departments || [],
            useAuthStore.getState().permissions || [],
            admin.active ?? true
          );
        }
      } catch (error) {
        console.error('Error loading admin profile:', error);
        // Si no encuentra admin_users pero el user tiene role ADMIN, permitir acceso igual
        // porque el SuperAdmin puede estar en proceso de asignar permisos
      }
    };

    loadAdmin();
  }, [isAuthenticated, user?.id, user?.role, adminRoleType, router]);

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  // Verificar que el usuario tenga un rol admin
  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'];
  if (!user || !adminRoles.includes(user.role)) {
    return null; // Se redirigirá en el useEffect
  }

  return <>{children}</>;
}
