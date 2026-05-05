'use client';

import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { Crown, Star, Lock } from 'lucide-react';

interface PlanBadgeProps {
  className?: string;
  showDescription?: boolean;
}

export function PlanBadge({ className = '', showDescription = false }: PlanBadgeProps) {
  const { data: activeSubscription } = useActiveSubscription();
  
  // Obtener el plan actual del usuario
  const currentPlan = activeSubscription?.plan?.id || 'FREE';

  const getPlanInfo = () => {
    switch (currentPlan) {
      case 'PREMIUM':
        return {
          name: 'PREMIUM',
          icon: <Crown className="w-3 h-3" />,
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          description: 'Acceso completo'
        };
      case 'BASIC':
        return {
          name: 'BASIC',
          icon: <Star className="w-3 h-3" />,
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          description: 'Funciones limitadas'
        };
      default:
        return {
          name: 'FREE',
          icon: <Lock className="w-3 h-3" />,
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          description: 'Funciones básicas'
        };
    }
  };

  const planInfo = getPlanInfo();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${planInfo.color}`}>
        {planInfo.icon}
        Plan {planInfo.name}
      </span>
      {showDescription && (
        <span className="text-xs text-gray-500">
          {planInfo.description}
        </span>
      )}
    </div>
  );
}
