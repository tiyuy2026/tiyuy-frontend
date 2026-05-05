/**
 * Admin Plans and Monetization Page
 * Complete subscription and payment management with real backend integration
 */

'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Componente PlanCard
interface PlanCardProps {
  plan: any;
  onEdit: () => void;
  onManageDiscounts: () => void;
  onToggle: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, onManageDiscounts, onToggle }) => {
  const cycleMap = {
    'MONTHLY': 'Mensual',
    'QUARTERLY': 'Trimestral', 
    'YEARLY': 'Anual',
    'LIFETIME': 'Vitalicio'
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 ${
      plan.isFeatured ? 'border-blue-500' : 'border-gray-200'
    } overflow-hidden hover:shadow-xl transition-shadow duration-300`}>
      {/* Header */}
      <div className={`p-6 ${
        plan.isFeatured ? 'bg-gradient-to-r from-blue-500 to-teal-400' : 'bg-gradient-to-r from-gray-50 to-gray-100'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{plan.displayName}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {plan.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          S/ {plan.priceInPen?.toLocaleString() || '0'}
          <span className="text-sm font-normal text-gray-600">/mes</span>
        </div>
        {plan.priceInUsd && (
          <div className="text-sm text-gray-600">
            ${plan.priceInUsd?.toLocaleString()} USD
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Description */}
        <p className="text-gray-600 text-sm">{plan.description}</p>

        {/* Limits */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Límites:</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>📄 {plan.publicationsLimit || 0} publicaciones</div>
            <div>🏢 {plan.projectsLimit || 0} proyectos</div>
            <div>📸 {plan.photosLimit || 0} fotos</div>
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Ciclo:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {cycleMap[plan.billingCycle as keyof typeof cycleMap] || plan.billingCycle}
          </span>
        </div>

        {/* Duration */}
        {plan.durationDays && plan.durationDays > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Duración:</span>
            <span className="text-sm font-medium text-gray-900">{plan.durationDays} días</span>
          </div>
        )}

        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Características:</h4>
            <div className="space-y-1">
              {plan.features.slice(0, 3).map((feature: string, index: number) => (
                <div key={index} className="text-sm text-gray-600">✓ {feature}</div>
              ))}
              {plan.features.length > 3 && (
                <div className="text-sm text-gray-500">+{plan.features.length - 3} más...</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="space-y-2">
          <button
            onClick={onEdit}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Editar Plan
          </button>
          <button
            onClick={onManageDiscounts}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Descuentos
          </button>
          <button
            onClick={onToggle}
            className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              plan.isActive 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {plan.isActive ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  );
};
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
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { AdminFilters } from '@/presentation/components/admin/AdminFilters/AdminFilters';
import { PaginationParams, PaginatedResponse } from '@/core/domain/repositories/IAdminRepository';
import { 
  FinanceStatsDto, 
  SubscriptionPlan, 
  Subscription, 
  PaymentTransaction,
  AgencyPlanDiscount
} from '@/core/domain/entities/Admin';

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
    if (confirm(`Are you sure you want to refund transaction ${transaction.id}?`)) {
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

  // Handle edit plan
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
      label: 'User ID',
      sortable: true,
      render: (value: number) => `User ${value}`
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
          {value}
        </span>
      )
    },
    {
      key: 'status' as keyof Subscription,
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          value === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
          value === 'CANCELLED' ? 'bg-red-100 text-red-800' :
          value === 'EXPIRED' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'price' as keyof Subscription,
      label: 'Price',
      sortable: true,
      render: (value: number, subscription: Subscription) => (
        <div className="font-medium text-green-600">
          {subscription.currency} {value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'paymentMethod' as keyof Subscription,
      label: 'Payment Method',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: 'autoRenew' as keyof Subscription,
      label: 'Auto Renew',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Enabled' : 'Disabled'}
        </span>
      )
    },
    {
      key: 'startDate' as keyof Subscription,
      label: 'Started',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'endDate' as keyof Subscription,
      label: 'Ends',
      sortable: true,
      render: (value?: string) => value ? new Date(value).toLocaleDateString() : 'No end date'
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
      label: 'User ID',
      sortable: true,
      render: (value: number) => `User ${value}`
    },
    {
      key: 'subscriptionId' as keyof PaymentTransaction,
      label: 'Subscription',
      sortable: true,
      render: (value?: number) => value ? `#${value}` : 'N/A'
    },
    {
      key: 'amount' as keyof PaymentTransaction,
      label: 'Amount',
      sortable: true,
      render: (value: number, transaction: PaymentTransaction) => (
        <div className="font-medium text-green-600">
          {transaction.currency} {value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'paymentMethod' as keyof PaymentTransaction,
      label: 'Method',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      key: 'status' as keyof PaymentTransaction,
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          value === 'FAILED' ? 'bg-red-100 text-red-800' :
          value === 'REFUNDED' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
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
      label: 'Description',
      sortable: false,
      render: (value: string) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'createdAt' as keyof PaymentTransaction,
      label: 'Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
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
        <div className="font-medium text-green-600">S/ {value.toLocaleString()}</div>
      )
    },
    {
      key: 'priceInUsd' as keyof SubscriptionPlan,
      label: 'Precio (USD)',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-blue-600">${value.toLocaleString()}</div>
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
      label: 'View Details',
      onClick: handleViewSubscription,
      variant: 'primary' as const
    }
  ];

  const transactionActions = [
    {
      label: 'View Details',
      onClick: handleViewTransaction,
      variant: 'primary' as const
    },
    ...(canRefund ? [{
      label: 'Refund',
      onClick: (transaction: PaymentTransaction) => {
        const reason = prompt('Enter refund reason:');
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
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'EXPIRED', label: 'Expired' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'FAILED', label: 'Failed' },
        { value: 'REFUNDED', label: 'Refunded' }
      ]
    }
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    if (filters.status !== undefined) {
      setStatusFilter(filters.status);
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plans & Monetization</h2>
          <p className="text-gray-600">Manage subscriptions, payments, and revenue</p>
        </div>
        <button
          onClick={handleRefreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={statsLoading}
        >
          {statsLoading ? 'Actualizando...' : '🔄 Refrescar Datos'}
        </button>
      </div>

      {/* Finance Stats Cards */}
      {financeStats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                ${(financeStats.totalRevenue ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Ingresos Totales</div>
              <div className="text-xs text-green-600">
                +${(financeStats.revenueToday ?? 0).toLocaleString()} hoy
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{financeStats.totalSubscriptions ?? 0}</div>
              <div className="text-sm text-gray-500">Suscripciones Totales</div>
              <div className="text-xs text-blue-600">
                {financeStats.activeSubscriptions ?? 0} activas
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{financeStats.totalTransactions ?? 0}</div>
              <div className="text-sm text-gray-500">Transacciones Totales</div>
              <div className="text-xs text-purple-600">
                {financeStats.transactionsToday ?? 0} hoy
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                ${(financeStats.averageTransactionValue ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Transacción Promedio</div>
              <div className="text-xs text-red-600">
                ${(financeStats.refundsTotal ?? 0).toLocaleString()} reembolsado
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
          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Gráfico de ingresos se mostraría aquí
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Suscripciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.isArray(plans) && plans?.map((plan) => (
                    <div key={plan.id} className="flex justify-between items-center">
                      <span className="text-sm">{plan.displayName}</span>
                      <span className="text-sm font-medium">{plan.priceInPen} PEN</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Today's Revenue: ${financeStats?.revenueToday.toLocaleString()}</div>
                  <div>This Week: ${financeStats?.revenueThisWeek.toLocaleString()}</div>
                  <div>This Month: ${financeStats?.revenueThisMonth.toLocaleString()}</div>
                  <div>New Subscriptions Today: {financeStats?.newSubscriptionsToday}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <AdminFilters
            searchPlaceholder="Search by user ID or plan..."
            onSearchChange={setSearchQuery}
            onFilterChange={handleFilterChange}
            filters={filterOptions}
            onClear={handleClearFilters}
          />

          <AdminTable
            data={subscriptionsData?.content || []}
            columns={subscriptionColumns}
            loading={subscriptionsLoading}
            actions={subscriptionActions}
            selection={{
              selectedItems: selectedSubscriptions,
              onSelectionChange: setSelectedSubscriptions,
              getRowId: (subscription) => subscription.id
            }}
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
              title: 'No subscriptions found',
              description: 'Try adjusting your search or filter criteria.',
              action: {
                label: 'Clear Filters',
                onClick: handleClearFilters
              }
            }}
          />
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <AdminFilters
            searchPlaceholder="Search by transaction ID or user..."
            onSearchChange={setSearchQuery}
            onFilterChange={handleFilterChange}
            filters={filterOptions}
            onClear={handleClearFilters}
          />

          <AdminTable
            data={transactionsData?.content || []}
            columns={transactionColumns}
            loading={transactionsLoading}
            actions={transactionActions}
            selection={{
              selectedItems: selectedTransactions,
              onSelectionChange: setSelectedTransactions,
              getRowId: (transaction) => transaction.id
            }}
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
              title: 'No transactions found',
              description: 'Try adjusting your search or filter criteria.',
              action: {
                label: 'Clear Filters',
                onClick: handleClearFilters
              }
            }}
          />
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
              {plans.slice(0, 4).map((plan: any) => {
                console.log('Rendering plan card for:', plan);
                return (
                  <PlanCard 
                    key={plan.id} 
                    plan={plan} 
                    onEdit={() => handleEditPlan(plan)}
                    onManageDiscounts={() => handleManageDiscounts(plan)}
                    onToggle={() => handleTogglePlan(plan.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Plan Modal */}
      {isEditPlanModalOpen && selectedPlan && (
        <Modal isOpen={isEditPlanModalOpen} onClose={() => setIsEditPlanModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Editar Plan: {selectedPlan.displayName}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre para Mostrar</label>
                <input
                  type="text"
                  value={editForm.displayName || ''}
                  onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (PEN)</label>
                  <input
                    type="number"
                    value={editForm.priceInPen || ''}
                    onChange={(e) => setEditForm({...editForm, priceInPen: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (USD)</label>
                  <input
                    type="number"
                    value={editForm.priceInUsd || ''}
                    onChange={(e) => setEditForm({...editForm, priceInUsd: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (Días)</label>
                  <input
                    type="number"
                    value={editForm.durationDays || ''}
                    onChange={(e) => setEditForm({...editForm, durationDays: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Publicaciones</label>
                  <input
                    type="number"
                    value={editForm.publicationsLimit || ''}
                    onChange={(e) => setEditForm({...editForm, publicationsLimit: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Límite de Fotos</label>
                  <input
                    type="number"
                    value={editForm.photosLimit || ''}
                    onChange={(e) => setEditForm({...editForm, photosLimit: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isActive || false}
                    onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Activo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isFeatured || false}
                    onChange={(e) => setEditForm({...editForm, isFeatured: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Destacado</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditPlanModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePlan}
                disabled={updatePlanMutation.isPending}
              >
                {updatePlanMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Agency Discount Modal */}
      {isDiscountModalOpen && discountPlan && (
        <Modal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">
              Apply Discount: {discountPlan.displayName}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RUC Inmobiliaria
                  </label>
                  <input
                    type="text"
                    value={agencyRuc}
                    onChange={(e) => setAgencyRuc(e.target.value)}
                    placeholder="Enter RUC (e.g., 20123456789)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    O DNI Agente
                  </label>
                  <input
                    type="text"
                    value={agentDni}
                    onChange={(e) => setAgentDni(e.target.value)}
                    placeholder="Enter DNI (e.g., 12345678)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Search Button */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSearchAgency}
                  disabled={isSearching || (!agencyRuc && !agentDni)}
                  className="flex-1"
                >
                  {isSearching ? 'Searching...' : 'Buscar'}
                </Button>
              </div>
              
              {/* Search Result */}
              {searchResult && (
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Encontrado:</strong> {searchResult.name}
                  </p>
                  <p className="text-xs text-green-600">
                    ID: {searchResult.id} | Tipo: {searchResult.type}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Price (PEN) - Optional
                  </label>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="e.g., 299"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount % - Optional
                  </label>
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="e.g., 20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={discountNotes}
                  onChange={(e) => setDiscountNotes(e.target.value)}
                  placeholder="Reason for discount..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Current Price:</strong> S/ {discountPlan.priceInPen}
                </p>
                {customPrice && (
                  <p className="text-sm text-green-700 mt-1">
                    <strong>New Price:</strong> S/ {customPrice}
                  </p>
                )}
                {discountPercentage && !customPrice && (
                  <p className="text-sm text-green-700 mt-1">
                    <strong>With {discountPercentage}% off:</strong> S/ {(discountPlan.priceInPen * (1 - parseFloat(discountPercentage)/100)).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDiscountModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateDiscount}
                disabled={createDiscountMutation.isPending || !agencyId}
              >
                {createDiscountMutation.isPending ? 'Applying...' : 'Apply Discount'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
            
            <div className="space-y-4">
              <div>
                <strong>Transaction ID:</strong> #{selectedTransaction.id}
              </div>
              <div>
                <strong>User ID:</strong> {selectedTransaction.userId}
              </div>
              <div>
                <strong>Amount:</strong> {selectedTransaction.currency} {selectedTransaction.amount.toLocaleString()}
              </div>
              <div>
                <strong>Payment Method:</strong> {selectedTransaction.paymentMethod}
              </div>
              <div>
                <strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedTransaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  selectedTransaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  selectedTransaction.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  selectedTransaction.status === 'REFUNDED' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTransaction.status}
                </span>
              </div>
              <div>
                <strong>Description:</strong> {selectedTransaction.description}
              </div>
              <div>
                <strong>Date:</strong> {new Date(selectedTransaction.createdAt).toLocaleString()}
              </div>
              {selectedTransaction.paymentId && (
                <div>
                  <strong>Payment ID:</strong> {selectedTransaction.paymentId}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsTransactionModalOpen(false)}>
                Close
              </Button>
              {canRefund && selectedTransaction.status === 'COMPLETED' && (
                <Button 
                  variant="danger"
                  onClick={() => {
                    const reason = prompt('Enter refund reason:');
                    if (reason) {
                      handleRefundTransaction(selectedTransaction, reason);
                      setIsTransactionModalOpen(false);
                    }
                  }}
                >
                  Refund
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Subscription Details Modal */}
      {selectedSubscription && (
        <Modal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
            
            <div className="space-y-4">
              <div>
                <strong>Subscription ID:</strong> #{selectedSubscription.id}
              </div>
              <div>
                <strong>User ID:</strong> {selectedSubscription.userId}
              </div>
              <div>
                <strong>Plan:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedSubscription.tier === 'FREE' ? 'bg-gray-100 text-gray-800' :
                  selectedSubscription.tier === 'BASIC' ? 'bg-blue-100 text-blue-800' :
                  selectedSubscription.tier === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                  selectedSubscription.tier === 'ENTERPRISE' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSubscription.tier}
                </span>
              </div>
              <div>
                <strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedSubscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  selectedSubscription.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                  selectedSubscription.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  selectedSubscription.status === 'EXPIRED' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSubscription.status}
                </span>
              </div>
              <div>
                <strong>Price:</strong> {selectedSubscription.currency} {selectedSubscription.price.toLocaleString()}
              </div>
              <div>
                <strong>Payment Method:</strong> {selectedSubscription.paymentMethod}
              </div>
              <div>
                <strong>Auto Renew:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedSubscription.autoRenew ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedSubscription.autoRenew ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div>
                <strong>Start Date:</strong> {new Date(selectedSubscription.startDate).toLocaleDateString()}
              </div>
              {selectedSubscription.endDate && (
                <div>
                  <strong>End Date:</strong> {new Date(selectedSubscription.endDate).toLocaleDateString()}
                </div>
              )}
              <div>
                <strong>Created:</strong> {new Date(selectedSubscription.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsSubscriptionModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}