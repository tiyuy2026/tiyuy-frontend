'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Banner, CreateBannerRequest } from '@/core/domain/entities/Admin';

interface BannerCardProps {
  banner: Banner;
  onEdit: (id: number, data: CreateBannerRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

export function BannerCard({
  banner,
  onEdit,
  onDelete,
  isDeleting,
  isUpdating,
}: BannerCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState<CreateBannerRequest>({
    title: banner.title,
    description: banner.description || '',
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl || '',
    placement: banner.placement,
    startDate: banner.startDate,
    endDate: banner.endDate || '',
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onEdit(banner.id, editForm);
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await onDelete(banner.id);
    setShowDeleteConfirm(false);
  };

  const ctr = banner.impressions && banner.impressions > 0
    ? ((banner.clicks || 0) / banner.impressions * 100).toFixed(2)
    : '0.00';

  return (
    <>
      <Card className="relative overflow-hidden border-t-4 border-t-teal-500">
        {banner.imageUrl && (
          <div className="h-40 bg-gray-100 overflow-hidden">
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg truncate mr-2">{banner.title}</CardTitle>
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {banner.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          {banner.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{banner.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Ubicación:</span>
                <p className="font-medium truncate">{banner.placement}</p>
              </div>
              <div>
                <span className="text-gray-500">Inicio:</span>
                <p className="font-medium">{new Date(banner.startDate).toLocaleDateString()}</p>
              </div>
              {banner.endDate && (
                <div>
                  <span className="text-gray-500">Fin:</span>
                  <p className="font-medium">{new Date(banner.endDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Performance Stats */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rendimiento</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{(banner.impressions || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Impresiones</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{(banner.clicks || 0).toLocaleString()}</p>
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
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowEditModal(true)}
                disabled={isUpdating}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(true)}
                isLoading={isDeleting}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Banner">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Título"
            value={editForm.title}
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
            value={editForm.imageUrl}
            onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
            required
          />
          <Input
            label="URL de Destino"
            value={editForm.linkUrl || ''}
            onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <select
              value={editForm.placement}
              onChange={(e) => setEditForm({ ...editForm, placement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="HOME_MAIN">Home - Principal</option>
              <option value="HOME_SPOTLIGHT">Home - Spotlight</option>
              <option value="HOME_BANNER">Home - Banner</option>
              <option value="SEARCH_RESULTS">Resultados de Búsqueda</option>
              <option value="PROPERTY_DETAIL">Detalle de Propiedad</option>
              <option value="PROJECT_DETAIL">Detalle de Proyecto</option>
              <option value="PROPERTY_LIST">Lista de Propiedades</option>
              <option value="PROJECT_LIST">Lista de Proyectos</option>
              <option value="SIDEBAR">Barra Lateral</option>
              <option value="SLIDER">Slider</option>
              <option value="BANNER_TOP">Banner Superior</option>
              <option value="BANNER_BOTTOM">Banner Inferior</option>
              <option value="RECOMMENDED">Recomendado</option>
              <option value="CATEGORY_PAGE">Página de Categoría</option>
            </select>
          </div>
          <Input
            label="Fecha Inicio"
            type="date"
            value={editForm.startDate}
            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={editForm.endDate || ''}
            onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
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
            ¿Estás seguro de eliminar el banner <strong>{banner.title}</strong>? Esta acción no se puede deshacer.
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
