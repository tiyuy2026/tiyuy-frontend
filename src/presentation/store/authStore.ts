import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AdminRoleType } from '@/core/domain/entities';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  adminRoleType: AdminRoleType | null;
  permissions: string[];
  departments: string[];
  isAdminActive: boolean | null;

  setAuth: (token: string, user: User, adminData?: AdminAuthData) => void;
  setUser: (user: User) => void;
  setAdminProfile: (role: AdminRoleType, departments: string[], permissions: string[], isActive: boolean) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

interface AdminAuthData {
  adminRoleType?: AdminRoleType;
  permissions?: string[];
  departments?: string[];
  isActive?: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      adminRoleType: null,
      permissions: [],
      departments: [],
      isAdminActive: null,

      setAuth: (token, user, adminData) =>
        set({
          token,
          user,
          isAuthenticated: true,
          error: null,
          adminRoleType: adminData?.adminRoleType || null,
          permissions: adminData?.permissions || [],
          departments: adminData?.departments || [],
          isAdminActive: adminData?.isActive ?? null,
        }),

      setUser: (user) => set({ user }),

      setAdminProfile: (role, departments, permissions, isActive) =>
        set({
          adminRoleType: role,
          departments,
          permissions,
          isAdminActive: isActive,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          adminRoleType: null,
          permissions: [],
          departments: [],
          isAdminActive: null,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'tiyuy-auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        adminRoleType: state.adminRoleType,
        permissions: state.permissions,
        departments: state.departments,
        isAdminActive: state.isAdminActive,
      }),
    }
  )
);
