/**
 * Agent Marketing Campaigns Page
 * Agents can create and manage their own promotion campaigns
 */

'use client';

import { useState } from 'react';
import { useAgentMyCampaigns, useAgentCreateCampaign } from '@/presentation/hooks/useAgent';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { PromotionCampaign, CreatePromotionCampaignRequest } from '@/core/domain/entities/Admin';

export default function AgentMarketingCampaignsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: campaignsData, isLoading, error, refetch } = useAgentMyCampaigns({ page: 0, size: 50 });
  const createMutation = useAgentCreateCampaign();

  const filteredCampaigns = (campaignsData?.content || []).filter((campaign: PromotionCampaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
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

  if (isLoading) return <LoadingState message="Cargando campanas..." />;
  if (error) return <ErrorState message="Error al cargar campanas." retry={refetch} />;

  if (filteredCampaigns.length === 0) {
    return (
      <EmptyState
        title="Sin campanas"
        description={searchQuery || statusFilter !== 'all' ? "Ajusta tu busqueda." : "Crea tu primera campana promocional."}
        action={{ label: "Crear Campana", onClick: () => setIsCreateModalOpen(true) }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Campanas</h2>
          <p className="text-gray-600">Administra tus campanas promocionales</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Crear Campana</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input
              placeholder="Buscar campanas..."
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
              <option value="INACTIVE">Inactivas</option>
              <option value="SCHEDULED">Programadas</option>
              <option value="EXPIRED">Expiradas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign: PromotionCampaign) => (
          <Card key={campaign.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                  campaign.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>{campaign.status}</span>
              </div>
              {campaign.description && <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="text-sm">{campaign.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Audiencia:</span>
                  <span className="text-sm">{campaign.targetAudience || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inicio:</span>
                  <span className="text-sm">{new Date(campaign.startDate).toLocaleDateString()}</span>
                </div>
                {campaign.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fin:</span>
                    <span className="text-sm">{new Date(campaign.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                {campaign.budget && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Presupuesto:</span>
                    <span className="text-sm font-semibold">${campaign.budget.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Rendimiento:</span>
                  <span className="text-sm">{campaign.impressions || 0} imp / {campaign.clicks || 0} clics</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Crear Campana"
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
    name: '',
    description: '',
    type: 'DISPLAY',
    startDate: '',
    endDate: '',
    budget: 0,
    targetAudience: 'ALL',
    placementLocations: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      budget: Number(formData.budget),
      placementLocations: formData.placementLocations ? formData.placementLocations.split(',').map(s => s.trim()) : [],
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
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="DISPLAY">Display</option>
              <option value="SEARCH">Busqueda</option>
              <option value="SOCIAL">Redes Sociales</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>
          <Input label="Fecha Inicio" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
          <Input label="Fecha Fin" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          <Input label="Presupuesto" type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audiencia</label>
            <select value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="ALL">Todos</option>
              <option value="NEW_USERS">Nuevos Usuarios</option>
              <option value="EXISTING_USERS">Usuarios Existentes</option>
              <option value="SUBSCRIBERS">Suscriptores</option>
            </select>
          </div>
          <Input label="Ubicaciones (separadas por coma)" value={formData.placementLocations} onChange={(e) => setFormData({ ...formData, placementLocations: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">Crear Campana</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
