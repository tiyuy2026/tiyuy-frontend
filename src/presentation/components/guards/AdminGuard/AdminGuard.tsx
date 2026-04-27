"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/presentation/store/authStore";
import { adminRepository } from "@/repositories/AdminRepository";

type AdminData = {
  id: number;
  userId: number;
  roleType: "ADMIN" | "SUPERADMIN";
};

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [adminError, setAdminError] = useState(false);

  useEffect(() => {
    const loadAdmin = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoadingAdmin(false);
        setAdminData(null);
        return;
      }

      try {
        setLoadingAdmin(true);
        setAdminError(false);

        const response = await adminRepository.getAdminByUserId(user.id);
        const admin = response?.data ?? response ?? null;

        setAdminData(admin);
      } catch (error) {
        setAdminData(null);
        setAdminError(true);
      } finally {
        setLoadingAdmin(false);
      }
    };

    loadAdmin();
  }, [isAuthenticated, user?.id]);

  const adminRoleType = useMemo(() => {
    return (
      adminData?.roleType ||
      (user as any)?.roleType ||
      (user as any)?.role ||
      (user as any)?.adminRoleType ||
      (user as any)?.admin?.roleType ||
      null
    );
  }, [adminData, user]);

  const isSuperAdmin = adminRoleType === "SUPERADMIN" || adminRoleType === "SUPER_ADMIN";
  const isAdmin = ["ADMIN", "SUPERADMIN", "SUPER_ADMIN"].includes(adminRoleType);

  console.log("AdminGuard Debug:", {
    isAuthenticated,
    user,
    adminData,
    adminRoleType,
    isAdmin,
    isSuperAdmin,
    loadingAdmin,
    adminError,
  });

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  if (loadingAdmin) {
    return <div>Cargando permisos...</div>;
  }

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
}
