/**
 * Admin Marketing Hub Page
 * Premium SaaS-style dashboard for marketing management
 * Design: Stripe/Linear/Vercel inspired - minimal, elegant, enterprise
 */

'use client';

import { useMarketingStats } from '@/presentation/hooks/useAdmin';
import Link from 'next/link';
import {
  TrendingUp, DollarSign, Users, Eye, MousePointerClick,
  Megaphone, Image, Gift, Tag, ArrowUpRight, ArrowDownRight,
  BarChart3, Target,
} from 'lucide-react';

// ─── Format Helpers ─────────────────────────────────────────────────────────
const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatCompactCurrency = (value: number) => {
  if (value >= 1_000_000) return `S/ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `S/ ${(value / 1_000).toFixed(1)}K`;
  return `S/ ${value.toFixed(0)}`;
};

// ─── Stat Card Component ────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  progress?: { current: number; total: number };
}

function StatCard({ title, value, subtitle, icon, iconBg, iconColor, progress }: StatCardProps) {
  const pct = progress ? Math.round((progress.current / Math.max(progress.total, 1)) * 100) : undefined;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{title}</p>
      {progress && (
        <div className="mt-2">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${iconBg.replace('50', '500')}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{progress.current} de {progress.total}</p>
        </div>
      )}
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// ─── Module Card Component ──────────────────────────────────────────────────
interface ModuleCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badges?: { label: string; value: string | number; color?: string }[];
}

function ModuleCard({ title, description, href, icon, iconBg, iconColor, badges }: ModuleCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 h-full">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor} group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{description}</p>
            {badges && badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {badges.map((badge) => (
                  <span
                    key={badge.label}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      badge.color || 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {badge.value} {badge.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 mt-1" />
        </div>
      </div>
    </Link>
  );
}

// ─── Metric Chip Component ──────────────────────────────────────────────────
function MetricChip({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color} bg-opacity-10`}>
      <div className={`${color}`}>{icon}</div>
      <div>
        <p className={`text-xs font-semibold ${color}`}>{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AdminMarketingHubPage() {
  const { data: stats, isLoading } = useMarketingStats();

  if (isLoading) {
    return (
      <div className="space-y-4 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de campañas, banners, precios y campañas festivas</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const ctr = stats?.averageCTR != null ? `${stats.averageCTR.toFixed(2)}%` : '0%';
  const conversionRate = stats?.totalConversions != null && stats?.totalImpressions != null && stats.totalImpressions > 0
    ? `${((stats.totalConversions / stats.totalImpressions) * 100).toFixed(2)}%`
    : '0%';

  return (
    <div className="space-y-4 pb-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Marketing</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Gestión de campañas, banners, precios y campañas festivas
        </p>
      </div>

      {/* ── Row 1: 4 Stat Cards (compactas) ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Campañas Activas"
          value={String(stats?.activeCampaigns ?? 0)}
          icon={<Megaphone className="w-4 h-4" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          progress={{ current: stats?.activeCampaigns ?? 0, total: stats?.totalCampaigns ?? 0 }}
        />
        <StatCard
          title="Banners Activos"
          value={String(stats?.activeBanners ?? 0)}
          icon={<Image className="w-4 h-4" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          progress={{ current: stats?.activeBanners ?? 0, total: stats?.totalBanners ?? 0 }}
        />
        <StatCard
          title="Campañas Festivas"
          value={String(stats?.activeFestiveCampaigns ?? 0)}
          icon={<Gift className="w-4 h-4" />}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          progress={{ current: stats?.activeFestiveCampaigns ?? 0, total: stats?.totalFestiveCampaigns ?? 0 }}
        />
        <StatCard
          title="Ingresos Totales"
          value={formatCompactCurrency(stats?.totalRevenue ?? 0)}
          icon={<DollarSign className="w-4 h-4" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          subtitle="Generado por campañas"
        />
      </div>

      {/* ── Row 2: Hero Card - Panel de Marketing (full-width) ─────────── */}
      <Link href="/admin/marketing" className="block group">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Panel de Marketing</h3>
                <p className="text-sm text-gray-400">Vista general con métricas detalladas de rendimiento</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
          </div>
          <div className="flex flex-wrap gap-3">
            <MetricChip
              label="CTR"
              value={ctr}
              icon={<MousePointerClick className="w-3.5 h-3.5" />}
              color="text-emerald-400"
            />
            <MetricChip
              label="Conversiones"
              value={String(stats?.totalConversions?.toLocaleString('es-PE') ?? 0)}
              icon={<Target className="w-3.5 h-3.5" />}
              color="text-blue-400"
            />
            <MetricChip
              label="Impresiones"
              value={String(stats?.totalImpressions?.toLocaleString('es-PE') ?? 0)}
              icon={<Eye className="w-3.5 h-3.5" />}
              color="text-purple-400"
            />
            <MetricChip
              label="Clicks"
              value={String(stats?.totalClicks?.toLocaleString('es-PE') ?? 0)}
              icon={<MousePointerClick className="w-3.5 h-3.5" />}
              color="text-amber-400"
            />
            <MetricChip
              label="Tasa Conversión"
              value={conversionRate}
              icon={<TrendingUp className="w-3.5 h-3.5" />}
              color="text-cyan-400"
            />
          </div>
        </div>
      </Link>

      {/* ── Row 3: 3 columnas — Campañas, Banners, Festivas ────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModuleCard
          title="Campañas"
          description="Crea y administra campañas promocionales para impulsar tus productos y servicios"
          href="/admin/marketing/campaigns"
          icon={<Megaphone className="w-6 h-6" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          badges={[
            { label: 'activas', value: stats?.activeCampaigns ?? 0, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'pendientes', value: stats?.pendingApproval ?? 0, color: 'bg-amber-50 text-amber-700' },
          ]}
        />
        <ModuleCard
          title="Banners"
          description="Administra los banners publicitarios del sitio web y controla su rendimiento"
          href="/admin/marketing/banners"
          icon={<Image className="w-6 h-6" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          badges={[
            { label: 'activos', value: stats?.activeBanners ?? 0, color: 'bg-blue-50 text-blue-700' },
            { label: 'totales', value: stats?.totalBanners ?? 0, color: 'bg-gray-50 text-gray-600' },
          ]}
        />
        <ModuleCard
          title="Campañas Festivas"
          description="Crea campañas especiales para fechas festivas y temporadas del año"
          href="/admin/marketing/festive"
          icon={<Gift className="w-6 h-6" />}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          badges={[
            { label: 'activas', value: stats?.activeFestiveCampaigns ?? 0, color: 'bg-rose-50 text-rose-700' },
          ]}
        />
      </div>

      {/* ── Row 4: Precios como card secundaria sutil ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModuleCard
          title="Precios"
          description="Configura los precios por ubicación de campañas publicitarias"
          href="/admin/marketing/pricing"
          icon={<Tag className="w-6 h-6" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <div className="md:col-span-2" />
      </div>

    </div>
  );
}
