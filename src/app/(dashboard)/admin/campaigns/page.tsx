/**
 * Admin Campaigns Dashboard
 * Premium SaaS dashboard - Stripe/Linear/Vercel inspired
 * ALL DATA FROM REAL BACKEND APIs - No simulated data
 */

'use client';

import { useState, useMemo } from 'react';
import {
  useMarketingStats,
  usePromotionCampaigns,
  useBanners,
  useFestiveCampaigns,
  useCampaignPricingList,
} from '@/presentation/hooks/useAdmin';
import {
  TrendingUp, DollarSign, Megaphone, Image, Gift,
  Eye, MousePointerClick, Target, BarChart3,
  XCircle, AlertCircle, Calendar,
  Activity, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

// ─── Colors ─────────────────────────────────────────────────────────────────
const TEAL = '#0ea5e9';
const EMERALD = '#10b981';
const AMBER = '#f59e0b';
const ROSE = '#f43f5e';
const PURPLE = '#8b5cf6';
const GRAY = '#64748b';

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

// ─── Mini Sparkline from real data ──────────────────────────────────────────
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 60, h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// ─── KPI Card (110px height exact) ──────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean };
  sparkline?: number[];
  sparkColor?: string;
}

function KPICard({ title, value, icon, iconBg, iconColor, trend, sparkline, sparkColor }: KPICardProps) {
  return (
    <div className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-[18px] flex items-center justify-between" style={{ height: 110 }}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-[32px] font-extrabold text-gray-900 leading-none tracking-tight">{value}</p>
          <p className="text-[13px] text-gray-500 font-medium mt-1">{title}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              {trend.positive ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingUp className="w-3 h-3 text-rose-500 rotate-180" />
              )}
              <span className={`text-[11px] font-semibold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
      </div>
      {sparkline && sparkColor && <MiniSparkline data={sparkline} color={sparkColor} />}
    </div>
  );
}

// ─── Activity Item ──────────────────────────────────────────────────────────
interface ActivityItemProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  time: string;
}

function ActivityItem({ icon, iconBg, iconColor, title, subtitle, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
      <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">{time}</span>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700',
    INACTIVE: 'bg-gray-100 text-gray-600',
    SCHEDULED: 'bg-blue-50 text-blue-700',
    EXPIRED: 'bg-red-50 text-red-700',
    PENDING: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function AdminCampaignsDashboard() {
  const [chartTab, setChartTab] = useState<'campaigns' | 'revenue'>('campaigns');

  // ── ALL DATA FROM REAL BACKEND APIs ─────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useMarketingStats();
  const { data: campaignsData } = usePromotionCampaigns({ page: 0, size: 50 });
  const { data: bannersData } = useBanners();
  const { data: festiveData } = useFestiveCampaigns();
  const { data: pricingData } = useCampaignPricingList();

  const campaigns = Array.isArray(campaignsData) ? campaignsData : (campaignsData?.content || []);
  const banners = Array.isArray(bannersData) ? bannersData : [];
  const festive = Array.isArray(festiveData) ? festiveData : [];
  const pricing = Array.isArray(pricingData) ? pricingData : [];

  // ── REAL metrics from MarketingStats API ────────────────────────────────
  const activeCampaigns = stats?.activeCampaigns ?? campaigns.filter(c => c.status === 'ACTIVE').length;
  const totalCampaigns = stats?.totalCampaigns ?? campaigns.length;
  const activeBanners = stats?.activeBanners ?? banners.filter(b => b.isActive).length;
  const totalBanners = stats?.totalBanners ?? banners.length;
  const activeFestive = stats?.activeFestiveCampaigns ?? festive.filter(f => f.isActive).length;
  const totalFestive = stats?.totalFestiveCampaigns ?? festive.length;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalImpressions = stats?.totalImpressions ?? campaigns.reduce((s, c) => s + (c.impressions || 0), 0) + banners.reduce((s, b) => s + (b.impressions || 0), 0);
  const totalClicks = stats?.totalClicks ?? campaigns.reduce((s, c) => s + (c.clicks || 0), 0) + banners.reduce((s, b) => s + (b.clicks || 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const totalConversions = stats?.totalConversions ?? 0;
  const conversionRate = totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(2) : '0.00';
  const pendingApproval = stats?.pendingApproval ?? campaigns.filter(c => c.status === 'PENDING').length;
  const expiredCampaigns = stats?.expiredCampaigns ?? campaigns.filter(c => c.status === 'EXPIRED').length;
  const pricingCount = pricing.length;

  // ── REAL chart data from campaigns ──────────────────────────────────────
  const chartData = useMemo(() => {
    if (chartTab === 'campaigns') {
      const statuses = ['ACTIVE', 'SCHEDULED', 'PENDING', 'EXPIRED', 'INACTIVE'];
      return statuses.map(s => ({
        name: s,
        value: campaigns.filter(c => c.status === s).length,
        fill: s === 'ACTIVE' ? EMERALD : s === 'SCHEDULED' ? TEAL : s === 'PENDING' ? AMBER : s === 'EXPIRED' ? ROSE : GRAY,
      }));
    }
    // Revenue by promotion type (real data)
    const types: Record<string, number> = {};
    campaigns.forEach(c => {
      if (c.pricePaid) {
        types[c.promotionType] = (types[c.promotionType] || 0) + c.pricePaid;
      }
    });
    const colors = [EMERALD, TEAL, PURPLE, AMBER, ROSE];
    return Object.entries(types).map(([k, v], i) => ({
      name: k,
      value: v,
      fill: colors[i % colors.length],
    }));
  }, [chartTab, campaigns]);

  // ── REAL sparkline data from campaign dates ────────────────────────────
  const sparklineData = useMemo(() => {
    // Group campaigns by month (last 6 months) for real sparklines
    const now = new Date();
    const months: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(campaigns.filter(c => {
        const d = new Date(c.startDate);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).length);
    }
    return {
      campaigns: months,
      banners: months.map((_, i) => banners.filter(b => {
        const d = new Date(b.startDate);
        const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).length),
      festive: months.map((_, i) => festive.filter(f => {
        const d = new Date(f.startDate);
        const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).length),
      revenue: months.map((_, i) => campaigns
        .filter(c => {
          const d = new Date(c.startDate);
          const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
        })
        .reduce((s, c) => s + (c.pricePaid || 0), 0)
      ),
    };
  }, [campaigns, banners, festive]);

  // ── REAL activity feed from backend data ───────────────────────────────
  const activityItems = useMemo(() => {
    const items: ActivityItemProps[] = [];

    campaigns.filter(c => c.status === 'ACTIVE').slice(0, 2).forEach(c => {
      items.push({
        icon: <Megaphone className="w-4 h-4" />,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        title: `Campaña activa: ${c.title}`,
        subtitle: `${c.promotionType} · ${c.placementLocation}`,
        time: 'Ahora',
      });
    });

    campaigns.filter(c => c.status === 'PENDING').slice(0, 2).forEach(c => {
      items.push({
        icon: <AlertCircle className="w-4 h-4" />,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        title: `Pendiente: ${c.title}`,
        subtitle: 'Esperando aprobación',
        time: 'Pendiente',
      });
    });

    banners.filter(b => b.isActive).slice(0, 2).forEach(b => {
      items.push({
        icon: <Image className="w-4 h-4" />,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        title: `Banner activo: ${b.title}`,
        subtitle: `${b.placement} · ${(b.impressions || 0).toLocaleString('es-PE')} imp`,
        time: 'Activo',
      });
    });

    festive.filter(f => f.isActive).slice(0, 2).forEach(f => {
      items.push({
        icon: <Gift className="w-4 h-4" />,
        iconBg: 'bg-rose-50',
        iconColor: 'text-rose-600',
        title: `Festiva activa: ${f.name}`,
        subtitle: `${f.festiveType} · ${f.discountPercentage || 0}% desc`,
        time: 'Activa',
      });
    });

    campaigns.filter(c => c.status === 'EXPIRED').slice(0, 1).forEach(c => {
      items.push({
        icon: <XCircle className="w-4 h-4" />,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-600',
        title: `Expirada: ${c.title}`,
        subtitle: 'Campaña finalizada',
        time: 'Expirada',
      });
    });

    return items.slice(0, 8);
  }, [campaigns, banners, festive]);

  // ── REAL recent campaigns table ────────────────────────────────────────
  const recentCampaigns = useMemo(() =>
    campaigns.slice(0, 5).map(c => ({
      id: c.id,
      title: c.title,
      type: c.promotionType,
      status: c.status,
      price: c.pricePaid ? `${c.currency || 'USD'} ${c.pricePaid.toLocaleString()}` : '-',
      impressions: c.impressions || 0,
      clicks: c.clicks || 0,
    })),
    [campaigns]
  );

  if (statsLoading) {
    return (
      <div className="space-y-4 pb-6" style={{ background: '#f5f7fb' }}>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[18px] bg-gray-100 animate-pulse" style={{ height: 110 }} />
          ))}
        </div>
        <div className="grid grid-cols-[1fr_340px] gap-4">
          <div className="rounded-[20px] bg-gray-100 animate-pulse" style={{ height: 380 }} />
          <div className="rounded-[20px] bg-gray-100 animate-pulse" style={{ height: 380 }} />
        </div>
        <div className="rounded-[20px] bg-gray-100 animate-pulse" style={{ height: 260 }} />
      </div>
    );
  }

  return (
    <div className="pb-6" style={{ background: '#f5f7fb' }}>
      <div className="space-y-4">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Inter' }}>Campañas</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">Panel de control de campañas publicitarias</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">Últimos 30 días</span>
            </div>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:shadow-md transition-all">
              <Zap className="w-4 h-4" /> Nueva Campaña
            </button>
          </div>
        </div>

        {/* ── Row 1: 4 KPI Cards (110px height) ───────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            title="Campañas Activas"
            value={String(activeCampaigns)}
            icon={<Megaphone className="w-4 h-4" />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            trend={{ value: `${totalCampaigns} totales`, positive: true }}
            sparkline={sparklineData.campaigns}
            sparkColor={EMERALD}
          />
          <KPICard
            title="Banners Activos"
            value={String(activeBanners)}
            icon={<Image className="w-4 h-4" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            trend={{ value: `${totalBanners} totales`, positive: activeBanners >= (totalBanners / 2) }}
            sparkline={sparklineData.banners}
            sparkColor={TEAL}
          />
          <KPICard
            title="Festivas Activas"
            value={String(activeFestive)}
            icon={<Gift className="w-4 h-4" />}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            trend={{ value: `${totalFestive} totales`, positive: activeFestive >= (totalFestive / 2) }}
            sparkline={sparklineData.festive}
            sparkColor={ROSE}
          />
          <KPICard
            title="Ingresos Totales"
            value={formatCompactCurrency(totalRevenue)}
            icon={<DollarSign className="w-4 h-4" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            trend={{ value: `${pricingCount} precios config`, positive: true }}
            sparkline={sparklineData.revenue}
            sparkColor={AMBER}
          />
        </div>

        {/* ── Row 2: Chart (70%) + Activity (30%) ─────────────────────────── */}
        <div className="grid grid-cols-[1fr_340px] gap-4">

          {/* ── Main Chart ────────────────────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-5" style={{ height: 380 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-semibold text-gray-900">Analytics de Campañas</h3>
                <div className="flex gap-1 bg-gray-50 rounded-lg p-0.5">
                  <button
                    onClick={() => setChartTab('campaigns')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartTab === 'campaigns' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Campañas
                  </button>
                  <button
                    onClick={() => setChartTab('revenue')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartTab === 'revenue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Ingresos
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Activas</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pendientes</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Expiradas</span>
              </div>
            </div>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                {chartTab === 'campaigns' ? (
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TEAL} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="value" stroke={TEAL} fill="url(#chartGrad)" strokeWidth={2} />
                  </AreaChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 12 }}
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center" style={{ height: 260 }}>
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Sin datos disponibles</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-50">
              <div>
                <p className="text-[11px] text-gray-400">CTR Global</p>
                <p className="text-sm font-bold text-gray-900">{ctr}%</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Conversiones</p>
                <p className="text-sm font-bold text-gray-900">{formatCompact(totalConversions)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Tasa Conv.</p>
                <p className="text-sm font-bold text-gray-900">{conversionRate}%</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Impresiones</p>
                <p className="text-sm font-bold text-gray-900">{formatCompact(totalImpressions)}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Clicks</p>
                <p className="text-sm font-bold text-gray-900">{formatCompact(totalClicks)}</p>
              </div>
            </div>
          </div>

          {/* ── Activity Feed ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-5" style={{ height: 380 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Actividad Reciente</h3>
              <span className="text-[11px] text-gray-400 font-medium">{activityItems.length} eventos</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 310 }}>
              {activityItems.length > 0 ? activityItems.map((item, i) => (
                <ActivityItem key={i} {...item} />
              )) : (
                <div className="flex items-center justify-center" style={{ height: 200 }}>
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Sin actividad reciente</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 3: Mini Stats Row ────────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{pendingApproval}</p>
              <p className="text-[11px] text-gray-500">Pendientes</p>
            </div>
          </div>
          <div className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{expiredCampaigns}</p>
              <p className="text-[11px] text-gray-500">Expiradas</p>
            </div>
          </div>
          <div className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{formatCompact(totalImpressions)}</p>
              <p className="text-[11px] text-gray-500">Impresiones</p>
            </div>
          </div>
          <div className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{formatCompact(totalClicks)}</p>
              <p className="text-[11px] text-gray-500">Clicks</p>
            </div>
          </div>
          <div className="bg-white rounded-[18px] border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{ctr}%</p>
              <p className="text-[11px] text-gray-500">CTR</p>
            </div>
          </div>
        </div>

        {/* ── Row 4: Recent Campaigns Table ────────────────────────────────── */}
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-[0_2px_8px_rgba(15,23,42,0.05)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Campañas Recientes</h3>
            <button className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">Ver todas →</button>
          </div>
          <div className="overflow-x-auto" style={{ maxHeight: 260 }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Campaña</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Tipo</th>
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Estado</th>
                  <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Precio</th>
                  <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Imp.</th>
                  <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.length > 0 ? recentCampaigns.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <span className="text-sm font-medium text-gray-900">{c.title}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs text-gray-600">{c.type}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-xs font-semibold text-gray-900">{c.price}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-xs text-gray-600">{formatCompact(c.impressions)}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-xs text-gray-600">{formatCompact(c.clicks)}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <p className="text-sm text-gray-400">No hay campañas disponibles</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
