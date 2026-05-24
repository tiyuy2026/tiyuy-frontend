/**
 * Marketing Festive Campaigns Page
 * Premium SaaS-style CRUD for seasonal/holiday campaigns
 */

'use client';

import { useState } from 'react';
import { useFestiveCampaigns, useCreateFestiveCampaign, useUpdateFestiveCampaign, useDeleteFestiveCampaign } from '@/presentation/hooks/useAdmin';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { FestiveCampaign, CreateFestiveCampaignRequest } from '@/core/domain/entities/Admin';
import { Gift, Plus, Search, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';

export default function MarketingFestivePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFestive, setSelectedFestive] = useState<FestiveCampaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: festiveData, isLoading, error, refetch } = useFestiveCampaigns();
  const createMutation = useCreateFestiveCampaign();
  const updateMutation = useUpdateFestiveCampaign();
  const deleteMutation = useDeleteFestiveCampaign();

  const festiveList = Array.isArray(festiveData) ? festiveData : [];
  const filteredFestive = festiveList.filter(f =>
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
    if (!confirm('¿Eliminar esta campaña festiva?')) return;
    try {
      await deleteMutation.mutateAsync(festiveId);
      refetch();
    } catch (error) {
      console.error('Failed to delete festive campaign:', error);
    }
  };

  const handleToggleStatus = async (festive: FestiveCampaign) => {
    setSelectedFestive(festive);
    await handleUpdate({ isActive: !festive.isActive });
  };

  if (isLoading) return <LoadingState message="Cargando campañas festivas..." />;
  if (error) return <ErrorState message="Error al cargar campañas festivas." retry={refetch} />;

  if (filteredFestive.length === 0) {
    return (
      <>
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campañas Festivas</h1>
              <p className="text-sm text-gray-500 mt-0.5">Administra campañas por temporada y fechas especiales</p>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
              <Plus className="w-4 h-4" /> Crear Campaña Festiva
            </button>
          </div>
          <EmptyState
            title="Sin campañas festivas"
            description={searchQuery ? "Ajusta tu búsqueda." : "Crea tu primera campaña festiva."}
            action={{ label: "Crear Campaña Festiva", onClick: () => setIsCreateModalOpen(true) }}
          />
        </div>
        <FestiveModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          title="Crear Campaña Festiva"
        />
      </>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campañas Festivas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Administra campañas por temporada y fechas especiales</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
          <Plus className="w-4 h-4" /> Crear Campaña Festiva
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Buscar campañas festivas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFestive.map((festive) => (
          <div key={festive.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            {festive.bannerUrl && (
              <div className="h-36 bg-gray-50 overflow-hidden">
                <img src={festive.bannerUrl} alt={festive.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${festive.isActive ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{festive.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      festive.isActive ? 'bg-rose-50 text-rose-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {festive.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
              {festive.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{festive.description}</p>
              )}
              <div className="space-y-1.5 text-xs">
                {festive.festiveType && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tipo</span>
                    <span className="font-medium text-gray-700">{festive.festiveType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Inicio</span>
                  <span className="font-medium text-gray-700">{new Date(festive.startDate).toLocaleDateString('es-PE')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fin</span>
                  <span className="font-medium text-gray-700">{new Date(festive.endDate).toLocaleDateString('es-PE')}</span>
                </div>
                {festive.discountPercentage && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Descuento</span>
                    <span className="font-semibold text-emerald-600">{festive.discountPercentage}%</span>
                  </div>
                )}
                {festive.specialPricePen && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Precio PEN</span>
                    <span className="font-semibold text-gray-900">S/ {festive.specialPricePen.toLocaleString('es-PE')}</span>
                  </div>
                )}
                {festive.specialPriceUsd && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Precio USD</span>
                    <span className="font-semibold text-gray-900">$ {festive.specialPriceUsd.toLocaleString('es-PE')}</span>
                  </div>
                )}
                {festive.maxParticipants && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max. Participantes</span>
                    <span className="font-medium text-gray-700">{festive.maxParticipants}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => handleEdit(festive)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit3 className="w-3 h-3" /> Editar
                </button>
                <button onClick={() => handleToggleStatus(festive)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  {festive.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {festive.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleDelete(festive.id)} className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <FestiveModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Crear Campaña Festiva"
      />

      {selectedFestive && (
        <FestiveModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedFestive(null); }}
          onSubmit={(data) => handleUpdate(data)}
          title="Editar Campaña Festiva"
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
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Festivo</label>
            <select value={formData.festiveType} onChange={(e) => setFormData({ ...formData, festiveType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
              <option value="CHRISTMAS">Navidad</option>
              <option value="NEW_YEAR">Año Nuevo</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Términos y Condiciones</label>
            <textarea value={formData.termsAndConditions} onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
              {festive ? 'Actualizar' : 'Crear'} Campaña Festiva
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
