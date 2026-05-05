'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/presentation/store/authStore';
import { 
  useDeveloperAssociationRequestsPaginated, 
  useDeveloperAgentAssociationsPaginated,
  useApproveDeveloperAssociation,
  useRejectDeveloperAssociation,
  useRemoveDeveloperAgent
} from '@/presentation/hooks/admin/useDeveloperAssociations';
import { DeveloperAgentAssociation } from '@/core/domain/entities/Admin';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { Button } from '@/presentation/components/ui/Button';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  UserMinus,
  Mail,
  Building2,
  AlertCircle
} from 'lucide-react';

export default function DeveloperAgentsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'all'>('pending');
  const [page, setPage] = useState(0);
  const pageSize = 6;
  const { user } = useAuthStore();
  const developerId = user?.id;
  
  // Determine status filter based on active tab
  const statusFilter = activeTab === 'pending' ? 'PENDING' : activeTab === 'active' ? 'ACTIVE' : null;
  
  // Use paginated hooks
  const { 
    data: associationsData, 
    isLoading,
    refetch
  } = useDeveloperAgentAssociationsPaginated(developerId || 0, statusFilter, page, pageSize);
  
  // Also fetch pending requests separately for the count
  const { 
    data: pendingData,
    refetch: refetchPending
  } = useDeveloperAssociationRequestsPaginated(developerId || 0, 'PENDING', 0, 100);

  const approveMutation = useApproveDeveloperAssociation();
  const rejectMutation = useRejectDeveloperAssociation();
  const removeMutation = useRemoveDeveloperAgent();

  const handleTabChange = (tab: 'pending' | 'active' | 'all') => {
    setActiveTab(tab);
    setPage(0); // Reset page when changing tabs
  };

  const filteredAssociations = associationsData?.content || [];

  // Debug logging
  useEffect(() => {
    console.log('=== DEBUG DeveloperAgentsPage ===');
    console.log('activeTab:', activeTab, 'statusFilter:', statusFilter);
    console.log('developerId:', developerId);
    console.log('associationsData:', associationsData);
    console.log('filteredAssociations count:', filteredAssociations.length);
    console.log('==================================');
  }, [activeTab, statusFilter, developerId, associationsData, filteredAssociations]);

  const handleApprove = async (associationId: number) => {
    try {
      console.log('Approving association:', associationId);
      await approveMutation.mutateAsync({
        associationId,
        data: {}
      });
      console.log('Association approved, refreshing data...');
      await refetch();
      await refetchPending();
      // Switch to active tab to show the newly approved agent
      console.log('Switching to active tab...');
      setActiveTab('active');
    } catch (error) {
      console.error('Error approving association:', error);
    }
  };

  const handleReject = async (associationId: number) => {
    try {
      await rejectMutation.mutateAsync({
        associationId,
        data: {}
      });
      refetch();
      refetchPending();
    } catch (error) {
      console.error('Error rejecting association:', error);
    }
  };

  const handleRemove = async (agentId: number) => {
    if (!developerId) return;
    if (!confirm('¿Estás seguro de que deseas remover este agente?')) return;
    
    try {
      await removeMutation.mutateAsync({
        developerId,
        agentId
      });
      refetch();
    } catch (error) {
      console.error('Error removing agent:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REMOVED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'ACTIVE':
        return 'Activo';
      case 'REJECTED':
        return 'Rechazado';
      case 'REMOVED':
        return 'Removido';
      default:
        return status;
    }
  };

  if (!developerId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium mb-2">No se pudo identificar tu cuenta</p>
            <p className="text-sm">Por favor, inicia sesión nuevamente</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Agentes</h1>
              <p className="text-gray-600">Gestiona las solicitudes de asociación de agentes a tu inmobiliaria</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingData?.totalElements || 0}</p>
                <p className="text-sm text-gray-600">Solicitudes pendientes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeTab === 'active' ? associationsData?.totalElements || 0 : '-'}</p>
                <p className="text-sm text-gray-600">Agentes activos (en pestaña Actual)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{associationsData?.totalElements || 0}</p>
                <p className="text-sm text-gray-600">Total en vista actual</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex gap-2 border-b border-gray-200 p-4">
            <button
                onClick={() => handleTabChange('pending')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'pending'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                Pendientes ({pendingData?.totalElements || 0})
              </button>
            <button
                onClick={() => handleTabChange('active')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'active'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                Activos
              </button>
            <button
                onClick={() => handleTabChange('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Todos ({associationsData?.totalElements || 0})
              </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : filteredAssociations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium mb-2">
                  {activeTab === 'pending' ? 'No hay solicitudes pendientes' : 
                   activeTab === 'active' ? 'No hay agentes activos' : 
                   'No hay asociaciones'}
                </p>
                <p className="text-sm">
                  {activeTab === 'pending' 
                    ? 'Las solicitudes de agentes aparecerán aquí cuando envíen una solicitud de asociación'
                    : activeTab === 'active'
                    ? 'Aprueba solicitudes para empezar a tener agentes activos'
                    : 'No hay actividad de asociaciones aún'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssociations.map((association) => (
                  <div 
                    key={association.id} 
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-teal-500 transition"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold">
                          {association.agentFirstName?.[0] || association.agentEmail?.[0] || 'A'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {association.agentFirstName} {association.agentLastName}
                          </p>
                          <p className="text-sm text-gray-500">{association.agentEmail}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(association.status)}`}>
                        {getStatusLabel(association.status)}
                      </span>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {association.requestedAt 
                            ? new Date(association.requestedAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                            : '-'
                          }
                        </span>
                      </div>
                      {association.notes && (
                        <div className="bg-white rounded p-2">
                          <span className="font-medium">Notas:</span> {association.notes}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    {association.status === 'PENDING' && (
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <Button
                          onClick={() => handleApprove(association.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => handleReject(association.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          variant="outline"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}

                    {association.status === 'ACTIVE' && (
                      <div className="pt-3 border-t border-gray-200">
                        <Button
                          onClick={() => handleRemove(association.agentId)}
                          disabled={removeMutation.isPending}
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Remover agente
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {associationsData && associationsData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 px-4 pb-4">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredAssociations.length} de {associationsData.totalElements} asociaciones
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {page + 1} de {associationsData.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(associationsData.totalPages - 1, p + 1))}
                    disabled={page >= associationsData.totalPages - 1}
                    className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
