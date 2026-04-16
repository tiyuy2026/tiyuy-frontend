/**
 * Admin Project Management Page
 * Complete project administration with real backend integration
 */

'use client';

import { useState } from 'react';
import { 
  useProjectsForAdmin, 
  useProjectStats, 
  useModerateProject, 
  useToggleFeaturedProject, 
  useDeleteProject 
} from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { AdminFilters } from '@/presentation/components/admin/AdminFilters/AdminFilters';
import { PaginationParams, PaginatedResponse } from '@/core/domain/repositories/IAdminRepository';
import { ProjectAdminItem, ModerateProjectRequest } from '@/core/domain/entities/Admin';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedProjects, setSelectedProjects] = useState<ProjectAdminItem[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isModerateModalOpen, setIsModerateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectAdminItem | null>(null);

  const { hasPermission } = usePermissions();
  const canModerateProjects = hasPermission('PROJECTS_MODERATE');
  const canDeleteProjects = hasPermission('PROJECTS_DELETE');

  const { data: projectsData, isLoading, error, refetch } = useProjectsForAdmin(
    statusFilter !== 'all' ? statusFilter : undefined,
    searchQuery || undefined,
    { page: currentPage - 1, size: pageSize }
  );

  const { data: projectStats } = useProjectStats();

  const moderateMutation = useModerateProject();
  const toggleFeaturedMutation = useToggleFeaturedProject();
  const deleteMutation = useDeleteProject();

  const handleViewProject = (project: ProjectAdminItem) => {
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  const handleModerateProject = (project: ProjectAdminItem, action: string) => {
    setSelectedProject(project);
    setIsModerateModalOpen(true);
  };

  const confirmModeration = async (action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE' | 'DEACTIVATE', reason?: string) => {
    if (!selectedProject) return;

    await moderateMutation.mutateAsync({
      projectId: selectedProject.id,
      request: {
        action,
        reason,
        notes: `Moderated by admin: ${reason || 'No additional notes'}`
      }
    });
    setIsModerateModalOpen(false);
    setSelectedProject(null);
    refetch();
  };

  const handleToggleFeatured = async (project: ProjectAdminItem) => {
    const newFeaturedState = !project.isFeatured;
    await toggleFeaturedMutation.mutateAsync({
      projectId: project.id,
      featured: newFeaturedState
    });
    refetch();
  };

  const handleDeleteProject = async (project: ProjectAdminItem, reason?: string) => {
    if (confirm(`Are you sure you want to delete project "${project.name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync({
        projectId: project.id,
        reason
      });
      refetch();
    }
  };

  // Table columns
  const columns = [
    {
      key: 'name' as keyof ProjectAdminItem,
      label: 'Project',
      sortable: true,
      render: (value: string, project: ProjectAdminItem) => (
        <div className="flex items-center gap-3">
          {project.coverImageUrl && (
            <img 
              src={project.coverImageUrl} 
              alt={project.name}
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{project.slug}</div>
          </div>
        </div>
      )
    },
    {
      key: 'developerName' as keyof ProjectAdminItem,
      label: 'Developer',
      sortable: true,
      render: (value: string, project: ProjectAdminItem) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{project.developerEmail}</div>
        </div>
      )
    },
    {
      key: 'type' as keyof ProjectAdminItem,
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'RESIDENTIAL' ? 'bg-blue-100 text-blue-800' :
          value === 'COMMERCIAL' ? 'bg-green-100 text-green-800' :
          value === 'MIXED_USE' ? 'bg-purple-100 text-purple-800' :
          value === 'INDUSTRIAL' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status' as keyof ProjectAdminItem,
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          value === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' :
          value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          value === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
          value === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
          value === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'lifecycleStatus' as keyof ProjectAdminItem,
      label: 'Lifecycle',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          value === 'ENDING_SOON' ? 'bg-orange-100 text-orange-800' :
          value === 'PAST' ? 'bg-gray-100 text-gray-800' :
          value === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
          value === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value?.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'phase' as keyof ProjectAdminItem,
      label: 'Phase',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
          value === 'CONSTRUCTION' ? 'bg-orange-100 text-orange-800' :
          value === 'PRE_SALE' ? 'bg-purple-100 text-purple-800' :
          value === 'SALE' ? 'bg-green-100 text-green-800' :
          value === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value?.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'priceRange' as keyof ProjectAdminItem,
      label: 'Price Range',
      sortable: false,
      render: (value: { min: number; max: number }) => (
        <div className="font-medium text-green-600">
          ${value.min.toLocaleString()} - ${value.max.toLocaleString()}
        </div>
      )
    },
    {
      key: 'totalUnits' as keyof ProjectAdminItem,
      label: 'Units',
      sortable: true,
      render: (value: number, project: ProjectAdminItem) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">
            {project.soldUnits} sold / {project.availableUnits} available
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${(project.soldUnits / value) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'constructionProgress' as keyof ProjectAdminItem,
      label: 'Progress',
      sortable: true,
      render: (value: number) => (
        <div>
          <div className="font-medium">{value}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'isFeatured' as keyof ProjectAdminItem,
      label: 'Featured',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Featured' : 'Standard'}
        </span>
      )
    },
    {
      key: 'viewsCount' as keyof ProjectAdminItem,
      label: 'Views',
      sortable: true,
      render: (value: number) => value.toLocaleString()
    },
    {
      key: 'createdAt' as keyof ProjectAdminItem,
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'View Details',
      onClick: handleViewProject,
      variant: 'primary' as const
    },
    ...(canModerateProjects ? [
      {
        label: 'Approve',
        onClick: (project: ProjectAdminItem) => handleModerateProject(project, 'APPROVE'),
        variant: 'primary' as const
      },
      {
        label: 'Reject',
        onClick: (project: ProjectAdminItem) => handleModerateProject(project, 'REJECT'),
        variant: 'secondary' as const
      },
      {
        label: 'Suspend',
        onClick: (project: ProjectAdminItem) => handleModerateProject(project, 'SUSPEND'),
        variant: 'secondary' as const
      }
    ] : []),
    {
      label: 'Toggle Featured',
      onClick: handleToggleFeatured,
      variant: 'secondary' as const
    },
    ...(canDeleteProjects ? [{
      label: 'Delete',
      onClick: (project: ProjectAdminItem) => handleDeleteProject(project),
      variant: 'danger' as const
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
        { value: 'PUBLISHED', label: 'Published' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'SUSPENDED', label: 'Suspended' },
        { value: 'CANCELLED', label: 'Cancelled' }
      ]
    },
    {
      key: 'lifecycle',
      label: 'Lifecycle',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Lifecycle' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'ENDING_SOON', label: 'Ending Soon' },
        { value: 'PAST', label: 'Past' },
        { value: 'COMPLETED', label: 'Completed' },
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
          <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
          <p className="text-gray-600">Administrate and manage real estate projects</p>
        </div>
        
        {/* Project Stats Cards */}
        {projectStats && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{projectStats.totalProjects}</div>
                <div className="text-sm text-gray-500">Total Projects</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{projectStats.activeProjects}</div>
                <div className="text-sm text-gray-500">Active Projects</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{projectStats.coveragePercentage}%</div>
                <div className="text-sm text-gray-500">With Cover Images</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{projectStats.totalUnits}</div>
                <div className="text-sm text-gray-500">Total Units</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Filters */}
      <AdminFilters
        searchPlaceholder="Search by name, developer, or location..."
        onSearchChange={setSearchQuery}
        onFilterChange={handleFilterChange}
        filters={filterOptions}
        onClear={handleClearFilters}
      />

      {/* Projects Table */}
      <AdminTable
        data={projectsData?.content || []}
        columns={columns}
        loading={isLoading}
        error={error?.message || undefined}
        actions={actions}
        selection={{
          selectedItems: selectedProjects,
          onSelectionChange: setSelectedProjects,
          getRowId: (project) => project.id
        }}
        pagination={
          projectsData && {
            page: currentPage,
            size: pageSize,
            total: projectsData.totalElements,
            onPageChange: setCurrentPage,
            onSizeChange: setPageSize
          }
        }
        emptyState={{
          title: 'No projects found',
          description: 'Try adjusting your search or filter criteria.',
          action: {
            label: 'Clear Filters',
            onClick: handleClearFilters
          }
        }}
      />

      {/* Project Details Modal */}
      {selectedProject && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Project Details</h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedProject.name}</div>
                  <div><strong>Slug:</strong> {selectedProject.slug}</div>
                  <div><strong>Type:</strong> {selectedProject.type}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedProject.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      selectedProject.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' :
                      selectedProject.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      selectedProject.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                      selectedProject.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                      selectedProject.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedProject.status}
                    </span>
                  </div>
                  <div><strong>Phase:</strong> {selectedProject.phase?.replace('_', ' ')}</div>
                  <div><strong>Lifecycle:</strong> {selectedProject.lifecycleStatus?.replace('_', ' ')}</div>
                </div>
              </div>

              {/* Developer Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Developer Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedProject.developerName}</div>
                  <div><strong>Email:</strong> {selectedProject.developerEmail}</div>
                  <div><strong>ID:</strong> {selectedProject.developerId}</div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Location</h4>
              <div className="space-y-2">
                <div><strong>District:</strong> {selectedProject.district}</div>
                <div><strong>City:</strong> {selectedProject.city}</div>
                <div><strong>Country:</strong> {selectedProject.country}</div>
              </div>
            </div>

            {/* Units and Pricing */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Units and Pricing</h4>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{selectedProject.totalUnits}</div>
                  <div className="text-sm text-gray-500">Total Units</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedProject.soldUnits}</div>
                  <div className="text-sm text-gray-500">Sold Units</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{selectedProject.availableUnits}</div>
                  <div className="text-sm text-gray-500">Available Units</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${selectedProject.priceRange.min.toLocaleString()} - ${selectedProject.priceRange.max.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Price Range</div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{selectedProject.viewsCount}</div>
                  <div className="text-sm text-gray-500">Total Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedProject.favoritesCount}</div>
                  <div className="text-sm text-gray-500">Favorites</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{selectedProject.inquiriesCount}</div>
                  <div className="text-sm text-gray-500">Inquiries</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{selectedProject.constructionProgress}%</div>
                  <div className="text-sm text-gray-500">Construction Progress</div>
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
      {selectedProject && (
        <Modal isOpen={isModerateModalOpen} onClose={() => setIsModerateModalOpen(false)}>
          <ModerationModal
            project={selectedProject}
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
  project: ProjectAdminItem;
  onConfirm: (action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE' | 'DEACTIVATE', reason?: string) => void;
  onCancel: () => void;
}

function ModerationModal({ project, onConfirm, onCancel }: ModerationModalProps) {
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE' | 'DEACTIVATE'>('APPROVE');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(action, reason);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-4">Moderate Project</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          Moderating: <strong>{project.name}</strong>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
              <option value="SUSPEND">Suspend</option>
              <option value="ACTIVATE">Activate</option>
              <option value="DEACTIVATE">Deactivate</option>
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
            <Button type="submit" variant={action === 'APPROVE' || action === 'ACTIVATE' ? 'primary' : 'danger'}>
              {action === 'APPROVE' ? 'Approve' : action === 'REJECT' ? 'Reject' : action === 'SUSPEND' ? 'Suspend' : action === 'ACTIVATE' ? 'Activate' : 'Deactivate'}
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
