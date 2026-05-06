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
  useAdminSubscriptions, 
  usePaymentTransactions,
  useRefundTransaction,
  useUpdateSubscriptionPlan,
  useTogglePlanStatus,
  useAgencyPlanDiscounts,
  useCreateAgencyDiscount
} from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { adminRepository } from '@/infrastructure/repositories/AdminRepository';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { RevenueChart } from '@/presentation/components/admin/RevenueChart/RevenueChart';
import { PaginationParams, PaginatedResponse } from '@/core/domain/repositories/IAdminRepository';
import { TrendingUp, CreditCard, Users, RefreshCw, DollarSign, Search, Filter, X } from 'lucide-react';
import { 
  FinanceStatsDto, 
  SubscriptionPlan, 
  Subscription, 
  PaymentTransaction,
  AgencyPlanDiscount
} from '@/core/domain/entities/Admin';

// Componentes y Modales Refactorizados
import { PlanCard } from '@/presentation/components/admin/PlansModals/PlanCard';
import { AdminPlansFilters } from '@/presentation/components/admin/PlansModals/AdminPlansFilters';
import { EditPlanModal } from '@/presentation/components/admin/PlansModals/EditPlanModal';
import { DiscountModal } from '@/presentation/components/admin/PlansModals/DiscountModal';
import { TransactionDetailsModal } from '@/presentation/components/admin/PlansModals/TransactionDetailsModal';
import { SubscriptionDetailsModal } from '@/presentation/components/admin/PlansModals/SubscriptionDetailsModal';

