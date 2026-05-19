/**
 * Agent Marketing Banners Page
 * Agents can create and manage their own banners
 */

'use client';

import { useState } from 'react';
import { useAgentMyBanners, useAgentCreateBanner } from '@/presentation/hooks/useAgent';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { Banner, CreateBannerRequest } from '@/core/domain/entities/Admin';

export default function AgentMarketingBannersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: banners, isLoading, error, refetch } = useAgentMyBanners();
  const createMutation = useAgentCreateBanner();

  const handleCreate = async (formData: CreateBannerRequest) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create banner:', error);
    }
  };

  if (isLoading) return <LoadingState message="Cargando banners..." />;
  if (error) return <ErrorState message="Error al cargar banners." retry={refetch} />;

  const bannerList = banners || [];

  if (bannerList.length === 0) {
    return (
      <EmptyState
        title="Sin banners"
        description="Crea tu primer banner publicitario."
        action={{ label: "Crear Banner", onClick: () => setIsCreateModalOpen(true) }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Banners</h2>
          <p className="text-gray-600">Administra tus banners publicitarios</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Crear Banner</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bannerList.map((banner: Banner) => (
          <Card key={banner.id} className="relative overflow-hidden">
            {banner.imageUrl && (
              <div className="h-40 bg-gray-100 overflow-hidden">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{banner.title}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {banner.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {banner.description && <p className="text-sm text-gray-600 mt-1">{banner.description}</p>}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ubicacion:</span>
                  <span className="text-sm">{banner.placementLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clics:</span>
                  <span className="text-sm">{banner.clicks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Impresiones:</span>
                  <span className="text-sm">{banner.impressions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <BannerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Crear Banner"
      />
    </div>
  );
}

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
}

function BannerModal({ isOpen, onClose, onSubmit, title }: BannerModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    placementLocation: 'HOME_TOP',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Titulo" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <Input label="URL de Imagen" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} required />
          <Input label="URL de Destino" value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicacion</label>
            <select value={formData.placementLocation} onChange={(e) => setFormData({ ...formData, placementLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="HOME_TOP">Home - Superior</option>
              <option value="HOME_MIDDLE">Home - Medio</option>
              <option value="HOME_BOTTOM">Home - Inferior</option>
              <option value="PROPERTIES_SIDEBAR">Propiedades - Sidebar</option>
              <option value="PROJECTS_SIDEBAR">Proyectos - Sidebar</option>
            </select>
          </div>
          <Input label="Fecha Inicio" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
          <Input label="Fecha Fin" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">Crear Banner</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
