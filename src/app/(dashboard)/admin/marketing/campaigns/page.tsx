/**
 * Marketing Campaigns Page
 * Premium SaaS-style CRUD for promotion campaigns
 */

'use client';

import { useState } from 'react';
import { usePromotionCampaigns, useCreatePromotionCampaign, useUpdatePromotionCampaign, useDeletePromotionCampaign } from '@/presentation/hooks/useAdmin';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { PromotionCampaign, CreatePromotionCampaignRequest, UpdatePromotionCampaignRequest } from '@/core/domain/entities/Admin';
import { Megaphone, Plus, Search, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  SCHEDULED: 'bg-blue-50 text-blue-700',
  EXPIRED: 'bg-red-50 text-red-700',
  PENDING: 'bg-amber-50 text-amber-700',
};

export default function MarketingCampaignsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<PromotionCampaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: campaignsData, isLoading, error, refetch } = usePromotionCampaigns({ page: 0, size: 50 });
  const createMutation = useCreatePromotionCampaign();
  const updateMutation = useUpdatePromotionCampaign();
  const deleteMutation = useDeletePromotionCampaign();

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
      console.error('Error al crear campaña:', error);
    }
  };

  const handleEdit = (campaign: PromotionCampaign) => {
    setSelectedCampaign(campaign);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (formData: UpdatePromotionCampaignRequest) => {
    if (!selectedCampaign) return;
    try {
      await updateMutation.mutateAsync({ id: selectedCampaign.id, request: formData });
      setIsEditModalOpen(false);
      setSelectedCampaign(null);
      refetch();
    } catch (error) {
      console.error('Error al actualizar campaña:', error);
    }
  };

  const handleDelete = async (campaignId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta campaña?')) return;
    try {
      await deleteMutation.mutateAsync(campaignId);
      refetch();
    } catch (error) {
      console.error('Error al eliminar campaña:', error);
    }
  };

  const handleToggleStatus = async (campaign: PromotionCampaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateMutation.mutateAsync({ id: campaign.id, request: { status: newStatus } });
      refetch();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  if (isLoading) return <LoadingState message="Cargando campañas..." />;
  if (error) return <ErrorState message="Error al cargar campañas." retry={refetch} />;

  if (filteredCampaigns.length === 0) {
    return (
      <div className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campañas de Marketing</h1>
            <p className="text-sm text-gray-500 mt-0.5">Administra campañas promocionales</p>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
            <Plus className="w-4 h-4" /> Crear Campaña
          </button>
        </div>
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
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campañas de Marketing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Administra campañas promocionales</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
          <Plus className="w-4 h-4" /> Crear Campaña
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Buscar campañas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        >
          <option value="all">Todos</option>
          <option value="ACTIVE">Activas</option>
          <option value="INACTIVE">Inactivas</option>
          <option value="SCHEDULED">Programadas</option>
          <option value="EXPIRED">Expiradas</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  campaign.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                  campaign.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600' :
                  campaign.status === 'EXPIRED' ? 'bg-red-50 text-red-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{campaign.title}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[campaign.status] || 'bg-gray-100 text-gray-600'}`}>
                    {campaign.status}
                  </span>
                </div>
              </div>
            </div>
            {campaign.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{campaign.description}</p>
            )}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo</span>
                <span className="font-medium text-gray-700">{campaign.promotionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ubicación</span>
                <span className="font-medium text-gray-700">{campaign.placementLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Inicio</span>
                <span className="font-medium text-gray-700">{new Date(campaign.startDate).toLocaleDateString('es-PE')}</span>
              </div>
              {campaign.endDate && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Fin</span>
                  <span className="font-medium text-gray-700">{new Date(campaign.endDate).toLocaleDateString('es-PE')}</span>
                </div>
              )}
              {campaign.pricePaid && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Precio</span>
                  <span className="font-semibold text-gray-900">{campaign.currency || 'USD'} {campaign.pricePaid.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Rendimiento</span>
                <span className="font-medium text-gray-700">{(campaign.impressions || 0).toLocaleString('es-PE')} imp / {(campaign.clicks || 0).toLocaleString('es-PE')} clics</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
              <button onClick={() => handleEdit(campaign)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit3 className="w-3 h-3" /> Editar
              </button>
              <button onClick={() => handleToggleStatus(campaign)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                {campaign.status === 'ACTIVE' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {campaign.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => handleDelete(campaign.id)} className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <CampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Crear Campaña"
      />

      {selectedCampaign && (
        <CampaignModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedCampaign(null); }}
          onSubmit={(data) => handleUpdate(data)}
          title="Editar Campaña"
          campaign={selectedCampaign}
        />
      )}
    </div>
  );
}

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  campaign?: PromotionCampaign;
}

function CampaignModal({ isOpen, onClose, onSubmit, title, campaign }: CampaignModalProps) {
  const [formData, setFormData] = useState({
    title: campaign?.title || '',
    description: campaign?.description || '',
    promotionType: campaign?.promotionType || 'BANNER',
    placementLocation: campaign?.placementLocation || 'HOME_BANNER',
    startDate: campaign?.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
    endDate: campaign?.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
    pricePaid: campaign?.pricePaid || 0,
    currency: campaign?.currency || 'USD',
    imageUrl: campaign?.imageUrl || '',
    linkUrl: campaign?.linkUrl || '',
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
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Promoción</label>
            <select value={formData.promotionType} onChange={(e) => setFormData({ ...formData, promotionType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
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
            <select value={formData.placementLocation} onChange={(e) => setFormData({ ...formData, placementLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
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
            <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
              {campaign ? 'Actualizar' : 'Crear'} Campaña
            </button>
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
