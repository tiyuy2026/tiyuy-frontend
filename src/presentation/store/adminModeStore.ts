/**
 * Admin Mode Store
 * Tracks whether an admin user is viewing the platform as a regular user
 * or as an admin/support/superadmin
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminModeState {
  /** true = viewing platform as regular user, false = viewing admin panel */
  isUserMode: boolean;
  setUserMode: (value: boolean) => void;
  toggleMode: () => void;
}

export const useAdminModeStore = create<AdminModeState>()(
  persist(
    (set) => ({
      isUserMode: true, // Default to user mode when logging in
      setUserMode: (value) => set({ isUserMode: value }),
      toggleMode: () => set((state) => ({ isUserMode: !state.isUserMode })),
    }),
    {
      name: 'tiyuy-admin-mode',
      partialize: (state) => ({
        isUserMode: state.isUserMode,
      }),
    }
  )
);