'use client';

import { useState } from 'react';
import { Building2, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useMyDeveloperAssociation, useRequestDeveloperAssociation, useCancelDeveloperAssociationRequest } from '@/presentation/hooks/admin/useDeveloperAssociations';
import { DeveloperAgentAssociation, AssociationStatus } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import SearchAgencyModal from '@/presentation/components/profile/SearchAgencyModal';

export default function MyAgencySection() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { data: association, isLoading, refetch } = useMyDeveloperAssociation();
  const requestMutation = useRequestDeveloperAssociation();
  const cancelMutation = useCancelDeveloperAssociationRequest();

  const handleRequestAssociation = async (developerId: number, notes?: string) => {
    try {
      await requestMutation.mutateAsync({ developerId, notes });
      setIsSearchModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error requesting association:', error);
    }
  };

  const handleCancelRequest = async () => {
    if (!association?.id) return;
    try {
      await cancelMutation.mutateAsync(association.id);
      refetch();
    } catch (error) {
      console.error('Error canceling request:', error);
    }
  };

  const getStatusBadge = (status?: AssociationStatus) => {
    switch (status) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' };
      case 'ACTIVE':
        return { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Asociado' };
      case 'REJECTED':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rechazado' };
      case 'REMOVED':
        return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Desvinculado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Building2, label: 'Independiente' };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(association?.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          Mi Inmobiliaria
        </h3>
        {association && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusBadge.label}
          </div>
        )}
      </div>

      {!association ? (
        // Estado: Independiente
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">No estás asociado a ninguna inmobiliaria</p>
          <p className="text-sm text-gray-500 mb-6">
            Puedes operar de forma independiente o asociarte a una inmobiliaria existente
          </p>
          <Button
            onClick={() => setIsSearchModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Search className="w-4 h-4 mr-2" />
            Asociarme a una inmobiliaria
          </Button>
        </div>
      ) : association.status === 'PENDING' ? (
        // Estado: Solicitud pendiente
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">Solicitud enviada</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Tu solicitud de asociación a <span className="font-semibold">{association.developerName}</span> está siendo revisada
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Enviada el {association.requestedAt ? new Date(association.requestedAt).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>

          {association.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tus notas:</span> {association.notes}
              </p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleCancelRequest}
            disabled={cancelMutation.isPending}
            className="w-full"
          >
            {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar solicitud'}
          </Button>
        </div>
      ) : association.status === 'ACTIVE' ? (
        // Estado: Asociado
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
              {association.developerName?.[0] || 'I'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{association.developerName}</p>
              <p className="text-sm text-gray-600">RUC: {association.developerRuc || '-'}</p>
              <p className="text-xs text-gray-500 mt-1">
                Asociado desde {association.reviewedAt ? new Date(association.reviewedAt).toLocaleDateString() : new Date(association.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Plan actual</p>
              <p className="font-semibold text-gray-900">{association.developerCurrentPlan || 'Sin plan'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Verificado</p>
              <p className="font-semibold text-gray-900">{association.isVerified ? 'Sí' : 'No'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsSearchModalOpen(true)}
              className="flex-1"
            >
              Solicitar cambio
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Desvincularme
            </Button>
          </div>
        </div>
      ) : association.status === 'REJECTED' ? (
        // Estado: Rechazado
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Solicitud rechazada</p>
                <p className="text-sm text-red-700 mt-1">
                  Tu solicitud de asociación a <span className="font-semibold">{association.developerName}</span> fue rechazada
                </p>
                {association.notes && (
                  <p className="text-sm text-red-600 mt-2">
                    <span className="font-medium">Motivo:</span> {association.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar otra inmobiliaria
          </Button>
        </div>
      ) : (
        // Estado: Desvinculado
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Desvinculado</p>
                <p className="text-sm text-gray-600 mt-1">
                  Ya no estás asociado a {association.developerName}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Desvinculado el {new Date(association.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            <Search className="w-4 h-4 mr-2" />
            Asociarme a otra inmobiliaria
          </Button>
        </div>
      )}

      {/* Modal de búsqueda de inmobiliarias */}
      <SearchAgencyModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onRequestAssociation={handleRequestAssociation}
        isPending={requestMutation.isPending}
      />
    </div>
  );
}
