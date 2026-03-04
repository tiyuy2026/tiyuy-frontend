import { create } from 'zustand';
import { DniValidationResponse, RucValidationResponse } from '@/core/domain/entities';

interface KycState {
  dniValidation: DniValidationResponse | null;
  rucValidation: RucValidationResponse | null;
  isValidating: boolean;
  error: string | null;
  
  // Actions
  setDniValidation: (validation: DniValidationResponse) => void;
  setRucValidation: (validation: RucValidationResponse) => void;
  setValidating: (validating: boolean) => void;
  setError: (error: string | null) => void;
  clearKyc: () => void;
}

export const useKycStore = create<KycState>((set) => ({
  dniValidation: null,
  rucValidation: null,
  isValidating: false,
  error: null,

  setDniValidation: (validation) => set({ dniValidation: validation, error: null }),

  setRucValidation: (validation) => set({ rucValidation: validation, error: null }),

  setValidating: (validating) => set({ isValidating: validating }),

  setError: (error) => set({ error }),

  clearKyc: () =>
    set({
      dniValidation: null,
      rucValidation: null,
      error: null,
    }),
}));
