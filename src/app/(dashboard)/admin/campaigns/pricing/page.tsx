/**
 * Marketing Pricing Page
 * Premium SaaS-style CRUD for campaign pricing by placement location
 */

'use client';

import { useState } from 'react';
import { useCampaignPricingList, useCreateCampaignPricing, useUpdateCampaignPricing, useDeleteCampaignPricing } from '@/presentation/hooks/useAdmin';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { CampaignPricing, CreateCampaignPricingRequest } from '@/core/domain/entities/Admin';
import { Tag, Plus, Search, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';

export default function MarketingPricingPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<CampaignPricing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: pricingData, isLoading, error, refetch } = useCampaignPricingList();
  const createMutation = useCreateCampaignPricing();
  const updateMutation = useUpdateCampaignPricing();
  const deleteMutation = useDeleteCampaignPricing();

  const pricingList = Array.isArray(pricingData) ? pricingData : [];
  const filteredPricing = pricingList.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.promotionType && p.promotionType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = async (formData: CreateCampaignPricingRequest) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create pricing:', error);
    }
  };

  const handleEdit = (pricing: CampaignPricing) => {
    setSelectedPricing(pricing);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (formData: Record<string, unknown>) => {
    if (!selectedPricing) return;
    try {
      await updateMutation.mutateAsync({ id: selectedPricing.id, request: formData });
      setIsEditModalOpen(false);
      setSelectedPricing(null);
      refetch();
    } catch (error) {
      console.error('Failed to update pricing:', error);
    }
  };

  const handleDelete = async (pricingId: number) => {
    if (!confirm('¿Eliminar este precio?')) return;
    try {
      await deleteMutation.mutateAsync(pricingId);
      refetch();
    } catch (error) {
      console.error('Failed to delete pricing:', error);
    }
  };

  const handleToggleStatus = async (pricing: CampaignPricing) => {
    setSelectedPricing(pricing);
    await handleUpdate({ isActive: !pricing.isActive });
  };

  if (isLoading) return <LoadingState message="Cargando precios..." />;
  if (error) return <ErrorState message="Error al cargar precios." retry={refetch} />;

  if (filteredPricing.length === 0) {
    return (
      <>
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Precios por Ubicación</h1>
              <p className="text-sm text-gray-500 mt-0.5">Configura precios para campañas según ubicación</p>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
              <Plus className="w-4 h-4" /> Crear Precio
            </button>
          </div>
          <EmptyState
            title="Sin precios configurados"
            description={searchQuery ? "Ajusta tu búsqueda." : "Configura el primer precio por ubicación."}
            action={{ label: "Crear Precio", onClick: () => setIsCreateModalOpen(true) }}
          />
        </div>
        <PricingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          title="Crear Precio"
        />
      </>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Precios por Ubicación</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configura precios para campañas según ubicación</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
          <Plus className="w-4 h-4" /> Crear Precio
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Buscar por nombre o ubicación..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPricing.map((pricing) => (
          <div key={pricing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pricing.isActive ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{pricing.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    pricing.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {pricing.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
            {pricing.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{pricing.description}</p>
            )}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo</span>
                <span className="font-medium text-gray-700">{pricing.promotionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Precio PEN</span>
                <span className="font-semibold text-emerald-600">S/ {pricing.pricePen.toLocaleString('es-PE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Precio USD</span>
                <span className="font-semibold text-emerald-600">$ {pricing.priceUsd.toLocaleString('es-PE')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duración</span>
                <span className="font-medium text-gray-700">{pricing.durationDays} días</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
              <button onClick={() => handleEdit(pricing)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit3 className="w-3 h-3" /> Editar
              </button>
              <button onClick={() => handleToggleStatus(pricing)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                {pricing.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {pricing.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => handleDelete(pricing.id)} className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <PricingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Crear Precio"
      />

      {selectedPricing && (
        <PricingModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedPricing(null); }}
          onSubmit={(data) => handleUpdate(data)}
          title="Editar Precio"
          pricing={selectedPricing}
        />
      )}
    </div>
  );
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  pricing?: CampaignPricing;
}

function PricingModal({ isOpen, onClose, onSubmit, title, pricing }: PricingModalProps) {
  const [formData, setFormData] = useState({
    name: pricing?.name || '',
    description: pricing?.description || '',
    promotionType: pricing?.promotionType || 'BANNER',
    durationDays: pricing?.durationDays || 30,
    pricePen: pricing?.pricePen || 0,
    priceUsd: pricing?.priceUsd || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      durationDays: Number(formData.durationDays),
      pricePen: Number(formData.pricePen),
      priceUsd: Number(formData.priceUsd),
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
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
          <Input label="Precio PEN (S/)" type="number" value={formData.pricePen} onChange={(e) => setFormData({ ...formData, pricePen: Number(e.target.value) })} required />
          <Input label="Precio USD ($)" type="number" value={formData.priceUsd} onChange={(e) => setFormData({ ...formData, priceUsd: Number(e.target.value) })} required />
          <Input label="Duración (días)" type="number" value={formData.durationDays} onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })} required />
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
              {pricing ? 'Actualizar' : 'Crear'} Precio
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
