import { create } from 'zustand';

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  
  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  totalSteps: 3,
  isCompleted: false,

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  goToStep: (step) =>
    set((state) => ({
      currentStep: Math.max(1, Math.min(step, state.totalSteps)),
    })),

  completeOnboarding: () => set({ isCompleted: true }),

  resetOnboarding: () => set({ currentStep: 1, isCompleted: false }),
}));
