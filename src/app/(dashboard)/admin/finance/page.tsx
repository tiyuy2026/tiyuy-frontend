/**
 * Admin Finance Management Page
 * Complete finance and monetization management with real backend integration
 */

'use client';

import { useState } from 'react';
import { useSubscriptionPlans, useAdminSubscriptions, usePaymentTransactions } from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { AdminFilters } from '@/presentation/components/admin/AdminFilters/AdminFilters';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { SubscriptionPlan, Subscription, AdminSubscription, Transaction } from '@/core/domain/entities/Admin';
import { PaginationParams } from '@/core/domain/repositories/IAdminRepository';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'transactions'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedSubscription, setSelectedSubscription] = useState<AdminSubscription | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const { hasPermission } = usePermissions();
  const canViewFinance = hasPermission('FINANCE_VIEW');
  const canManageSubscriptions = hasPermission('SUBSCRIPTIONS_MANAGE');

  const params: PaginationParams = { page: currentPage - 1, size: pageSize };

  // Get data from backend
  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlans();
  const { data: subscriptionsData, isLoading: subscriptionsLoading, refetch: refetchSubscriptions } = useAdminSubscriptions(
    statusFilter !== 'all' ? statusFilter : undefined,
    params
  );
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = usePaymentTransactions(
    undefined,
    params
  );

  const handleViewSubscription = (subscription: AdminSubscription) => {
    setSelectedSubscription(subscription);
    setIsSubscriptionModalOpen(true);
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  // Calculate overview statistics
  const calculateStats = () => {
    const subscriptions = subscriptionsData?.content || [];
    const transactions = transactionsData?.content || [];
    
    const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE').length;
    const totalRevenue = transactions
      .filter(t => t.type === 'PAYMENT' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyRevenue = transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt);
        const now = new Date();
        return t.type === 'PAYMENT' && 
               t.status === 'COMPLETED' &&
               transactionDate.getMonth() === now.getMonth() &&
               transactionDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions,
      totalRevenue,
      monthlyRevenue,
      totalTransactions: transactions.length
    };
  };

  const stats = calculateStats();

  // Subscription table columns
  const subscriptionColumns = [
    {
      key: 'userEmail' as keyof AdminSubscription,
      label: 'User',
      sortable: true,
      render: (value: string, subscription: AdminSubscription) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">ID: {subscription.userId}</div>
        </div>
      )
    },
    {
      key: 'tier' as keyof AdminSubscription,
      label: 'Plan',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'FREE' ? 'bg-gray-100 text-gray-800' :
          value === 'BASIC' ? 'bg-blue-100 text-blue-800' :
          value === 'PRO' ? 'bg-purple-100 text-purple-800' :
          value === 'ENTERPRISE_TRIAL' ? 'bg-orange-100 text-orange-800' :
          value === 'ENTERPRISE' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status' as keyof AdminSubscription,
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          value === 'EXPIRED' ? 'bg-red-100 text-red-800' :
          value === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'amount' as keyof AdminSubscription,
      label: 'Amount',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-green-600">
          ${value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'startDate' as keyof AdminSubscription,
      label: 'Start Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'endDate' as keyof AdminSubscription,
      label: 'End Date',
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'createdAt' as keyof AdminSubscription,
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  // Transaction table columns
  const transactionColumns = [
    {
      key: 'userEmail' as keyof Transaction,
      label: 'User',
      sortable: true,
      render: (value: string, transaction: Transaction) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">ID: {transaction.userId}</div>
        </div>
      )
    },
    {
      key: 'type' as keyof Transaction,
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'PAYMENT' ? 'bg-green-100 text-green-800' :
          value === 'REFUND' ? 'bg-red-100 text-red-800' :
          value === 'CREDIT' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status' as keyof Transaction,
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          value === 'FAILED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'amount' as keyof Transaction,
      label: 'Amount',
      sortable: true,
      render: (value: number, transaction: Transaction) => (
        <div className={`font-medium ${
          transaction.type === 'REFUND' ? 'text-red-600' : 'text-green-600'
        }`}>
          {transaction.type === 'REFUND' ? '-' : '+'}${value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'description' as keyof Transaction,
      label: 'Description',
      render: (value: string) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'createdAt' as keyof Transaction,
      label: 'Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  // Filter options
  const subscriptionFilterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'EXPIRED', label: 'Expired' },
        { value: 'CANCELLED', label: 'Cancelled' }
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

  if (!canViewFinance) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view finance information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finance Management</h2>
          <p className="text-gray-600">Monitor subscriptions, revenue, and transactions</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'transactions', label: 'Transactions' }
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSubscriptions}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <div className="text-blue-600">Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <div className="text-green-600">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <div className="text-purple-600">Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">${stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <div className="text-orange-600">Monthly</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plansData?.map((plan: SubscriptionPlan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{plan.displayName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">${plan.priceInPen}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Properties: {plan.limits.properties}</div>
                      <div>Projects: {plan.limits.projects}</div>
                      <div>Features: {plan.features.length}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Filters */}
          <AdminFilters
            searchPlaceholder="Search by user email..."
            onSearchChange={setSearchQuery}
            onFilterChange={handleFilterChange}
            filters={subscriptionFilterOptions}
            onClear={handleClearFilters}
          />

          {/* Subscriptions Table */}
          <AdminTable
            data={subscriptionsData?.content || []}
            columns={subscriptionColumns}
            loading={subscriptionsLoading}
            actions={[
              {
                label: 'View Details',
                onClick: handleViewSubscription,
                variant: 'primary' as const
              }
            ]}
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

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filters */}
          <AdminFilters
            searchPlaceholder="Search by user email or description..."
            onSearchChange={setSearchQuery}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />

          {/* Transactions Table */}
          <AdminTable
            data={transactionsData?.content || []}
            columns={transactionColumns}
            loading={transactionsLoading}
            actions={[
              {
                label: 'View Details',
                onClick: handleViewTransaction,
                variant: 'primary' as const
              }
            ]}
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
              description: 'Try adjusting your search criteria.',
              action: {
                label: 'Clear Search',
                onClick: handleClearFilters
              }
            }}
          />
        </div>
      )}

      {/* Subscription Details Modal */}
      {selectedSubscription && (
        <Modal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                <div className="space-y-2">
                  <div><strong>Email:</strong> {selectedSubscription.userEmail}</div>
                  <div><strong>User ID:</strong> {selectedSubscription.userId}</div>
                  <div><strong>Plan:</strong> {selectedSubscription.tier}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedSubscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      selectedSubscription.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedSubscription.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Subscription Details</h4>
                <div className="space-y-2">
                  <div><strong>Amount:</strong> ${selectedSubscription.amount}</div>
                  <div><strong>Start Date:</strong> {new Date(selectedSubscription.startDate).toLocaleDateString()}</div>
                  <div><strong>End Date:</strong> {selectedSubscription.endDate ? new Date(selectedSubscription.endDate).toLocaleDateString() : 'N/A'}</div>
                  <div><strong>Created:</strong> {new Date(selectedSubscription.createdAt).toLocaleDateString()}</div>
                </div>
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

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
                <div className="space-y-2">
                  <div><strong>Email:</strong> {selectedTransaction.userEmail}</div>
                  <div><strong>User ID:</strong> {selectedTransaction.userId}</div>
                  <div><strong>Type:</strong> {selectedTransaction.type}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedTransaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      selectedTransaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Transaction Details</h4>
                <div className="space-y-2">
                  <div><strong>Amount:</strong> 
                    <span className={`ml-2 font-medium ${
                      selectedTransaction.type === 'REFUND' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {selectedTransaction.type === 'REFUND' ? '-' : '+'}${selectedTransaction.amount}
                    </span>
                  </div>
                  <div><strong>Description:</strong> {selectedTransaction.description}</div>
                  <div><strong>Date:</strong> {new Date(selectedTransaction.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsTransactionModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
