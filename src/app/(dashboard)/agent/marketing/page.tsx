/**
 * Agent Marketing Dashboard Page
 * Misma experiencia que Developer Marketing - Pantalla Única Premium
 * Todo el marketing en una sola pantalla sin submenús
 */

'use client';

import { useState } from 'react';
import { useAuthStore } from '@/presentation/store/authStore';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import {
  useAgentMarketingStats,
  useAgentMyCampaigns,
  useAgentCreateCampaign,
  useAgentUpdateCampaign,
  useAgentDeleteCampaign,
  useAgentPublishCampaign,
  useAgentRenewCampaign,
  useAgentTargetEntities,
} from '@/presentation/hooks/useAgent';
import {
  PromotionCampaign,
  UpdatePromotionCampaignRequest,
} from '@/core/domain/entities/Admin';
import {
  Megaphone,
  ArrowRight,
  Lock,
  Sparkles,
  Eye,
  MousePointer2,
  Users,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Target,
  Activity,
  Award,
  Star,
  Search,
  Link2,
  Loader2,
  Home,
  Building2,
  RefreshCw,
  Calendar,
  BarChart3,
  Image as ImageIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MarketingKpiCard } from '@/presentation/components/marketing/MarketingKpiCard';
import {
  CampaignModal,
  DeleteConfirmModal,
  CampaignFormData,
} from '@/presentation/components/marketing/MarketingModals';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number) {
  return n.toLocaleString('es-PE');
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-700 border-amber-200',
    SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200',
    EXPIRED: 'bg-red-100 text-red-700 border-red-200',
    REJECTED: 'bg-gray-100 text-gray-700 border-gray-200',
    INACTIVE: 'bg-gray-100 text-gray-500 border-gray-200',
    SUSPENDED: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Borrador',
    ACTIVE: 'Activa',
    PENDING_APPROVAL: 'Pendiente',
    SCHEDULED: 'Programada',
    EXPIRED: 'Expirada',
    REJECTED: 'Rechazada',
    INACTIVE: 'Inactiva',
    SUSPENDED: 'Suspendida',
  };
  return labels[status] || status;
}

function getStatusDot(status: string): string {
  const dots: Record<string, string> = {
    DRAFT: 'bg-gray-400',
    ACTIVE: 'bg-emerald-500',
    PENDING_APPROVAL: 'bg-amber-500',
    SCHEDULED: 'bg-blue-500',
    EXPIRED: 'bg-red-500',
    REJECTED: 'bg-gray-400',
    INACTIVE: 'bg-gray-300',
    SUSPENDED: 'bg-orange-500',
  };
  return dots[status] || 'bg-gray-400';
}

function getLinkTypeLabel(campaign: PromotionCampaign): { label: string; icon: React.ReactNode } {
  if (campaign.targetProjectId) {
    return { label: 'Proyecto', icon: <Building2 className="w-3.5 h-3.5" /> };
  }
  if (campaign.targetPropertyId) {
    return { label: 'Propiedad', icon: <Home className="w-3.5 h-3.5" /> };
  }
  return { label: 'Sin vínculo', icon: <Link2 className="w-3.5 h-3.5" /> };
}

function getDurationText(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return '7 días';
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return `${diffDays} días de campaña`;
}

