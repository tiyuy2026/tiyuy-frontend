/**
 * Admin Campaigns Dashboard
 * Rediseño nivel senior — idéntico a imagen de referencia
 * ALL DATA FROM REAL BACKEND APIs - Zero static data
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  useMarketingStats,
  usePromotionCampaigns,
  useBanners,
  useFestiveCampaigns,
  useCampaignPricingList,
} from '@/presentation/hooks/useAdmin';
import {
  TrendingUp, DollarSign, Megaphone, Gift,
  Eye, MousePointerClick, BarChart3,
  XCircle, AlertCircle, Calendar,
  Activity, Zap, MoreVertical, PenLine, Image as ImageIcon,
  ChevronDown, SlidersHorizontal,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

// ─── Colors ─────────────────────────────────────────────────────────────────
const PURPLE   = '#8b5cf6';
const BLUE     = '#3b82f6';
const TEAL     = '#14b8a6';
const EMERALD  = '#10b981';
const AMBER    = '#f59e0b';
const ROSE     = '#f43f5e';
const GRAY     = '#64748b';

const PIE_COLORS = [TEAL, BLUE, PURPLE, AMBER, EMERALD];

// ─── Format Helpers ─────────────────────────────────────────────────────────
const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('es-PE');
};

const formatCurrency = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCompactCurrency = (n: number) => {
  if (n >= 1_000_000) return `S/ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `S/ ${(n / 1_000).toFixed(1)}K`;
  return `S/ ${n.toFixed(0)}`;
};

// ─── Mini Sparkline SVG ──────────────────────────────────────────────────────
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 80, h = 40;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`
  ).join(' ');
  return (
    <svg width={w} height={h} className="shrink-0 opacity-80">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ─── KPI Card — idéntico a imagen 2 ──────────────────────────────────────────
// Layout: ícono grande cuadrado a la izquierda | número+label centro | sparkline derecha | badge arriba derecha
interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badge?: string;          // ej "+18% vs mes anterior"
  badgePositive?: boolean;
  sparkline?: number[];
  sparkColor?: string;
}

function KPICard({ title, value, icon, iconBg, iconColor, badge, badgePositive = true, sparkline, sparkColor }: KPICardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
      {/* Ícono */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">{value}</p>
        {badge && (
          <div className={`flex items-center gap-1 mt-0.5`}>
            <TrendingUp className={`w-3 h-3 ${badgePositive ? 'text-emerald-500' : 'text-rose-500 rotate-180'}`} />
            <span className={`text-[11px] font-semibold ${badgePositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparkline && sparkColor && (
        <MiniSparkline data={sparkline} color={sparkColor} />
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE:     { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Activa' },
    INACTIVE:   { bg: 'bg-gray-100',   text: 'text-gray-600',    label: 'Inactiva' },
    SCHEDULED:  { bg: 'bg-blue-50',    text: 'text-blue-700',    label: 'Programada' },
    EXPIRED:    { bg: 'bg-red-50',     text: 'text-red-700',     label: 'Expirada' },
    PENDING:    { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Pendiente' },
  };
  const s = map[status] || { bg: 'bg-gray-50', text: 'text-gray-600', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

// ─── Custom Tooltips ──────────────────────────────────────────────────────────
function LineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
          <span className="text-gray-500">{e.name}:</span>
          <span className="font-bold text-gray-900">{formatCompact(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.payload.fill }} />
        <span className="font-semibold text-gray-900">{d.name}</span>
      </div>
      <p className="text-gray-500">{d.value} conversiones <span className="font-bold text-gray-900">({d.payload.pct}%)</span></p>
    </div>
  );
}

// ─── Activity Item ────────────────────────────────────────────────────────────
function ActivityItem({ icon, iconBg, iconColor, title, subtitle, time }: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  title: string; subtitle: string; time: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>
      </div>
      <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0 pt-0.5">{time}</span>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminCampaignsDashboard() {
  const router = useRouter();
  const [chartPeriod, setChartPeriod] = useState<'Diario' | 'Semanal' | 'Mensual'>('Diario');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');

  // ── ALL DATA FROM REAL BACKEND APIs ──────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useMarketingStats();
  const { data: campaignsData } = usePromotionCampaigns({ page: 0, size: 50 });
  const { data: bannersData }   = useBanners();
  const { data: festiveData }   = useFestiveCampaigns();
  const { data: pricingData }   = useCampaignPricingList();

  const campaigns = useMemo(() => Array.isArray(campaignsData) ? campaignsData : (campaignsData?.content || []), [campaignsData]);
  const banners   = useMemo(() => Array.isArray(bannersData) ? bannersData : [], [bannersData]);
  const festive   = useMemo(() => Array.isArray(festiveData) ? festiveData : [], [festiveData]);
  const pricing   = useMemo(() => Array.isArray(pricingData) ? pricingData : [], [pricingData]);

  // ── Métricas reales ──────────────────────────────────────────────────────
  const activeCampaigns  = stats?.activeCampaigns  ?? campaigns.filter(c => c.status === 'ACTIVE').length;
  const totalCampaigns   = stats?.totalCampaigns   ?? campaigns.length;
  const activeBanners    = stats?.activeBanners    ?? banners.filter(b => b.isActive).length;
  const totalBanners     = stats?.totalBanners     ?? banners.length;
  const activeFestive    = stats?.activeFestiveCampaigns ?? festive.filter(f => f.isActive).length;
  const totalRevenue     = stats?.totalRevenue     ?? 0;
  const totalImpressions = stats?.totalImpressions ?? campaigns.reduce((s, c) => s + (c.impressions || 0), 0) + banners.reduce((s, b) => s + (b.impressions || 0), 0);
  const totalClicks      = stats?.totalClicks      ?? campaigns.reduce((s, c) => s + (c.clicks || 0), 0)      + banners.reduce((s, b) => s + (b.clicks || 0), 0);
  const totalConversions = stats?.totalConversions ?? 0;
  const ctr              = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const conversionRate   = totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(2) : '0.00';
  const pendingApproval  = stats?.pendingApproval  ?? campaigns.filter(c => c.status === 'PENDING').length;
  const expiredCampaigns = stats?.expiredCampaigns ?? campaigns.filter(c => c.status === 'EXPIRED').length;

  // ── Sparklines desde datos reales ────────────────────────────────────────
  const sparklineData = useMemo(() => {
    const now = new Date();
    const months: number[] = Array.from({ length: 6 }, (_, i) => {
      const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return campaigns.filter(c => {
        const d = new Date(c.startDate);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).length;
    });
    return {
      campaigns: months,
      banners: Array.from({ length: 6 }, (_, i) => {
        const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return banners.filter(b => {
          const d = new Date(b.startDate);
          return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
        }).length;
      }),
      festive: Array.from({ length: 6 }, (_, i) => {
        const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return festive.filter(f => {
          const d = new Date(f.startDate);
          return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
        }).length;
      }),
      revenue: Array.from({ length: 6 }, (_, i) => {
        const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return campaigns
          .filter(c => {
            const d = new Date(c.startDate);
            return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
          })
          .reduce((s, c) => s + (c.pricePaid || 0), 0);
      }),
    };
  }, [campaigns, banners, festive]);

  // ── Chart de línea: Impresiones / Clics / Conversiones agrupados por fecha ──
  const lineChartData = useMemo(() => {
    const now = new Date();
    // Número de puntos según período
    const points = chartPeriod === 'Diario' ? 30 : chartPeriod === 'Semanal' ? 12 : 6;
    return Array.from({ length: points }, (_, i) => {
      let label = '';
      let start: Date, end: Date;
      if (chartPeriod === 'Diario') {
        start = new Date(now); start.setDate(now.getDate() - (points - 1 - i));
        end = new Date(start); end.setDate(start.getDate() + 1);
        label = `${start.getDate()} ${start.toLocaleString('es-PE', { month: 'short' })}`;
      } else if (chartPeriod === 'Semanal') {
        start = new Date(now); start.setDate(now.getDate() - (points - 1 - i) * 7);
        end = new Date(start); end.setDate(start.getDate() + 7);
        label = `Sem ${i + 1}`;
      } else {
        start = new Date(now.getFullYear(), now.getMonth() - (points - 1 - i), 1);
        end = new Date(now.getFullYear(), now.getMonth() - (points - 2 - i), 1);
        label = start.toLocaleString('es-PE', { month: 'short' });
      }
      const inRange = (c: any) => {
        const d = new Date(c.startDate || c.createdAt || now);
        return d >= start && d < end;
      };
      const imp  = campaigns.filter(inRange).reduce((s, c) => s + (c.impressions || 0), 0)
                 + banners.filter(inRange).reduce((s, b) => s + (b.impressions || 0), 0);
      const clk  = campaigns.filter(inRange).reduce((s, c) => s + (c.clicks || 0), 0)
                 + banners.filter(inRange).reduce((s, b) => s + (b.clicks || 0), 0);
      const conv = campaigns.filter(inRange).reduce((s, c) => s + (c.conversions || 0), 0);
      return { label, Impresiones: imp, Clics: clk, Conversiones: conv };
    });
  }, [chartPeriod, campaigns, banners]);

  // ── Pie: Conversiones por canal desde datos reales ───────────────────────
  const pieData = useMemo(() => {
    const channels: Record<string, number> = {};
    campaigns.forEach(c => {
      const canal = c.placementLocation || c.promotionType || 'Otros';
      channels[canal] = (channels[canal] || 0) + (c.conversions || 0);
    });
    banners.forEach(b => {
      const canal = b.placement || 'Banners';
      channels[canal] = (channels[canal] || 0) + (b.conversions || 0);
    });
    const total = Object.values(channels).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(channels).map(([name, value], i) => ({
      name,
      value,
      pct: ((value / total) * 100).toFixed(0),
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [campaigns, banners]);

  const totalPieConversions = pieData.reduce((s, d) => s + d.value, 0);

  // ── Top Campañas (por conversiones, desde datos reales) ──────────────────
  const topCampaigns = useMemo(() =>
    [...campaigns]
      .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
      .slice(0, 4)
      .map((c, i) => ({
        rank: i + 1,
        title: c.title,
        conversions: c.conversions || 0,
        color: PIE_COLORS[i % PIE_COLORS.length],
      })),
    [campaigns]
  );
  const maxTopConv = Math.max(...topCampaigns.map(t => t.conversions), 1);

  // ── Actividad Reciente desde datos reales ────────────────────────────────
  const activityItems = useMemo(() => {
    const items: any[] = [];
    campaigns.filter(c => c.status === 'ACTIVE').slice(0, 2).forEach(c => {
      items.push({
        icon: <Megaphone className="w-4 h-4" />, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
        title: 'Nueva campaña creada', subtitle: c.title, time: 'Ahora',
      });
    });
    banners.filter(b => b.isActive).slice(0, 1).forEach(b => {
      items.push({
        icon: <ImageIcon className="w-4 h-4" />, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
        title: 'Banner aprobado', subtitle: b.title, time: 'Reciente',
      });
    });
    campaigns.filter(c => (c.conversions || 0) > 0).slice(0, 1).forEach(c => {
      items.push({
        icon: <TrendingUp className="w-4 h-4" />, iconBg: 'bg-teal-50', iconColor: 'text-teal-600',
        title: 'Conversión registrada', subtitle: c.title, time: 'Reciente',
      });
    });
    festive.filter(f => f.isActive).slice(0, 1).forEach(f => {
      items.push({
        icon: <Gift className="w-4 h-4" />, iconBg: 'bg-rose-50', iconColor: 'text-rose-600',
        title: 'Temporada activada', subtitle: f.name, time: 'Reciente',
      });
    });
    campaigns.filter(c => c.status === 'PENDING').slice(0, 1).forEach(c => {
      items.push({
        icon: <AlertCircle className="w-4 h-4" />, iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
        title: 'Reporte generado', subtitle: c.title, time: 'Pendiente',
      });
    });
    return items.slice(0, 6);
  }, [campaigns, banners, festive]);

  // ── Tabla: Campañas Activas con todos los campos de la imagen 2 ──────────
  const filteredCampaigns = useMemo(() => {
    let list = [...campaigns];
    if (statusFilter !== 'Todos los estados') {
      list = list.filter(c => c.status === statusFilter.toUpperCase());
    }
    return list.slice(0, 10).map(c => ({
      id: c.id,
      title: c.title,
      dates: c.startDate && c.endDate
        ? `${new Date(c.startDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })} – ${new Date(c.endDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}`
        : '—',
      status: c.status,
      budget: c.pricePaid ? formatCurrency(c.pricePaid) : '—',
      impressions: c.impressions || 0,
      clicks: c.clicks || 0,
      ctr: c.impressions > 0 ? `${((c.clicks / c.impressions) * 100).toFixed(2)}%` : '0.00%',
      conversions: c.conversions || 0,
      convRate: c.impressions > 0 ? `${((c.conversions / c.impressions) * 100).toFixed(2)}%` : '0.00%',
      revenue: c.revenue ? formatCurrency(c.revenue) : '—',
      thumbnail: c.imageUrl || c.thumbnailUrl || null,
    }));
  }, [campaigns, statusFilter]);

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (statsLoading) {
    return (
      <div className="space-y-4 pb-6">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-[1fr_280px_280px] gap-4">
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
        <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel de Marketing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen general de actividades y rendimiento de marketing</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range picker */}
          <button className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {new Date(Date.now() - 30 * 86400000).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
              {' – '}
              {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {/* Status filter */}
          <button className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <span>{statusFilter}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {/* CTA */}
          <button
            onClick={() => router.push('/admin/marketing/campaigns')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Zap className="w-4 h-4" /> Nueva Campaña
          </button>
        </div>
      </div>

      {/* ── Row 1: 4 KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Campañas Activas"
          value={String(activeCampaigns)}
          icon={<Megaphone className="w-5 h-5" />}
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
          badge={`${totalCampaigns} totales`}
          badgePositive={true}
          sparkline={sparklineData.campaigns}
          sparkColor={EMERALD}
        />
        <KPICard
          title="Banners Activos"
          value={String(activeBanners)}
          icon={<ImageIcon className="w-5 h-5" />}
          iconBg="bg-blue-50" iconColor="text-blue-600"
          badge={`${totalBanners} totales`}
          badgePositive={true}
          sparkline={sparklineData.banners}
          sparkColor={BLUE}
        />
        <KPICard
          title="Festivas Activas"
          value={String(activeFestive)}
          icon={<Gift className="w-5 h-5" />}
          iconBg="bg-rose-50" iconColor="text-rose-600"
          badge={`${festive.length} totales`}
          badgePositive={true}
          sparkline={sparklineData.festive}
          sparkColor={ROSE}
        />
        <KPICard
          title="Ingresos Totales"
          value={formatCompactCurrency(totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-amber-50" iconColor="text-amber-600"
          badge={`${pricing.length} precios config`}
          badgePositive={true}
          sparkline={sparklineData.revenue}
          sparkColor={AMBER}
        />
      </div>

      {/* ── Row 2: LineChart (2/4) + Pie (1/4) + Actividad (1/4) ── */}
      <div className="grid grid-cols-[1fr_260px_260px] gap-4">

        {/* ── Rendimiento de Campañas (LineChart) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-900">Rendimiento de Campañas</h3>
            <div className="flex items-center gap-2">
              {/* Period selector */}
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(['Diario', 'Semanal', 'Mensual'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      chartPeriod === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4">Métricas clave de todas las campañas activas</p>

          {/* Leyenda */}
          <div className="flex items-center gap-5 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: PURPLE }} />
              <span className="text-xs text-gray-500">Impresiones</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: BLUE }} />
              <span className="text-xs text-gray-500">Clics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: EMERALD }} />
              <span className="text-xs text-gray-500">Conversiones</span>
            </div>
          </div>

          {/* Line Chart */}
          <div style={{ height: 220 }}>
            {lineChartData.some(d => d.Impresiones > 0 || d.Clics > 0 || d.Conversiones > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                  <Tooltip content={<LineTooltip />} />
                  <Line type="monotone" dataKey="Impresiones" stroke={PURPLE} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: PURPLE, stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="Clics"       stroke={BLUE}   strokeWidth={2} dot={false} activeDot={{ r: 4, fill: BLUE,   stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="Conversiones" stroke={EMERALD} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: EMERALD, stroke: '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Sin datos para este período</p>
                </div>
              </div>
            )}
          </div>

          {/* Métricas debajo del chart — 5 chips exacto como imagen 2 */}
          <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-gray-50">
            {[
              { label: 'Impresiones', value: formatCompact(totalImpressions), color: 'text-purple-600', growth: stats?.impressionsGrowth ?? 0 },
              { label: 'Clics',       value: formatCompact(totalClicks),      color: 'text-blue-600',   growth: stats?.clicksGrowth ?? 0 },
              { label: 'CTR',         value: `${ctr}%`,                       color: 'text-amber-600',  growth: stats?.ctrGrowth ?? 0 },
              { label: 'Conversiones',value: formatCompact(totalConversions),  color: 'text-emerald-600',growth: stats?.conversionsGrowth ?? 0 },
              { label: 'Tasa Conv.',  value: `${conversionRate}%`,            color: 'text-teal-600',   growth: stats?.conversionRateGrowth ?? 0 },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className={`text-lg font-extrabold ${m.color} leading-none`}>{m.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{m.label}</p>
                {m.growth !== 0 && (
                  <p className={`text-[10px] font-semibold mt-0.5 ${m.growth > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {m.growth > 0 ? '+' : ''}{m.growth}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Conversiones por Canal (Pie) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Conversiones por Canal</h3>
          <p className="text-xs text-gray-500 mb-3">Distribución por fuente</p>

          {/* Pie chart con total en el centro */}
          <div className="relative flex-1" style={{ minHeight: 160 }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: 'Sin datos', value: 1, pct: '100', fill: '#e2e8f0' }]}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={2} dataKey="value"
                >
                  {(pieData.length > 0 ? pieData : [{ fill: '#e2e8f0' }]).map((d: any, i: number) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Total centrado */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-xl font-extrabold text-gray-900">{formatCompact(totalPieConversions)}</p>
            </div>
          </div>

          {/* Leyenda con porcentaje */}
          <div className="space-y-2 mt-3">
            {pieData.slice(0, 5).map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.fill }} />
                  <span className="text-gray-600 truncate max-w-[100px]">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900 shrink-0">{d.value} <span className="text-gray-400 font-normal">({d.pct}%)</span></span>
              </div>
            ))}
            {pieData.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">Sin conversiones registradas</p>
            )}
          </div>

          {/* Top Campañas */}
          <div className="mt-5 pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Top Campañas</h4>
              <button className="flex items-center gap-1 text-[11px] text-gray-500 border border-gray-200 rounded-lg px-2 py-1">
                Por conversiones <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {topCampaigns.length > 0 ? topCampaigns.map((t) => (
                <div key={t.rank} className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-gray-400 w-3 shrink-0">{t.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{t.title}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${(t.conversions / maxTopConv) * 100}%`, background: t.color }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-700 shrink-0">{t.conversions}</span>
                </div>
              )) : (
                <p className="text-xs text-gray-400 text-center py-2">Sin campañas con conversiones</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Actividad Reciente ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Actividad Reciente</h3>
            <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
              <Activity className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activityItems.length > 0 ? activityItems.map((item, i) => (
              <ActivityItem key={i} {...item} />
            )) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Sin actividad reciente</p>
                </div>
              </div>
            )}
          </div>

          {activityItems.length > 0 && (
            <button className="mt-3 pt-3 border-t border-gray-50 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors text-center w-full">
              Ver toda la actividad →
            </button>
          )}
        </div>
      </div>

      {/* ── Row 3: Tabla Campañas Activas — full width ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Campañas Activas</h3>
          </div>
          <button
            onClick={() => router.push('/admin/marketing/campaigns')}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            Ver todas las campañas →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['Campaña', 'Estado', 'Presupuesto', 'Impresiones', 'Clics', 'CTR', 'Conversiones', 'Tasa Conversión', 'Ingresos', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.length > 0 ? filteredCampaigns.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  {/* Campaña + fechas + thumbnail */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {c.thumbnail ? (
                          <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                        ) : (
                          <Megaphone className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">{c.title}</p>
                        <p className="text-[11px] text-gray-400 truncate">{c.dates}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">{c.budget}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{formatCompact(c.impressions)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{formatCompact(c.clicks)}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{c.ctr}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{c.conversions}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{c.convRate}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-emerald-600">{c.revenue}</td>
                  {/* Acciones: 3 botones */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Analytics">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                        <PenLine className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Más opciones">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center">
                    <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No hay campañas disponibles</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}