/**
 * Agent Discounts Management Page
 * Complete discount management for individual agents
 */

'use client';

import { useState } from 'react';
import { 
  useAgentDiscounts, 
  useAvailableDiscountsForAgent,
  useAssignDiscountToAgent,
  useRemoveDiscountFromAgent,
  useToggleAgentDiscountStatus 
} from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { AdminFilters } from '@/presentation/components/admin/AdminFilters/AdminFilters';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { PaginationParams, PaginatedResponse } from '@/core/domain/repositories/IAdminRepository';
import { 
  AgentDiscount, 
  AgentDiscountFilters, 
  AgentDiscountSummary,
  AssignDiscountToAgentRequest 
} from '@/core/domain/entities/AgentDiscount';
import { format } from 'date-fns';

export default function AgentDiscountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDiscounts, setSelectedDiscounts] = useState<AgentDiscount[]>([]);

  const { hasPermission } = usePermissions();
  const canManageDiscounts = hasPermission('DISCOUNTS_MANAGE');

  const params: PaginationParams = { page: currentPage - 1, size: pageSize };

  const { data: discountsData, isLoading, error, refetch } = useAgentDiscounts(
    selectedAgent ? { agentId: selectedAgent } : {},
    params
  );

  const { data: availableDiscounts } = useAvailableDiscountsForAgent(selectedAgent || 0);
  const assignDiscountMutation = useAssignDiscountToAgent();
  const removeDiscountMutation = useRemoveDiscountFromAgent();
  const toggleStatusMutation = useToggleAgentDiscountStatus();

  const handleAssignDiscount = async (discountId: number) => {
    if (!selectedAgent) return;
    
    await assignDiscountMutation.mutateAsync({
      agentId: selectedAgent,
      discountCodeId: discountId,
      notes: `Assigned by admin on ${new Date().toISOString()}`
    });
    refetch();
  };

  const handleRemoveDiscount = async (agentId: number, discountCodeId: number) => {
    await removeDiscountMutation.mutateAsync({ agentId, discountCodeId });
    refetch();
  };

  const handleToggleStatus = async (discountId: number) => {
    await toggleStatusMutation.mutateAsync(discountId);
    refetch();
  };

  const discounts = discountsData?.content || [];

  // Filter discounts based on search and filters
  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = !searchQuery || 
      discount.discountCode.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.discountCode.discountPercentage.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || discount.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Paginate results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDiscounts = filteredDiscounts.slice(startIndex, endIndex);

  // Table columns
  const columns = [
    {
      key: 'discountCode' as keyof AgentDiscount,
      label: 'Discount Code',
      sortable: true,
      render: (value: any) => (
        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value.code}
        </div>
      )
    },
    {
      key: 'discountCode' as keyof AgentDiscount,
      label: 'Percentage',
      sortable: true,
      render: (value: any) => (
        <span className="text-green-600 font-medium">
          {value.discountPercentage}% OFF
        </span>
      )
    },
    {
      key: 'status' as keyof AgentDiscount,
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const statusColors = {
          ACTIVE: 'bg-green-100 text-green-800',
          EXPIRED: 'bg-red-100 text-red-800',
          USED: 'bg-gray-100 text-gray-800',
          CANCELLED: 'bg-yellow-100 text-yellow-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'assignedAt' as keyof AgentDiscount,
      label: 'Assigned Date',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          {format(new Date(value), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      key: 'expiresAt' as keyof AgentDiscount,
      label: 'Expires',
      sortable: true,
      render: (value: string) => {
        if (!value) return <span className="text-gray-400">No expiry</span>;
        const isExpired = new Date(value) < new Date();
        return (
          <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
            {format(new Date(value), 'MMM dd, yyyy')}
          </div>
        );
      }
    },
    {
      key: 'usageCount' as keyof AgentDiscount,
      label: 'Usage',
      sortable: true,
      render: (value: number, discount: AgentDiscount) => (
        <div className="text-sm">
          <div>{value} / {discount.maxUsage || '∞'}</div>
          <div className="text-xs text-gray-500">
            {discount.maxUsage ? `${Math.round((value / discount.maxUsage) * 100)}% used` : 'Unlimited'}
          </div>
        </div>
      )
    }
  ];

  // Table actions
  const actions = [
    ...(canManageDiscounts ? [
      {
        label: 'Toggle Status',
        onClick: (discount: AgentDiscount) => handleToggleStatus(discount.id),
        variant: 'secondary' as const
      },
      {
        label: 'Remove',
        onClick: (discount: AgentDiscount) => handleRemoveDiscount(discount.agentId, discount.discountCodeId),
        variant: 'danger' as const
      }
    ] : [])
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
        { value: 'EXPIRED', label: 'Expired' },
        { value: 'USED', label: 'Used' },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agent Discounts Management</h2>
          <p className="text-gray-600">Manage discount codes assigned to individual agents</p>
        </div>
        
        {canManageDiscounts && selectedAgent && (
          <Button
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Assign Discount
          </Button>
        )}
      </div>

      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Agent ID:</label>
            <input
              type="number"
              value={selectedAgent || ''}
              onChange={(e) => setSelectedAgent(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Enter agent ID to view their discounts"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={() => refetch()}
              disabled={!selectedAgent}
              variant="outline"
            >
              View Discounts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <AdminFilters
        searchPlaceholder="Search by discount code..."
        onSearchChange={setSearchQuery}
        onFilterChange={handleFilterChange}
        filters={filterOptions}
        onClear={handleClearFilters}
      />

      {/* Discounts Table */}
      <AdminTable
        data={paginatedDiscounts}
        columns={columns}
        loading={isLoading}
        actions={actions}
        selection={{
          selectedItems: selectedDiscounts,
          onSelectionChange: setSelectedDiscounts,
          getRowId: (discount) => discount.id
        }}
        pagination={{
          page: currentPage,
          size: pageSize,
          total: filteredDiscounts.length,
          onPageChange: setCurrentPage,
          onSizeChange: setPageSize
        }}
        emptyState={{
          title: 'No discounts found',
          description: selectedAgent 
            ? 'This agent has no assigned discount codes.'
            : 'Select an agent to view their discount codes.',
          action: selectedAgent ? undefined : {
            label: 'Select Agent',
            onClick: () => (document.querySelector('input[type="number"]') as HTMLInputElement)?.focus()
          }
        }}
      />

      {/* Assign Discount Modal */}
      {isAssignModalOpen && (
        <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">Assign Discount to Agent</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Discount Codes</label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {availableDiscounts && availableDiscounts.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {availableDiscounts.map((discount) => (
                        <div key={discount.id} className="p-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{discount.code}</div>
                              <div className="text-sm text-gray-500">{discount.discountPercentage}% OFF</div>
                              <div className="text-xs text-gray-400">
                                Valid: {format(new Date(discount.startDate), 'MMM dd')} - {format(new Date(discount.endDate), 'MMM dd, yyyy')}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleAssignDiscount(discount.id)}
                              disabled={assignDiscountMutation.isPending}
                              size="sm"
                            >
                              Assign
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No available discount codes to assign.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
