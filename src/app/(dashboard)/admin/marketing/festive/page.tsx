/**
 * Marketing Festive Campaigns Page
 * CRUD for seasonal/holiday campaigns
 */

'use client';

import { useState } from 'react';
import { useFestiveCampaigns, useCreateFestiveCampaign, useUpdateFestiveCampaign, useDeleteFestiveCampaign } from '@/presentation/hooks/useAdmin';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { FestiveCampaign, CreateFestiveCampaignRequest } from '@/core/domain/entities/Admin';

export default function MarketingFestivePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFestive, setSelectedFestive] = useState<FestiveCampaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: festiveData, isLoading, error, refetch } = useFestiveCampaigns();
  const createMutation = useCreateFestiveCampaign();
  const updateMutation = useUpdateFestiveCampaign();
  const deleteMutation = useDeleteFestiveCampaign();

  const filteredFestive = (festiveData || []).filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (formData: CreateFestiveCampaignRequest) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create festive campaign:', error);
    }
  };

  const handleEdit = (festive: FestiveCampaign) => {
    setSelectedFestive(festive);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (formData: Record<string, unknown>) => {
    if (!selectedFestive) return;
    try {
      await updateMutation.mutateAsync({ id: selectedFestive.id, request: formData });
      setIsEditModalOpen(false);
      setSelectedFestive(null);
      refetch();
    } catch (error) {
      console.error('Failed to update festive campaign:', error);
    }
  };

  const handleDelete = async (festiveId: number) => {
    if (!confirm('Eliminar esta campania festiva?')) return;
    try {
      await deleteMutation.mutateAsync(festiveId);
      refetch();
    } catch (error) {
      console.error('Failed to delete festive campaign:', error);
    }
  };

  const handleToggleStatus = async (festive: FestiveCampaign) => {
    await handleUpdate({ isActive: !festive.isActive });
  };

  if (isLoading) return <LoadingState message="Cargando campanias festivas..." />;
  if (error) return <ErrorState message="Error al cargar campanias festivas." retry={refetch} />;

  if (filteredFestive.length === 0) {
    return (
      <>
        <EmptyState
          title="Sin campanias festivas"
          description={searchQuery ? "Ajusta tu busqueda." : "Crea tu primera campania festiva."}
          action={{ label: "Crear Campania Festiva", onClick: () => setIsCreateModalOpen(true) }}
        />
        <FestiveModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          title="Crear Campania Festiva"
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campanias Festivas</h2>
          <p className="text-gray-600">Administra campanias por temporada y fechas especiales</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>Crear Campania Festiva</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar campanias festivas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFestive.map((festive) => (
          <Card key={festive.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{festive.name}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  festive.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>{festive.isActive ? 'Activo' : 'Inactivo'}</span>
              </div>
              {festive.description && <p className="text-sm text-gray-600 mt-1">{festive.description}</p>}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {festive.festiveType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="text-sm">{festive.festiveType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Inicio:</span>
                  <span className="text-sm">{new Date(festive.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fin:</span>
                  <span className="text-sm">{new Date(festive.endDate).toLocaleDateString()}</span>
                </div>
                {festive.discountPercentage && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descuento:</span>
                    <span className="text-sm font-semibold text-green-600">{festive.discountPercentage}%</span>
                  </div>
                )}
                {festive.bannerUrl && (
                  <div className="pt-2">
                    <img src={festive.bannerUrl} alt={festive.name} className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(festive)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleToggleStatus(festive)}>
                    {festive.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(festive.id)} className="text-red-600">Eliminar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FestiveModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Crear Campania Festiva"
      />

      {selectedFestive && (
        <FestiveModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedFestive(null); }}
          onSubmit={(data) => handleUpdate(data)}
          title="Editar Campania Festiva"
          festive={selectedFestive}
        />
      )}
    </div>
  );
}

interface FestiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  festive?: FestiveCampaign;
}

function FestiveModal({ isOpen, onClose, onSubmit, title, festive }: FestiveModalProps) {
  const [formData, setFormData] = useState({
    name: festive?.name || '',
    description: festive?.description || '',
    festiveType: festive?.festiveType || 'CHRISTMAS',
    bannerUrl: festive?.bannerUrl || '',
    startDate: festive?.startDate ? new Date(festive.startDate).toISOString().split('T')[0] : '',
    endDate: festive?.endDate ? new Date(festive.endDate).toISOString().split('T')[0] : '',
    discountPercentage: festive?.discountPercentage || 0,
    specialPricePen: festive?.specialPricePen || 0,
    specialPriceUsd: festive?.specialPriceUsd || 0,
    maxParticipants: festive?.maxParticipants || 100,
    termsAndConditions: festive?.termsAndConditions || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      discountPercentage: Number(formData.discountPercentage),
      specialPricePen: Number(formData.specialPricePen),
      specialPriceUsd: Number(formData.specialPriceUsd),
      maxParticipants: Number(formData.maxParticipants),
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
          <Input label="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Festivo</label>
            <select value={formData.festiveType} onChange={(e) => setFormData({ ...formData, festiveType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="CHRISTMAS">Navidad</option>
              <option value="NEW_YEAR">Ano Nuevo</option>
              <option value="BLACK_FRIDAY">Black Friday</option>
              <option value="CYBER_DAY">Cyber Day</option>
              <option value="FIESTAS_PATRIAS">Fiestas Patrias</option>
              <option value="HALLOWEEN">Halloween</option>
            </select>
          </div>
          <Input label="URL de Banner" value={formData.bannerUrl} onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })} />
          <Input label="Fecha Inicio" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
          <Input label="Fecha Fin" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
          <Input label="Descuento (%)" type="number" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })} />
          <Input label="Precio Especial PEN (S/)" type="number" value={formData.specialPricePen} onChange={(e) => setFormData({ ...formData, specialPricePen: Number(e.target.value) })} />
          <Input label="Precio Especial USD ($)" type="number" value={formData.specialPriceUsd} onChange={(e) => setFormData({ ...formData, specialPriceUsd: Number(e.target.value) })} />
          <Input label="Max Participantes" type="number" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terminos y Condiciones</label>
            <textarea value={formData.termsAndConditions} onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">{festive ? 'Actualizar' : 'Crear'} Campania Festiva</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
