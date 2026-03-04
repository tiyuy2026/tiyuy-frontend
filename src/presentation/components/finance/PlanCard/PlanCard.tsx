'use client';

import { SubscriptionPlan } from '@/core/domain/entities/Wallet';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  isSelected?: boolean;
  isExhausted?: boolean;
  isActive?: boolean; // ✅ NUEVO - plan activo del usuario
}

export function PlanCard({ plan, onSelectPlan, isSelected, isExhausted, isActive }: PlanCardProps) {
  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? 'US$' : 'S/';
    return `${symbol} ${price.toLocaleString()}`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 ${
      isActive ? 'border-green-500 ring-2 ring-green-400 ring-opacity-50' :
      isSelected ? 'border-blue-500' : 'border-transparent'
    } ${isExhausted ? 'opacity-60 grayscale' : ''}`}>

      {/* Banner según estado */}
      {isActive && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-xl py-2 text-center">
          <span className="text-white font-bold text-sm">✅ TU PLAN ACTUAL</span>
        </div>
      )}
      {isExhausted && !isActive && (
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-t-xl py-2 text-center">
          <span className="text-white font-bold text-sm">🔒 PLAN AGOTADO</span>
        </div>
      )}
      {plan.isFeatured && !isExhausted && !isActive && (
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-t-xl py-2 text-center">
          <span className="text-white font-bold text-sm">⭐ MÁS POPULAR</span>
        </div>
      )}

      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
        <p className="text-gray-600 mb-6">{plan.description}</p>

        <div className="space-y-2 mb-8">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={isActive ? 'text-green-500' : isExhausted ? 'text-gray-400' : 'text-green-500'}>✓</span>
              <span className={isExhausted && !isActive ? 'text-gray-500 line-through' : 'text-gray-700'}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold mb-2 text-gray-900">
            {formatPrice(plan.price, plan.currency)}
          </div>
          <p className="text-sm mb-6 text-gray-500">
            {plan.maxPublications} publicaciones
          </p>

          <button
            onClick={() => !isExhausted && !isActive && onSelectPlan(plan)}
            disabled={isExhausted || isActive}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              isExhausted
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isActive
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${isSelected && !isExhausted && !isActive ? 'ring-4 ring-blue-600 ring-opacity-50' : ''}`}
          >
            {isExhausted ? '🔒 Plan Agotado' : isActive ? '✅ Plan Activo' : `Elegir ${plan.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}
