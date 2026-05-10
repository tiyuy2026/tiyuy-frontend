'use client';

import { SubscriptionPlan, BillingCycle } from '@/core/domain/entities/Wallet';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  isSelected?: boolean;
  isExhausted?: boolean;
  isActive?: boolean; //  NUEVO - plan activo del usuario
  discountPercentage?: number; //  NUEVO - porcentaje de descuento
  hasDiscount?: boolean; //  NUEVO - si tiene descuento aplicado
  canRenew?: boolean; //  NUEVO - si el plan puede renovarse
  isExpired?: boolean; //  NUEVO - si el plan esta vencido por tiempo
  isExhaustedByLimit?: boolean; //  NUEVO - si el plan esta agotado por limite
  selectedBillingCycle?: BillingCycle; //  NUEVO - ciclo de facturacion seleccionado
  onBillingCycleChange?: (cycle: BillingCycle) => void; //  NUEVO - callback para cambio de ciclo
}

export function PlanCard({ plan, onSelectPlan, isSelected, isExhausted, isActive, discountPercentage, hasDiscount, canRenew, isExpired, isExhaustedByLimit, selectedBillingCycle, onBillingCycleChange }: PlanCardProps) {
  // DEBUG: Logs para depurar props recibidas
  console.log(' DEBUG PlanCard:', {
    planName: plan.name,
    planPrice: plan.price,
    discountPercentage,
    hasDiscount,
    hasPriceDiscount: hasDiscount && discountPercentage && discountPercentage > 0
  });

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? 'US$' : 'S/';
    return `${symbol} ${price.toLocaleString()}`;
  };

  // Calcular precio con descuento
  const calculateDiscountedPrice = () => {
    if (!hasDiscount || !discountPercentage) return plan.price;
    const discountAmount = plan.price * (discountPercentage / 100);
    return plan.price - discountAmount;
  };

  const discountedPrice = calculateDiscountedPrice();
  const hasPriceDiscount = hasDiscount && discountPercentage && discountPercentage > 0;

  // Calculate price for selected billing cycle
  const getPriceForCycle = (cycle: BillingCycle): number => {
    switch (cycle) {
      case 'QUARTERLY':
        return plan.priceQuarterly || (plan.price * 3 * 0.9); // 10% discount
      case 'YEARLY':
        return plan.priceYearly || (plan.price * 12 * 0.8); // 20% discount
      default:
        return plan.price;
    }
  };

  const currentCycle = selectedBillingCycle || 'MONTHLY';
  const currentPrice = getPriceForCycle(currentCycle);
  const finalPrice = hasPriceDiscount ? currentPrice * (1 - discountPercentage / 100) : currentPrice;

  console.log(' DEBUG PlanCard cálculo:', {
    discountedPrice,
    hasPriceDiscount,
    originalPrice: plan.price,
    currentCycle,
    currentPrice,
    finalPrice
  });

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 ${
      isActive && !isExhausted && !isExpired ? 'border-green-500 ring-2 ring-green-400 ring-opacity-50' :
      isSelected && !isExhausted && !isExpired ? 'border-blue-500' : 
      isExpired ? 'border-gray-300 bg-gray-50' :
      isExhaustedByLimit ? 'border-red-300 bg-red-50' :
      isExhausted ? 'border-gray-400' : 'border-transparent'
    } ${
      isExpired ? 'opacity-60 grayscale' : 
      isExhaustedByLimit ? 'opacity-75' : 
      isExhausted ? 'opacity-70 grayscale hover:opacity-80' : ''
    }`}>

      {/* Banner según estado */}
      {isActive && !isExhausted && !isExpired && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-xl py-2 text-center">
          <span className="text-white font-bold text-sm"> TU PLAN ACTUAL</span>
        </div>
      )}
      {isExhaustedByLimit && isActive && plan.id !== 'FREE' && (
        <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-t-xl py-2 text-center">
          <span className="text-white font-bold text-sm"> PLAN AGOTADO</span>
        </div>
      )}
      {isExpired && isActive && plan.id !== 'FREE' && (
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-t-xl py-2 text-center">
          <span className="text-white font-bold text-sm"> PLAN VENCIDO</span>
        </div>
      )}
      {isExhausted && isActive && plan.id === 'FREE' && (
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-t-xl py-2 text-center">
          <span className="text-white font-bold text-sm"> PLAN CONSUMIDO</span>
        </div>
      )}
      {isExhausted && !isActive && (
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-t-xl py-2 text-center">
          <span className="text-white font-bold text-sm"> PLAN AGOTADO</span>
        </div>
      )}
      {plan.isFeatured && !isExhausted && !isActive && !isExpired && (
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-t-xl py-2 text-center">
          <span className="text-white font-bold text-sm"> MÁS POPULAR</span>
        </div>
      )}

      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
        <p className="text-gray-600 mb-6">{plan.description}</p>

        <div className="space-y-2 mb-8">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={isActive ? 'text-green-500' : isExhausted ? 'text-gray-400' : 'text-green-500'}>[OK]</span>
              <span className={isExhausted && !isActive ? 'text-gray-500 line-through' : 'text-gray-700'}>
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center">
          {/* Billing Cycle Selection */}
          {!isActive && !isExhausted && !isExpired && plan.id !== 'FREE' && (
            <div className="mb-4">
              <div className="flex justify-center gap-2 mb-3">
                <button
                  onClick={() => onBillingCycleChange?.('MONTHLY')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    currentCycle === 'MONTHLY'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => onBillingCycleChange?.('QUARTERLY')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    currentCycle === 'QUARTERLY'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Trimestral
                </button>
                <button
                  onClick={() => onBillingCycleChange?.('YEARLY')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    currentCycle === 'YEARLY'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Anual
                </button>
              </div>
              
              {/* Show discount badges for billing cycles */}
              {currentCycle !== 'MONTHLY' && (
                <div className="flex justify-center gap-2 mb-2">
                  {currentCycle === 'QUARTERLY' && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      10% OFF
                    </span>
                  )}
                  {currentCycle === 'YEARLY' && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      20% OFF
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mostrar precio con descuento */}
          {hasPriceDiscount ? (
            <div className="mb-2">
              <div className="text-gray-400 line-through text-sm mb-1">
                {formatPrice(currentPrice, plan.currency)}
              </div>
              <div className="text-4xl font-bold text-green-600">
                {formatPrice(finalPrice, plan.currency)}
              </div>
              <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full inline-block mt-2">
                 {discountPercentage}% OFF
              </div>
            </div>
          ) : (
            <div className="text-4xl font-bold mb-2 text-gray-900">
              {formatPrice(finalPrice, plan.currency)}
            </div>
          )}
          
          {/* Show billing cycle duration */}
          {plan.id !== 'FREE' && (
            <p className="text-sm mb-2 text-gray-500">
              {currentCycle === 'MONTHLY' && '30 días'}
              {currentCycle === 'QUARTERLY' && '90 días (3 meses)'}
              {currentCycle === 'YEARLY' && '365 días (1 año)'}
            </p>
          )}
          
          <p className="text-sm mb-6 text-gray-500">
            {plan.maxPublications} publicaciones
          </p>

          <button
            onClick={() => {
              // Only allow selection if plan is not exhausted and not active
              if (!isExhausted && !isActive && !isExpired) {
                onSelectPlan(plan);
              }
              // Allow renewal only for expired plans
              else if (canRenew && isActive) {
                onSelectPlan(plan);
              }
            }}
            disabled={
              (isActive && !isExhausted && !isExpired) || 
              (isExhausted && plan.id === 'FREE') || 
              (isExhaustedByLimit && !canRenew) ||
              (isExpired && !canRenew)
            }
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
              canRenew && isActive
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg animate-pulse'
                : isExhaustedByLimit && !canRenew
                ? 'bg-red-100 text-red-700 cursor-not-allowed'
                : isExpired && !canRenew
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : isExhausted && !isActive
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isActive
                ? 'bg-green-500 text-white cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } ${isSelected && !isExhausted && !isActive && !isExpired ? 'ring-4 ring-blue-600 ring-opacity-50' : ''}`}
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
      </div>
    </div>
  );
}
