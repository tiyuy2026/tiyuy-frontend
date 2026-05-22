'use client';

import React from 'react';
import { useMarketingAccess, MarketingAccessLevel } from '@/presentation/hooks/useMarketingAccess';
import { Card } from '@/presentation/components/ui/Card';
import Link from 'next/link';

interface MarketingAccessGuardProps {
  /** The minimum marketing level required to access the content */
  requiredLevel?: MarketingAccessLevel;
  /** The content to render if the user has access */
  children: React.ReactNode;
  /** Optional fallback content when blocked (overrides default) */
  fallback?: React.ReactNode;
  /** The dashboard role for the upgrade link */
  role?: 'agent' | 'developer';
}

/**
 * Component that conditionally renders marketing content based on the user's
 * subscription plan. If the user does not have the required marketing access level,
 * it shows a blocked state with a CTA to upgrade their plan.
 *
 * Usage:
 *   <MarketingAccessGuard requiredLevel="BASIC">
 *     <MarketingCampaignsList />
 *   </MarketingAccessGuard>
 */
export function MarketingAccessGuard({
  requiredLevel = 'BASIC',
  children,
  fallback,
  role = 'agent',
}: MarketingAccessGuardProps) {
  const { hasAccess, hasLevel, isLoading, currentTier, accessLevel } = useMarketingAccess();

  // Show nothing while loading subscription data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // If user has the required level, render children
  if (hasAccess && hasLevel(requiredLevel)) {
    return <>{children}</>;
  }

  // If a custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default blocked state with upgrade CTA
  const upgradePath = `/${role}/subscription`;

  const levelLabels: Record<MarketingAccessLevel, string> = {
    NONE: 'Sin acceso',
    BASIC: 'Marketing Básico',
    MEDIUM: 'Marketing Medio',
    FULL: 'Marketing Completo',
  };

  const requiredLabel = levelLabels[requiredLevel];

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Marketing no disponible
        </h2>
        <p className="text-gray-600 mb-4">
          {hasAccess
            ? `Tu plan actual (${levelLabels[accessLevel]}) no incluye "${requiredLabel}".`
            : 'Tu plan actual no incluye acceso a herramientas de Marketing.'}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {currentTier
            ? `Plan actual: ${currentTier}`
            : 'No tienes un plan activo.'}
          {' '}Actualiza a un plan superior para desbloquear funciones promocionales.
        </p>
        <Link
          href={upgradePath}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Mejorar plan
        </Link>
      </Card>
    </div>
  );
}
