/**
 * Admin Campaigns List Page
 * Admin administra: ver, aprobar, rechazar, suspender, reactivar y eliminar campañas.
 * Cada accion envia notificacion por correo via Brevo en tiempo real.
 */

'use client';

import { useState, useMemo } from 'react';
import { usePromotionCampaigns, useApprovePromotionCampaign, useRejectPromotionCampaign, useSuspendPromotionCampaign, useReactivatePromotionCampaign, useDeletePromotionCampaign } from '@/presentation/hooks/useAdmin';
import { LoadingState, EmptyState, ErrorState } from '@/presentation/components/admin/AdminUIStates';
import { PromotionCampaign } from '@/core/domain/entities/Admin';
import { Megaphone, Search, CheckCircle, XCircle, AlertTriangle, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700',
  REJECTED: 'bg-red-50 text-red-700',
  SUSPENDED: 'bg-rose-50 text-rose-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
};

export default function AdminCampaignsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const { data: campaignsData, isLoading, error, refetch } = usePromotionCampaigns({ page: 0, size: 50 });
  const approveMutation = useApprovePromotionCampaign();
  const rejectMutation = useRejectPromotionCampaign();
  const suspendMutation = useSuspendPromotionCampaign();
  const reactivateMutation = useReactivatePromotionCampaign();
  const deleteMutation = useDeletePromotionCampaign();

  const campaignsList = Array.isArray(campaignsData) ? campaignsData : (campaignsData?.content || []);
  const filteredCampaigns = campaignsList.filter((campaign: PromotionCampaign) => {
    const name = campaign.title || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (campaign: PromotionCampaign) => {
    setActionLoading(campaign.id);
    try {
      await approveMutation.mutateAsync(campaign.id);
      refetch();
    } catch (error) {
      console.error('Error al aprobar campaña:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (campaign: PromotionCampaign) => {
    const reason = prompt('Motivo de rechazo (se notificara al propietario):');
    if (!reason) return;
    setActionLoading(campaign.id);
    try {
      await rejectMutation.mutateAsync({ id: campaign.id, reason });
      refetch();
    } catch (error) {
      console.error('Error al rechazar campaña:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (campaign: PromotionCampaign) => {
    const reason = prompt('Motivo de suspension (se notificara al propietario):');
    if (!reason) return;
    setActionLoading(campaign.id);
    try {
      await suspendMutation.mutateAsync({ id: campaign.id, reason });
      refetch();
    } catch (error) {
      console.error('Error al suspender campaña:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (campaign: PromotionCampaign) => {
    setActionLoading(campaign.id);
    try {
      await reactivateMutation.mutateAsync(campaign.id);
      refetch();
    } catch (error) {
      console.error('Error al reactivar campaña:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (campaign: PromotionCampaign) => {
    const confirmMsg = `¿Estas seguro de eliminar la campaña "${campaign.title}"?\n\nSe notificara al propietario por correo.`;
    if (!window.confirm(confirmMsg)) return;
    setActionLoading(campaign.id);
    try {
      await deleteMutation.mutateAsync(campaign.id);
      refetch();
    } catch (error) {
      console.error('Error al eliminar campaña:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return <LoadingState message="Cargando campanas..." />;
  if (error) return <ErrorState message="Error al cargar campanas." retry={refetch} />;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campañas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Administra y modera campanas promocionales</p>
        </div>
        <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Buscar campanas..."
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
          <option value="all">Todos los estados</option>
          <option value="PENDING_APPROVAL">Pendientes</option>
          <option value="ACTIVE">Activas</option>
          <option value="REJECTED">Rechazadas</option>
          <option value="SUSPENDED">Suspendidas</option>
          <option value="EXPIRED">Expiradas</option>
        </select>
      </div>

      {filteredCampaigns.length === 0 ? (
        <EmptyState
          title="Sin campanas"
          description={searchQuery || statusFilter !== 'all' ? "Ajusta tu busqueda o filtro." : "No hay campanas registradas aun."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    campaign.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                    campaign.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600' :
                    campaign.status === 'REJECTED' ? 'bg-red-50 text-red-600' :
                    campaign.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{campaign.title}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[campaign.status] || 'bg-gray-100 text-gray-600'}`}>
                      {campaign.status === 'PENDING_APPROVAL' ? 'Pendiente' :
                       campaign.status === 'ACTIVE' ? 'Activa' :
                       campaign.status === 'REJECTED' ? 'Rechazada' :
                       campaign.status === 'SUSPENDED' ? 'Suspendida' :
                       campaign.status === 'EXPIRED' ? 'Expirada' : campaign.status}
                    </span>
                  </div>
                </div>
              </div>
              {campaign.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{campaign.description}</p>
              )}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Propietario</span>
                  <span className="font-medium text-gray-700">{campaign.ownerName || `${campaign.ownerRole} #${campaign.ownerId}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipo</span>
                  <span className="font-medium text-gray-700">{campaign.promotionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ubicacion</span>
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
                <div className="flex justify-between">
                  <span className="text-gray-400">Rendimiento</span>
                  <span className="font-medium text-gray-700">{(campaign.impressions || 0).toLocaleString('es-PE')} imp / {(campaign.clicks || 0).toLocaleString('es-PE')} clics</span>
                </div>
                {campaign.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Notas</span>
                    <span className="font-medium text-gray-700 truncate max-w-[150px]">{campaign.notes}</span>
                  </div>
                )}
              </div>

              {/* Acciones de administracion */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                {campaign.status === 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => handleApprove(campaign)}
                      disabled={actionLoading === campaign.id}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Aprobar - notifica al propietario via Brevo"
                    >
                      {actionLoading === campaign.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(campaign)}
                      disabled={actionLoading === campaign.id}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Rechazar - notifica al propietario via Brevo"
                    >
                      {actionLoading === campaign.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                      Rechazar
                    </button>
                  </>
                )}
                {campaign.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => handleSuspend(campaign)}
                      disabled={actionLoading === campaign.id}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Suspender - notifica al propietario via Brevo"
                    >
                      {actionLoading === campaign.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                      Suspender
                    </button>
                    <button
                      onClick={() => handleDelete(campaign)}
                      disabled={actionLoading === campaign.id}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar - notifica al propietario via Brevo"
                    >
                      {actionLoading === campaign.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </>
                )}
                {campaign.status === 'SUSPENDED' && (
                  <>
                    <button
                      onClick={() => handleReactivate(campaign)}
                      disabled={actionLoading === campaign.id}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                      title="Reactivar - notifica al propietario via Brevo"
                    >
                      {actionLoading === campaign.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                      Reactivar
                    </button>
                    <button
                      onClick={() => handleDelete(campaign)}
                      disabled={actionLoading === campaign.id}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar - notifica al propietario via Brevo"
                    >
                      {actionLoading === campaign.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </>
                )}
                {campaign.status === 'REJECTED' && (
                  <>
                    <span className="flex-1 text-center text-xs text-gray-400 py-1.5">Rechazada</span>
                    <button
                      onClick={() => handleDelete(campaign)}
                      disabled={actionLoading === campaign.id}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar - notifica al propietario via Brevo"
                    >
                      {actionLoading === campaign.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </>
                )}
                {campaign.status === 'EXPIRED' && (
                  <>
                    <span className="flex-1 text-center text-xs text-gray-400 py-1.5">Expirada</span>
                    <button
                      onClick={() => handleDelete(campaign)}
                      disabled={actionLoading === campaign.id}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar - notifica al propietario via Brevo"
                    >
                      {actionLoading === campaign.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
