/**
 * Admin Campaign Pricing Page
 * Actualización de precios en tiempo real para campañas y banners
 * Los cambios se reflejan inmediatamente para agentes y developers
 */

'use client';

import { useState, useMemo } from 'react';
import {
  useCampaignPricingList,
  useCreateCampaignPricing,
  useUpdateCampaignPricing,
  useDeleteCampaignPricing,
} from '@/presentation/hooks/useAdmin';
import { LoadingState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { Modal } from '@/presentation/components/ui/Modal';
import {
  Megaphone, Image, DollarSign, Search,
  RefreshCw, TrendingUp, Clock, Save, AlertTriangle, History,
  Plus, Trash2, Edit3, CheckCircle, XCircle,
} from 'lucide-react';
import type { CampaignPricing, CreateCampaignPricingRequest } from '@/core/domain/entities/Admin';

// ─── Format Helpers ─────────────────────────────────────────────────────────
const formatCurrency = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatUSD = (n: number) =>
  `$ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Promotion Type Labels ──────────────────────────────────────────────────
const PROMOTION_TYPE_LABELS: Record<string, string> = {
  BANNER: 'Banner',
  SLIDER: 'Slider',
  HOME_SPOTLIGHT: 'Spotlight Principal',
  FEATURED_PROPERTY: 'Propiedad Destacada',
  FEATURED_PROJECT: 'Proyecto Destacado',
  RECOMMENDED: 'Recomendado',
  PREMIUM_AD: 'Anuncio Premium',
  SEARCH_BOOST: 'Boost en Búsqueda',
};

// ─── Edit Price Modal ───────────────────────────────────────────────────────
interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { pricePen: number; priceUsd: number; name: string; description?: string; promotionType: string; durationDays: number; isActive?: boolean }) => void;
  editItem?: CampaignPricing | null;
  isSaving?: boolean;
}

function EditPriceModal({ isOpen, onClose, onSave, editItem, isSaving }: EditPriceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    promotionType: 'BANNER',
    durationDays: 30,
    pricePen: 0,
    priceUsd: 0,
    isActive: true,
  });

  // Reset form when modal opens
  useState(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        description: editItem.description || '',
        promotionType: editItem.promotionType,
        durationDays: editItem.durationDays,
        pricePen: editItem.pricePen,
        priceUsd: editItem.priceUsd,
        isActive: editItem.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        promotionType: 'BANNER',
        durationDays: 30,
        pricePen: 0,
        priceUsd: 0,
        isActive: true,
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description || undefined,
      promotionType: formData.promotionType,
      durationDays: formData.durationDays,
      pricePen: Number(formData.pricePen),
      priceUsd: Number(formData.priceUsd),
      isActive: formData.isActive,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editItem ? 'Editar Precio' : 'Nuevo Precio'}
            </h3>
            <p className="text-sm text-gray-500">
              {editItem ? 'Actualiza el precio de esta ubicación' : 'Configura un nuevo precio para una ubicación'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              Los cambios se aplican en tiempo real. Agentes y developers verán el nuevo precio inmediatamente.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              required
              placeholder="Ej: Banner Home Principal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              placeholder="Descripción opcional"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={formData.promotionType}
                onChange={(e) => setFormData({ ...formData, promotionType: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                {Object.entries(PROMOTION_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (días)</label>
              <input
                type="number"
                min={1}
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio PEN <span className="text-gray-400">(S/)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">S/</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pricePen}
                  onChange={(e) => setFormData({ ...formData, pricePen: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio USD <span className="text-gray-400">($)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.priceUsd}
                  onChange={(e) => setFormData({ ...formData, priceUsd: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Precio activo</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-md hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Guardando...' : editItem ? 'Actualizar Precio' : 'Crear Precio'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// ─── Delete Confirm Modal ───────────────────────────────────────────────────
function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, isDeleting }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isDeleting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Eliminar Precio</h3>
          <p className="text-sm text-gray-500 mt-1">
            ¿Estás seguro de eliminar el precio de <strong>{itemName}</strong>?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AdminPricingPage() {
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState<{ isOpen: boolean; item: CampaignPricing | null }>({ isOpen: false, item: null });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: CampaignPricing | null }>({ isOpen: false, item: null });

  // ── Data ──
  const { data: pricingData, isLoading, error, refetch } = useCampaignPricingList({ page: 0, size: 100 });
  const createMutation = useCreateCampaignPricing();
  const updateMutation = useUpdateCampaignPricing();
  const deleteMutation = useDeleteCampaignPricing();

  const pricingList = useMemo(() => Array.isArray(pricingData) ? pricingData : [], [pricingData]);

  const filteredList = useMemo(() =>
    pricingList.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.promotionType?.toLowerCase().includes(search.toLowerCase())
    ), [pricingList, search]
  );

  // ── Stats ──
  const stats = useMemo(() => {
    const active = pricingList.filter(p => p.isActive);
    const avgPen = active.length > 0 ? active.reduce((s, p) => s + p.pricePen, 0) / active.length : 0;
    const avgUsd = active.length > 0 ? active.reduce((s, p) => s + p.priceUsd, 0) / active.length : 0;
    return { total: pricingList.length, active: active.length, avgPen, avgUsd };
  }, [pricingList]);

  // ── Handlers ──
  const handleSave = async (data: { pricePen: number; priceUsd: number; name: string; description?: string; promotionType: string; durationDays: number; isActive?: boolean }) => {
    if (editModal.item) {
      await updateMutation.mutateAsync({ id: editModal.item.id, request: data });
    } else {
      await createMutation.mutateAsync(data as CreateCampaignPricingRequest);
    }
    setEditModal({ isOpen: false, item: null });
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    await deleteMutation.mutateAsync(deleteModal.item.id);
    setDeleteModal({ isOpen: false, item: null });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-6">
        <div className="h-8 w-64 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Error al cargar datos de precios." retry={refetch} />;
  }

  return (
    <div className="space-y-5 pb-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Precios en Tiempo Real</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configura los precios de campañas y banners por ubicación. Los cambios se reflejan inmediatamente.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-700">Tiempo Real</span>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Precios Configurados</p>
              <p className="text-xl font-extrabold text-gray-900">{stats.total}</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-emerald-600">{stats.active}</span> activos
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Precio Prom. PEN</p>
              <p className="text-xl font-extrabold text-gray-900">{formatCurrency(stats.avgPen)}</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50">
            <p className="text-xs text-gray-400">Precio promedio en soles</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Precio Prom. USD</p>
              <p className="text-xl font-extrabold text-gray-900">{formatUSD(stats.avgUsd)}</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50">
            <p className="text-xs text-gray-400">Precio promedio en dólares</p>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Precios por Ubicación</h3>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
            <button
              onClick={() => setEditModal({ isOpen: true, item: null })}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:shadow-md hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Precio
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['Nombre', 'Tipo', 'Duración', 'Precio PEN', 'Precio USD', 'Estado', 'Actualizado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? filteredList.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      {p.description && <p className="text-[11px] text-gray-400 truncate max-w-[200px]">{p.description}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-600">{PROMOTION_TYPE_LABELS[p.promotionType] || p.promotionType}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.durationDays} días</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(p.pricePen)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-gray-900">{formatUSD(p.priceUsd)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditModal({ isOpen: true, item: p })}
                        className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors group"
                        title="Editar precio"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, item: p })}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {search ? 'No se encontraron precios con ese criterio' : 'No hay precios configurados'}
                    </p>
                    {!search && (
                      <button
                        onClick={() => setEditModal({ isOpen: true, item: null })}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-xl hover:bg-amber-100 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Configurar primer precio
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit/Create Modal ── */}
      <EditPriceModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, item: null })}
        onSave={handleSave}
        editItem={editModal.item}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      {/* ── Delete Modal ── */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.item?.name || ''}
        isDeleting={deleteMutation.isPending}
      />

    </div>
  );
}
