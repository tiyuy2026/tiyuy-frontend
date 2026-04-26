'use client';

import { useState, useMemo } from 'react';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/infrastructure/api/axios-client';
import { Card, CardContent } from '@/presentation/components/ui/Card';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { PaginationParams } from '@/core/domain/repositories/IAdminRepository';

interface Agent {
  id: number;
  userId: number;
  user: {
    id: number;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dni: string;
    role: 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN';
    enabled: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  licenseNumber?: string;
  verificationStatus?: string;
  averageRating?: number;
  totalSales: number;
  totalRentals: number;
  isVerifiedAgent?: boolean;
  agency?: string;
  agencyRuc?: string;
  yearsOfExperience?: number;
  specialty?: string;
  responseTimeAvgMinutes?: number;
  aboutProfessional?: string;
  languages: string[];
  serviceAreas: string[];
  publishedPropertiesCount: number;
  city?: string;
  country?: string;
  lastLoginAt?: Date;
  createdAt: Date;
}

interface InmobiliariaGroup {
  name: string;
  ruc: string;
  agents: Agent[];
  totalSales: number;
  totalRentals: number;
  averageRating: number;
  verifiedAgents: number;
  totalAgents: number;
}

export default function AgenciesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgency, setSelectedAgency] = useState<InmobiliariaGroup | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { hasPermission } = usePermissions();
  const canManageAgents = hasPermission('MANAGE_AGENTS');

  const params: PaginationParams = { page: currentPage - 1, size: pageSize };

  // Get all agents from /api/agent/ endpoint - this returns complete agent profiles with agency info
  const { data: agentsData, isLoading } = useQuery({
    queryKey: ['admin-agencies'],
    queryFn: async () => {
      // Note: We need to get all agents with their complete profiles
      // This would require a new endpoint in backend like /api/admin/agents
      // For now, we'll use the existing structure but it needs backend support
      const response = await axiosClient.get('/admin/users?role=AGENT&size=100');
      return response.data;
    },
  });

  const agents = agentsData?.content || [];

  const agencies = useMemo((): InmobiliariaGroup[] => {
    if (!agents || agents.length === 0) return [];

    const grouped = agents.reduce((acc: Record<string, InmobiliariaGroup>, agent: any) => {
      // For now, we'll use the basic user structure
      // TODO: Backend needs to provide agency info in admin users endpoint
      const agencyName = 'Independent Agents'; // Default since we don't have agency data
      const agencyRuc = '-';
      const key = `${agencyName}-${agencyRuc}`;

      if (!acc[key]) {
        acc[key] = {
          name: agencyName,
          ruc: agencyRuc,
          agents: [],
          totalSales: 0,
          totalRentals: 0,
          averageRating: 0,
          verifiedAgents: 0,
          totalAgents: 0,
        };
      }

      acc[key].agents.push(agent);
      acc[key].totalAgents += 1;
      if (agent.emailVerified) {
        acc[key].verifiedAgents += 1;
      }

      return acc;
    }, {});

    return (Object.values(grouped) as InmobiliariaGroup[]).map((agency) => ({
      ...agency,
      averageRating: 0, // No rating data in basic user response
    }));
  }, [agents]);

  const filteredAgencies = agencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agency.ruc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAgencyModal = (agency: InmobiliariaGroup) => {
    setSelectedAgency(agency);
    setIsAgencyModalOpen(true);
  };

  const openAgentModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsAgentModalOpen(true);
  };

  const getStatusBadgeClass = (status?: string) => {
    return status === 'VERIFIED' || status === 'ACTIVE'
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-rose-100 text-rose-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real Estate Agencies</h1>
          <p className="text-gray-600 mt-1">Manage agencies and their agents</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <Input
              placeholder="Search agencies by name or RUC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgencies.map((agency) => (
                <div
                  key={`${agency.name}-${agency.ruc}`}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xl font-bold">
                      {agency.name[0]}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        agency.verifiedAgents === agency.totalAgents
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {agency.verifiedAgents}/{agency.totalAgents} Verified
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{agency.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">RUC: {agency.ruc}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-gray-900">{agency.totalSales}</p>
                      <p className="text-xs text-gray-600">Total Sales</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-gray-900">{agency.totalRentals}</p>
                      <p className="text-xs text-gray-600">Total Rentals</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {agency.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <button
                      onClick={() => openAgencyModal(agency)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white text-sm font-medium rounded-lg hover:opacity-90 transition"
                    >
                      View Agents
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredAgencies.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No agencies found matching your search
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agency Agents Modal */}
      <Modal
        isOpen={isAgencyModalOpen}
        onClose={() => setIsAgencyModalOpen(false)}
        title={selectedAgency?.name}
        size="lg"
      >
        {selectedAgency && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-2xl font-bold text-gray-900">{selectedAgency.totalAgents}</p>
                <p className="text-xs text-gray-600">Total Agents</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{selectedAgency.verifiedAgents}</p>
                <p className="text-xs text-gray-600">Verified</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{selectedAgency.totalSales}</p>
                <p className="text-xs text-gray-600">Total Sales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{selectedAgency.totalRentals}</p>
                <p className="text-xs text-gray-600">Total Rentals</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Agent</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">License</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Performance</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAgency.agents.map((agent) => (
                    <tr key={agent.userId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold">
                            {agent.user.firstName[0]}
                            {agent.user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {agent.user.firstName} {agent.user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{agent.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{agent.licenseNumber}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            agent.verificationStatus
                          )}`}
                        >
                          {agent.verificationStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium">{agent.averageRating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <span className="text-gray-400">|</span>
                          <span className="text-sm text-gray-600">{agent.totalSales + agent.totalRentals} deals</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => openAgentModal(agent)}
                          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Agent Profile Modal */}
      <Modal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        title="Agent Profile"
        size="lg"
      >
        {selectedAgent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-2xl font-bold">
                {selectedAgent.user.firstName[0]}
                {selectedAgent.user.lastName[0]}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedAgent.user.firstName} {selectedAgent.user.lastName}
                </h3>
                <p className="text-gray-600">{selectedAgent.user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      selectedAgent.verificationStatus
                    )}`}
                  >
                    {selectedAgent.verificationStatus}
                  </span>
                  {selectedAgent.isVerifiedAgent && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                      Verified Agent
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">License Number</p>
                <p className="text-gray-900 font-medium">{selectedAgent.licenseNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Agency</p>
                <p className="text-gray-900 font-medium">{selectedAgent.agency || 'Independent'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Agency RUC</p>
                <p className="text-gray-900 font-medium">{selectedAgent.agencyRuc || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Years of Experience</p>
                <p className="text-gray-900 font-medium">{selectedAgent.yearsOfExperience || 0} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Specialty</p>
                <p className="text-gray-900 font-medium">{selectedAgent.specialty || 'General'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Rating</p>
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-gray-900 font-medium">
                    {selectedAgent.averageRating?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-2xl font-bold text-gray-900">{selectedAgent.totalSales}</p>
                <p className="text-xs text-gray-600">Total Sales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{selectedAgent.totalRentals}</p>
                <p className="text-xs text-gray-600">Total Rentals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedAgent.responseTimeAvgMinutes || 0}m
                </p>
                <p className="text-xs text-gray-600">Avg Response Time</p>
              </div>
            </div>

            {selectedAgent.aboutProfessional && (
              <div>
                <p className="text-sm text-gray-500 mb-2">About</p>
                <p className="text-gray-900">{selectedAgent.aboutProfessional}</p>
              </div>
            )}

            {selectedAgent.languages.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.languages.map((lang) => (
                    <span key={lang} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedAgent.serviceAreas.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Service Areas</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.serviceAreas.map((area) => (
                    <span key={area} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {canManageAgents && (
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsAgentModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg font-medium hover:opacity-90 transition"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
