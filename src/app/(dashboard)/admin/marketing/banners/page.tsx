/**
 * Marketing Banners Page
 * CRUD for promotional banners
 */

'use client';

import { useState } from 'react';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '@/presentation/hooks/useAdmin';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { Banner, CreateBannerRequest } from '@/core/domain/entities/Admin';

export default function MarketingBannersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bannersData, isLoading, error, refetch } = useBanners({ page: 0, size: 50 });
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const filteredBanners = bannersData?.content?.filter(banner =>
    banner.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCreate = async (formData: CreateBannerRequest) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create banner:', error);
    }
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (formData: Record<string, unknown>) => {
    if (!selectedBanner) return;
    try {
      await updateMutation.mutateAsync({ id: selectedBanner.id, request: formData });

      setIsEditModalOpen(false);
      setSelectedBanner(null);
      refetch();
    } catch (error) {
      console.error('Failed to update banner:', error);
    }
  };

  const handleDelete = async (bannerId: number) => {
    if (!confirm('Eliminar este banner?')) return;
    try {
      await deleteMutation.mutateAsync(bannerId);
      refetch();
    } catch (error) {
      console.error('Failed to delete banner:', error);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    await handleUpdate({ isActive: !banner.isActive });
  };

  if (isLoading) return <LoadingState message="Cargando banners..." />;
  if (error) return <ErrorState message="Error al cargar banners." retry={refetch} />;

  if (filteredBanners.length === 0) {
    return (
      <EmptyState
        title="Sin banners"
        description={searchQuery ? "Ajusta tu busqueda." : "Crea tu primer banner publicitario."}
        action={{ label: "Crear Banner", onClick: () => setIsCreateModalOpen(true) }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banners Publicitarios</h2>
          <p className="text-gray-600">Administra banners promocionales</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Crear Banner</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar banners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.map((banner) => (
          <Card key={banner.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{banner.title}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>{banner.isActive ? 'Activo' : 'Inactivo'}</span>
              </div>
              {banner.description && <p className="text-sm text-gray-600 mt-1">{banner.description}</p>}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ubicacion:</span>
                  <span className="text-sm">{banner.placementLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inicio:</span>
                  <span className="text-sm">{new Date(banner.startDate).toLocaleDateString()}</span>
                </div>
                {banner.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fin:</span>
                    <span className="text-sm">{new Date(banner.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Rendimiento:</span>
                  <span className="text-sm">{banner.impressions || 0} imp / {banner.clicks || 0} clics</span>
                </div>
                {banner.imageUrl && (
                  <div className="pt-2">
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(banner)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(banner)}>
                    {banner.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(banner.id)} className="text-red-600">Eliminar</Button>
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

      {selectedBanner && (
        <BannerModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedBanner(null); }}
          onSubmit={(data) => handleUpdate(data)}
          title="Editar Banner"
          banner={selectedBanner}
        />
      )}
    </div>
  );
}

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  banner?: Banner;
}

function BannerModal({ isOpen, onClose, onSubmit, title, banner }: BannerModalProps) {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    description: banner?.description || '',
    imageUrl: banner?.imageUrl || '',
    linkUrl: banner?.linkUrl || '',
    placementLocation: banner?.placementLocation || 'HOME_TOP',
    startDate: banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
    endDate: banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
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
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <Input label="URL de Imagen" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} required />
          <Input label="URL de Destino" value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicacion</label>
            <select value={formData.placementLocation} onChange={(e) => setFormData({ ...formData, placementLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="HOME_TOP">Home - Superior</option>
              <option value="HOME_MIDDLE">Home - Medio</option>
              <option value="HOME_BOTTOM">Home - Inferior</option>
              <option value="SIDEBAR">Barra Lateral</option>
              <option value="POPUP">Pop-up</option>
            </select>
          </div>
          <Input label="Fecha Inicio" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
          <Input label="Fecha Fin" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">{banner ? 'Actualizar' : 'Crear'} Banner</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
