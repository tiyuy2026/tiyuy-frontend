/**
 * Admin Developer Management Page
 * Complete developer management based on backend DEVELOPER role
 * Developers are users who create real estate projects
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
import { UserListItem } from '@/core/domain/entities/Admin';
import { PaginationParams } from '@/core/domain/repositories/IAdminRepository';
import Link from 'next/link';

export default function DevelopersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedDevelopers, setSelectedDevelopers] = useState<UserListItem[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<UserListItem | null>(null);
  const [developerProjects, setDeveloperProjects] = useState<any[]>([]);

  const { hasPermission } = usePermissions();
  const canManageDevelopers = hasPermission('USERS_UPDATE');
  const canViewProjects = hasPermission('PROPERTIES_VIEW');

  const params: PaginationParams = { page: currentPage - 1, size: pageSize };

  // Get users with DEVELOPER role
  const { data: developersData, isLoading, error, refetch } = useUsers(
    'DEVELOPER', // Filter by DEVELOPER role
    undefined, // No enabled filter
    searchQuery || undefined,
    params
  );

  const toggleStatusMutation = useToggleUserStatus();

  const handleViewDeveloper = (developer: UserListItem) => {
    setSelectedDeveloper(developer);
    setIsViewModalOpen(true);
  };

  const handleViewProjects = async (developer: UserListItem) => {
    setSelectedDeveloper(developer);
    // TODO: Implement endpoint to get developer projects
    // const projects = await getDeveloperProjects(developer.id);
    // setDeveloperProjects(projects);
    setIsProjectsModalOpen(true);
  };

  const handleToggleStatus = async (developer: UserListItem) => {
    await toggleStatusMutation.mutateAsync({
      userId: developer.id,
      enabled: !developer.enabled,
      reason: `Developer status changed by admin`
    });
    refetch();
  };

  // Use developers data directly from backend with pagination
  const developers = developersData?.content || [];

  // Filter developers based on search and status
  const filteredDevelopers = developers.filter(developer => {
    const matchesSearch = !searchQuery || 
      developer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      developer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      developer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'enabled' && developer.enabled) ||
      (statusFilter === 'disabled' && !developer.enabled);
    
    return matchesSearch && matchesStatus;
  });

  // Paginate results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDevelopers = filteredDevelopers.slice(startIndex, endIndex);

  // Table columns
  const columns = [
    {
      key: 'firstName' as keyof UserListItem,
      label: 'Developer',
      sortable: true,
      render: (value: any, developer: UserListItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold">
            {developer.firstName[0]}{developer.lastName[0]}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {developer.firstName} {developer.lastName}
            </div>
            <div className="text-sm text-gray-500">{developer.email}</div>
            <div className="text-xs text-gray-400">
              {developer.city ? `${developer.city}, ${developer.country || ''}` : 'No location'}
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
      render: (value: boolean, developer: UserListItem) => (
        <div className="space-y-1">
          <div className={`text-xs ${developer.emailVerified ? 'text-green-600' : 'text-gray-400'}`}>
            {developer.emailVerified ? 'Email Verified' : 'Email Not Verified'}
          </div>
          <div className={`text-xs ${developer.phoneVerified ? 'text-green-600' : 'text-gray-400'}`}>
            {developer.phoneVerified ? 'Phone Verified' : 'Phone Not Verified'}
          </div>
        </div>
      )
    },
    {
      key: 'publishedPropertiesCount' as keyof UserListItem,
      label: 'Projects',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm">
          <div className="font-medium">{value || 0} Projects</div>
          <div className="text-gray-500">Created</div>
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
      onClick: handleViewDeveloper,
      variant: 'primary' as const
    },
    ...(canViewProjects ? [{
      label: 'View Projects',
      onClick: handleViewProjects,
      variant: 'secondary' as const
    }] : []),
    ...(canManageDevelopers ? [{
      label: 'Toggle Status',
      onClick: handleToggleStatus,
      variant: 'secondary' as const
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
        { value: 'enabled', label: 'Active' },
        { value: 'disabled', label: 'Disabled' }
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
    setStatusFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Developer Management</h2>
          <p className="text-gray-600">Manage developers who create real estate projects</p>
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

      {/* Developers Table */}
      <AdminTable
        data={paginatedDevelopers}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        actions={actions}
        selection={{
          selectedItems: selectedDevelopers,
          onSelectionChange: setSelectedDevelopers,
          getRowId: (developer) => developer.id
        }}
        pagination={{
          page: currentPage,
          size: pageSize,
          total: filteredDevelopers.length,
          onPageChange: setCurrentPage,
          onSizeChange: setPageSize
        }}
        emptyState={{
          title: 'No developers found',
          description: 'Try adjusting your search or filter criteria.',
          action: {
            label: 'Clear Filters',
            onClick: handleClearFilters
          }
        }}
      />

      {/* Bulk Operations */}
      {selectedDevelopers.length > 0 && (
        <AdminBulkOperations
          selectedItems={selectedDevelopers}
          onClearSelection={() => setSelectedDevelopers([])}
          onOperationComplete={() => refetch()}
          itemType="developers"
        />
      )}

      {/* Developer Details Modal */}
      {selectedDeveloper && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Developer Details</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedDeveloper.firstName} {selectedDeveloper.lastName}</div>
                  <div><strong>Email:</strong> {selectedDeveloper.email}</div>
                  <div><strong>Phone:</strong> {selectedDeveloper.phone}</div>
                  <div><strong>DNI:</strong> {selectedDeveloper.dni}</div>
                  <div><strong>Role:</strong> {selectedDeveloper.role}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedDeveloper.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDeveloper.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Activity</h4>
                <div className="space-y-2">
                  <div><strong>Projects Created:</strong> {selectedDeveloper.publishedPropertiesCount}</div>
                  <div><strong>City:</strong> {selectedDeveloper.city || 'Not specified'}</div>
                  <div><strong>Country:</strong> {selectedDeveloper.country || 'Not specified'}</div>
                  <div><strong>Email Verified:</strong> 
                    <span className={`ml-2 ${selectedDeveloper.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedDeveloper.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div><strong>Phone Verified:</strong> 
                    <span className={`ml-2 ${selectedDeveloper.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedDeveloper.phoneVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div><strong>Last Login:</strong> 
                    {selectedDeveloper.lastLoginAt ? new Date(selectedDeveloper.lastLoginAt).toLocaleString() : 'Never'}
                  </div>
                  <div><strong>Member Since:</strong> {new Date(selectedDeveloper.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              {canViewProjects && (
                <Button 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleViewProjects(selectedDeveloper);
                  }}
                >
                  View Projects
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Projects Modal */}
      {selectedDeveloper && (
        <Modal isOpen={isProjectsModalOpen} onClose={() => setIsProjectsModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Projects by {selectedDeveloper.firstName} {selectedDeveloper.lastName}
            </h3>
            
            <div className="text-center py-8 text-gray-500">
              <p>Developer projects functionality coming soon</p>
              <p className="text-sm mt-2">Total Projects: {selectedDeveloper.publishedPropertiesCount}</p>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsProjectsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
