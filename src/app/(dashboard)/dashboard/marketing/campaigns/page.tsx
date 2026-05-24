/**
 * Developer Marketing Campaigns Page
 * Developers can create, edit, delete, and renew their promotion campaigns
 */

'use client';

import { useState } from 'react';
import {
  useDeveloperMyCampaigns,
  useDeveloperCreateCampaign,
  useDeveloperUpdateCampaign,
  useDeveloperDeleteCampaign,
  useDeveloperRenewCampaign,
} from '@/presentation/hooks/useDeveloper';
import { Card, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { CampaignCard } from '@/presentation/components/marketing/CampaignCard';
import { PromotionCampaign, CreatePromotionCampaignRequest, UpdatePromotionCampaignRequest } from '@/core/domain/entities/Admin';

export default function DeveloperMarketingCampaignsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: campaignsData, isLoading, error, refetch } = useDeveloperMyCampaigns({ page: 0, size: 50 });
  const createMutation = useDeveloperCreateCampaign();
  const updateMutation = useDeveloperUpdateCampaign();
  const deleteMutation = useDeveloperDeleteCampaign();
  const renewMutation = useDeveloperRenewCampaign();

  const campaignsList = Array.isArray(campaignsData) ? campaignsData : (campaignsData?.content || []);
  const filteredCampaigns = campaignsList.filter((campaign: PromotionCampaign) => {
    const name = campaign.title || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (formData: CreatePromotionCampaignRequest) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleEdit = async (id: number, data: UpdatePromotionCampaignRequest) => {
    await updateMutation.mutateAsync({ id, data });
    refetch();
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    refetch();
  };

  const handleRenew = async (id: number) => {
    await renewMutation.mutateAsync({ id, paymentRequest: { paymentMethod: 'WALLET' } });
    refetch();
  };

  if (isLoading) return <LoadingState message="Cargando campañas..." />;
  if (error) return <ErrorState message="Error al cargar campañas." retry={refetch} />;

  if (filteredCampaigns.length === 0) {
    return (
      <>
        <EmptyState
          title="Sin campañas"
          description={searchQuery || statusFilter !== 'all' ? "Ajusta tu búsqueda." : "Crea tu primera campaña promocional."}
          action={{ label: "Crear Campaña", onClick: () => setIsCreateModalOpen(true) }}
        />
        <CampaignModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          title="Crear Campaña"
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Campañas</h2>
          <p className="text-gray-600">Administra tus campañas promocionales</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Crear Campaña</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Buscar campañas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="ACTIVE">Activas</option>
              <option value="PENDING_APPROVAL">Pendientes</option>
              <option value="SCHEDULED">Programadas</option>
              <option value="EXPIRED">Expiradas</option>
              <option value="REJECTED">Rechazadas</option>
              <option value="INACTIVE">Inactivas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign: PromotionCampaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRenew={handleRenew}
            isDeleting={deleteMutation.isPending}
            isUpdating={updateMutation.isPending}
            isRenewing={renewMutation.isPending}
          />
        ))}
      </div>

      <CampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Crear Campaña"
      />
    </div>
  );
}

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
}

function CampaignModal({ isOpen, onClose, onSubmit, title }: CampaignModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promotionType: 'BANNER',
    placementLocation: 'HOME_MAIN',
    startDate: '',
    endDate: '',
    pricePaid: 0,
    currency: 'PEN',
    imageUrl: '',
    linkUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      pricePaid: Number(formData.pricePaid),
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Promoción</label>
            <select value={formData.promotionType} onChange={(e) => setFormData({ ...formData, promotionType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="BANNER">Banner</option>
              <option value="SLIDER">Slider</option>
              <option value="HOME_SPOTLIGHT">Spotlight Principal</option>
              <option value="FEATURED_PROPERTY">Propiedad Destacada</option>
              <option value="FEATURED_PROJECT">Proyecto Destacado</option>
              <option value="RECOMMENDED">Recomendado</option>
              <option value="PREMIUM_AD">Anuncio Premium</option>
              <option value="SEARCH_BOOST">Boost en Búsqueda</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <select value={formData.placementLocation} onChange={(e) => setFormData({ ...formData, placementLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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
          <Input label="Fecha Inicio" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
          <Input label="Fecha Fin" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
          <Input label="Precio" type="number" value={formData.pricePaid} onChange={(e) => setFormData({ ...formData, pricePaid: Number(e.target.value) })} required />
          <Input label="Moneda" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
          <Input label="URL de Imagen" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
          <Input label="URL de Destino" value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">Crear Campaña</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
