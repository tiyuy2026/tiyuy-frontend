/**
 * Admin Agent Management Page
 * Complete agent management with real estate relationships
 */

'use client';

import { useState } from 'react';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { AdminFilters } from '@/presentation/components/admin/AdminFilters/AdminFilters';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { AgentProfileResponse } from '@/presentation/hooks/useAgent';

// Mock data - replace with real backend integration
const mockAgents: AgentProfileResponse[] = [
  {
    userId: 1,
    basicInfo: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@agency.com',
      phone: '+1 555-0123',
      photoUrl: '/images/agent1.jpg',
      city: 'New York',
      country: 'USA'
    },
    professionalInfo: {
      licenseNumber: 'RE123456',
      agency: 'Premium Real Estate',
      agencyRuc: '12345678901',
      yearsOfExperience: 5,
      specialty: 'Residential',
      aboutProfessional: 'Experienced agent specializing in residential properties.'
    },
    verification: {
      isVerified: true,
      status: 'VERIFIED'
    },
    metrics: {
      averageRating: 4.5,
      totalSales: 25,
      totalRentals: 15,
      responseTimeAvg: 30,
      activeProperties: 12
    },
    publicProfileInfo: {
      slug: 'john-smith',
      languages: ['English', 'Spanish'],
      serviceAreas: ['Manhattan', 'Brooklyn', 'Queens']
    }
  },
  {
    userId: 2,
    basicInfo: {
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@agency.com',
      phone: '+1 555-0456',
      photoUrl: '/images/agent2.jpg',
      city: 'Miami',
      country: 'USA'
    },
    professionalInfo: {
      licenseNumber: 'RE789012',
      agency: 'Coastal Properties',
      agencyRuc: '98765432109',
      yearsOfExperience: 8,
      specialty: 'Commercial',
      aboutProfessional: 'Specialist in commercial real estate and investment properties.'
    },
    verification: {
      isVerified: false,
      status: 'PENDING'
    },
    metrics: {
      averageRating: 4.2,
      totalSales: 18,
      totalRentals: 22,
      responseTimeAvg: 45,
      activeProperties: 8
    },
    publicProfileInfo: {
      slug: 'maria-garcia',
      languages: ['English', 'Spanish', 'Portuguese'],
      serviceAreas: ['Miami Beach', 'Downtown Miami', 'Coral Gables']
    }
  }
];

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [agencyFilter, setAgencyFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedAgents, setSelectedAgents] = useState<AgentProfileResponse[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfileResponse | null>(null);

  const { hasPermission } = usePermissions();
  const canManageAgents = hasPermission('AGENTS_MANAGE');

  // Filter agents based on search and filters
  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = !searchQuery || 
      agent.basicInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.basicInfo.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.basicInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.professionalInfo.agency.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && agent.verification.isVerified) ||
      (verificationFilter === 'unverified' && !agent.verification.isVerified);
    
    const matchesAgency = !agencyFilter || 
      agent.professionalInfo.agency.toLowerCase().includes(agencyFilter.toLowerCase());
    
    return matchesSearch && matchesVerification && matchesAgency;
  });

  // Paginate results
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

  const handleViewAgent = (agent: AgentProfileResponse) => {
    setSelectedAgent(agent);
    setIsViewModalOpen(true);
  };

  const handleToggleVerification = async (agent: AgentProfileResponse) => {
    // Mock implementation - replace with real backend call
    const newStatus = agent.verification.isVerified ? 'unverified' : 'verified';
    alert(`${agent.basicInfo.firstName} ${agent.basicInfo.lastName} marked as ${newStatus}`);
    // In real implementation, call backend API to update verification status
  };

  // Table columns
  const columns = [
    {
      key: 'basicInfo' as keyof AgentProfileResponse,
      label: 'Agent',
      sortable: true,
      render: (value: any, agent: AgentProfileResponse) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {value.photoUrl ? (
              <img src={value.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">
                {value.firstName.charAt(0)}{value.lastName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {value.firstName} {value.lastName}
            </div>
            <div className="text-sm text-gray-500">{value.email}</div>
            <div className="text-xs text-gray-400">{value.city}, {value.country}</div>
          </div>
        </div>
      )
    },
    {
      key: 'professionalInfo' as keyof AgentProfileResponse,
      label: 'Agency',
      sortable: true,
      render: (value: any) => (
        <div>
          <div className="font-medium text-gray-900">{value.agency}</div>
          <div className="text-sm text-gray-500">RUC: {value.agencyRuc}</div>
        </div>
      )
    },
    {
      key: 'verification' as keyof AgentProfileResponse,
      label: 'Verification',
      sortable: true,
      render: (value: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value.isVerified 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value.isVerified ? 'Verified' : 'Pending'}
        </span>
      )
    },
    {
      key: 'metrics' as keyof AgentProfileResponse,
      label: 'Performance',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <span>⭐ {value.averageRating}</span>
            <span className="text-gray-400">•</span>
            <span>{value.totalSales} sales</span>
            <span className="text-gray-400">•</span>
            <span>{value.activeProperties} active</span>
          </div>
        </div>
      )
    },
    {
      key: 'professionalInfo' as keyof AgentProfileResponse,
      label: 'Experience',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm">
          <div>{value.yearsOfExperience} years</div>
          <div className="text-gray-500">{value.specialty}</div>
        </div>
      )
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
      label: 'Toggle Verification',
      onClick: handleToggleVerification,
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
        { value: 'unverified', label: 'Pending' }
      ]
    },
    {
      key: 'agency',
      label: 'Agency',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Agencies' },
        { value: 'Premium Real Estate', label: 'Premium Real Estate' },
        { value: 'Coastal Properties', label: 'Coastal Properties' }
      ]
    }
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    if (filters.verification !== undefined) {
      setVerificationFilter(filters.verification);
    }
    if (filters.agency !== undefined) {
      setAgencyFilter(filters.agency);
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setVerificationFilter('all');
    setAgencyFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agent Management</h2>
          <p className="text-gray-600">Manage real estate agents and their relationships</p>
        </div>
      </div>

      {/* Filters */}
      <AdminFilters
        searchPlaceholder="Search by name, email, or agency..."
        onSearchChange={setSearchQuery}
        onFilterChange={handleFilterChange}
        filters={filterOptions}
        onClear={handleClearFilters}
      />

      {/* Agents Table */}
      <AdminTable
        data={paginatedAgents}
        columns={columns}
        loading={false}
        actions={actions}
        selection={{
          selectedItems: selectedAgents,
          onSelectionChange: setSelectedAgents,
          getRowId: (agent) => agent.userId
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

      {/* Agent Details Modal */}
      {selectedAgent && (
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Agent Details</h3>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div><strong>Name:</strong> {selectedAgent.basicInfo.firstName} {selectedAgent.basicInfo.lastName}</div>
                  <div><strong>Email:</strong> {selectedAgent.basicInfo.email}</div>
                  <div><strong>Phone:</strong> {selectedAgent.basicInfo.phone}</div>
                  <div><strong>Location:</strong> {selectedAgent.basicInfo.city}, {selectedAgent.basicInfo.country}</div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Professional Information</h4>
                <div className="space-y-2">
                  <div><strong>Agency:</strong> {selectedAgent.professionalInfo.agency}</div>
                  <div><strong>RUC:</strong> {selectedAgent.professionalInfo.agencyRuc}</div>
                  <div><strong>License:</strong> {selectedAgent.professionalInfo.licenseNumber}</div>
                  <div><strong>Experience:</strong> {selectedAgent.professionalInfo.yearsOfExperience} years</div>
                  <div><strong>Specialty:</strong> {selectedAgent.professionalInfo.specialty}</div>
                  {selectedAgent.professionalInfo.aboutProfessional && (
                    <div><strong>About:</strong> {selectedAgent.professionalInfo.aboutProfessional}</div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
                <div className="space-y-2">
                  <div><strong>Rating:</strong> ⭐ {selectedAgent.metrics.averageRating}/5.0</div>
                  <div><strong>Total Sales:</strong> {selectedAgent.metrics.totalSales}</div>
                  <div><strong>Total Rentals:</strong> {selectedAgent.metrics.totalRentals}</div>
                  <div><strong>Active Properties:</strong> {selectedAgent.metrics.activeProperties}</div>
                  <div><strong>Avg Response Time:</strong> {selectedAgent.metrics.responseTimeAvg} minutes</div>
                </div>
              </div>
            </div>

            {/* Public Profile Information */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Public Profile</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="space-y-2">
                    <div><strong>Profile Slug:</strong> {selectedAgent.publicProfileInfo.slug}</div>
                    <div><strong>Languages:</strong> {selectedAgent.publicProfileInfo.languages.join(', ')}</div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div><strong>Service Areas:</strong></div>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {selectedAgent.publicProfileInfo.serviceAreas.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
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
    </div>
  );
}
