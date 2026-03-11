'use client';

import { useState, useEffect } from 'react';
import { User } from '@/core/domain/entities';
import { Button } from '@/presentation/components/ui';
import { useAvailablePlans, useActiveSubscription, useSubscribeToPlan } from '@/presentation/hooks/useFinance';
import { useMyProperties } from '@/presentation/hooks/useProperties';
import { PlanCard } from '@/presentation/components/finance';
import { SubscriptionPlan } from '@/core/domain/entities/Wallet';
import { authStorage } from '@/infrastructure/storage/auth-storage';
import { toast } from 'sonner';

interface PlansTabProps {
  user: User;
}

export const PlansTab: React.FC<PlansTabProps> = ({ user }) => {
  const { data: plans, isLoading } = useAvailablePlans();
  const { data: activeSubscription, refetch: refetchSubscription } = useActiveSubscription();
  const { data: propertiesData } = useMyProperties();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const subscribeMutation = useSubscribeToPlan();

  // Calculate published properties count
  const publishedCount = (propertiesData?.properties || []).filter(
    (p: any) => p.status === 'PUBLISHED'
  ).length;

  useEffect(() => {
    refetchSubscription();
  }, [refetchSubscription]);

  // Lógica para detectar plan agotado (misma que /planes)
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

  // Lógica de suscripción (misma que /planes)
  const handleSubscribe = () => {
    if (!selectedPlan) return;

    subscribeMutation.mutate({
      planId: selectedPlan.id,
      paymentMethod: 'MERCADOPAGO',
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
                unitPrice: selectedPlan.price
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
            window.location.href = url;
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Mi Plan</h2>
        <p className="text-gray-600">
          Elige el plan que mejor se adapte a tus necesidades como {user.role === 'AGENT' ? 'agente inmobiliario' : 'desarrollador'}.
        </p>
      </div>

      {/* Plan Actual */}
      {activeSubscription && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Plan Actual</p>
              <p className="text-lg font-bold text-blue-900">
                {(activeSubscription as any).tier || activeSubscription.plan?.id || 'Gratis'}
              </p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Activo
            </div>
          </div>
        </div>
      )}

      {/* Planes Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando planes...</p>
          </div>
        ) : plans ? (
          plans.map((plan) => {
            const backendTier = activeSubscription
              ? (activeSubscription as any).tier || activeSubscription.plan?.id
              : null;
            const isActive = !activeSubscription
              ? plan.id === 'FREE'
              : backendTier === plan.id;
            const isExhausted = isPlanExhausted(plan);

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelectPlan={setSelectedPlan}
                isSelected={selectedPlan?.id === plan.id}
                isActive={isActive && !isExhausted}
                isExhausted={isExhausted}
              />
            );
          })
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-red-600">No se pudieron cargar los planes. Intenta nuevamente.</p>
          </div>
        )}
      </div>

      {/* Botón de suscripción */}
      {selectedPlan && (
        <div className="mt-8 text-center">
          <Button
            onClick={handleSubscribe}
            disabled={subscribeMutation.isPending}
            variant="primary"
            className="min-w-[200px]"
          >
            {subscribeMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </span>
            ) : (
              `Suscribirse al Plan ${selectedPlan.name} - S/ ${selectedPlan.price.toLocaleString('es-PE')}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
