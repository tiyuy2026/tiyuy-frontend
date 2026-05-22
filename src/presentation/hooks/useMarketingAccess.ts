'use client';

import { useActiveSubscription } from './useFinance';

/**
 * Marketing access levels matching backend MarketingAccessLevel enum.
 */
export type MarketingAccessLevel = 'NONE' | 'BASIC' | 'MEDIUM' | 'FULL';

/**
 * Maps subscription tier codes to marketing access levels.
 * FREE and BASIC -> NONE
 * PREMIUM (Pro) -> BASIC
 * ENTERPRISE_TRIAL -> MEDIUM
 * ENTERPRISE -> FULL
 */
function resolveAccessLevel(tierCode: string | undefined): MarketingAccessLevel {
  if (!tierCode) return 'NONE';
  switch (tierCode.toUpperCase()) {
    case 'PREMIUM':
      return 'BASIC';
    case 'ENTERPRISE_TRIAL':
      return 'MEDIUM';
    case 'ENTERPRISE':
      return 'FULL';
    default:
      return 'NONE';
  }
}

/**
 * Checks if a level grants at least the required level.
 */
function grants(userLevel: MarketingAccessLevel, required: MarketingAccessLevel): boolean {
  const order: Record<MarketingAccessLevel, number> = {
    NONE: 0,
    BASIC: 1,
    MEDIUM: 2,
    FULL: 3,
  };
  return order[userLevel] >= order[required];
}

/**
 * Hook that determines marketing access based on the user's active subscription.
 * Centralizes all marketing authorization logic in one place.
 */
export function useMarketingAccess() {
  const { data: subscription, isLoading, error } = useActiveSubscription();

  const tierCode = subscription?.plan?.name;
  const accessLevel = resolveAccessLevel(tierCode);
  const hasAccess = accessLevel !== 'NONE';

  return {
    /** Whether the user has any marketing access at all */
    hasAccess,
    /** The current marketing access level */
    accessLevel,
    /** Whether the marketing section should be blocked */
    isBlocked: !hasAccess,
    /** Whether the subscription data is still loading */
    isLoading,
    /** Error loading subscription data */
    error,
    /** The current subscription tier name */
    currentTier: tierCode || null,

    /**
     * Check if user has at least the required marketing level.
     */
    hasLevel: (required: MarketingAccessLevel): boolean => {
      return grants(accessLevel, required);
    },

    /**
     * Get max active campaigns allowed for this access level.
     */
    getMaxActiveCampaigns: (): number => {
      switch (accessLevel) {
        case 'BASIC': return 1;
        case 'MEDIUM': return 3;
        case 'FULL': return Infinity;
        default: return 0;
      }
    },

    /**
     * Get max campaign duration in days for this access level.
     */
    getMaxCampaignDurationDays: (): number => {
      switch (accessLevel) {
        case 'BASIC': return 7;
        case 'MEDIUM': return 15;
        case 'FULL': return 30;
        default: return 0;
      }
    },

    /** Whether user can use festive campaigns (FULL only) */
    canUseFestiveCampaigns: (): boolean => {
      return grants(accessLevel, 'FULL');
    },

    /** Whether user can use premium banners (FULL only) */
    canUsePremiumBanners: (): boolean => {
      return grants(accessLevel, 'FULL');
    },

    /** Whether user can promote projects (FULL only) */
    canPromoteProjects: (): boolean => {
      return grants(accessLevel, 'FULL');
    },
  };
}
