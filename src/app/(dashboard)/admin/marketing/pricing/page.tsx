/**
 * Marketing Pricing Page
 * CRUD for campaign pricing by placement location
 */

'use client';

import { useState } from 'react';
import { useCampaignPricingList, useCreateCampaignPricing, useUpdateCampaignPricing, useDeleteCampaignPricing } from '@/presentation/hooks/useAdmin';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { CampaignPricing, CreateCampaignPricingRequest } from '@/core/domain/entities/Admin';

export default function MarketingPricingPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<CampaignPricing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: pricingData, isLoading, error, refetch } = useCampaignPricingList();
  const createMutation = useCreateCampaignPricing();
  const updateMutation = useUpdateCampaignPricing();
  const deleteMutation = useDeleteCampaignPricing();

  const filteredPricing = (pricingData || []).filter(p =>
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
    if (!confirm('Eliminar este precio?')) return;
    try {
      await deleteMutation.mutateAsync(pricingId);
      refetch();
    } catch (error) {
      console.error('Failed to delete pricing:', error);
    }
  };

  const handleToggleStatus = async (pricing: CampaignPricing) => {
    await handleUpdate({ isActive: !pricing.isActive });
  };

  if (isLoading) return <LoadingState message="Cargando precios..." />;
  if (error) return <ErrorState message="Error al cargar precios." retry={refetch} />;

  if (filteredPricing.length === 0) {
    return (
      <>
        <EmptyState
          title="Sin precios configurados"
          description={searchQuery ? "Ajusta tu busqueda." : "Configura el primer precio por ubicacion."}
          action={{ label: "Crear Precio", onClick: () => setIsCreateModalOpen(true) }}
        />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Precios por Ubicacion</h2>
          <p className="text-gray-600">Configura precios para campanias segun ubicacion</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Crear Precio</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar por nombre o ubicacion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPricing.map((pricing) => (
          <Card key={pricing.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pricing.name}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pricing.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>{pricing.isActive ? 'Activo' : 'Inactivo'}</span>
              </div>
              {pricing.description && <p className="text-sm text-gray-600 mt-1">{pricing.description}</p>}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="text-sm font-medium">{pricing.promotionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio PEN:</span>
                  <span className="text-sm font-semibold text-green-600">
                    S/ {pricing.pricePen.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio USD:</span>
                  <span className="text-sm font-semibold text-green-600">
                    $ {pricing.priceUsd.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duracion:</span>
                  <span className="text-sm">{pricing.durationDays} dias</span>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(pricing)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(pricing)}>
                    {pricing.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(pricing.id)} className="text-red-600">Eliminar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Promocion</label>
            <select value={formData.promotionType} onChange={(e) => setFormData({ ...formData, promotionType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="BANNER">Banner</option>
              <option value="SLIDER">Slider</option>
              <option value="HOME_SPOTLIGHT">Spotlight Principal</option>
              <option value="FEATURED_PROPERTY">Propiedad Destacada</option>
              <option value="FEATURED_PROJECT">Proyecto Destacado</option>
              <option value="RECOMMENDED">Recomendado</option>
              <option value="PREMIUM_AD">Anuncio Premium</option>
              <option value="SEARCH_BOOST">Boost en Busqueda</option>
            </select>
          </div>
          <Input label="Precio PEN (S/)" type="number" value={formData.pricePen} onChange={(e) => setFormData({ ...formData, pricePen: Number(e.target.value) })} required />
          <Input label="Precio USD ($)" type="number" value={formData.priceUsd} onChange={(e) => setFormData({ ...formData, priceUsd: Number(e.target.value) })} required />
          <Input label="Duracion (dias)" type="number" value={formData.durationDays} onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })} required />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">{pricing ? 'Actualizar' : 'Crear'} Precio</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