export default function PlansPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedTransactions, setSelectedTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Subscription[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'transactions' | 'plans'>('overview');
  
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
  const canRefund = hasPermission('FINANCE_REFUNDS');

  const { data: financeStats, isLoading: statsLoading } = useFinanceStats();

  // Función para refrescar datos manualmente
  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'financeStats'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions', 'plans'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'transactions'] });
  };
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  
  // Debug logging para verificar datos
  console.log('Plans data in component:', plans);
  console.log('Plans loading:', plansLoading);
  const { data: subscriptionsData, isLoading: subscriptionsLoading, refetch: refetchSubscriptions } = useAdminSubscriptions(
    statusFilter !== 'all' ? statusFilter : undefined,
    { page: currentPage - 1, size: pageSize }
  );
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = usePaymentTransactions(
    statusFilter !== 'all' ? statusFilter : undefined,
    { page: currentPage - 1, size: pageSize }
  );

  const refundMutation = useRefundTransaction();

  const handleViewTransaction = (transaction: PaymentTransaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsSubscriptionModalOpen(true);
  };

  const handleRefundTransaction = async (transaction: PaymentTransaction, reason: string) => {
    if (confirm(`¿Estás seguro de que deseas reembolsar la transacción ${transaction.id}?`)) {
      await refundMutation.mutateAsync({
        transactionId: transaction.id,
        reason
      });
      refetchTransactions();
    }
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

  // Subscription columns
  const subscriptionColumns = [
    {
      key: 'id' as keyof Subscription,
      label: 'ID',
      sortable: true,
      render: (value: number) => `#${value}`
    },
    {
      key: 'userId' as keyof Subscription,
      label: 'Usuario',
      sortable: true,
      render: (value: number) => `Usuario ${value}`
    },
    {
      key: 'tier' as keyof Subscription,
      label: 'Plan',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'FREE' ? 'bg-gray-100 text-gray-800' :
          value === 'BASIC' ? 'bg-blue-100 text-blue-800' :
          value === 'PRO' ? 'bg-purple-100 text-purple-800' :
          value === 'ENTERPRISE' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'FREE' ? 'GRATIS' :
           value === 'BASIC' ? 'BÁSICO' :
           value === 'PRO' ? 'PRO' :
           value === 'ENTERPRISE' ? 'EMPRESARIAL' : value}
        </span>
      )
    },
    {
      key: 'status' as keyof Subscription,
      label: 'Estado',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          value === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
          value === 'CANCELLED' ? 'bg-red-100 text-red-800' :
          value === 'EXPIRED' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'ACTIVE' ? 'ACTIVO' :
           value === 'INACTIVE' ? 'INACTIVO' :
           value === 'CANCELLED' ? 'CANCELADO' :
           value === 'EXPIRED' ? 'EXPIRADO' : value}
        </span>
      )
    },
    {
      key: 'price' as keyof Subscription,
      label: 'Precio',
      sortable: true,
      render: (value: number, subscription: Subscription) => (
        <div className="font-medium text-green-600">
          {subscription.currency === 'PEN' ? 'S/' : '$'} {value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'paymentMethod' as keyof Subscription,
      label: 'Método de Pago',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: 'autoRenew' as keyof Subscription,
      label: 'Auto Renovación',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Activado' : 'Desactivado'}
        </span>
      )
    },
    {
      key: 'startDate' as keyof Subscription,
      label: 'Iniciado',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('es-PE')
    },
    {
      key: 'endDate' as keyof Subscription,
      label: 'Vence',
      sortable: true,
      render: (value?: string) => value ? new Date(value).toLocaleDateString('es-PE') : 'Sin fecha fin'
    }
  ];

  // Transaction columns
  const transactionColumns = [
    {
      key: 'id' as keyof PaymentTransaction,
      label: 'ID',
      sortable: true,
      render: (value: number) => `#${value}`
    },
    {
      key: 'userId' as keyof PaymentTransaction,
      label: 'Usuario',
      sortable: true,
      render: (value: number) => `Usuario ${value}`
    },
    {
      key: 'subscriptionId' as keyof PaymentTransaction,
      label: 'Suscripción',
      sortable: true,
      render: (value?: number) => value ? `#${value}` : 'N/A'
    },
    {
      key: 'amount' as keyof PaymentTransaction,
      label: 'Monto',
      sortable: true,
      render: (value: number, transaction: PaymentTransaction) => (
        <div className="font-medium text-green-600">
          {transaction.currency === 'PEN' ? 'S/' : '$'} {value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'paymentMethod' as keyof PaymentTransaction,
      label: 'Método',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: 'status' as keyof PaymentTransaction,
      label: 'Estado',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          value === 'FAILED' ? 'bg-red-100 text-red-800' :
          value === 'REFUNDED' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'COMPLETED' ? 'COMPLETADO' :
           value === 'PENDING' ? 'PENDIENTE' :
           value === 'FAILED' ? 'FALLIDO' :
           value === 'REFUNDED' ? 'REEMBOLSADO' : value}
        </span>
      )
    },
    {
      key: 'paymentId' as keyof PaymentTransaction,
      label: 'Payment ID',
      sortable: true,
      render: (value?: string) => value ? value.slice(0, 8) + '...' : 'N/A'
    },
    {
      key: 'description' as keyof PaymentTransaction,
      label: 'Descripción',
      sortable: false,
      render: (value: string) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'createdAt' as keyof PaymentTransaction,
      label: 'Fecha',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('es-PE')
    }
  ];

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

  // Actions
  const subscriptionActions = [
    {
      label: 'Ver Detalles',
      onClick: handleViewSubscription,
      variant: 'primary' as const
    }
  ];

  const transactionActions = [
    {
      label: 'Ver Detalles',
      onClick: handleViewTransaction,
      variant: 'primary' as const
    },
    ...(canRefund ? [{
      label: 'Reembolsar',
      onClick: (transaction: PaymentTransaction) => {
        const reason = prompt('Ingrese el motivo del reembolso:');
        if (reason) handleRefundTransaction(transaction, reason);
      },
      variant: 'danger' as const,
      disabled: (transaction: PaymentTransaction) => transaction.status !== 'COMPLETED'
    }] : [])
  ];

  // Filter options
  const filterOptions = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'ACTIVE', label: 'Activo' },
        { value: 'INACTIVE', label: 'Inactivo' },
        { value: 'CANCELLED', label: 'Cancelado' },
        { value: 'EXPIRED', label: 'Expirado' },
        { value: 'COMPLETED', label: 'Completado' },
        { value: 'PENDING', label: 'Pendiente' },
        { value: 'FAILED', label: 'Fallido' },
        { value: 'REFUNDED', label: 'Reembolsado' }
      ]
    }
  ];

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    if (filters.status !== undefined) {
      setStatusFilter(filters.status);
    }
    setCurrentPage(1);
  };

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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen' },
            { id: 'subscriptions', label: 'Suscripciones' },
            { id: 'transactions', label: 'Transacciones' },
            { id: 'plans', label: 'Planes' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Chart */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-white py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-800">Historial de Ingresos</CardTitle>
                  <p className="text-xs text-gray-500">Visualización de ventas de planes por mes</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <RevenueChart />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="border-b border-gray-50 py-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-md font-bold text-gray-800">Distribución de Suscripciones</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {Array.isArray(plans) && plans?.length > 0 ? (
                    plans.slice(0, 5).map((plan) => (
                      <div key={plan.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-10 rounded-full ${
                            plan.displayName.includes('Pro') ? 'bg-purple-500' :
                            plan.displayName.includes('Empresarial') ? 'bg-orange-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <span className="text-sm font-semibold text-gray-700 block">{plan.displayName}</span>
                            <span className="text-xs text-gray-500">{plan.isActive ? 'Activo' : 'Inactivo'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900 block">S/ {plan.priceInPen?.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{plan.billingCycle}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No hay planes activos</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="border-b border-gray-50 py-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-md font-bold text-gray-800">Actividad Reciente</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100/50">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Hoy</p>
                    <p className="text-xl font-black text-green-800">S/ {(financeStats?.revenueToday ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-green-600/70 mt-1 flex items-center gap-1">
                      Data actualizada hace un momento
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Semana</p>
                    <p className="text-xl font-black text-blue-800">S/ {(financeStats?.revenueThisWeek ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-blue-600/70 mt-1">7 días transcurridos</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100/50">
                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">Mes</p>
                    <p className="text-xl font-black text-purple-800">S/ {(financeStats?.revenueThisMonth ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-purple-600/70 mt-1">Acumulado mensual</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100/50">
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest mb-1">Nuevos</p>
                    <p className="text-xl font-black text-teal-800">{financeStats?.newSubscriptionsToday ?? 0}</p>
                    <p className="text-[10px] text-teal-600/70 mt-1">Suscripciones hoy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <AdminPlansFilters
            placeholder="Buscar por ID de usuario o plan..."
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onClear={handleClearFilters}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'ACTIVE', label: 'Activo' },
              { value: 'INACTIVE', label: 'Inactivo' },
              { value: 'CANCELLED', label: 'Cancelado' },
              { value: 'EXPIRED', label: 'Expirado' }
            ]}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <AdminTable
              data={subscriptionsData?.content || []}
              columns={subscriptionColumns}
              loading={subscriptionsLoading}
              actions={subscriptionActions}
              pagination={
                subscriptionsData && {
                  page: currentPage,
                  size: pageSize,
                  total: subscriptionsData.totalElements,
                  onPageChange: setCurrentPage,
                  onSizeChange: setPageSize
                }
              }
              emptyState={{
                title: 'No se encontraron suscripciones',
                description: 'Asegúrate de que existan registros en el backend para los filtros seleccionados.',
                action: {
                  label: 'Ver todas las suscripciones',
                  onClick: handleClearFilters
                }
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <AdminPlansFilters
            placeholder="Buscar por ID de transacción o usuario..."
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onClear={handleClearFilters}
            options={[
              { value: 'all', label: 'Todos los estados' },
              { value: 'COMPLETED', label: 'Completado' },
              { value: 'PENDING', label: 'Pendiente' },
              { value: 'FAILED', label: 'Fallido' },
              { value: 'REFUNDED', label: 'Reembolsado' }
            ]}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <AdminTable
              data={transactionsData?.content || []}
              columns={transactionColumns}
              loading={transactionsLoading}
              actions={transactionActions}
              pagination={
                transactionsData && {
                  page: currentPage,
                  size: pageSize,
                  total: transactionsData.totalElements,
                  onPageChange: setCurrentPage,
                  onSizeChange: setPageSize
                }
              }
              emptyState={{
                title: 'No se encontraron transacciones',
                description: 'Asegúrate de que existan transacciones registradas en el sistema.',
                action: {
                  label: 'Ver todas las transacciones',
                  onClick: handleClearFilters
                }
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          {plansLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Cargando planes...</div>
            </div>
          ) : !plans || plans.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No se encontraron planes</div>
              <div className="text-gray-400">No hay planes de suscripción disponibles.</div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      )}

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
          agencyRuc={agencyRuc}
          setAgencyRuc={setAgencyRuc}
          agentDni={agentDni}
          setAgentDni={setAgentDni}
          isSearching={isSearching}
          onSearch={handleSearchAgency}
          searchResult={searchResult}
          customPrice={customPrice}
          setCustomPrice={setCustomPrice}
          discountPercentage={discountPercentage}
          setDiscountPercentage={setDiscountPercentage}
          discountNotes={discountNotes}
          setDiscountNotes={setDiscountNotes}
          onCreateDiscount={handleCreateDiscount}
          isPending={createDiscountMutation.isPending}
        />
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          transaction={selectedTransaction}
          canRefund={canRefund}
          onRefund={handleRefundTransaction}
        />
      )}

      {/* Subscription Details Modal */}
      {selectedSubscription && (
        <SubscriptionDetailsModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          subscription={selectedSubscription}
        />
      )}
    </div>
  );
}