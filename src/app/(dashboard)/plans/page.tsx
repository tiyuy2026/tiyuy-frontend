'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { AdminRestrictionGuard } from '@/presentation/components/guards/AdminRestrictionGuard';
import { useAvailablePlans, useSubscribeToPlan, useActiveSubscription, useAvailableDeveloperDiscountCodes } from '@/presentation/hooks/useFinance';
import { useValidateDeveloperDiscountCode, useUseDeveloperDiscountCode } from '@/presentation/hooks/admin/useDevelopers';
import { useMyProperties } from '@/presentation/hooks/useProperties';
import { PlanCard } from '@/presentation/components/finance';
import { SubscriptionPlan, BillingCycle } from '@/core/domain/entities/Wallet';
import { UpgradePlanModal } from '@/presentation/components/modals/UpgradePlanModal';
import { authStorage } from '@/infrastructure/storage/auth-storage';
import HeroSection from './HeroSection';

export default function PlansPage() {
  const { data: plans, isLoading } = useAvailablePlans();
  const { data: activeSubscription, refetch: refetchSubscription } = useActiveSubscription();
  const { data: propertiesData } = useMyProperties();
  const { data: availableDiscountCodes } = useAvailableDeveloperDiscountCodes();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const subscribeMutation = useSubscribeToPlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [selectedBillingCycles, setSelectedBillingCycles] = useState<Record<string, BillingCycle>>({});
  
  // Hooks para descuentos manuales
  const validateDiscountMutation = useValidateDeveloperDiscountCode();
  const useDiscountMutation = useUseDeveloperDiscountCode();
  const [manualDiscountCode, setManualDiscountCode] = useState('');
  const [appliedManualDiscount, setAppliedManualDiscount] = useState<{
    valid: boolean;
    discountPercentage?: number;
    originalPrice?: number;
    discountedPrice?: number;
    message: string;
  } | null>(null);
  const [isValidatingManual, setIsValidatingManual] = useState(false);

  // Check if user is agent and has available discount codes
  const userData = authStorage.getUser();
  
  const userRole = userData?.role;
  const isAgent = userRole === 'AGENT';
  const isDeveloper = userRole === 'DEVELOPER';
  // SEGURIDAD: Agentes pueden tener descuentos en todos los planes, Developers solo en empresariales
  const hasAgencyRole = isAgent || isDeveloper;
  const hasDiscountCodes = hasAgencyRole && availableDiscountCodes && availableDiscountCodes.length > 0;
  
  // Función para determinar si un plan es empresarial
  const isEnterprisePlan = (plan: SubscriptionPlan): boolean => {
    // Consideramos empresariales los planes con precios altos o nombres que indican nivel empresarial
    const enterpriseKeywords = ['EMPRESARIAL', 'ENTERPRISE', 'PREMIUM', 'BUSINESS'];
    const planNameUpper = plan.name.toUpperCase();
    const hasEnterpriseKeyword = enterpriseKeywords.some(keyword => planNameUpper.includes(keyword));
    const isHighValuePlan = plan.price >= 199; // Planes de S/199 o más se consideran empresariales
    
    return hasEnterpriseKeyword || isHighValuePlan;
  };

  // Función para detectar descuentos inteligentes basados en reglas de negocio - DINÁMICO DESDE BACKEND
  const detectIntelligentDiscount = (plan: SubscriptionPlan): { code: string; percentage: number } | null => {
    // Para Developers: solo aplicar descuentos en planes empresariales
    if (isDeveloper && !isEnterprisePlan(plan)) {
      return null;
    }
    
    // Para Agents: solo si tienen descuentos de agencia
    if (isAgent && !hasDiscountCodes) {
      return null;
    }
    
    // Buscar descuento inteligente en los descuentos disponibles del backend
    if (availableDiscountCodes && availableDiscountCodes.length > 0) {
      const intelligentDiscount = availableDiscountCodes.find(discount => 
        discount.status === 'ACTIVE' && 
        discount.code && discount.code.startsWith('AUTO')
      );
      
      if (intelligentDiscount) {
        return {
          code: intelligentDiscount.code,
          percentage: intelligentDiscount.discountPercentage
        };
      }
    }
    
    return null;
  };

  // Función para validar descuento manual
  const handleValidateManualDiscount = async () => {
    if (!manualDiscountCode.trim() || !selectedPlan) return;
    
    setIsValidatingManual(true);
    try {
      const result = await validateDiscountMutation.mutateAsync({
        code: manualDiscountCode,
        planCode: selectedPlan.name // Usar name en lugar de code
      });
      
      setAppliedManualDiscount(result);
      
      if (!result.valid) {
        toast.error(result.message);
      } else {
        toast.success('¡Descuento aplicado correctamente!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al validar el código');
    } finally {
      setIsValidatingManual(false);
    }
  };

  // Función para verificar si un descuento es válido para este usuario
  const isDiscountValidForUser = (discount: any) => {
    // 1. Verificar que el descuento esté activo
    if (discount.status !== 'ACTIVE') {
      return false;
    }
    
    // 2. Verificar que no haya expirado
    if (discount.validUntil) {
      const expiryDate = new Date(discount.validUntil);
      const now = new Date();
      if (now > expiryDate) {
        return false;
      }
    }
    
    // 3. Verificar que no haya alcanzado el límite de uso
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      return false;
    }
    
    return true;
  };

  // Auto-aplicar descuento de agencia SOLO si no hay descuento inteligente ni manual
  useEffect(() => {
    // No aplicar descuento de agencia si ya hay descuento manual aplicado
    if (appliedManualDiscount?.valid) {
      return;
    }
    
    if (isAgent && hasDiscountCodes && availableDiscountCodes && availableDiscountCodes.length > 0) {
      // Filtrar descuentos válidos para este usuario
      const validDiscounts = availableDiscountCodes.filter(discount => isDiscountValidForUser(discount));
      
      if (validDiscounts.length === 0) {
        setDiscountCode(''); // Limpiar descuento
        return;
      }
      
      // Usar el primer descuento válido
      const validDiscount = validDiscounts[0];
      const discountCodeValue = validDiscount.code;
      
      setDiscountCode(discountCodeValue);
    }
  }, [isAgent, hasDiscountCodes, availableDiscountCodes, appliedManualDiscount?.valid]);

  // Calcular precio con descuento para el plan seleccionado
  const getDiscountedPrice = (plan: SubscriptionPlan) => {
    // #1 Prioridad MÁXIMA: Descuento de agencia desde backend (AgencyPlanDiscount)
    if (plan.agencyDiscountedPrice != null && plan.agencyDiscountedPrice < plan.price) {
      return plan.agencyDiscountedPrice;
    }
    
    // #2 Descuento manual aplicado por código
    const isManualDiscountValid = appliedManualDiscount?.valid && 
      plan.name === selectedPlan?.name && 
      appliedManualDiscount.discountedPrice !== undefined;
    
    if (isManualDiscountValid) {
      return appliedManualDiscount.discountedPrice || plan.price;
    }
    
    // #3 Descuento inteligente (códigos AUTO)
    const intelligentDiscount = detectIntelligentDiscount(plan);
    if (intelligentDiscount) {
      return plan.price - (plan.price * intelligentDiscount.percentage / 100);
    }
    
    // #4 Descuento de agente por código
    const isAgentDiscountValid = hasDiscountCodes && 
      availableDiscountCodes.length > 0 && 
      (availableDiscountCodes[0] as any).status === 'ACTIVE';
    
    if (isAgentDiscountValid) {
      const agentDiscount = availableDiscountCodes[0];
      const discountPercent = (agentDiscount as any).discountPercentage || (agentDiscount as any).discountPercent || 0;
      return plan.price - (plan.price * discountPercent / 100);
    }
    
    return plan.price;
  };

  // Calculate published properties count
  const publishedCount = (propertiesData?.properties || []).filter(
    (p: any) => p.status === 'PUBLISHED'
  ).length;

  // Handle billing cycle change for a plan
  const handleBillingCycleChange = (planId: string, cycle: BillingCycle) => {
    setSelectedBillingCycles(prev => ({
      ...prev,
      [planId]: cycle
    }));
  };

  useEffect(() => {
    refetchSubscription();
  }, [refetchSubscription]);

  useEffect(() => {
    if (!showUpgradeModal) {
      setTimeout(() => refetchSubscription(), 1000);
    }
  }, [showUpgradeModal, refetchSubscription]);

  // Enhanced plan exhaustion detection with expiration date validation
  // Mapeo ID numerico a codigo tier (mismo que FinanceRepository)
  const planIdToTier: Record<string, string> = {
    '1': 'FREE', '2': 'BASIC', '3': 'PREMIUM',
    '4': 'ENTERPRISE_TRIAL', '5': 'ENTERPRISE'
  };
  const getPlanTierCode = (planId: string): string => planIdToTier[planId] || planId;

  const isPlanExhausted = (plan: SubscriptionPlan) => {
    const planTier = getPlanTierCode(plan.id);
    
    // ENTERPRISE y ENTERPRISE_TRIAL son para proyectos, no tienen límite de publicaciones
    // Solo se agotan si expiran
    if (planTier === 'ENTERPRISE' || planTier === 'ENTERPRISE_TRIAL') {
      if (!activeSubscription) return false;
      const currentTier = (activeSubscription as any).tier || activeSubscription.plan?.id;
      if (currentTier !== planTier) return false;
      const expirationDate = activeSubscription.expiresAt;
      return expirationDate && new Date(expirationDate) <= new Date();
    }

    // FREE plan special case: permanently blocked after first use
    if (planTier === 'FREE') {
      // If user has any published property, FREE is permanently blocked
      if (publishedCount >= 1) return true;
      
      // If user has active paid subscription, FREE is also blocked
      if (activeSubscription && activeSubscription.plan?.id !== 'FREE') return true;
      
      // If user has FREE subscription but no remaining publications, it's blocked
      if (activeSubscription && activeSubscription.plan?.id === 'FREE' 
          && activeSubscription.remainingPublications <= 0) return true;
      
      return false;
    }

    // For paid plans (BASIC, PREMIUM), only evaluate if there's an active subscription
    if (!activeSubscription) return false;

    // Get current plan tier, remaining publications, and expiration date
    const currentTier = (activeSubscription as any).tier || activeSubscription.plan?.id;
    const remainingPublications = activeSubscription.remainingPublications || 0;
    const expirationDate = activeSubscription.expiresAt;
    
    // If this is the current active plan
    if (currentTier === planTier) {
      // Check if plan is expired
      if (expirationDate) {
        const expiration = new Date(expirationDate);
        const now = new Date();
        if (expiration <= now) {
          return true; // Plan is expired - can be renewed
        }
      }
      
      // Plan is exhausted when no remaining publications but NOT expired
      return remainingPublications <= 0;
    }
    
    // If user has a different active plan, this plan is not exhausted (available for upgrade)
    return false;
  };

  // Check if plan can be renewed (only when expired, not just exhausted)
  const canRenewPlan = (plan: SubscriptionPlan) => {
    const planTier = getPlanTierCode(plan.id);
    if (planTier === 'FREE') return false; // FREE plan cannot be renewed
    
    if (!activeSubscription) return false;
    
    const currentTier = (activeSubscription as any).tier || activeSubscription.plan?.id;
    const expirationDate = activeSubscription.expiresAt;
    
    // Can only renew if this is the current active plan AND it's expired
    return currentTier === planTier && expirationDate && new Date(expirationDate) <= new Date();
  };

  // Check if plan is expired (by time)
  const isPlanExpired = (plan: SubscriptionPlan) => {
    const planTier = getPlanTierCode(plan.id);
    if (!activeSubscription) return false;
    
    const currentTier = (activeSubscription as any).tier || activeSubscription.plan?.id;
    const expirationDate = activeSubscription.expiresAt;
    
    // Only check expiration for the current active plan
    if (currentTier !== planTier) return false;
    
    return expirationDate && new Date(expirationDate) <= new Date();
  };

  // Check if plan is exhausted (by publication limit, not expired)
  const isPlanExhaustedByLimit = (plan: SubscriptionPlan) => {
    const planTier = getPlanTierCode(plan.id);
    if (planTier === 'FREE') {
      if (publishedCount >= 1) return true;
      if (activeSubscription && activeSubscription.plan?.id !== 'FREE') return true;
      if (activeSubscription && activeSubscription.plan?.id === 'FREE' 
          && activeSubscription.remainingPublications <= 0) return true;
      return false;
    }

    if (!activeSubscription) return false;

    const currentTier = activeSubscription.plan?.id;
    const remainingPublications = activeSubscription.remainingPublications || 0;
    
    if (currentTier === planTier && remainingPublications <= 0) {
      const expirationDate = activeSubscription.expiresAt;
      return !expirationDate || new Date(expirationDate) > new Date();
    }
    
    return false;
  };

  // Misma lógica que el modal - abre MercadoPago
  const handleSubscribe = () => {
    if (!selectedPlan) return;

    const finalPrice = getDiscountedPrice(selectedPlan);

    subscribeMutation.mutate({
      planId: selectedPlan.id,
      paymentMethod: 'MERCADOPAGO',
      discountCode: discountCode || undefined,
    }, {
      onSuccess: async (subscription) => {
        try {
          const token = authStorage.getToken();
          
          const response = await fetch(
            `/api/finance/mercadopago/create-preference`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                subscriptionId: subscription.id.toString(),
                title: selectedPlan.name,
                unitPrice: finalPrice,
                frontendUrl: window.location.origin
              })
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            toast.error(`Error ${response.status} al crear preferencia`);
            return;
          }

          const data = await response.json();
          // Usar init_point (producción) primero. sandbox_init_point solo para pruebas.
          const url = data.init_point || data.initPoint ||
                      data.sandbox_init_point || data.sandboxInitPoint;

          if (url) {
            window.location.href = url;
          } else {
            toast.error('No se recibio URL de pago');
          }
        } catch (error) {
          toast.error('Error al iniciar pago: ' + (error as any).message);
        }
      },
      onError: (error: any) => {
        if (error?.response?.status === 409) {
          toast.error('Ya tienes una suscripción activa');
        } else {
          toast.error(error.response?.data?.message || 'Error al crear suscripción');
        }
      }
    });
  };

  const features = [
    'Publicación de propiedades ilimitadas',
    'Fotos hasta 20 por propiedad',
    'Destacado en búsquedas',
    'Soporte prioritario',
    'Estadísticas avanzadas',
    'Contacto directo con clientes'
  ];

  return (
    <ProtectedRoute>
      <AdminRestrictionGuard feature="plans">
      <div className="min-h-screen bg-gray-50">
        <div className="relative bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary-light)] via-white to-white opacity-50"></div>
          <HeroSection />
        </div>

        <div className="max-w-[1920px] mx-auto px-8 xl:px-16 pb-16 pt-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Elige tu Plan Ideal</h2>
            <p className="text-lg text-gray-600">Precios transparentes, sin sorpresas. Escalable según tu crecimiento.</p>
          </div>

          <div className="relative">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
                <p className="mt-4 text-gray-600">Cargando planes...</p>
              </div>
            ) : plans && plans.length > 0 ? (
              <div className="relative px-1 pb-4">
                <button
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      const cardWidth = scrollContainerRef.current.clientWidth;
                      scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
                    }
                  }}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer border border-gray-200"
                >
                  <Icon icon="material-symbols:chevron-left-rounded" className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      const cardWidth = scrollContainerRef.current.clientWidth;
                      scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
                    }
                  }}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer border border-gray-200"
                >
                  <Icon icon="material-symbols:chevron-right-rounded" className="w-6 h-6 text-gray-700" />
                </button>

                <div className="overflow-visible pt-8 pb-8 px-2">
                  <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                  >
                    {plans.map((plan) => {
                      const backendTier = activeSubscription ? activeSubscription.plan?.id : null;
                      const planIdToTier: Record<string, string> = {
                        '1': 'FREE', '2': 'BASIC', '3': 'PREMIUM',
                        '4': 'ENTERPRISE_TRIAL', '5': 'ENTERPRISE'
                      };
                      const planTierCode = planIdToTier[plan.id] || plan.id;
                      const isActive = !activeSubscription ? planTierCode === 'FREE' : backendTier === planTierCode;
                      const isExhausted = isPlanExhausted(plan);
                      const intelligentDiscount = detectIntelligentDiscount(plan);
                      let finalDiscountCode = '';
                      let finalDiscountPercentage = 0;
                      let hasAnyDiscount = false;
                      
                      if (appliedManualDiscount?.valid && plan.name === selectedPlan?.name) {
                        finalDiscountCode = manualDiscountCode;
                        finalDiscountPercentage = appliedManualDiscount.discountPercentage || 0;
                        hasAnyDiscount = true;
                      } else if (intelligentDiscount) {
                        finalDiscountCode = intelligentDiscount.code;
                        finalDiscountPercentage = intelligentDiscount.percentage;
                        hasAnyDiscount = true;
                      } else if (hasDiscountCodes && availableDiscountCodes && availableDiscountCodes.length > 0) {
                        const agentDiscount = availableDiscountCodes[0];
                        const discountCodeObj = (agentDiscount as any).discountCode;
                        if (discountCodeObj) {
                          finalDiscountCode = discountCodeObj.code || '';
                          finalDiscountPercentage = discountCodeObj.discountPercentage || 0;
                        } else {
                          finalDiscountCode = (agentDiscount as any).code || '';
                          finalDiscountPercentage = (agentDiscount as any).discountPercentage || 0;
                        }
                        hasAnyDiscount = finalDiscountPercentage > 0;
                      }

                      return (
                        <div key={plan.id} className="min-w-full sm:min-w-[50%] lg:min-w-[25%]">
                          <PlanCard
                            plan={plan}
                            onSelectPlan={setSelectedPlan}
                            isSelected={selectedPlan?.id === plan.id}
                            isActive={isActive}
                            isExhausted={isExhausted}
                            isExpired={isPlanExpired(plan)}
                            isExhaustedByLimit={isPlanExhaustedByLimit(plan)}
                            canRenew={canRenewPlan(plan)}
                            discountPercentage={finalDiscountPercentage}
                            hasDiscount={hasAnyDiscount}
                            selectedBillingCycle={selectedBillingCycles[plan.id] || 'MONTHLY'}
                            onBillingCycleChange={(cycle) => handleBillingCycleChange(plan.id, cycle)}
                            agencyDiscountPrice={plan.agencyDiscountedPrice}
                            agencyOriginalPrice={plan.agencyDiscountedPrice ? plan.price : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-red-600">No se pudieron cargar los planes. Intenta nuevamente.</p>
              </div>
            )}
          </div>

          {selectedPlan && (
            <div className="mt-12 text-center">
              {/* Discount Code Section - Ultra-Inteligente: Solo muestra si no hay automáticos */}
               {(() => {
                 const intelligentDiscount = detectIntelligentDiscount(selectedPlan);
                 const hasAgencyDiscount = hasAgencyRole && hasDiscountCodes;
                 const hasAnyDiscountAvailable = intelligentDiscount || hasAgencyDiscount || appliedManualDiscount?.valid;
                 
                 if (hasAnyDiscountAvailable) {
                   if (intelligentDiscount) {
                     return (
                       <div className="mb-8 bg-[var(--brand-primary-light)] border border-[var(--brand-primary)] rounded-xl p-6 max-w-md mx-auto">
                         <div className="flex items-center gap-2 mb-2">
                           <Icon icon="material-symbols:local-offer-rounded" className="w-5 h-5 text-[var(--brand-primary)]" />
                           <h3 className="text-sm font-bold text-[var(--brand-primary)]">
                             Descuento inteligente aplicado
                           </h3>
                         </div>
                         <div className="text-sm text-gray-700">
                           Se ha aplicado automáticamente un {intelligentDiscount.percentage}% de descuento según el precio del plan.
                         </div>
                       </div>
                     );
                   } else if (hasAgencyDiscount) {
                     return (
                       <div className="mb-8 bg-[var(--brand-primary-light)] border border-[var(--brand-primary)] rounded-xl p-6 max-w-md mx-auto">
                         <div className="flex items-center gap-2 mb-2">
                           <Icon icon="material-symbols:business-center-rounded" className="w-5 h-5 text-[var(--brand-primary)]" />
                           <h3 className="text-sm font-bold text-[var(--brand-primary)]">
                             Descuento de agencia aplicado
                           </h3>
                         </div>
                         <div className="text-sm text-gray-700">
                           Se ha aplicado automáticamente el descuento de tu inmobiliaria.
                         </div>
                       </div>
                     );
                   } else if (appliedManualDiscount?.valid) {
                     return (
                       <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
                         <div className="flex items-center gap-2 mb-2">
                           <Icon icon="material-symbols:check-circle-rounded" className="w-5 h-5 text-green-600" />
                           <h3 className="text-sm font-bold text-green-800">
                             Descuento personal aplicado
                           </h3>
                         </div>
                         <div className="text-sm text-gray-700">
                           {appliedManualDiscount.message}
                         </div>
                       </div>
                     );
                   }
                 }
                 
                 if (!intelligentDiscount && !hasAgencyDiscount && !appliedManualDiscount?.valid) {
                   return (
                     <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
                       <div className="flex items-center gap-2 mb-3">
                         <Icon icon="material-symbols:local-offer-rounded" className="w-5 h-5 text-yellow-600" />
                         <h3 className="text-sm font-bold text-yellow-800">
                           ¿Tienes un código de descuento personal?
                         </h3>
                       </div>
                       <div className="flex gap-2">
                         <input
                           type="text"
                           value={manualDiscountCode}
                           onChange={(e) => setManualDiscountCode(e.target.value.toUpperCase())}
                           placeholder="Ingresa tu código (ej: DESCUENTO20)"
                           className="flex-1 px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm uppercase"
                           disabled={appliedManualDiscount?.valid || isValidatingManual}
                         />
                         <button
                           onClick={handleValidateManualDiscount}
                           disabled={!manualDiscountCode.trim() || isValidatingManual || appliedManualDiscount?.valid}
                           className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                             appliedManualDiscount?.valid
                               ? 'bg-green-500 text-white cursor-default'
                               : selectedPlan?.name === 'PREMIUM' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                           }`}
                         >
                           {isValidatingManual ? (
                             <span className="flex items-center gap-1">
                               <Icon icon="line-md:loading-loop" className="w-4 h-4" />
                               Validando...
                             </span>
                           ) : appliedManualDiscount?.valid ? (
                             <span className="flex items-center gap-1">
                               <Icon icon="material-symbols:check-rounded" className="w-4 h-4" />
                               Aplicado
                             </span>
                           ) : (
                             'Aplicar'
                           )}
                         </button>
                       </div>
                       {appliedManualDiscount?.valid && (
                         <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                           <Icon icon="material-symbols:info-rounded" className="w-4 h-4" />
                           {appliedManualDiscount.message}
                         </p>
                       )}
                       {appliedManualDiscount && !appliedManualDiscount.valid && (
                         <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                           <Icon icon="material-symbols:error-rounded" className="w-4 h-4" />
                           {appliedManualDiscount.message}
                         </p>
                       )}
                     </div>
                   );
                 }
                 
                 return null;
               })()}
              
               <button
                 onClick={handleSubscribe}
                 disabled={subscribeMutation.isPending}
                 className={`bg-[var(--brand-primary)] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[var(--brand-primary-hover)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                   !subscribeMutation.isPending ? 'cursor-pointer' : ''
                 }`}
               >
                 {subscribeMutation.isPending ? (
                   <span className="flex items-center gap-2">
                     <Icon icon="line-md:loading-loop" className="w-5 h-5" />
                     Procesando...
                   </span>
                 ) : (
                   (() => {
                     const originalPrice = selectedPlan.price ?? 0;
                     const discountedPrice = getDiscountedPrice(selectedPlan);
                     const hasDiscount = discountedPrice < originalPrice;
                     
                     return (
                       <div className="flex flex-col items-center">
                         {hasDiscount && (
                           <div className="text-sm line-through text-gray-300 mb-1">
                             S/ {originalPrice.toLocaleString('es-PE')}
                           </div>
                         )}
                         <div className="flex items-center gap-2">
                           <span>Suscribirse al Plan {selectedPlan.name}</span>
                           <span className="font-bold">
                             - S/ {discountedPrice.toLocaleString('es-PE')}
                           </span>
                           {hasDiscount && (
                             <span className="bg-white text-[var(--brand-primary)] text-xs px-2 py-1 rounded-full font-bold">
                               {Math.round((1 - discountedPrice / originalPrice) * 100)}% OFF
                             </span>
                           )}
                         </div>
                       </div>
                     );
                   })()
                 )}
               </button>
            </div>
          )}
        </div>
      </div>
      </AdminRestrictionGuard>

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </ProtectedRoute>
  );
}