function getDaysRemaining(endDate: string): number {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  return Math.max(0, Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

// ─── Chart Data from real stats ──────────────────────────────────────────────

function buildChartDataFromStats(stats: any, days: number) {
  if (!stats?.dailyStats || !Array.isArray(stats.dailyStats) || stats.dailyStats.length === 0) {
    return [];
  }
  return stats.dailyStats.slice(-days).map((d: any) => ({
    label: d.date,
    clicks: d.clicks || 0,
    impressions: d.impressions || 0,
  }));
}

// ─── Period Tabs ──────────────────────────────────────────────────────────────

type PeriodKey = '7d' | '30d' | 'month';

function PeriodTabs({ active, onChange }: { active: PeriodKey; onChange: (k: PeriodKey) => void }) {
  const tabs: { key: PeriodKey; label: string }[] = [
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
    { key: 'month', label: 'Este mes' },
  ];
  return (
    <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
            active === t.key
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyStateCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── Campaign Table Row ───────────────────────────────────────────────────────

function CampaignTableRow({
  campaign,
  onEdit,
  onDelete,
  onRenew,
  onPublish,
  isPublishing,
}: {
  campaign: PromotionCampaign;
  onEdit: (c: PromotionCampaign) => void;
  onDelete: (id: number, name: string) => void;
  onRenew: (id: number) => void;
  onPublish?: (id: number) => void;
  isPublishing?: boolean;
}) {
  const ctr = campaign.impressions && campaign.impressions > 0
    ? ((campaign.clicks || 0) / campaign.impressions * 100).toFixed(2)
    : '0.00';

  const isDraft = campaign.status === 'DRAFT';
  const isExpired = campaign.status === 'EXPIRED';
  const isActive = campaign.status === 'ACTIVE';
  const linkType = getLinkTypeLabel(campaign);
  const daysRemaining = getDaysRemaining(campaign.endDate || '');

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
            {campaign.imageUrl ? (
              <img src={campaign.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{campaign.title}</p>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">
              {campaign.description || 'Sin descripción'}
            </p>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
          campaign.targetProjectId
            ? 'bg-blue-50 text-blue-700'
            : campaign.targetPropertyId
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-gray-50 text-gray-500'
        }`}>
          {linkType.icon}
          {linkType.label}
        </span>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{getDurationText(campaign.startDate || '', campaign.endDate || '')}</span>
        </div>
        {isActive && daysRemaining > 0 && (
          <p className="text-[10px] text-emerald-600 mt-0.5">
            {daysRemaining} día{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}
          </p>
        )}
      </td>

      <td className="py-4 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(campaign.status)}`} />
          {getStatusLabel(campaign.status)}
        </span>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{(campaign.clicks || 0).toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">Clics</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{(campaign.impressions || 0).toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">Impr.</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">{ctr}%</p>
            <p className="text-[10px] text-gray-400">CTR</p>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-1">
          {isDraft && onPublish && (
            <button
              onClick={() => onPublish(campaign.id)}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              title="Publicar campaña"
            >
              {isPublishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              Publicar
            </button>
          )}
          {isActive && (
            <button
              onClick={() => onEdit(campaign)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {isExpired && (
            <button
              onClick={() => onRenew(campaign.id)}
              className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 transition-colors"
              title="Renovar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(campaign.id, campaign.title)}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgentMarketingPage() {
  const { user } = useAuthStore();
  const { data: activeSubscription, isLoading: isLoadingPlan } = useActiveSubscription();

  const { data: stats, isLoading: isLoadingStats } = useAgentMarketingStats();
  const { data: campaignsData, isLoading: isLoadingCampaigns, refetch: refetchCampaigns } = useAgentMyCampaigns({ page: 0, size: 50 });
  const { data: targetEntities, isLoading: isLoadingEntities } = useAgentTargetEntities();

  const createCampaignMutation = useAgentCreateCampaign();
  const updateCampaignMutation = useAgentUpdateCampaign();
  const deleteCampaignMutation = useAgentDeleteCampaign();
  const publishCampaignMutation = useAgentPublishCampaign();
  const renewCampaignMutation = useAgentRenewCampaign();

  const [period, setPeriod] = useState<'7d' | '30d' | 'month'>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<PromotionCampaign | null>(null);
  const [deletingId, setDeletingId] = useState<{ id: number; name: string } | null>(null);

  const isLoading = isLoadingStats || isLoadingCampaigns || isLoadingPlan;
  const planName = activeSubscription?.plan?.name || 'FREE';
  const hasMarketingAccess = planName !== 'FREE';

  const campaignsList = Array.isArray(campaignsData) ? campaignsData : (campaignsData?.content || []);
  const filteredCampaigns = campaignsList.filter((c: PromotionCampaign) => {
    const name = c.title || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 31;
  const impressionsChartData = buildChartDataFromStats(stats, days);

  const handleCreateCampaign = async (formData: CampaignFormData) => {
    try {
      await createCampaignMutation.mutateAsync({
        ...formData,
        pricePaid: Number(formData.pricePaid),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setShowCreateCampaign(false);
      refetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleUpdateCampaign = async (id: number, data: UpdatePromotionCampaignRequest) => {
    await updateCampaignMutation.mutateAsync({ id, data });
    setEditingCampaign(null);
    refetchCampaigns();
  };

  const handleDeleteCampaign = async (id: number) => {
    await deleteCampaignMutation.mutateAsync(id);
    setDeletingId(null);
    refetchCampaigns();
  };

  const handleRenewCampaign = async (id: number) => {
    await renewCampaignMutation.mutateAsync({ id, paymentRequest: { paymentMethod: 'WALLET' } });
    refetchCampaigns();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 bg-[#F8F9FA] min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-gray-200 rounded-xl" />
          <div className="h-5 w-96 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-80 bg-gray-200 rounded-2xl" />
            <div className="h-80 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasMarketingAccess) {
    return (
      <div className="space-y-6 p-6 bg-[#F8F9FA] min-h-screen">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center max-w-lg mx-auto mt-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Marketing bloqueado</h3>
          <p className="text-gray-500 mb-6">
            Las herramientas de marketing están disponibles solo para planes pagos.
            Actualiza tu plan para acceder a campañas promocionales.
          </p>
          <a
            href="/plans"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm"
          >
            <Sparkles className="w-5 h-5" />
            Ver Planes
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const activeCampaigns = stats?.activeCampaigns ?? 0;
  const totalCampaigns = stats?.totalCampaigns ?? 0;
  const totalImpressions = stats?.totalImpressions ?? 0;
  const totalClicks = stats?.totalClicks ?? 0;
  const totalConversions = stats?.totalConversions ?? 0;
  const averageCTR = stats?.averageCTR ?? 0;
  const conversionRate = totalImpressions > 0 ? (totalConversions / totalImpressions) * 100 : 0;
  const hasLikes = totalClicks > 0;
  const linkEvaluationText = hasLikes
    ? '¡El enlace tiene interacciones! Campaña funcionando con éxito'
    : 'Sin interacciones aún. Revisa la configuración de tu campaña';

  return (
    <div className="space-y-6 p-6 bg-[#F8F9FA] min-h-screen">

      {/* MÉTRICAS CLAVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MarketingKpiCard
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Campañas Activas"
          value={`${activeCampaigns}/${totalCampaigns}`}
          subtitle="Campañas creadas"
          valueColor="text-emerald-600"
        />
        <MarketingKpiCard
          icon={<Target className="w-6 h-6 text-purple-600" />}
          iconBg="bg-purple-50"
          label="Tasa de Conversión"
          value={`${conversionRate.toFixed(1)}%`}
          subtitle={`${totalConversions} conversiones`}
          valueColor="text-purple-600"
          trend={conversionRate > 0 ? '+0.8%' : '0%'}
          trendUp={conversionRate > 0}
        />
        <MarketingKpiCard
          icon={<MousePointer2 className="w-6 h-6 text-amber-600" />}
          iconBg="bg-amber-50"
          label="Clics Totales"
          value={formatNumber(totalClicks)}
          subtitle={`${formatNumber(totalImpressions)} impresiones`}
          valueColor="text-amber-600"
          trend={`${averageCTR.toFixed(1)}% CTR`}
          trendUp={averageCTR > 1}
        />
        <MarketingKpiCard
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
          iconBg="bg-blue-50"
          label="Impresiones"
          value={formatNumber(totalImpressions)}
          subtitle="Total acumulado"
          valueColor="text-blue-600"
        />
      </div>

      {/* EVALUACIÓN DE LINKS + GRÁFICA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 rounded-xl p-2.5">
                <Link2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Evaluación de Links e Interacciones</h3>
                <p className="text-xs text-gray-500">Rendimiento de enlaces y contenido</p>
              </div>
            </div>
            <PeriodTabs active={period} onChange={setPeriod} />
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
            hasLikes ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            {hasLikes ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-medium ${hasLikes ? 'text-emerald-800' : 'text-amber-800'}`}>
                {linkEvaluationText}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {hasLikes
                  ? `${totalClicks} clicks • ${totalConversions} conversiones`
                  : 'Crea contenido atractivo para mejorar resultados'}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Interacciones por día</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  Clicks
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-400" />
                  Impresiones
                </span>
              </div>
            </div>
            {impressionsChartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center bg-gray-50 rounded-xl">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Sin datos de interacciones aún</p>
                  <p className="text-xs text-gray-300">Los datos aparecerán cuando los usuarios interactúen</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={impressionsChartData.slice(-7)} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2.5} fill="url(#clicksGradient)" name="Clicks" dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                  <Area type="monotone" dataKey="impressions" stroke="#60a5fa" strokeWidth={2} fill="url(#impressionsGradient)" name="Impresiones" dot={{ r: 2, fill: '#60a5fa', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 4, fill: '#60a5fa', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Resumen de Rendimiento */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-50 rounded-xl p-2">
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Resumen de Rendimiento</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 rounded-lg p-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Impresiones</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(totalImpressions)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 rounded-lg p-2">
                  <MousePointer2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Clicks</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(totalClicks)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 rounded-lg p-2">
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Conversiones</p>
                  <p className="text-lg font-bold text-gray-900">{formatNumber(totalConversions)}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">CTR</span>
                  <span className="text-xs font-medium text-gray-700">{averageCTR.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(averageCTR * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE CAMPAÑAS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">Mis Campañas</h2>
              {campaignsList.length > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full ml-1">{campaignsList.length}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar campaña..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="all">Todos</option>
                <option value="DRAFT">Borradores</option>
                <option value="ACTIVE">Activas</option>
                <option value="PENDING_APPROVAL">Pendientes</option>
                <option value="SCHEDULED">Programadas</option>
                <option value="EXPIRED">Expiradas</option>
                <option value="INACTIVE">Inactivas</option>
              </select>
              <button
                onClick={() => setShowCreateCampaign(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nueva Campaña
              </button>
            </div>
          </div>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="p-8">
            <EmptyStateCard
              icon={<Megaphone className="w-8 h-8 text-gray-300" />}
              title={searchQuery || statusFilter !== 'all' ? 'Sin resultados' : 'Aún no tienes campañas'}
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'No se encontraron campañas con los filtros aplicados'
                  : 'Crea tu primera campaña promocional para destacar tus propiedades'
              }
              action={!searchQuery && statusFilter === 'all' ? { label: 'Crear Campaña', onClick: () => setShowCreateCampaign(true) } : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaña</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vínculo</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duración</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Interacciones</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign: PromotionCampaign) => (
                  <CampaignTableRow
                    key={campaign.id}
                    campaign={campaign}
                    onEdit={(c) => setEditingCampaign(c)}
                    onDelete={(id, name) => setDeletingId({ id, name })}
                    onRenew={handleRenewCampaign}
                    onPublish={(id) => {
                      publishCampaignMutation.mutate(id, {
                        onSuccess: () => refetchCampaigns(),
                      });
                    }}
                    isPublishing={publishCampaignMutation.isPending}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALES */}

      {/* Modal: Crear Campaña */}
      <CampaignModal
        isOpen={showCreateCampaign}
        onClose={() => setShowCreateCampaign(false)}
        onSubmit={handleCreateCampaign}
        title="Nueva Campaña Promocional"
        targetEntities={targetEntities}
        isLoadingEntities={isLoadingEntities}
      />

      {/* Modal: Editar Campaña */}
      {editingCampaign && (
        <CampaignModal
          isOpen={true}
          onClose={() => setEditingCampaign(null)}
          onSubmit={(formData) => handleUpdateCampaign(editingCampaign.id, {
            title: formData.title,
            description: formData.description,
            imageUrl: formData.imageUrl,
            linkUrl: formData.linkUrl,
            placementLocation: formData.placementLocation,
            startDate: formData.startDate,
            endDate: formData.endDate,
          })}
          title="Editar Campaña"
          initialData={{
            title: editingCampaign.title,
            description: editingCampaign.description || '',
            promotionType: editingCampaign.promotionType,
            placementLocation: editingCampaign.placementLocation,
            startDate: editingCampaign.startDate?.split('T')[0] || '',
            endDate: editingCampaign.endDate?.split('T')[0] || '',
            imageUrl: editingCampaign.imageUrl || '',
            linkUrl: editingCampaign.linkUrl || '',
            pricePaid: editingCampaign.pricePaid || 0,
            currency: editingCampaign.currency || 'PEN',
            targetPropertyId: editingCampaign.targetPropertyId,
            targetProjectId: editingCampaign.targetProjectId,
          }}
          targetEntities={targetEntities}
          isLoadingEntities={isLoadingEntities}
        />
      )}

      {/* Modal: Confirmar Eliminación */}
      {deletingId && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setDeletingId(null)}
          onConfirm={() => handleDeleteCampaign(deletingId.id)}
          title="Eliminar Campaña"
          itemName={deletingId.name}
          isLoading={deleteCampaignMutation.isPending}
        />
      )}

    </div>
  );
}
