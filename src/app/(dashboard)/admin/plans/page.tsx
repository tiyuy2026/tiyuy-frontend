/**
 * Admin Plans and Monetization Page
 * Complete subscription and payment management with real backend integration
 */

'use client';

import { useState } from 'react';
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

  const { hasPermission } = usePermissions();
  const canManageSubscriptions = hasPermission('FINANCE_MANAGE_SUBSCRIPTIONS');
  const canRefund = hasPermission('FINANCE_REFUNDS');

  const { data: financeStats, isLoading: statsLoading } = useFinanceStats();
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
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
    await updatePlanMutation.mutateAsync({
      planId: selectedPlan.id,
      plan: editForm
    });
    setIsEditPlanModalOpen(false);
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
      label: 'Price (PEN)',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-green-600">S/ {value.toLocaleString()}</div>
      )
    },
    {
      key: 'priceInUsd' as keyof SubscriptionPlan,
      label: 'Price (USD)',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-blue-600">${value.toLocaleString()}</div>
      )
    },
    {
      key: 'billingCycle' as keyof SubscriptionPlan,
      label: 'Billing',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'MONTHLY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'limits' as keyof SubscriptionPlan,
      label: 'Limits',
      sortable: false,
      render: (value: any) => (
        <div className="text-sm text-gray-600">
          <div>{value.properties} properties</div>
          <div>{value.projects} projects</div>
          <div>{value.photos} photos</div>
        </div>
      )
    },
    {
      key: 'isActive' as keyof SubscriptionPlan,
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  // Plan actions
  const planActions = [
    {
      label: 'Edit',
      onClick: handleEditPlan,
      variant: 'primary' as const
    },
    {
      label: 'Discounts',
      onClick: handleManageDiscounts,
      variant: 'secondary' as const
    },
    {
      label: 'Toggle',
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
      </div>

      {/* Finance Stats Cards */}
      {financeStats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                ${(financeStats.totalRevenue ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-xs text-green-600">
                +${(financeStats.revenueToday ?? 0).toLocaleString()} today
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{financeStats.totalSubscriptions ?? 0}</div>
              <div className="text-sm text-gray-500">Total Subscriptions</div>
              <div className="text-xs text-blue-600">
                {financeStats.activeSubscriptions ?? 0} active
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{financeStats.totalTransactions ?? 0}</div>
              <div className="text-sm text-gray-500">Total Transactions</div>
              <div className="text-xs text-purple-600">
                {financeStats.transactionsToday ?? 0} today
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                ${(financeStats.averageTransactionValue ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Avg Transaction</div>
              <div className="text-xs text-red-600">
                ${(financeStats.refundsTotal ?? 0).toLocaleString()} refunded
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'plans', label: 'Plans' }
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
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                Revenue chart component would go here
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {plans?.map((plan) => (
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
          <AdminTable
            data={plans || []}
            columns={planColumns}
            actions={planActions}
            loading={plansLoading}
            emptyState={{
              title: 'No plans found',
              description: 'No subscription plans are available.'
            }}
          />
        </div>
      )}

      {/* Edit Plan Modal */}
      {isEditPlanModalOpen && selectedPlan && (
        <Modal isOpen={isEditPlanModalOpen} onClose={() => setIsEditPlanModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Plan: {selectedPlan.displayName}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName || ''}
                  onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (PEN)</label>
                  <input
                    type="number"
                    value={editForm.priceInPen || ''}
                    onChange={(e) => setEditForm({...editForm, priceInPen: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={editForm.durationDays || ''}
                    onChange={(e) => setEditForm({...editForm, durationDays: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publications Limit</label>
                  <input
                    type="number"
                    value={editForm.publicationsLimit || ''}
                    onChange={(e) => setEditForm({...editForm, publicationsLimit: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photos Limit</label>
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
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isFeatured || false}
                    onChange={(e) => setEditForm({...editForm, isFeatured: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditPlanModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSavePlan}
                disabled={updatePlanMutation.isPending}
              >
                {updatePlanMutation.isPending ? 'Saving...' : 'Save Changes'}
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
                  selectedSubscription.tier === 'PRO' ? 'bg-purple-100 text-purple-800' :
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
