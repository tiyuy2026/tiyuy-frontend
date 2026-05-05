'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useAvailablePlans, useSubscribeToPlan, useActiveSubscription, useAvailableDeveloperDiscountCodes } from '@/presentation/hooks/useFinance';
import { useValidateDeveloperDiscountCode, useUseDeveloperDiscountCode } from '@/presentation/hooks/admin/useDevelopers';
import { useMyProperties } from '@/presentation/hooks/useProperties';
import { PlanCard } from '@/presentation/components/finance';
import { SubscriptionPlan } from '@/core/domain/entities/Wallet';
import { UpgradePlanModal } from '@/presentation/components/modals/UpgradePlanModal';
import { authStorage } from '@/infrastructure/storage/auth-storage';

export default function PlansPage() {
  const { data: plans, isLoading } = useAvailablePlans();
  const { data: activeSubscription, refetch: refetchSubscription } = useActiveSubscription();
  const { data: propertiesData } = useMyProperties();
  const { data: availableDiscountCodes } = useAvailableDeveloperDiscountCodes();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const subscribeMutation = useSubscribeToPlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  
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
  console.log('🔍 DEBUG: Datos completos del usuario:', userData);
  
  const userRole = userData?.role;
  const isAgent = userRole === 'AGENT';
  const isDeveloper = userRole === 'DEVELOPER';
  // 🔒 SEGURIDAD: Agentes pueden tener descuentos en todos los planes, Developers solo en empresariales
  const hasAgencyRole = isAgent || isDeveloper;
  const hasDiscountCodes = hasAgencyRole && availableDiscountCodes && availableDiscountCodes.length > 0;
  
  console.log('🔍 DEBUG: Información de agencia:', {
    userId: userData?.id,
    agencyId: userData?.agencyId,
    agencyName: userData?.agencyName,
    role: userRole,
    isAgent,
    isDeveloper,
    hasAgencyRole,
    hasDiscountCodes,
    availableDiscountCodes,
    availableDiscountCodesLength: availableDiscountCodes?.length || 0
  });

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
    console.log('🔍 Detectando descuento inteligente para plan:', plan.name, 'precio:', plan.price);
    
    // Para Developers: solo aplicar descuentos en planes empresariales
    if (isDeveloper && !isEnterprisePlan(plan)) {
      console.log('🚫 Developer solo puede tener descuentos en planes empresariales');
      return null;
    }
    
    // Para Agents: solo si tienen descuentos de agencia
    if (isAgent && !hasDiscountCodes) {
      console.log('🚫 Agente no tiene descuentos de agencia disponibles');
      return null;
    }
    
    // Buscar descuento inteligente en los descuentos disponibles del backend
    if (availableDiscountCodes && availableDiscountCodes.length > 0) {
      const intelligentDiscount = availableDiscountCodes.find(discount => 
        discount.status === 'ACTIVE' && 
        discount.code && discount.code.startsWith('AUTO')
      );
      
      if (intelligentDiscount) {
        console.log('✅ Descuento inteligente encontrado desde backend:', intelligentDiscount.code, intelligentDiscount.discountPercentage + '%');
        return {
          code: intelligentDiscount.code,
          percentage: intelligentDiscount.discountPercentage
        };
      }
    }
    
    console.log('❌ No se encontraron descuentos inteligentes para este plan');
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
    console.log('🔍 DEBUG: Validando descuento para usuario:', {
      userId: userData?.id,
      agencyId: userData?.agencyId,
      role: userData?.role,
      discountId: discount.id,
      discountCode: discount.code
    });
    
    // 1. Verificar que el descuento esté activo
    if (discount.status !== 'ACTIVE') {
      console.log('❌ Descuento inválido: No está activo');
      return false;
    }
    
    // 2. Verificar que no haya expirado
    if (discount.validUntil) {
      const expiryDate = new Date(discount.validUntil);
      const now = new Date();
      if (now > expiryDate) {
        console.log('❌ Descuento inválido: Ha expirado', {
          validUntil: discount.validUntil,
          now: now.toISOString()
        });
        return false;
      }
    }
    
    // 3. Verificar que no haya alcanzado el límite de uso
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      console.log('❌ Descuento inválido: Ha alcanzado el límite de uso');
      return false;
    }
    
    // 4. SEGURIDAD CRÍTICA: Verificar que el usuario pertenezca a la misma inmobiliaria
    // NOTA: Esto es un parche temporal. El backend debería filtrar por agencyId.
    if (userData?.role === 'AGENT' && userData?.agencyId) {
      // El descuento debe estar asignado a un agente de la misma inmobiliaria
      // Por ahora, como el backend no filtra correctamente, necesitamos validar en frontend
      
      // Si el descuento tiene userId, verificamos que pertenezca a un usuario de la misma agencia
      // Esto es complicado porque el backend no devuelve la información de la agencia del descuento
      console.log('🚨 SEGURIDAD: Verificando agencia del usuario');
      console.log('🔍 Usuario agencyId:', userData?.agencyId);
      console.log('🔍 Descuento asignado a userId:', discount.userId);
      
      // Por ahora, permitimos el descuento pero registramos la advertencia de seguridad
      console.log('⚠️ ADVERTENCIA: El backend debería filtrar descuentos por agencyId');
      console.log('⚠️ Actualmente todos los agentes ven todos los descuentos - PROBLEMA DE SEGURIDAD');
    }
    
    console.log('✅ Descuento válido para este usuario (con advertencias de seguridad)');
    return true;
  };

  // Auto-aplicar descuento de agencia SOLO si no hay descuento inteligente ni manual
  useEffect(() => {
    console.log('🔍 DEBUG: useEffect de descuentos - availableDiscountCodes:', availableDiscountCodes);
    
    // No aplicar descuento de agencia si ya hay descuento manual aplicado
    if (appliedManualDiscount?.valid) {
      console.log('🚫 Saltando aplicación de descuento de agencia - ya hay descuento manual');
      return;
    }
    
    if (isAgent && hasDiscountCodes && availableDiscountCodes && availableDiscountCodes.length > 0) {
      console.log('🔍 DEBUG: Analizando descuentos disponibles:');
      availableDiscountCodes.forEach((discount, index) => {
        console.log(`🔍 Descuento ${index + 1}:`, {
          id: discount.id,
          code: discount.code,
          discountPercentage: discount.discountPercentage,
          status: discount.status,
          validUntil: discount.validUntil
        });
      });
      
      // Filtrar descuentos válidos para este usuario
      const validDiscounts = availableDiscountCodes.filter(discount => isDiscountValidForUser(discount));
      
      if (validDiscounts.length === 0) {
        console.log('❌ No hay descuentos válidos para este usuario');
        setDiscountCode(''); // Limpiar descuento
        return;
      }
      
      // Usar el primer descuento válido
      const validDiscount = validDiscounts[0];
      const discountCodeValue = validDiscount.code;
      
      console.log('✅ Descuento válido encontrado y aplicado:', discountCodeValue);
      setDiscountCode(discountCodeValue);
      console.log('🎁 Descuento de agencia aplicado automáticamente:', discountCodeValue);
    }
  }, [isAgent, hasDiscountCodes, availableDiscountCodes, appliedManualDiscount?.valid]);

  // Calcular precio con descuento para el plan seleccionado
  const getDiscountedPrice = (plan: SubscriptionPlan) => {
    // Prioridad: 1. Descuento manual aplicado, 2. Descuento inteligente, 3. Descuento de agente
    
    // Verificar si los descuentos actuales siguen siendo válidos
    const isManualDiscountValid = appliedManualDiscount?.valid && 
      plan.name === selectedPlan?.name && 
      appliedManualDiscount.discountedPrice !== undefined;
    
    const isAgentDiscountValid = hasDiscountCodes && 
      availableDiscountCodes.length > 0 && 
      (availableDiscountCodes[0] as any).status === 'ACTIVE';
    
    if (isManualDiscountValid) {
      return appliedManualDiscount.discountedPrice || plan.price;
    }
    
    const intelligentDiscount = detectIntelligentDiscount(plan);
    
    if (intelligentDiscount) {
      return plan.price - (plan.price * intelligentDiscount.percentage / 100);
    }
    
    if (isAgentDiscountValid) {
      const agentDiscount = availableDiscountCodes[0];
      const discountPercent = (agentDiscount as any).discountPercentage || (agentDiscount as any).discountPercent || 0;
      console.log('💰 Calculando descuento:', { planPrice: plan.price, discountPercent, agentDiscount });
      return plan.price - (plan.price * discountPercent / 100);
    }
    
    // Si ningún descuento es válido, volver al precio normal
    console.log('⚠️ Ningún descuento válido, volviendo al precio normal');
    return plan.price;
  };

  // Calculate published properties count
  const publishedCount = (propertiesData?.properties || []).filter(
    (p: any) => p.status === 'PUBLISHED'
  ).length;

  useEffect(() => {
    refetchSubscription();
  }, [refetchSubscription]);

  useEffect(() => {
    if (!showUpgradeModal) {
      setTimeout(() => refetchSubscription(), 1000);
    }
  }, [showUpgradeModal, refetchSubscription]);

  // ✅ Lógica corregida para detectar plan agotado
  const isPlanExhausted = (plan: SubscriptionPlan) => {
    if (plan.id !== 'FREE') return false;

    // Tiene suscripción de pago → FREE agotado
    if (activeSubscription && (activeSubscription as any).tier !== 'FREE') return true;

    // Tiene FREE pero sin publicaciones restantes → agotado
    if (activeSubscription && (activeSubscription as any).tier === 'FREE' 
        && activeSubscription.remainingPublications <= 0) return true;

    // Sin suscripción pero ya publicó 1 → agotado
    if (!activeSubscription && publishedCount >= 1) return true;

    return false;
  };

  // ✅ Misma lógica que el modal - abre MercadoPago
  const handleSubscribe = () => {
    if (!selectedPlan) return;

    const finalPrice = getDiscountedPrice(selectedPlan);
    console.log('💳 MERCADOPAGO: Enviando precio final:', { 
      planName: selectedPlan.name, 
      originalPrice: selectedPlan.price, 
      finalPrice,
      discountCode: discountCode || 'Ninguno'
    });

    subscribeMutation.mutate({
      planId: selectedPlan.id,
      paymentMethod: 'MERCADOPAGO',
      discountCode: discountCode || undefined,
    }, {
      onSuccess: async (subscription) => {
        try {
          const token = authStorage.getToken();
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/finance/mercadopago/create-preference`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                subscriptionId: subscription.id.toString(),
                title: `Plan ${selectedPlan.name}`,
                unitPrice: finalPrice
              })
            }
          );

          if (!response.ok) {
            toast.error('Error al crear preferencia de pago');
            return;
          }

          const data = await response.json();
          const url = data.sandbox_init_point || data.sandboxInitPoint ||
                      data.init_point || data.initPoint;

          if (url) {
            window.location.href = url; // ✅ misma pestaña, no se bloquea
          } else {
            toast.error('No se recibió URL de pago');
          }
        } catch (error) {
          toast.error('Error al iniciar el pago');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-6">Planes para Tu Negocio Inmobiliario</h1>
              <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
                Publica propiedades, reach más clientes y haz crecer tu negocio con los planes más flexibles del mercado peruano
              </p>
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2z" clipRule="evenodd" />
                  </svg>
                  <span>Cancela cuando quieras</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c0-1.021-.082-1.997-.233-2.926l-.003-.1a.998.998 0 00-.01-.192 7.99 7.99 0 00-4.495-4.095l-.003-.018A7.976 7.976 0 003.07 4.141l.09-.014c.827-.06 1.643-.19 2.433-.411l.012-.003a1 1 0 00.717-1.213l-4.022-2.304a1 1 0 00-1.064.092l-3.998 2.31a1 1 0 00-.292 1.411l2.02 3.485a1 1 0 001.111.518l2.167-1.257a11.951 11.951 0 005.475 5.475 11.951 11.951 0 00-5.475 5.475z" clipRule="evenodd" />
                  </svg>
                  <span>Soporte 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 001.745.723 3.066 3.066 0 001.745-.723 3.066 3.066 0 00-1.745-.723A3.066 3.066 0 006.267 3.455zm3.447 4.792a1 1 0 00-.617-.835l-2.833-1.89a1 1 0 00-.977.063l-2.833 1.89a1 1 0 00-.36 1.366l2.833 1.89a1 1 0 00.977-.063l2.833-1.89a1 1 0 00.36-1.366z" clipRule="evenodd" />
                  </svg>
                  <span>Métodos de pago seguros</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Todo lo que necesitas para tener éxito</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nuestras herramientas están diseñadas para maximizar tu visibilidad y facilitar la gestión de tus propiedades
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-md">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Elige tu Plan Ideal</h2>
            <p className="text-lg text-gray-600">Precios transparentes, sin sorpresas. Escalable según tu crecimiento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full text-center py-16">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Cargando planes...</p>
              </div>
            ) : plans ? (
              plans.map((plan) => {
                console.log('🔍 DEBUG: Procesando plan en /plans:', plan.name, 'precio:', plan.price);
                
                const backendTier = activeSubscription
                  ? (activeSubscription as any).tier || activeSubscription.plan?.id
                  : null;
                const isActive = !activeSubscription
                  ? plan.id === 'FREE'
                  : backendTier === plan.id;
                const isExhausted = isPlanExhausted(plan);
                
                // Detectar descuento inteligente para este plan específico
                const intelligentDiscount = detectIntelligentDiscount(plan);
                console.log('🤖 DEBUG: intelligentDiscount detectado:', intelligentDiscount);
                
                // Determinar qué descuento aplicar: manual, inteligente o de agente
                let finalDiscountCode = '';
                let finalDiscountPercentage = 0;
                let hasAnyDiscount = false;
                
                // Prioridad: 1. Descuento manual (solo para el plan seleccionado), 2. Descuento inteligente, 3. Descuento de agente
                if (appliedManualDiscount?.valid && plan.name === selectedPlan?.name) {
                  // Aplicar descuento manual solo al plan seleccionado
                  finalDiscountCode = manualDiscountCode;
                  finalDiscountPercentage = appliedManualDiscount.discountPercentage || 0;
                  hasAnyDiscount = true;
                  console.log('💳 Aplicando descuento manual:', finalDiscountCode, finalDiscountPercentage + '%');
                } else if (intelligentDiscount) {
                  // Priorizar descuento inteligente
                  finalDiscountCode = intelligentDiscount.code;
                  finalDiscountPercentage = intelligentDiscount.percentage;
                  hasAnyDiscount = true;
                  console.log('🤖 Aplicando descuento inteligente:', intelligentDiscount.code, intelligentDiscount.percentage + '%');
                } else if (hasDiscountCodes && availableDiscountCodes && availableDiscountCodes.length > 0) {
                  // Aplicar descuento de agente
                  const agentDiscount = availableDiscountCodes[0];
                  console.log('🔍 DEBUG agente discount structure completo:', agentDiscount);
                  
                  // Intentar diferentes estructuras posibles
                  const discountCodeObj = (agentDiscount as any).discountCode;
                  if (discountCodeObj) {
                    finalDiscountCode = discountCodeObj.code || '';
                    finalDiscountPercentage = discountCodeObj.discountPercentage || 0;
                  } else {
                    finalDiscountCode = (agentDiscount as any).code || '';
                    finalDiscountPercentage = (agentDiscount as any).discountPercentage || 0;
                  }
                  
                  hasAnyDiscount = finalDiscountPercentage > 0;
                  console.log('🎁 Aplicando descuento de agente:', finalDiscountCode, finalDiscountPercentage + '%');
                  console.log('🔍 DEBUG valores extraídos:', {
                    discountCodeObj,
                    finalDiscountCode,
                    finalDiscountPercentage,
                    hasAnyDiscount
                  });
                } else {
                  console.log('❌ No se aplica ningún descuento para', plan.name, {
                    hasDiscountCodes,
                    availableDiscountCodesLength: availableDiscountCodes?.length || 0,
                    intelligentDiscount,
                    appliedManualDiscountValid: appliedManualDiscount?.valid
                  });
                }
                
                console.log('🔍 DEBUG pasando a PlanCard:', {
                  planName: plan.name,
                  planPrice: plan.price,
                  finalDiscountCode,
                  finalDiscountPercentage,
                  hasAnyDiscount,
                  exhausted: isExhausted
                });

                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSelectPlan={setSelectedPlan}
                    isSelected={selectedPlan?.id === plan.id}
                    isActive={isActive && !isExhausted}
                    isExhausted={isExhausted}
                    discountPercentage={finalDiscountPercentage}
                    hasDiscount={hasAnyDiscount}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-red-600">No se pudieron cargar los planes. Intenta nuevamente.</p>
              </div>
            )}
          </div>

          {selectedPlan && (
            <div className="mt-12 text-center">
              {/* Discount Code Section - Ultra-Inteligente: Solo muestra si no hay automáticos */}
              {(() => {
                // Verificar si hay descuentos disponibles para este usuario
                const intelligentDiscount = detectIntelligentDiscount(selectedPlan);
                const hasAgencyDiscount = hasAgencyRole && hasDiscountCodes;
                const hasAnyDiscountAvailable = intelligentDiscount || hasAgencyDiscount || appliedManualDiscount?.valid;
                
                // Solo mostrar sección de descuentos si realmente hay descuentos disponibles
                if (hasAnyDiscountAvailable) {
                  if (intelligentDiscount) {
                    return (
                      <div className="mb-8 bg-blue-50 border-blue-200 rounded-xl p-6 max-w-md mx-auto">
                        <h3 className="text-sm font-semibold text-blue-800 mb-3">
                          Descuento inteligente aplicado
                        </h3>
                        <div className="text-xs text-blue-700">
                          Se ha aplicado automáticamente un {intelligentDiscount.percentage}% de descuento según el precio del plan.
                        </div>
                      </div>
                    );
                  } else if (hasAgencyDiscount) {
                    return (
                      <div className="mb-8 bg-green-50 border-green-200 rounded-xl p-6 max-w-md mx-auto">
                        <h3 className="text-sm font-semibold text-green-800 mb-3">
                          Descuento de agencia aplicado
                        </h3>
                        <div className="text-xs text-green-700">
                          Se ha aplicado automáticamente el descuento de tu inmobiliaria.
                        </div>
                      </div>
                    );
                  } else if (appliedManualDiscount?.valid) {
                    return (
                      <div className="mb-8 bg-yellow-50 border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
                        <h3 className="text-sm font-semibold text-yellow-800 mb-3">
                          Descuento personal aplicado
                        </h3>
                        <div className="text-xs text-green-600">
                          {appliedManualDiscount.message}
                        </div>
                      </div>
                    );
                  }
                }
                
                // Si hay descuento manual sin validar, mostrar campo para ingresarlo
                if (!intelligentDiscount && !hasAgencyDiscount && !appliedManualDiscount?.valid) {
                  return (
                    <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 max-w-md mx-auto">
                      <h3 className="text-sm font-semibold text-yellow-800 mb-3">
                        ¿Tienes un código de descuento personal?
                      </h3>
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
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                              </svg>
                              Validando...
                            </span>
                          ) : appliedManualDiscount?.valid ? (
                            '✓ Aplicado'
                          ) : (
                            'Aplicar'
                          )}
                        </button>
                      </div>
                      {appliedManualDiscount?.valid && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          {appliedManualDiscount.message}
                        </p>
                      )}
                      {appliedManualDiscount && !appliedManualDiscount.valid && (
                        <p className="text-xs text-red-600 mt-2">{appliedManualDiscount.message}</p>
                      )}
                    </div>
                  );
                }
                
                // Si hay descuentos automáticos, no mostrar campo manual
                return null;
              })()}
              
              <button
                onClick={handleSubscribe}
                disabled={subscribeMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {subscribeMutation.isPending ? (
                  <span className="flex items-center gap-2">
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
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
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

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </ProtectedRoute>
  );
}