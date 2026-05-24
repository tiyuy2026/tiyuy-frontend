/**
 * Developer Marketing Banners Page
 * Developers can create, edit, and delete their banners
 */

'use client';

import { useState } from 'react';
import {
  useDeveloperMyBanners,
  useDeveloperCreateBanner,
  useDeveloperUpdateBanner,
  useDeveloperDeleteBanner,
} from '@/presentation/hooks/useDeveloper';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { BannerCard } from '@/presentation/components/marketing/BannerCard';
import { Banner, CreateBannerRequest } from '@/core/domain/entities/Admin';

export default function DeveloperMarketingBannersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: banners, isLoading, error, refetch } = useDeveloperMyBanners();
  const createMutation = useDeveloperCreateBanner();
  const updateMutation = useDeveloperUpdateBanner();
  const deleteMutation = useDeveloperDeleteBanner();

  const handleCreate = async (formData: CreateBannerRequest) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create banner:', error);
    }
  };

  const handleEdit = async (id: number, data: CreateBannerRequest) => {
    await updateMutation.mutateAsync({ id, data });
    refetch();
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    refetch();
  };

  if (isLoading) return <LoadingState message="Cargando banners..." />;
  if (error) return <ErrorState message="Error al cargar banners." retry={refetch} />;

  const bannerList = banners || [];

  if (bannerList.length === 0) {
    return (
      <>
        <EmptyState
          title="Sin banners"
          description="Crea tu primer banner publicitario."
          action={{ label: "Crear Banner", onClick: () => setIsCreateModalOpen(true) }}
        />
        <BannerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          title="Crear Banner"
        />
      </>
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
          <BannerCard
            key={banner.id}
            banner={banner}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
            isUpdating={updateMutation.isPending}
          />
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
    placement: 'HOME_MAIN',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-cyan-500 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
              <input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Destino</label>
              <input
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <select
                value={formData.placement}
                onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-500 text-white hover:shadow-lg hover:-translate-y-0.5"
              >
                Crear Banner
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
