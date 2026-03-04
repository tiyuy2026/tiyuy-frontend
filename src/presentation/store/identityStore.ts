// src/presentation/store/identityStore.ts
import { create } from 'zustand';

interface IdentityState {
  dniData: any | null;
  kycStatus: { isVerified: boolean; level: 'BASIC' | 'FULL' } | null;
  setDniData: (data: any) => void;
  setKycStatus: (status: { isVerified: boolean; level: 'BASIC' | 'FULL' }) => void;
}

export const useIdentityStore = create<IdentityState>((set) => ({
  dniData: null,
  kycStatus: null,
  setDniData: (data) => set({ dniData: data }),
  setKycStatus: (status) => set({ kycStatus: status }),
}));
