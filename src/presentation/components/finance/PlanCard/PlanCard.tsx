'use client';

import { Icon } from '@iconify/react';
import { SubscriptionPlan, BillingCycle } from '@/core/domain/entities/Wallet';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  isSelected?: boolean;
  isExhausted?: boolean;
  isActive?: boolean;
  discountPercentage?: number;
  hasDiscount?: boolean;
  canRenew?: boolean;
  isExpired?: boolean;
  isExhaustedByLimit?: boolean;
  selectedBillingCycle?: BillingCycle;
  onBillingCycleChange?: (cycle: BillingCycle) => void;
}

export function PlanCard({ plan, onSelectPlan, isSelected, isExhausted, isActive, discountPercentage, hasDiscount, canRenew, isExpired, isExhaustedByLimit, selectedBillingCycle, onBillingCycleChange }: PlanCardProps) {
  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? 'US$' : 'S/';
    return `${symbol} ${price.toLocaleString()}`;
  };

  const calculateDiscountedPrice = () => {
    if (!hasDiscount || !discountPercentage) return plan.price;
    const discountAmount = plan.price * (discountPercentage / 100);
    return plan.price - discountAmount;
  };

  const discountedPrice = calculateDiscountedPrice();
  const hasPriceDiscount = hasDiscount && discountPercentage && discountPercentage > 0;

  const getPriceForCycle = (cycle: BillingCycle): number => {
    switch (cycle) {
      case 'QUARTERLY':
        return plan.priceQuarterly || (plan.price * 3 * 0.9);
      case 'YEARLY':
        return plan.priceYearly || (plan.price * 12 * 0.8);
      default:
        return plan.price;
    }
  };

  const currentCycle = selectedBillingCycle || 'MONTHLY';
  const currentPrice = getPriceForCycle(currentCycle);
  const finalPrice = hasPriceDiscount ? currentPrice * (1 - discountPercentage / 100) : currentPrice;

  const isPopular = plan.isFeatured && !isExhausted && !isActive && !isExpired;

  return (
    <div className={`relative rounded-3xl p-8 transition-all duration-300 ${
      isActive && !isExhausted && !isExpired
        ? 'bg-blue-50 border-2 border-blue-400 shadow-lg'
        : isExhausted || isExpired
        ? 'bg-gray-100 border-2 border-orange-300 shadow-md'
        : isPopular 
          ? 'bg-white border-2 border-[var(--brand-primary)] shadow-xl' 
          : 'bg-white border border-gray-200 shadow-md hover:shadow-lg'
    }`}>
      
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[var(--brand-primary)] text-white text-sm font-bold px-4 py-1.5 rounded-full">
            POPULAR
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-500 text-sm">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold text-gray-900">
            {formatPrice(finalPrice, plan.currency)}
          </span>
        </div>
        <p className="text-gray-400 text-sm mt-1">/mes</p>
        
        {hasPriceDiscount && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-400 line-through text-sm">
              {formatPrice(currentPrice, plan.currency)}
            </span>
            <span className="bg-[var(--brand-primary-light)] text-[var(--brand-primary)] text-xs font-bold px-2 py-1 rounded-full">
              {discountPercentage}% OFF
            </span>
          </div>
        )}
      </div>

      {!isActive && !isExhausted && !isExpired && plan.id !== 'FREE' && (
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => onBillingCycleChange?.('MONTHLY')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                currentCycle === 'MONTHLY'
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mensual
            </button>
            {(plan.priceQuarterly ?? 0) !== 0 && (
              <button
                onClick={() => onBillingCycleChange?.('QUARTERLY')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  currentCycle === 'QUARTERLY'
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Trimestral
              </button>
            )}
            {(plan.priceYearly ?? 0) !== 0 && (
              <button
                onClick={() => onBillingCycleChange?.('YEARLY')}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  currentCycle === 'YEARLY'
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Anual
              </button>
            )}
          </div>
          
          {currentCycle !== 'MONTHLY' && (
            <div className="flex justify-center gap-2">
              {currentCycle === 'QUARTERLY' && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  10% OFF
                </span>
              )}
              {currentCycle === 'YEARLY' && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  20% OFF
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {plan.id !== 'FREE' && (
        <p className="text-gray-400 text-sm mb-4">
          {currentCycle === 'MONTHLY' && '30 días'}
          {currentCycle === 'QUARTERLY' && '90 días (3 meses)'}
          {currentCycle === 'YEARLY' && '365 días (1 año)'}
        </p>
      )}

      <div className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Icon 
              icon="material-symbols:check-circle-rounded" 
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isExhausted && !isActive ? 'text-gray-300' : 'text-[var(--brand-primary)]'
              }`}
            />
            <span className={`text-sm ${
              isExhausted && !isActive ? 'text-gray-400 line-through' : 'text-gray-700'
            }`}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-gray-500 text-sm mb-4 text-center">
          {plan.maxPublications} publicaciones
        </p>

        <button
          onClick={() => {
            if (!isExhausted && !isActive && !isExpired) {
              onSelectPlan(plan);
            } else if (canRenew && isActive) {
              onSelectPlan(plan);
            }
          }}
          disabled={
            (isActive && !isExhausted && !isExpired) || 
            (isExhausted && plan.id === 'FREE') || 
            (isExhaustedByLimit && !canRenew) ||
            (isExpired && !canRenew)
          }
          className={`w-full py-3.5 rounded-xl cursor-pointer font-semibold text-base transition-all ${
            canRenew && isActive
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg animate-pulse'
              : isExhaustedByLimit && !canRenew
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isExpired && !canRenew
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isExhausted && !isActive
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isActive
              ? 'bg-gray-100 text-gray-400 cursor-default'
              : plan.name.includes('PREMIUM') || plan.name.includes('ENTERPRISE')
              ? 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary-light-hover)]'
              : 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)]'
          } ${isSelected && !isExhausted && !isActive && !isExpired ? 'ring-2 ring-[var(--brand-primary)] ring-opacity-50' : ''}`}
        >
          {canRenew && isActive ? 'Renovar Plan' : 
           isExhaustedByLimit && !canRenew ? 'Plan Agotado' : 
           isExpired && !canRenew ? 'Plan Vencido' :
           isExhausted && !isActive ? 'Plan Agotado' : 
           isExhausted && isActive && plan.id === 'FREE' ? 'Plan Consumido' :
           isActive ? 'Plan Activo' : 
           `Elegir ${plan.name}`}
        </button>
      </div>

      {isActive && !isExhausted && !isExpired && (
        <div className="absolute top-4 right-4 ">
          <Icon icon="material-symbols:check-circle" className="w-6 h-6 text-[var(--brand-primary)]" />
        </div>
      )}
    </div>
  );
}
