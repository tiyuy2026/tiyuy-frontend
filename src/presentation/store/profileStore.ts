import { create } from 'zustand';
import { UserRole } from '@/core/domain/entities';

interface ProfileState {
  selectedProfile: UserRole | null;
  isProfileSelected: boolean;
  
  // Actions
  selectProfile: (profile: UserRole) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  selectedProfile: null,
  isProfileSelected: false,

  selectProfile: (profile) =>
    set({
      selectedProfile: profile,
      isProfileSelected: true,
    }),

  clearProfile: () =>
    set({
      selectedProfile: null,
      isProfileSelected: false,
    }),
}));
