'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAvailablePlans, useSubscribeToPlan, useAvailableDeveloperDiscountCodes } from '@/presentation/hooks/useFinance';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { useValidateDeveloperDiscountCode, useUseDeveloperDiscountCode } from '@/presentation/hooks/admin/useDevelopers';
import { SubscriptionPlan } from '@/core/domain/entities/Wallet';
import { ActiveSubscriptionModal } from './ActiveSubscriptionModal';
import { InvalidUpgradeModal } from './InvalidUpgradeModal';
import { PlanCard } from '../finance/PlanCard/PlanCard';
import { authStorage } from '@/infrastructure/storage/auth-storage';
import { FinanceRepository } from '@/infrastructure/repositories/FinanceRepository';
import { useQueryClient } from '@tanstack/react-query';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradePlanModal({ isOpen, onClose }: UpgradePlanModalProps) {
  console.log('DEBUG: UpgradePlanModal se está ejecutando');
  
  const { data: plans, isLoading } = useAvailablePlans();
  const { data: activeSubscription } = useActiveSubscription();
  const { data: availableDiscountCodes } = useAvailableDeveloperDiscountCodes();
  const subscribeMutation = useSubscribeToPlan();
  const queryClient = useQueryClient();
  const [showActiveSubscriptionModal, setShowActiveSubscriptionModal] = useState(false);
  const [showInvalidUpgradeModal, setShowInvalidUpgradeModal] = useState(false);
  const [hasUsedFreePlan, setHasUsedFreePlan] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const financeRepository = new FinanceRepository();

  // Check if user is agent/developer and has available discount codes
  const userRole = authStorage.getUser()?.role;
  const isAgent = userRole === 'AGENT';
  const isDeveloper = userRole === 'DEVELOPER';
  // 🔒 SEGURIDAD: Agentes y Developers (inmobiliarias) pueden tener descuentos si tienen agencyId
  const hasAgencyRole = isAgent || isDeveloper;
  const hasDiscountCodes = hasAgencyRole && availableDiscountCodes && availableDiscountCodes.length > 0;
  
  // Auto-aplicar el primer descuento disponible para agentes
  const [autoDiscountCode, setAutoDiscountCode] = useState('');
  const [autoDiscountPercentage, setAutoDiscountPercentage] = useState(0);
  const [isIntelligentDiscount, setIsIntelligentDiscount] = useState(false);
  
  // Estado para controlar si se debe mostrar campo de código manual
  const [showManualCodeField, setShowManualCodeField] = useState(false);
  
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
  
  // Función para detectar descuentos inteligentes basados en reglas de negocio - PARA AGENTES Y DEVELOPERS CON DESCUENTOS DE AGENCIA
  const detectIntelligentDiscount = (planPrice: number): { code: string; percentage: number } | null => {
    console.log('Detectando descuento inteligente para precio:', planPrice, 'usuario es agente:', isAgent, 'usuario es developer:', isDeveloper, 'tiene descuentos de agencia:', hasDiscountCodes);
    
    // 🔒 CRÍTICO: Solo agentes y developers con descuentos de agencia pueden tener descuentos inteligentes
    if (!hasAgencyRole || !hasDiscountCodes) {
      console.log('Usuario no es agente/developer o no tiene descuentos de agencia - no se aplican descuentos inteligentes');
      return null;
    }
    
    // Regla: Si el precio es 29, aplicar 20% de descuento
    if (planPrice === 29) {
      console.log('Descuento inteligente detectado: 20% para precio 29 (agente/developer con descuentos)');
      return {
        code: 'AUTO20',
        percentage: 20
      };
    }
    
    // Regla: Si el precio es 49, aplicar 15% de descuento
    if (planPrice === 49) {
      console.log('Descuento inteligente detectado: 15% para precio 49 (agente/developer con descuentos)');
      return {
        code: 'AUTO15',
        percentage: 15
      };
    }
    
    // Regla: Si el precio es 99, aplicar 10% de descuento
    if (planPrice === 99) {
      console.log('Descuento inteligente detectado: 10% para precio 99 (agente/developer con descuentos)');
      return {
        code: 'AUTO10',
        percentage: 10
      };
    }
    
    console.log('No se detectó descuento inteligente para precio:', planPrice);
    return null;
  };

  // Función para validar descuento manual
  const handleValidateManualDiscount = async (plan: SubscriptionPlan) => {
    if (!manualDiscountCode.trim()) return;
    
    setIsValidatingManual(true);
    try {
      const result = await validateDiscountMutation.mutateAsync({
        code: manualDiscountCode,
        planCode: plan.name // Usar name en lugar de code
      });
      
      setAppliedManualDiscount(result);
      
      if (!result.valid) {
        toast.error(result.message);
      } else {
        toast.success('¡Descuento aplicado correctamente!');
        setDiscountCode(manualDiscountCode);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al validar el código');
    } finally {
      setIsValidatingManual(false);
    }
  };
  
  useEffect(() => {
    console.log('useEffect triggered:', {
      isAgent,
      hasDiscountCodes,
      availableDiscountCodes,
      availableDiscountCodesLength: availableDiscountCodes?.length || 0
    });
    
    if (isAgent && hasDiscountCodes && availableDiscountCodes && availableDiscountCodes.length > 0) {
      // Aplicar automáticamente el primer descuento disponible
      const firstDiscount = availableDiscountCodes[0];
      console.log('firstDiscount structure:', firstDiscount);
      
      // El código está anidado en discountCode.code
      const discountCodeObj = (firstDiscount as any).discountCode;
      const discountCodeValue = discountCodeObj?.code || discountCodeObj;
      const discountPercentage = discountCodeObj?.discountPercentage || 0;
      console.log('discountCodeValue:', discountCodeValue, 'percentage:', discountPercentage);
      
      setAutoDiscountCode(discountCodeValue);
      setAutoDiscountPercentage(discountPercentage);
      setDiscountCode(discountCodeValue);
      setIsIntelligentDiscount(false);
      console.log('Descuento de agente aplicado automáticamente:', discountCodeValue, discountPercentage + '%');
    }
  }, [isAgent, hasDiscountCodes, availableDiscountCodes]);

  // Lógica ultra-inteligente: Solo mostrar descuentos si realmente hay descuentos disponibles
  const hasAnyDiscountAvailable = isIntelligentDiscount || (hasAgencyRole && hasDiscountCodes) || appliedManualDiscount?.valid;
  const showDiscountField = hasAnyDiscountAvailable;

  // DEBUG: Log para depurar
  console.log('DEBUG UpgradePlanModal:', {
    userRole,
    isAgent,
    availableDiscountCodes,
    hasDiscountCodes,
    autoDiscountCode,
    autoDiscountPercentage,
    discountCode,
    isIntelligentDiscount,
    showDiscountField,
    userData: authStorage.getUser(),
    availableDiscountCodesLength: availableDiscountCodes?.length || 0,
    firstDiscountCode: availableDiscountCodes?.[0],
    isLoading: false // Agregar esto para ver si está cargando
  });

  useEffect(() => {
    const checkFreePlanUsage = async () => {
      if (isOpen) {
        try {
          // Obtener userId del localStorage o contexto de autenticación
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            const userId = user.id;
            const used = await financeRepository.hasUserUsedFreePlan(userId);
            setHasUsedFreePlan(used);
            console.log('Usuario ya uso plan FREE:', used);
          }
        } catch (error) {
          console.error('Error checking free plan usage:', error);
        }
      }
    };

    checkFreePlanUsage();
  }, [isOpen]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    // Crear suscripción pendiente primero
    subscribeMutation.mutate({
      planId: plan.id,
      paymentMethod: 'MERCADOPAGO',
      discountCode: discountCode || undefined,
    }, {
      onSuccess: (subscription) => {
        // Suscripción creada, ahora abrir MercadoPago
        console.log('Suscripcion pendiente creada:', subscription);
        openMercadoPagoPayment(plan, subscription.id);
      },
      onError: (error: any) => {
        console.error('Error creando suscripcion:', error);
        
        // Si es error 409 (ya tiene suscripción activa), mostrar modal bonito
        if (error?.response?.status === 409) {
          setShowActiveSubscriptionModal(true);
        } else if (error?.response?.status === 400 && error?.response?.data?.code === 'INVALID_UPGRADE') {
          setShowInvalidUpgradeModal(true);
        } else {
          toast.error(error.response?.data?.message || 'Error al crear suscripción');
        }
      }
    });
  };

  const openMercadoPagoPayment = (plan: SubscriptionPlan, subscriptionId: string) => {
    console.log('Abriendo MercadoPago para plan:', plan.name);
    
    // Cargar SDK dinámicamente si no está disponible
    if (!(window as any).MercadoPago) {
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        createPreferenceAndCheckout(plan, subscriptionId);
      };
      document.head.appendChild(script);
    } else {
      createPreferenceAndCheckout(plan, subscriptionId);
    }
  };

  const createPreferenceAndCheckout = async (plan: SubscriptionPlan, subscriptionId: string) => {
    try {
      const token = authStorage.getToken();
      
      console.log('Creando preferencia de MercadoPago...');
      console.log('Token JWT:', token ? 'Presente' : 'Ausente');
      console.log('Subscription ID:', subscriptionId);
      console.log('Plan:', plan.name, '- Precio:', plan.price);
      
      const response = await fetch(
        `/api/finance/mercadopago/create-preference`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscriptionId: subscriptionId.toString(),
            title: `Plan ${plan.name}`,
            unitPrice: plan.price,
            frontendUrl: window.location.origin
          })
        }
      );

      console.log('Respuesta status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error creando preferencia:', response.status, errorText);
        toast.error(`Error ${response.status}: No se pudo crear preferencia de pago`);
        return;
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      // Usar init_point (producción) primero. sandbox_init_point solo para pruebas.
      const url = data.init_point || data.initPoint || 
                  data.sandbox_init_point || data.sandboxInitPoint;
      
      console.log('URL de pago:', url);

      if (url) {
        window.location.href = url;
      } else {
        console.error('No se encontro URL. Keys disponibles:', Object.keys(data));
        toast.error('El servidor no devolvio URL de pago');
      }

    } catch (error) {
      console.error('Error en createPreferenceAndCheckout:', error);
      toast.error('Error al iniciar pago: ' + (error as any).message);
    }
  };

  const openCheckout = (mp: any, response: any) => {
    try {
      if (mp.checkout) {
        mp.checkout({
          preference: { id: response.id },
          autoOpen: true
        });
      } else if (mp.checkout && mp.checkout.render) {
        const checkoutButton = document.createElement('button');
        checkoutButton.innerHTML = 'Pagar con MercadoPago';
        checkoutButton.onclick = () => {
          mp.checkout.render({
            preference: { id: response.id },
            container: '.mercadopago-button'
          });
        };
        document.body.appendChild(checkoutButton);
      } else {
        // Último recurso: abrir manualmente
        const checkoutUrl = `https://www.mercadopago.com/checkout/v1/redirect?preference_id=${response.id}`;
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Error abriendo checkout:', error);
      toast.error('Error al abrir checkout de MercadoPago');
    }
  };

  const tryAlternativeMethod = (mp: any, preference: any) => {
    // Si create falla, intentar con el método antiguo
    console.log('Intentando método alternativo...');
    if (mp.checkout && mp.checkout.render) {
      mp.checkout.render({
        preference: preference,
        container: '.mercadopago-button'
      });
    } else {
      // Como último recurso, construir URL manual
      console.log('Construyendo URL manual como fallback');
      const manualUrl = `https://www.mercadopago.com/checkout/v1/redirect?preference_id=${Math.random().toString(36).substring(2, 9)}`;
      window.location.href = manualUrl;
    }
  };

  // Determinar si el plan FREE está agotado (si el usuario ya lo usó)
  const isPlanExhausted = (plan: SubscriptionPlan) => {
    if (plan.id !== 'FREE') return false;
    
    console.log('Verificando plan FREE:', {
      hasUsedFreePlan,
      activeSubscription,
      activeSubscriptionPlan: activeSubscription?.plan?.id
    });
    
    // Si tiene suscripción activa diferente de FREE, el FREE está agotado
    if (activeSubscription && (activeSubscription as any).tier !== 'FREE') {
      console.log('Plan FREE agotado: Tiene suscripción activa diferente');
      return true;
    }
    
    // Si tiene suscripción FREE activa pero ya usó todas las publicaciones, está agotado
    if (activeSubscription && (activeSubscription as any).tier === 'FREE' && (activeSubscription as any).publicationsLimit - (activeSubscription as any).publicationsUsed <= 0) {
      console.log('Plan FREE agotado: Sin publicaciones restantes');
      return true;
    }
    
    // Si el modal se abre, es porque el usuario intenta publicar otra propiedad
    // Esto significa que ya usó su plan gratuito de 1 propiedad
    console.log('Plan FREE agotado: Modal abierto = usuario ya consumió su plan gratuito');
    return true;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal principal de upgrade */}
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Actualiza tu plan
                </h2>
                <p className="text-gray-600 mt-1">
                  Elige el plan perfecto para publicar más propiedades y hacer crecer tu negocio inmobiliario.
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
              >
                X
              </button>
            </div>
          </div>

          {/* Discount Code Section - Solo mostrar si realmente hay descuentos disponibles */}
          {showDiscountField && (
            <div className="px-6 pb-4 border-b border-gray-200">
              {isIntelligentDiscount ? (
                // Descuento inteligente - NO mostrar opción manual
                <div className="bg-blue-50 border-blue-200 border rounded-lg p-4">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Descuento inteligente aplicado automáticamente
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1 bg-blue-100 border-blue-300 border rounded">
                        <span className="font-mono text-sm font-bold text-blue-800">
                          {autoDiscountCode}
                        </span>
                      </div>
                      <span className="text-xs text-blue-700">
                        -{autoDiscountPercentage}% OFF
                      </span>
                    </div>
                    <div className="text-xs text-blue-600">
                      Descuento especial según precio del plan
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-700">
                    Este descuento se aplicó automáticamente basado en el precio del plan seleccionado.
                  </div>
                </div>
              ) : (hasAgencyRole && hasDiscountCodes) ? (
                // Descuento de agencia - NO mostrar opción manual
                <div className="bg-green-50 border-green-200 border rounded-lg p-4">
                  <label className="block text-sm font-medium text-green-900 mb-2">
                    Descuento de agencia aplicado automáticamente
                  </label>
                  <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-green-100 border-green-300 border rounded">
                      <span className="font-mono text-sm font-bold text-green-800">
                        {autoDiscountCode}
                      </span>
                    </div>
                    <span className="text-xs text-green-700">
                      -{autoDiscountPercentage}% OFF
                    </span>
                  </div>
                  <div className="text-xs text-green-600">
                    Descuento de tu inmobiliaria aplicado
                  </div>
                </div>
                <div className="mt-2 text-xs text-green-700">
                  Descuento de agencia disponible y aplicado automáticamente.
                </div>
              </div>
            ) : showDiscountField ? (
              // Solo código manual - porque no hay automáticos
              <div className="bg-yellow-50 border-yellow-200 border rounded-lg p-4">
                <label className="block text-sm font-medium text-yellow-900 mb-2">
                  ¿Tienes un código de descuento?
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ingresa tu código de descuento"
                    value={manualDiscountCode}
                    onChange={(e) => setManualDiscountCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    disabled={isValidatingManual}
                  />
                  <div className="text-xs text-yellow-700">
                    Agrega tu código personal para obtener un descuento especial.
                  </div>
                  {appliedManualDiscount?.valid ? (
                    <div className="text-xs text-green-600">
                      {appliedManualDiscount.message}
                    </div>
                  ) : (
                    <div className="text-xs text-red-600">
                      {appliedManualDiscount?.message}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600">No hay planes disponibles en este momento.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Modal de suscripción activa */}
    <ActiveSubscriptionModal
      isOpen={showActiveSubscriptionModal}
      onClose={() => {
        setShowActiveSubscriptionModal(false);
        onClose(); // Cerrar también el modal principal
      }}
      activeSubscription={activeSubscription || null}
    />

      {/* Modal de upgrade inválido */}
      <InvalidUpgradeModal
        isOpen={showInvalidUpgradeModal}
        onClose={() => {
          setShowInvalidUpgradeModal(false);
        }}
        currentPlan={activeSubscription?.plan?.name}
        selectedPlan={undefined} // Podríamos pasar el plan seleccionado si lo guardamos
      />
    </>
  );
}
