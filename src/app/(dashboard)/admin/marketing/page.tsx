/**
 * Marketing Dashboard Page
 * Shows overview of all marketing activities
 */

'use client';

import { useMarketingStats } from '@/presentation/hooks/useAdmin';
import { Card } from '@/presentation/components/ui/Card';


export default function MarketingDashboardPage() {
  const { data: stats, isLoading } = useMarketingStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Marketing</h1>
          <p className="text-gray-500 mt-1">Resumen general de actividades de marketing</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }


  const kpiCards = [
    { label: 'Campañas Activas', value: stats?.activeCampaigns ?? 0, total: stats?.totalCampaigns ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Banners Activos', value: stats?.activeBanners ?? 0, total: stats?.totalBanners ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Festivas Activas', value: stats?.activeFestiveCampaigns ?? 0, total: stats?.totalFestiveCampaigns ?? 0, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Impresiones', value: stats?.totalImpressions ?? 0, color: 'text-amber-600', bg: 'bg-amber-50', format: true },
    { label: 'Clicks', value: stats?.totalClicks ?? 0, color: 'text-cyan-600', bg: 'bg-cyan-50', format: true },
    { label: 'CTR Promedio', value: stats?.averageCTR != null ? `${stats.averageCTR.toFixed(2)}%` : '0%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Tasa Conversion', value: stats?.totalConversions != null && stats?.totalImpressions != null && stats.totalImpressions > 0 ? `${((stats.totalConversions / stats.totalImpressions) * 100).toFixed(2)}%` : '0%', color: 'text-teal-600', bg: 'bg-teal-50' },
  ];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Marketing</h1>
        <p className="text-gray-500 mt-1">Resumen general de actividades de marketing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className={`${kpi.bg} border-0 p-4`}>
            <p className="text-sm text-gray-600 font-medium">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>
              {kpi.format ? (kpi.value as number).toLocaleString('es-PE') : kpi.value}
            </p>
            {'total' in kpi && (
              <p className="text-xs text-gray-400 mt-1">
                de {kpi.total} totales
              </p>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceso Rapido</h3>
          <div className="space-y-3">
            <a href="/admin/marketing/campaigns" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Gestionar Campañas</p>
              <p className="text-sm text-gray-500">Crear y administrar campañas promocionales</p>
            </a>
            <a href="/admin/marketing/banners" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Gestionar Banners</p>
              <p className="text-sm text-gray-500">Administrar banners publicitarios</p>
            </a>
            <a href="/admin/marketing/pricing" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Gestionar Precios</p>
              <p className="text-sm text-gray-500">Configurar precios por ubicacion</p>
            </a>
            <a href="/admin/marketing/festive" className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Campañas Festivas</p>
              <p className="text-sm text-gray-500">Administrar campañas por temporada</p>
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Rendimiento</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tasa de Clickeo (CTR)</span>
                <span className="font-medium text-gray-900">{stats?.averageCTR != null ? `${stats.averageCTR.toFixed(2)}%` : '0%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(stats?.averageCTR ?? 0, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tasa de Conversion</span>
                <span className="font-medium text-gray-900">{stats?.totalConversions != null && stats?.totalImpressions != null && stats.totalImpressions > 0 ? `${((stats.totalConversions / stats.totalImpressions) * 100).toFixed(2)}%` : '0%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min(stats?.totalConversions != null && stats?.totalImpressions != null && stats.totalImpressions > 0 ? (stats.totalConversions / stats.totalImpressions) * 100 : 0, 100)}%` }} />
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500">
                Conversiones: <span className="font-semibold text-gray-900">{stats?.totalConversions?.toLocaleString('es-PE') ?? 0}</span>
              </p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
