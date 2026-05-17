/**
 * Admin Plans and Monetization Page
 * Complete subscription and payment management with real backend integration
 */

'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useFinanceStats,
  useSubscriptionPlans,
  useUpdateSubscriptionPlan,
  useTogglePlanStatus,
  useAgencyPlanDiscounts,
  useCreateAgencyDiscount
} from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { adminRepository } from '@/infrastructure/repositories/AdminRepository';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { RealtimeFinanceChart } from '@/presentation/components/admin/RealtimeFinanceChart/RealtimeFinanceChart';
import { TrendingUp, CreditCard, Users, RefreshCw, DollarSign } from 'lucide-react';
import {
  FinanceStatsDto,
  SubscriptionPlan,
  AgencyPlanDiscount
} from '@/core/domain/entities/Admin';

// Componentes y Modales Refactorizados
import { PlanCard } from '@/presentation/components/admin/PlansModals/PlanCard';
import { EditPlanModal } from '@/presentation/components/admin/PlansModals/EditPlanModal';
import { DiscountModal } from '@/presentation/components/admin/PlansModals/DiscountModal';

export default function PlansPage() {
  // Plan editing state
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({});

  // Agency discount state
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountPlan, setDiscountPlan] = useState<SubscriptionPlan | null>(null);
  const [agencyId, setAgencyId] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [discountNotes, setDiscountNotes] = useState('');
  const [agencyRuc, setAgencyRuc] = useState('');
  const [agentDni, setAgentDni] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{id: number, name: string, type: string} | null>(null);

  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManageSubscriptions = hasPermission('FINANCE_MANAGE_SUBSCRIPTIONS');

  const { data: financeStats, isLoading: statsLoading } = useFinanceStats();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();

  // Debug logging para verificar datos
  console.log('Plans data in component:', plans);
  console.log('Plans loading:', plansLoading);

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'financeStats'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', 'plans'] });
  };

  // Plan management hooks
  const updatePlanMutation = useUpdateSubscriptionPlan();
  const togglePlanMutation = useTogglePlanStatus();
  const createDiscountMutation = useCreateAgencyDiscount();

  // Action handlers
  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setEditForm({
      displayName: plan.displayName,
      description: plan.description,
      priceInPen: plan.priceInPen,
      priceInUsd: plan.priceInUsd,
      durationDays: plan.durationDays,
      publicationsLimit: plan.publicationsLimit,
      projectsLimit: plan.projectsLimit,
      photosLimit: plan.photosLimit,
      isActive: plan.isActive,
      isFeatured: plan.isFeatured,
      features: plan.features,
    });
    setIsEditPlanModalOpen(true);
  };

  // Handle save plan
  const handleSavePlan = async () => {
    if (!selectedPlan) return;
    
    console.log('Updating plan:', selectedPlan.id);
    console.log('With data:', editForm);
    
    try {
      await updatePlanMutation.mutateAsync({
        planId: selectedPlan.id,
        plan: editForm
      });
      console.log('Plan updated successfully');
      setIsEditPlanModalOpen(false);
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  // Handle toggle plan status
  const handleTogglePlan = async (planId: number) => {
    if (confirm('Are you sure you want to toggle this plan status?')) {
      await togglePlanMutation.mutateAsync(planId);
    }
  };

  // Handle manage discounts
  const handleManageDiscounts = (plan: SubscriptionPlan) => {
    setDiscountPlan(plan);
    setAgencyId('');
    setDiscountPercentage('');
    setCustomPrice('');
    setDiscountNotes('');
    setAgencyRuc('');
    setAgentDni('');
    setSearchResult(null);
    setIsDiscountModalOpen(true);
  };

  // Handle search agency/agent by RUC/DNI
  const handleSearchAgency = async () => {
    if (!agencyRuc && !agentDni) return;
    
    setIsSearching(true);
    try {
      if (agencyRuc) {
        const result = await adminRepository.searchAgencyByRuc(agencyRuc);
        if (result.found) {
          setSearchResult({
            id: result.id,
            name: result.name,
            type: result.type
          });
          setAgencyId(result.id.toString());
        } else {
          alert('Inmobiliaria no encontrada con ese RUC');
        }
      } else if (agentDni) {
        const result = await adminRepository.searchAgentByDni(agentDni);
        if (result.found) {
          setSearchResult({
            id: result.id,
            name: result.name,
            type: result.type
          });
          setAgencyId(result.id.toString());
        } else {
          alert('Agente no encontrado con ese DNI');
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('Error buscando. Verifica el RUC o DNI.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle create discount
  const handleCreateDiscount = async () => {
    if (!discountPlan || !agencyId) return;
    
    const discount: Partial<AgencyPlanDiscount> = {
      agencyId: parseInt(agencyId),
      planId: discountPlan.id,
      notes: discountNotes,
    };

    if (customPrice) {
      discount.customPricePen = parseFloat(customPrice);
    }
    if (discountPercentage) {
      discount.discountPercentage = parseFloat(discountPercentage);
    }

    await createDiscountMutation.mutateAsync({
      planId: discountPlan.id,
      discount
    });
    
    setIsDiscountModalOpen(false);
  };

  // Plan columns
  const planColumns = [
    {
      key: 'name' as keyof SubscriptionPlan,
      label: 'Plan',
      sortable: true,
      render: (value: string, plan: SubscriptionPlan) => (
        <div>
          <div className="font-medium text-gray-900">{plan.displayName}</div>
          <div className="text-sm text-gray-500">{value}</div>
        </div>
      )
    },
    {
      key: 'priceInPen' as keyof SubscriptionPlan,
      label: 'Precio (PEN)',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-green-600">S/ {value?.toLocaleString()}</div>
      )
    },
    {
      key: 'priceInUsd' as keyof SubscriptionPlan,
      label: 'Precio (USD)',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-blue-600">${value?.toLocaleString()}</div>
      )
    },
    {
      key: 'billingCycle' as keyof SubscriptionPlan,
      label: 'Facturación',
      sortable: true,
      render: (value: string) => {
        const cycleMap = {
          'MONTHLY': 'Mensual',
          'QUARTERLY': 'Trimestral', 
          'YEARLY': 'Anual',
          'LIFETIME': 'Vitalicio'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'MONTHLY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {cycleMap[value as keyof typeof cycleMap] || value}
          </span>
        );
      }
    },
    {
      key: 'limits' as keyof SubscriptionPlan,
      label: 'Límites',
      sortable: false,
      render: (value: any, item: any) => (
        <div className="text-sm text-gray-600">
          <div>{item.publicationsLimit || 0} publicaciones</div>
          <div>{item.projectsLimit || 0} proyectos</div>
          <div>{item.photosLimit || 0} fotos</div>
        </div>
      )
    },
    {
      key: 'isActive' as keyof SubscriptionPlan,
      label: 'Estado',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  // Plan actions
  const planActions = [
    {
      label: 'Editar',
      onClick: handleEditPlan,
      variant: 'primary' as const
    },
    {
      label: 'Descuentos',
      onClick: handleManageDiscounts,
      variant: 'secondary' as const
    },
    {
      label: 'Activar/Desactivar',
      onClick: (plan: SubscriptionPlan) => handleTogglePlan(plan.id),
      variant: 'secondary' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Planes y Monetización</h2>
          <p className="text-gray-500 text-sm">Gestión de suscripciones, pagos y análisis de ingresos en tiempo real</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefreshData}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 text-sm font-semibold shadow-sm active:scale-95"
            disabled={statsLoading}
          >
            <RefreshCw className={`w-4 h-4 text-blue-500 ${statsLoading ? 'animate-spin' : ''}`} />
            {statsLoading ? 'Sincronizando...' : 'Refrescar Datos'}
          </button>
        </div>
      </div>

      {/* Finance Stats Cards */}
      {financeStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm bg-gradient-to-br from-green-500/10 to-emerald-500/5">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-green-500 text-white rounded-lg shadow-sm shadow-green-200">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase">Ingresos</div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-gray-900">
                  S/ {(financeStats.totalRevenue ?? 0).toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">+S/ {(financeStats.revenueToday ?? 0).toLocaleString()} hoy</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/10 to-indigo-500/5">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-500 text-white rounded-lg shadow-sm shadow-blue-200">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">Suscripciones</div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-gray-900">{financeStats.totalSubscriptions ?? 0}</div>
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-600 font-medium">
                  {financeStats.activeSubscriptions ?? 0} activas actualmente
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-purple-500 text-white rounded-lg shadow-sm shadow-purple-200">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full uppercase">Transacciones</div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-gray-900">{financeStats.totalTransactions ?? 0}</div>
                <div className="flex items-center gap-1 mt-1 text-xs text-purple-600 font-medium">
                  {financeStats.transactionsToday ?? 0} transacciones registradas hoy
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-orange-500/10 to-amber-500/5">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-orange-500 text-white rounded-lg shadow-sm shadow-orange-200">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full uppercase">Promedio</div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-gray-900">
                  S/ {(financeStats.averageTransactionValue ?? 0).toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                  S/ {(financeStats.refundsTotal ?? 0).toLocaleString()} en reembolsos
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Chart */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-50 bg-white py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">Historial Financiero en Tiempo Real</CardTitle>
              <p className="text-xs text-gray-500">Ingresos, suscripciones y transacciones - Datos reales del backend</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <RealtimeFinanceChart />
        </CardContent>
      </Card>

      {/* Plans Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Planes de Suscripción</h3>
            <p className="text-sm text-gray-500">Gestiona los planes de suscripción disponibles</p>
          </div>
        </div>

        {plansLoading ? (
          <div className="text-center py-12 text-gray-400">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
            <p className="text-sm">Cargando planes...</p>
          </div>
        ) : !Array.isArray(plans) || plans.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No hay planes disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {plans.map((plan: any) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => handleEditPlan(plan)}
                onManageDiscounts={() => handleManageDiscounts(plan)}
                onToggle={() => handleTogglePlan(plan.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Plan Modal */}
      {isEditPlanModalOpen && selectedPlan && (
        <EditPlanModal
          isOpen={isEditPlanModalOpen}
          onClose={() => setIsEditPlanModalOpen(false)}
          selectedPlan={selectedPlan}
          editForm={editForm}
          setEditForm={setEditForm}
          onSave={handleSavePlan}
          isPending={updatePlanMutation.isPending}
        />
      )}

      {/* Discount Modal */}
      {isDiscountModalOpen && discountPlan && (
        <DiscountModal
          isOpen={isDiscountModalOpen}
          onClose={() => setIsDiscountModalOpen(false)}
          discountPlan={discountPlan}
          discountPercentage={discountPercentage}
          setDiscountPercentage={setDiscountPercentage}
          customPrice={customPrice}
          setCustomPrice={setCustomPrice}
          discountNotes={discountNotes}
          setDiscountNotes={setDiscountNotes}
          agencyRuc={agencyRuc}
          setAgencyRuc={setAgencyRuc}
          agentDni={agentDni}
          setAgentDni={setAgentDni}
          isSearching={isSearching}
          searchResult={searchResult}
          onSearch={handleSearchAgency}
          onCreateDiscount={handleCreateDiscount}
          isPending={createDiscountMutation.isPending}
        />
      )}
    </div>
  );
}
