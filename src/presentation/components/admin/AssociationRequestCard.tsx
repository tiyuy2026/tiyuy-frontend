'use client';

import { Clock, Calendar, Mail, User, Building2, CheckCircle, XCircle } from 'lucide-react';
import { DeveloperAgentAssociation, AssociationStatus } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { useApproveDeveloperAssociation, useRejectDeveloperAssociation } from '@/presentation/hooks/admin/useDeveloperAssociations';

interface AssociationRequestCardProps {
  association: DeveloperAgentAssociation;
  onRefresh?: () => void;
}

export default function AssociationRequestCard({ association, onRefresh }: AssociationRequestCardProps) {
  const approveMutation = useApproveDeveloperAssociation();
  const rejectMutation = useRejectDeveloperAssociation();

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        associationId: association.id,
        data: {}
      });
      onRefresh?.();
    } catch (error) {
      console.error('Error approving association:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({
        associationId: association.id,
        data: {}
      });
      onRefresh?.();
    } catch (error) {
      console.error('Error rejecting association:', error);
    }
  };

  const getStatusBadge = (status: AssociationStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'REMOVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-500 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold">
            {association.agentFirstName?.[0] || 'A'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {association.agentFirstName} {association.agentLastName}
            </p>
            <p className="text-sm text-gray-500">{association.agentEmail}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(association.status)}`}>
          {association.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            Solicitado el {association.requestedAt ? new Date(association.requestedAt).toLocaleDateString() : '-'}
          </span>
        </div>
        {association.requestedBy && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Solicitado por: {association.requestedBy}</span>
          </div>
        )}
        {association.notes && (
          <div className="bg-gray-50 rounded p-2 text-sm text-gray-600">
            <span className="font-medium">Notas:</span> {association.notes}
          </div>
        )}
      </div>

      {association.status === 'PENDING' && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Button
            onClick={handleApprove}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprobar
          </Button>
          <Button
            onClick={handleReject}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            variant="outline"
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rechazar
          </Button>
        </div>
      )}
    </div>
  );
}
