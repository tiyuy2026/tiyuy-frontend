'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useAvailablePlans, useSubscribeToPlan, useActiveSubscription } from '@/presentation/hooks/useFinance';
import { useMyProperties } from '@/presentation/hooks/useProperties';
import { PlanCard } from '@/presentation/components/finance';
import { SubscriptionPlan } from '@/core/domain/entities/Wallet';
import { UpgradePlanModal } from '@/presentation/components/modals/UpgradePlanModal';
import { authStorage } from '@/infrastructure/storage/auth-storage';

export default function PlansPage() {
  const { data: plans, isLoading } = useAvailablePlans();
  const { data: activeSubscription, refetch: refetchSubscription } = useActiveSubscription();
  const { data: propertiesData } = useMyProperties();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const subscribeMutation = useSubscribeToPlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
              <div className="col-span-full text-center py-16">
                <p className="text-red-600">No se pudieron cargar los planes. Intenta nuevamente.</p>
              </div>
            )}
          </div>

          {selectedPlan && (
            <div className="mt-12 text-center">
              <button
                onClick={handleSubscribe}
                disabled={subscribeMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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