/**
 * Admin Campaign Pricing Page
 * Solo actualización de precios existentes (NO crear nuevos)
 * Los cambios se reflejan en tiempo real para agentes y developers
 */

'use client';

import { useState, useMemo } from 'react';
import {
  useCampaignPricingList,
  useUpdateCampaignPricing,
} from '@/presentation/hooks/useAdmin';
import { ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { Modal } from '@/presentation/components/ui/Modal';
import {
  DollarSign, Search, RefreshCw, TrendingUp, Save, AlertTriangle,
  Edit3, CheckCircle, XCircle,
} from 'lucide-react';
import type { CampaignPricing } from '@/core/domain/entities/Admin';

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

// ─── Update Price Modal ─────────────────────────────────────────────────────
function UpdatePriceModal({ isOpen, onClose, onSave, item, isSaving }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { pricePen: number; priceUsd: number }) => void;
  item: CampaignPricing | null;
  isSaving: boolean;
}) {
  const [pricePen, setPricePen] = useState(item?.pricePen || 0);
  const [priceUsd, setPriceUsd] = useState(item?.priceUsd || 0);

  // Reset when item changes
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
            <h3 className="text-lg font-semibold text-gray-900">Actualizar Precio</h3>
            <p className="text-sm text-gray-500">
              {item.name} — {PROMOTION_TYPE_LABELS[item.promotionType] || item.promotionType}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio PEN <span className="text-gray-400">(S/)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">S/</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricePen}
                  onChange={(e) => setPricePen(Number(e.target.value))}
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
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  required
                />
              </div>
            </div>
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
              {isSaving ? 'Actualizando...' : 'Actualizar Precio'}
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

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AdminPricingPage() {
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<CampaignPricing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Data ──
  const { data: pricingData, isLoading, error, refetch } = useCampaignPricingList();
  const updateMutation = useUpdateCampaignPricing();

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
  const handleEdit = (item: CampaignPricing) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: { pricePen: number; priceUsd: number }) => {
    if (!selectedItem) return;
    await updateMutation.mutateAsync({
      id: selectedItem.id,
      request: { pricePen: data.pricePen, priceUsd: data.priceUsd },
    });
    setIsModalOpen(false);
    setSelectedItem(null);
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
            Actualiza los precios de campañas y banners. Los cambios se reflejan inmediatamente.
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
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['Nombre', 'Tipo', 'Duración', 'Precio PEN', 'Precio USD', 'Estado', 'Acciones'].map(h => (
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
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleEdit(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Actualizar Precio
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {search ? 'No se encontraron precios con ese criterio' : 'No hay precios configurados'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Update Price Modal ── */}
      <UpdatePriceModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
        onSave={handleSave}
        item={selectedItem}
        isSaving={updateMutation.isPending}
      />

    </div>
  );
}
