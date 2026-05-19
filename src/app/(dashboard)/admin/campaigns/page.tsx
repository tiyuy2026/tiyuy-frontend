/**
 * Admin Marketing Hub Page
 * Central hub for all marketing management (campaigns, banners, pricing, festive)
 */

'use client';

import { useMarketingStats } from '@/presentation/hooks/useAdmin';
import { Card } from '@/presentation/components/ui/Card';
import Link from 'next/link';

export default function AdminMarketingHubPage() {
  const { data: stats, isLoading } = useMarketingStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-gray-500 mt-1">Gestion de campanas, banners, precios y campanas festivas</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Campanas Activas', value: stats?.activeCampaigns ?? 0, total: stats?.totalCampaigns ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Banners Activos', value: stats?.activeBanners ?? 0, total: stats?.totalBanners ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Campanas Festivas', value: stats?.activeFestiveCampaigns ?? 0, total: stats?.totalFestiveCampaigns ?? 0, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Ingresos Totales', value: stats?.totalRevenue ?? 0, color: 'text-amber-600', bg: 'bg-amber-50', prefix: '$' },
  ];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="text-gray-500 mt-1">Gestion de campanas, banners, precios y campanas festivas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className={`${kpi.bg} border-0 p-4`}>
            <p className="text-sm text-gray-600 font-medium">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>
              {kpi.prefix || ''}{typeof kpi.value === 'number' ? kpi.value.toLocaleString('es-PE') : kpi.value}
            </p>
            {'total' in kpi && (
              <p className="text-xs text-gray-400 mt-1">
                de {kpi.total} totales
              </p>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/marketing" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            <h3 className="text-lg font-semibold text-gray-900">Panel de Marketing</h3>
            <p className="text-sm text-gray-500 mt-2">Vista general con metricas detalladas de rendimiento</p>
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span>CTR: {stats?.averageCTR != null ? `${(stats.averageCTR).toFixed(2)}%` : '0%'}</span>

              <span>Conversiones: {stats?.totalConversions?.toLocaleString('es-PE') ?? 0}</span>
            </div>
          </Card>
        </Link>

        <Link href="/admin/marketing/campaigns" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-emerald-500">
            <h3 className="text-lg font-semibold text-gray-900">Campanas</h3>
            <p className="text-sm text-gray-500 mt-2">Crea y administra campanas promocionales</p>
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span>{stats?.activeCampaigns ?? 0} activas</span>
              <span>{stats?.pendingApproval ?? 0} pendientes</span>
            </div>
          </Card>
        </Link>

        <Link href="/admin/marketing/banners" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-amber-500">
            <h3 className="text-lg font-semibold text-gray-900">Banners</h3>
            <p className="text-sm text-gray-500 mt-2">Administra los banners publicitarios del sitio</p>
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span>{stats?.activeBanners ?? 0} activos</span>
              <span>{stats?.totalBanners ?? 0} totales</span>
            </div>
          </Card>
        </Link>

        <Link href="/admin/marketing/pricing" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500">
            <h3 className="text-lg font-semibold text-gray-900">Precios</h3>
            <p className="text-sm text-gray-500 mt-2">Configura los precios por ubicacion de campanas</p>
          </Card>
        </Link>

        <Link href="/admin/marketing/festive" className="block">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-rose-500">
            <h3 className="text-lg font-semibold text-gray-900">Campanas Festivas</h3>
            <p className="text-sm text-gray-500 mt-2">Crea campanas especiales para fechas festivas</p>
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span>{stats?.activeFestiveCampaigns ?? 0} activas</span>

            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
