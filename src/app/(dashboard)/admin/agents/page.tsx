/**
 * Admin Agent Management Page
 * Complete agent management with real backend integration
 */

'use client';

import { useState } from 'react';
import { useUsers, useToggleUserStatus } from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { AdminFilters } from '@/presentation/components/admin/AdminFilters/AdminFilters';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { AdminBulkOperations } from '@/presentation/components/admin/AdminBulkOperations/AdminBulkOperations';
import { PaginationParams } from '@/core/domain/repositories/IAdminRepository';
import { UserListItem } from '@/core/domain/entities/Admin';
import Link from 'next/link';

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedAgents, setSelectedAgents] = useState<UserListItem[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<UserListItem | null>(null);

  const { hasPermission } = usePermissions();
  const canManageAgents = hasPermission('USERS_UPDATE');
  const canManageDiscounts = hasPermission('DISCOUNTS_MANAGE');

  const params: PaginationParams = { page: currentPage - 1, size: pageSize };

  // Get users with AGENT role
  const { data: agentsData, isLoading, error, refetch } = useUsers(
    'AGENT', // Filter by AGENT role
    undefined, // No enabled filter
    searchQuery || undefined,
    params
  );

  const toggleStatusMutation = useToggleUserStatus();

  const handleViewAgent = (agent: UserListItem) => {
    setSelectedAgent(agent);
    setIsViewModalOpen(true);
  };

  const handleToggleStatus = async (agent: UserListItem) => {
    await toggleStatusMutation.mutateAsync({
      userId: agent.id,
      enabled: !agent.enabled,
      reason: `Agent status changed by admin`
    });
    refetch();
  };

  // Use agents data directly from backend with pagination
  const agents = agentsData?.content || [];

  // Filter agents based on search and filters
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = !searchQuery || 
      agent.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && agent.emailVerified) ||
      (verificationFilter === 'unverified' && !agent.emailVerified);
    
    return matchesSearch && matchesVerification;
  });

  // Paginate results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

  // Table columns
  const columns = [
    {
      key: 'firstName' as keyof UserListItem,
      label: 'Agent',
      sortable: true,
      render: (value: string, agent: UserListItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold">
            {agent.firstName[0]}{agent.lastName[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {agent.firstName} {agent.lastName}
            </div>
            <div className="text-sm text-gray-500">{agent.email}</div>
            <div className="text-xs text-gray-400">
              {agent.city ? `${agent.city}, ${agent.country || ''}` : 'No location'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'enabled' as keyof UserListItem,
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Disabled'}
        </span>
      )
    },
    {
      key: 'emailVerified' as keyof UserListItem,
      label: 'Verification',
      sortable: true,
      render: (value: boolean, agent: UserListItem) => (
        <div className="space-y-1">
          <div className={`text-xs ${agent.emailVerified ? 'text-green-600' : 'text-gray-400'}`}>
            {agent.emailVerified ? 'Email Verified' : 'Email Not Verified'}
          </div>
          <div className={`text-xs ${agent.phoneVerified ? 'text-green-600' : 'text-gray-400'}`}>
            {agent.phoneVerified ? 'Phone Verified' : 'Phone Not Verified'}
          </div>
        </div>
      )
    },
    {
      key: 'publishedPropertiesCount' as keyof UserListItem,
      label: 'Properties',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm">
          <div className="font-medium">{value || 0} Properties</div>
          <div className="text-gray-500">Published</div>
        </div>
      )
    },
    {
      key: 'lastLoginAt' as keyof UserListItem,
      label: 'Last Activity',
      sortable: true,
      render: (value: Date) => (
        <div className="text-sm">
          <div>{value ? new Date(value).toLocaleDateString() : 'Never'}</div>
          <div className="text-gray-500">Last login</div>
        </div>
      )
    },
    {
      key: 'createdAt' as keyof UserListItem,
      label: 'Member Since',
      sortable: true,
      render: (value: Date) => new Date(value).toLocaleDateString()
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'View Profile',
      onClick: handleViewAgent,
      variant: 'primary' as const
    },
    ...(canManageAgents ? [{
      label: 'Toggle Status',
      onClick: handleToggleStatus,
      variant: 'secondary' as const
    }] : [])
  ];

  // Filter options
  const filterOptions = [
    {
      key: 'verification',
      label: 'Verification Status',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'verified', label: 'Verified' },
        { value: 'unverified', label: 'Unverified' }
      ]
    }
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    if (filters.verification !== undefined) {
      setVerificationFilter(filters.verification);
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setVerificationFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agent Management</h2>
          <p className="text-gray-600">Manage users with AGENT role</p>
        </div>
      </div>

      {/* Filters */}
      <AdminFilters
        searchPlaceholder="Search by name, email..."
        onSearchChange={setSearchQuery}
        onFilterChange={handleFilterChange}
        filters={filterOptions}
        onClear={handleClearFilters}
      />

      {/* Agents Table */}
      <AdminTable
        data={paginatedAgents}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        actions={actions}
        selection={{
          selectedItems: selectedAgents,
          onSelectionChange: setSelectedAgents,
          getRowId: (agent) => agent.id
        }}
        pagination={{
          page: currentPage,
          size: pageSize,
          total: filteredAgents.length,
          onPageChange: setCurrentPage,
          onSizeChange: setPageSize
        }}
        emptyState={{
          title: 'No agents found',
          description: 'Try adjusting your search or filter criteria.',
          action: {
            label: 'Clear Filters',
            onClick: handleClearFilters
          }
        }}
      />

      {/* Bulk Operations */}
      {selectedAgents.length > 0 && (
        <AdminBulkOperations
          selectedItems={selectedAgents}
          onClearSelection={() => setSelectedAgents([])}
          onOperationComplete={() => refetch()}
          itemType="agents"
        />
      )}

      {/* Agent Details Modal */}
      {selectedAgent && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Agent Details</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedAgent.firstName} {selectedAgent.lastName}</div>
                  <div><strong>Email:</strong> {selectedAgent.email}</div>
                  <div><strong>Phone:</strong> {selectedAgent.phone}</div>
                  <div><strong>DNI:</strong> {selectedAgent.dni}</div>
                  <div><strong>Role:</strong> {selectedAgent.role}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedAgent.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedAgent.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Activity</h4>
                <div className="space-y-2">
                  <div><strong>Properties:</strong> {selectedAgent.publishedPropertiesCount}</div>
                  <div><strong>City:</strong> {selectedAgent.city || 'Not specified'}</div>
                  <div><strong>Country:</strong> {selectedAgent.country || 'Not specified'}</div>
                  <div><strong>Email Verified:</strong> 
                    <span className={`ml-2 ${selectedAgent.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAgent.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div><strong>Phone Verified:</strong> 
                    <span className={`ml-2 ${selectedAgent.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAgent.phoneVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div><strong>Last Login:</strong> 
                    {selectedAgent.lastLoginAt ? new Date(selectedAgent.lastLoginAt).toLocaleString() : 'Never'}
                  </div>
                  <div><strong>Member Since:</strong> {new Date(selectedAgent.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              {canManageDiscounts && (
                <Link href={`/admin/discounts`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Manage Discounts
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
