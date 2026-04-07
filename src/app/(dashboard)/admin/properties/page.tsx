/**
 * Admin Property Management Page
 * Complete property moderation and management with backend integration
 */

'use client';

import { useState } from 'react';
import { usePropertiesForModeration, useModerateProperty, useToggleFeaturedProperty } from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { AdminFilters } from '@/presentation/components/admin/AdminFilters/AdminFilters';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { PropertyModerationItem, ModeratePropertyRequest } from '@/core/domain/entities/Admin';

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedProperties, setSelectedProperties] = useState<PropertyModerationItem[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isModerateModalOpen, setIsModerateModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyModerationItem | null>(null);

  const { hasPermission } = usePermissions();
  const canModerateProperties = hasPermission('PROPERTIES_MODERATE');
  const canDeleteProperties = hasPermission('PROPERTIES_DELETE');
  const canFeatureProperties = hasPermission('PROPERTIES_FEATURE');

  const { data: propertiesData, isLoading, error, refetch } = usePropertiesForModeration(
    statusFilter !== 'all' ? statusFilter as any : undefined,
    searchQuery || undefined,
    { page: currentPage - 1, size: pageSize }
  );

  const moderateMutation = useModerateProperty();
  const toggleFeaturedMutation = useToggleFeaturedProperty();

  const handleViewProperty = (property: PropertyModerationItem) => {
    setSelectedProperty(property);
    setIsViewModalOpen(true);
  };

  const handleModerateProperty = (property: PropertyModerationItem) => {
    setSelectedProperty(property);
    setIsModerateModalOpen(true);
  };

  const confirmModeration = async (action: 'APPROVE' | 'REJECT' | 'SUSPEND', reason?: string) => {
    if (!selectedProperty) return;

    await moderateMutation.mutateAsync({
      propertyId: selectedProperty.id,
      request: {
        action,
        reason,
        notes: `Moderated by admin: ${reason || 'No additional notes'}`
      }
    });
    setIsModerateModalOpen(false);
    setSelectedProperty(null);
    refetch();
  };

  const handleToggleFeatured = async (property: PropertyModerationItem) => {
    const newFeaturedState = !property.isFeatured;
    await toggleFeaturedMutation.mutateAsync({
      propertyId: property.id,
      featured: newFeaturedState
    });
    refetch();
  };

  // Table columns
  const columns = [
    {
      key: 'title' as keyof PropertyModerationItem,
      label: 'Property',
      sortable: true,
      render: (value: string, property: PropertyModerationItem) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{property.slug}</div>
          <div className="text-xs text-gray-400">ID: {property.id}</div>
        </div>
      )
    },
    {
      key: 'ownerName' as keyof PropertyModerationItem,
      label: 'Owner',
      sortable: true,
      render: (value: string, property: PropertyModerationItem) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{property.ownerEmail}</div>
          <div className="text-xs text-gray-400">ID: {property.ownerId}</div>
        </div>
      )
    },
    {
      key: 'price' as keyof PropertyModerationItem,
      label: 'Price',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-green-600">
          ${value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'district' as keyof PropertyModerationItem,
      label: 'Location',
      sortable: true,
      render: (value: string, property: PropertyModerationItem) => (
        <div className="text-sm">
          <div>{value}</div>
          <div className="text-gray-500">{property.city}</div>
        </div>
      )
    },
    {
      key: 'status' as keyof PropertyModerationItem,
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
          value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          value === 'REJECTED' ? 'bg-red-100 text-red-800' :
          value === 'SUSPENDED' ? 'bg-orange-100 text-orange-800' :
          value === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'isFeatured' as keyof PropertyModerationItem,
      label: 'Featured',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? '⭐ Featured' : 'Standard'}
        </span>
      )
    },
    {
      key: 'viewsCount' as keyof PropertyModerationItem,
      label: 'Views',
      sortable: true,
      render: (value: number) => value.toLocaleString()
    },
    {
      key: 'reportCount' as keyof PropertyModerationItem,
      label: 'Reports',
      sortable: true,
      render: (value: number) => (
        <div className={value > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
          {value} {value === 1 ? 'report' : 'reports'}
        </div>
      )
    },
    {
      key: 'createdAt' as keyof PropertyModerationItem,
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'View Details',
      onClick: handleViewProperty,
      variant: 'primary' as const
    },
    ...(canModerateProperties ? [{
      label: 'Moderate',
      onClick: handleModerateProperty,
      variant: 'secondary' as const
    }] : []),
    ...(canFeatureProperties ? [{
      label: property => property.isFeatured ? 'Unfeature' : 'Feature',
      onClick: handleToggleFeatured,
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
        { value: 'DRAFT', label: 'Draft' },
        { value: 'PENDING', label: 'Pending Approval' },
        { value: 'PUBLISHED', label: 'Published' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'SUSPENDED', label: 'Suspended' }
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
          <h2 className="text-2xl font-bold text-gray-900">Property Management</h2>
          <p className="text-gray-600">Moderate and manage property listings</p>
        </div>
      </div>

      {/* Filters */}
      <AdminFilters
        searchPlaceholder="Search by title, owner, or location..."
        onSearchChange={setSearchQuery}
        onFilterChange={handleFilterChange}
        filters={filterOptions}
        onClear={handleClearFilters}
      />

      {/* Properties Table */}
      <AdminTable
        data={propertiesData?.content || []}
        columns={columns}
        loading={isLoading}
        error={error}
        actions={actions}
        selection={{
          selectedItems: selectedProperties,
          onSelectionChange: setSelectedProperties,
          getRowId: (property) => property.id
        }}
        pagination={
          propertiesData && {
            page: currentPage,
            size: pageSize,
            total: propertiesData.totalElements,
            onPageChange: setCurrentPage,
            onSizeChange: setPageSize
          }
        }
        emptyState={{
          title: 'No properties found',
          description: 'Try adjusting your search or filter criteria.',
          action: {
            label: 'Clear Filters',
            onClick: handleClearFilters
          }
        }}
      />

      {/* Property Details Modal */}
      {selectedProperty && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Property Details</h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div><strong>Title:</strong> {selectedProperty.title}</div>
                  <div><strong>Slug:</strong> {selectedProperty.slug}</div>
                  <div><strong>Price:</strong> ${selectedProperty.price.toLocaleString()}</div>
                  <div><strong>District:</strong> {selectedProperty.district}</div>
                  <div><strong>City:</strong> {selectedProperty.city}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedProperty.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                      selectedProperty.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      selectedProperty.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      selectedProperty.status === 'SUSPENDED' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedProperty.status}
                    </span>
                  </div>
                  <div><strong>Featured:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedProperty.isFeatured ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedProperty.isFeatured ? '⭐ Featured' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Owner Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedProperty.ownerName}</div>
                  <div><strong>Email:</strong> {selectedProperty.ownerEmail}</div>
                  <div><strong>Owner ID:</strong> {selectedProperty.ownerId}</div>
                  <div><strong>Properties:</strong> {selectedProperty.publishedPropertiesCount}</div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{selectedProperty.viewsCount}</div>
                  <div className="text-sm text-gray-500">Total Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedProperty.reportCount}</div>
                  <div className="text-sm text-gray-500">Reports</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedProperty.isFeatured ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-500">Featured</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {new Date(selectedProperty.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">Created</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Moderation Modal */}
      {selectedProperty && (
        <Modal isOpen={isModerateModalOpen} onClose={() => setIsModerateModalOpen(false)}>
          <ModerationModal
            property={selectedProperty}
            onConfirm={confirmModeration}
            onCancel={() => setIsModerateModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

// Moderation Modal Component
interface ModerationModalProps {
  property: PropertyModerationItem;
  onConfirm: (action: 'APPROVE' | 'REJECT' | 'SUSPEND', reason?: string) => void;
  onCancel: () => void;
}

function ModerationModal({ property, onConfirm, onCancel }: ModerationModalProps) {
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | 'SUSPEND'>('APPROVE');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(action, reason);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-4">Moderate Property</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          Moderating: <strong>{property.title}</strong>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="APPROVE">✅ Approve</option>
              <option value="REJECT">❌ Reject</option>
              <option value="SUSPEND">⚠️ Suspend</option>
            </select>
          </div>
          
          {(action === 'REJECT' || action === 'SUSPEND') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`Reason for ${action.toLowerCase()}...`}
                required
              />
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant={action === 'APPROVE' ? 'primary' : 'danger'}>
              {action === 'APPROVE' ? 'Approve' : action === 'REJECT' ? 'Reject' : 'Suspend'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
