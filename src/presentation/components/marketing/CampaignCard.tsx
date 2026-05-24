'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { PromotionCampaign, UpdatePromotionCampaignRequest } from '@/core/domain/entities/Admin';

interface CampaignCardProps {
  campaign: PromotionCampaign;
  onEdit: (id: number, data: UpdatePromotionCampaignRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onRenew: (id: number) => Promise<void>;
  isDeleting?: boolean;
  isUpdating?: boolean;
  isRenewing?: boolean;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  EXPIRED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-gray-100 text-gray-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Activa',
  PENDING_APPROVAL: 'Pendiente',
  SCHEDULED: 'Programada',
  EXPIRED: 'Expirada',
  REJECTED: 'Rechazada',
  INACTIVE: 'Inactiva',
};

export function CampaignCard({
  campaign,
  onEdit,
  onDelete,
  onRenew,
  isDeleting,
  isUpdating,
  isRenewing,
}: CampaignCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState<UpdatePromotionCampaignRequest>({
    title: campaign.title,
    description: campaign.description,
    imageUrl: campaign.imageUrl,
    linkUrl: campaign.linkUrl,
    placementLocation: campaign.placementLocation,
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onEdit(campaign.id, editForm);
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await onDelete(campaign.id);
    setShowDeleteConfirm(false);
  };

  const handleRenew = async () => {
    await onRenew(campaign.id);
  };

  const ctr = campaign.impressions && campaign.impressions > 0
    ? ((campaign.clicks || 0) / campaign.impressions * 100).toFixed(2)
    : '0.00';

  const isExpired = campaign.status === 'EXPIRED';
  const isActive = campaign.status === 'ACTIVE';
  const isPending = campaign.status === 'PENDING_APPROVAL';

  return (
    <>
      <Card className="relative overflow-hidden border-t-4 border-t-blue-500">
        {campaign.imageUrl && (
          <div className="h-40 bg-gray-100 overflow-hidden">
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg truncate mr-2">{campaign.title}</CardTitle>
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[campaign.status] || 'bg-gray-100 text-gray-800'}`}>
              {statusLabels[campaign.status] || campaign.status}
            </span>
          </div>
          {campaign.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{campaign.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Tipo:</span>
                <p className="font-medium">{campaign.promotionType}</p>
              </div>
              <div>
                <span className="text-gray-500">Ubicación:</span>
                <p className="font-medium truncate">{campaign.placementLocation}</p>
              </div>
              <div>
                <span className="text-gray-500">Inicio:</span>
                <p className="font-medium">{new Date(campaign.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Fin:</span>
                <p className="font-medium">
                  {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rendimiento</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{(campaign.impressions || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Impresiones</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{(campaign.clicks || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Clics</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{ctr}%</p>
                  <p className="text-xs text-gray-500">CTR</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowEditModal(true)}
                  disabled={isUpdating}
                >
                  Editar
                </Button>
              )}
              {isExpired && (
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={handleRenew}
                  isLoading={isRenewing}
                >
                  Renovar (S/7)
                </Button>
              )}
              {!isPending && (
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(true)}
                  isLoading={isDeleting}
                >
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Campaña">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Título"
            value={editForm.title || ''}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Input
            label="URL de Imagen"
            value={editForm.imageUrl || ''}
            onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
          />
          <Input
            label="URL de Destino"
            value={editForm.linkUrl || ''}
            onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })}
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" isLoading={isUpdating}>
              Guardar Cambios
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirmar Eliminación">
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de eliminar la campaña <strong>{campaign.title}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="danger" className="flex-1" onClick={handleDelete} isLoading={isDeleting}>
              Eliminar
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
