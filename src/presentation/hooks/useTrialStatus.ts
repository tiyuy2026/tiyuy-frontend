'use client';

import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { useAuthStore } from '@/presentation/store/authStore';

export function useTrialStatus() {
  const { user } = useAuthStore();
  const { data: activeSubscription } = useActiveSubscription();

  // Si no es DEVELOPER, no aplica trial
  if (!user || user.role !== 'DEVELOPER') {
    return {
      isTrialUser: false,
      isTrialActive: false,
      isTrialExpired: false,
      daysRemaining: null,
      trialStartDate: null,
      trialEndDate: null,
    };
  }

  // Si no hay suscripción, asumir que está en trial (el backend debe manejar esto)
  if (!activeSubscription) {
    return {
      isTrialUser: true,
      isTrialActive: true,
      isTrialExpired: false,
      daysRemaining: null,
      trialStartDate: null,
      trialEndDate: null,
    };
  }

  const now = new Date();
  const createdAt = new Date(user.createdAt);
  const expiresAt = new Date(activeSubscription.expiresAt);
  
  // Calcular días restantes
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isTrialExpired = now > expiresAt;
  
  // Determinar si es un usuario de trial (plan FREE o sin suscripción de pago)
  const isTrialUser = !activeSubscription.plan || activeSubscription.plan.id === 'FREE';
  const isTrialActive = isTrialUser && !isTrialExpired;

  return {
    isTrialUser,
    isTrialActive,
    isTrialExpired,
    daysRemaining: Math.max(0, daysRemaining),
    trialStartDate: createdAt,
    trialEndDate: expiresAt,
  };
}
