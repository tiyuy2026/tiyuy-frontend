/**
 * Marketing Banners Page
 * Premium SaaS-style CRUD for promotional banners
 */

'use client';

import { useState, useMemo } from 'react';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useCampaignPricingList, useUpdateCampaignPricing } from '@/presentation/hooks/useAdmin';
import { Modal } from '@/presentation/components/ui/Modal';
import { Input } from '@/presentation/components/ui/Input';
import { Button } from '@/presentation/components/ui/Button';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { Banner, CreateBannerRequest, CampaignPricing } from '@/core/domain/entities/Admin';
import { Image, Plus, Search, Edit3, Trash2, Eye, EyeOff, DollarSign, Save, RefreshCw, AlertTriangle } from 'lucide-react';

export default function MarketingBannersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<CampaignPricing | null>(null);

  const { data: bannersData, isLoading, error, refetch } = useBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();
  const { data: pricingData } = useCampaignPricingList();
  const updatePricingMutation = useUpdateCampaignPricing();

  const pricingList = useMemo(() => Array.isArray(pricingData) ? pricingData : [], [pricingData]);
  const bannerPricing = useMemo(() => pricingList.find(p => p.promotionType === 'BANNER'), [pricingList]);

  const bannersList = Array.isArray(bannersData) ? bannersData : [];
  const filteredBanners = bannersList.filter(banner =>
    banner.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    if (!confirm('¿Eliminar este banner?')) return;
    try {
      await deleteMutation.mutateAsync(bannerId);
      refetch();
    } catch (error) {
      console.error('Failed to delete banner:', error);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    setSelectedBanner(banner);
    await handleUpdate({ isActive: !banner.isActive });
  };

  if (isLoading) return <LoadingState message="Cargando banners..." />;
  if (error) return <ErrorState message="Error al cargar banners." retry={refetch} />;

  if (filteredBanners.length === 0) {
    return (
      <>
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Banners Publicitarios</h1>
              <p className="text-sm text-gray-500 mt-0.5">Administra banners promocionales</p>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
              <Plus className="w-4 h-4" /> Crear Banner
            </button>
          </div>
          <EmptyState
            title="Sin banners"
            description={searchQuery ? "Ajusta tu búsqueda." : "Crea tu primer banner publicitario."}
            action={{ label: "Crear Banner", onClick: () => setIsCreateModalOpen(true) }}
          />
        </div>
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
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Banners Publicitarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Administra banners promocionales</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
          <Plus className="w-4 h-4" /> Crear Banner
        </button>
      </div>

      {/* ── Precio de Banner ── */}
      {bannerPricing && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Precio de Publicación de Banner</p>
              <p className="text-lg font-extrabold text-gray-900">
                S/ {bannerPricing.pricePen.toLocaleString('es-PE', { minimumFractionDigits: 2 })} 
                <span className="text-sm font-normal text-gray-400 mx-1">/</span>
                $ {bannerPricing.priceUsd.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setSelectedPricing(bannerPricing); setIsPriceModalOpen(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl hover:bg-amber-100 transition-all"
          >
            <DollarSign className="w-4 h-4" />
            Actualizar Precio de Banner
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Buscar banners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBanners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            {banner.imageUrl && (
              <div className="h-36 bg-gray-50 overflow-hidden">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${banner.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Image className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{banner.title}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      banner.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {banner.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
              {banner.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{banner.description}</p>
              )}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ubicación</span>
                  <span className="font-medium text-gray-700">{banner.placement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Inicio</span>
                  <span className="font-medium text-gray-700">{new Date(banner.startDate).toLocaleDateString('es-PE')}</span>
                </div>
                {banner.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fin</span>
                    <span className="font-medium text-gray-700">{new Date(banner.endDate).toLocaleDateString('es-PE')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Rendimiento</span>
                  <span className="font-medium text-gray-700">{(banner.impressions || 0).toLocaleString('es-PE')} imp / {(banner.clicks || 0).toLocaleString('es-PE')} clics</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => handleEdit(banner)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit3 className="w-3 h-3" /> Editar
                </button>
                <button onClick={() => handleToggleStatus(banner)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  {banner.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {banner.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleDelete(banner.id)} className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
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

      {/* ── Modal Actualizar Precio de Banner ── */}
      <UpdateBannerPriceModal
        isOpen={isPriceModalOpen}
        onClose={() => { setIsPriceModalOpen(false); setSelectedPricing(null); }}
        item={selectedPricing}
        onSave={async (data) => {
          if (!selectedPricing) return;
          await updatePricingMutation.mutateAsync({
            id: selectedPricing.id,
            request: { pricePen: data.pricePen, priceUsd: data.priceUsd },
          });
          setIsPriceModalOpen(false);
          setSelectedPricing(null);
        }}
        isSaving={updatePricingMutation.isPending}
      />
    </div>
  );
}

// ─── Modal para actualizar precio de banner ─────────────────────────────────
function UpdateBannerPriceModal({ isOpen, onClose, onSave, item, isSaving }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { pricePen: number; priceUsd: number }) => void;
  item: CampaignPricing | null;
  isSaving: boolean;
}) {
  const [pricePen, setPricePen] = useState(item?.pricePen || 0);
  const [priceUsd, setPriceUsd] = useState(item?.priceUsd || 0);

  useState(() => {
    if (item) {
      setPricePen(item.pricePen);
      setPriceUsd(item.priceUsd);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ pricePen: Number(pricePen), priceUsd: Number(priceUsd) });
  };

  if (!isOpen || !item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Actualizar Precio de Banner</h3>
            <p className="text-sm text-gray-500">
              {item.name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              El cambio se aplica en tiempo real. Agentes y developers verán el nuevo precio inmediatamente.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio PEN <span className="text-gray-400">(S/)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">S/</span>
                <input type="number" step="0.01" min="0" value={pricePen}
                  onChange={(e) => setPricePen(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio USD <span className="text-gray-400">($)</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" step="0.01" min="0" value={priceUsd}
                  onChange={(e) => setPriceUsd(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" required />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-md hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50">
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Actualizando...' : 'Actualizar Precio'}
            </button>
            <button type="button" onClick={onClose} disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
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
    placement: banner?.placement || 'HOME_BANNER',
    startDate: banner?.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
    endDate: banner?.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
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
          <Input label="URL de Imagen" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} required />
          <Input label="URL de Destino" value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <select value={formData.placement} onChange={(e) => setFormData({ ...formData, placement: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
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
          <Input label="Fecha Fin" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:shadow-md transition-all">
              {banner ? 'Actualizar' : 'Crear'} Banner
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
