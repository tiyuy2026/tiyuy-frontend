'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAvailablePlans, useSubscribeToPlan } from '@/presentation/hooks/useFinance';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
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
  const { data: plans, isLoading } = useAvailablePlans();
  const { data: activeSubscription } = useActiveSubscription();
  const subscribeMutation = useSubscribeToPlan();
  const queryClient = useQueryClient(); // ← Inicializar queryClient
  const [showActiveSubscriptionModal, setShowActiveSubscriptionModal] = useState(false);
  const [showInvalidUpgradeModal, setShowInvalidUpgradeModal] = useState(false);
  const [hasUsedFreePlan, setHasUsedFreePlan] = useState(false);
  const financeRepository = new FinanceRepository();

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
    console.log('🚀 Abriendo MercadoPago para plan:', plan.name);
    
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
      const token = authStorage.getToken(); // ← usa authStorage, no localStorage directo
      
      console.log('📝 Creando preferencia a través del backend...');
      console.log('🔑 Token JWT:', token ? 'Presente' : 'Ausente');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/finance/mercadopago/create-preference`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // ← JWT correcto
          },
          body: JSON.stringify({
            subscriptionId: subscriptionId.toString(),
            title: `Plan ${plan.name}`,
            unitPrice: plan.price
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del backend:', response.status, errorText);
        toast.error('Error al crear preferencia de pago');
        return;
      }

      const data = await response.json();
      console.log('🔍 DATA COMPLETA:', data); // ← DEBUG
      
      // FIX: Todos los nombres posibles
      const url = data.sandbox_init_point || data.sandboxInitPoint || 
                  data.init_point || data.initPoint;
      
      console.log('🚀 URL FINAL:', url);

      if (url) {
        window.open(url, '_blank');
      } else {
        console.error('❌ NO URL:', Object.keys(data));
        toast.error('No se recibió URL de pago');
      }

    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error al iniciar el pago');
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
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('❌ Error abriendo checkout:', error);
      toast.error('Error al abrir checkout de MercadoPago');
    }
  };

  const tryAlternativeMethod = (mp: any, preference: any) => {
    // Si create falla, intentar con el método antiguo
    console.log('🔄 Intentando método alternativo...');
    if (mp.checkout && mp.checkout.render) {
      mp.checkout.render({
        preference: preference,
        container: '.mercadopago-button'
      });
    } else {
      // Como último recurso, construir URL manual
      console.log('🔧 Construyendo URL manual como fallback');
      const manualUrl = `https://www.mercadopago.com/checkout/v1/redirect?preference_id=${Math.random().toString(36).substring(2, 9)}`;
      window.open(manualUrl, '_blank');
    }
  };

  // Determinar si el plan FREE está agotado (si el usuario ya lo usó)
  const isPlanExhausted = (plan: SubscriptionPlan) => {
    if (plan.id !== 'FREE') return false;
    
    console.log('🔍 Verificando plan FREE:', {
      hasUsedFreePlan,
      activeSubscription,
      activeSubscriptionPlan: activeSubscription?.plan?.id
    });
    
    // Si tiene suscripción activa diferente de FREE, el FREE está agotado
    if (activeSubscription && (activeSubscription as any).tier !== 'FREE') {
      console.log('✅ Plan FREE agotado: Tiene suscripción activa diferente');
      return true;
    }
    
    // Si tiene suscripción FREE activa pero ya usó todas las publicaciones, está agotado
    if (activeSubscription && (activeSubscription as any).tier === 'FREE' && (activeSubscription as any).publicationsLimit - (activeSubscription as any).publicationsUsed <= 0) {
      console.log('✅ Plan FREE agotado: Sin publicaciones restantes');
      return true;
    }
    
    // Si el modal se abre, es porque el usuario intenta publicar otra propiedad
    // Esto significa que ya usó su plan gratuito de 1 propiedad
    console.log('✅ Plan FREE agotado: Modal abierto = usuario ya consumió su plan gratuito');
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
                  🚀 Actualiza tu plan
                </h2>
                <p className="text-gray-600 mt-1">
                  Elige el plan perfecto para publicar más propiedades y hacer crecer tu negocio inmobiliario.
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando planes disponibles...</p>
                </div>
              ) : plans ? (
                plans.map((plan) => {
                  const exhausted = isPlanExhausted(plan);
                  console.log(`🔍 Plan ${plan.id}:`, {
                    exhausted,
                    planName: plan.name,
                    isFree: plan.id === 'FREE'
                  });
                  
                  return (
                    <div key={plan.id} className="scale-90">
                      <PlanCard
                        plan={plan}
                        onSelectPlan={handleSelectPlan}
                        isExhausted={exhausted}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">No hay planes disponibles en este momento.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                ¿Tienes dudas?{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Contacta a soporte
                </a>{' '}
                o{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  mira nuestras preguntas frecuentes
                </a>
              </p>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cerrar y continuar después
              </button>
            </div>
          </div>
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
