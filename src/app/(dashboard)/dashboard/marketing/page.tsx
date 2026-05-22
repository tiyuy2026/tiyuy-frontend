/**
 * Dashboard Marketing Page
 * Shows marketing options for Agent and Developer based on their plan
 */

'use client';

import { useAuthStore } from '@/presentation/store/authStore';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { useAgentMarketingStats } from '@/presentation/hooks/useAgent';
import { useDeveloperMarketingStats } from '@/presentation/hooks/useDeveloper';
import { Card } from '@/presentation/components/ui/Card';
import Link from 'next/link';
import { 
  Megaphone, Image, DollarSign, TrendingUp, 
  ArrowRight, Lock, Sparkles 
} from 'lucide-react';

export default function DashboardMarketingPage() {
  const { user } = useAuthStore();
  const { data: activeSubscription, isLoading: isLoadingPlan } = useActiveSubscription();

  const isAgent = user?.role === 'AGENT';
  const isDeveloper = user?.role === 'DEVELOPER';

  const { data: agentStats, isLoading: isLoadingAgent } = useAgentMarketingStats();
  const { data: developerStats, isLoading: isLoadingDeveloper } = useDeveloperMarketingStats();

  const stats = isAgent ? agentStats : developerStats;
  const isLoading = isLoadingAgent || isLoadingDeveloper || isLoadingPlan;

  const planName = activeSubscription?.plan?.name || 'FREE';
  const hasMarketingAccess = planName !== 'FREE';

  const marketingLinks = isAgent
    ? [
        { href: '/agent/marketing/campaigns', label: 'Mis Campañas', icon: Megaphone, desc: 'Crea y administra campañas', color: 'bg-blue-50 text-blue-600' },
        { href: '/agent/marketing/banners', label: 'Mis Banners', icon: Image, desc: 'Administra tus banners', color: 'bg-purple-50 text-purple-600' },
        { href: '/agent/marketing/pricing', label: 'Ver Precios', icon: DollarSign, desc: 'Consulta precios por ubicación', color: 'bg-green-50 text-green-600' },
      ]
    : [
        { href: '/dashboard/marketing/campaigns', label: 'Mis Campañas', icon: Megaphone, desc: 'Crea y administra campañas', color: 'bg-blue-50 text-blue-600' },
        { href: '/dashboard/marketing/banners', label: 'Mis Banners', icon: Image, desc: 'Administra tus banners', color: 'bg-purple-50 text-purple-600' },
        { href: '/dashboard/marketing/pricing', label: 'Ver Precios', icon: DollarSign, desc: 'Consulta precios por ubicación', color: 'bg-green-50 text-green-600' },
      ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-gray-500 mt-1">Promociona tus propiedades y proyectos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasMarketingAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
          <p className="text-gray-500 mt-1">Promociona tus propiedades y proyectos</p>
        </div>
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Funcionalidad bloqueada</h3>
            <p className="text-gray-600 max-w-md">
              Las herramientas de marketing están disponibles solo para planes pagos. 
              Actualiza tu plan para acceder a campañas promocionales, banners y más.
            </p>
            <Link 
              href="/plans"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-700 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Ver Planes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Campañas Activas', value: stats?.activeCampaigns ?? 0, total: stats?.totalCampaigns ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Banners Activos', value: stats?.activeBanners ?? 0, total: stats?.totalBanners ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Impresiones', value: stats?.totalImpressions ?? 0, color: 'text-amber-600', bg: 'bg-amber-50', format: true },
    { label: 'Clicks', value: stats?.totalClicks ?? 0, color: 'text-cyan-600', bg: 'bg-cyan-50', format: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="text-gray-500 mt-1">Promociona tus propiedades y proyectos</p>
      </div>

      {/* KPI Cards */}
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

      {/* Quick Access Links */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceso Rápido</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketingLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className={`p-3 rounded-lg ${link.color}`}>
                <link.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{link.label}</p>
                <p className="text-sm text-gray-500">{link.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>
          ))}
        </div>
      </Card>

      {/* Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">CTR</span>
              <span className="font-medium text-gray-900">
                {stats?.averageCTR != null ? `${stats.averageCTR.toFixed(2)}%` : '0%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(stats?.averageCTR ?? 0, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tasa de Conversión</span>
              <span className="font-medium text-gray-900">
                {stats?.totalConversions != null && stats?.totalImpressions != null && stats.totalImpressions > 0 
                  ? `${((stats.totalConversions / stats.totalImpressions) * 100).toFixed(2)}%` 
                  : '0%'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-teal-500 h-2 rounded-full" style={{ 
                width: `${Math.min(
                  stats?.totalConversions != null && stats?.totalImpressions != null && stats.totalImpressions > 0 
                    ? (stats.totalConversions / stats.totalImpressions) * 100 
                    : 0, 
                  100
                )}%` 
              }} />
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-500">
              Conversiones: <span className="font-semibold text-gray-900">
                {stats?.totalConversions?.toLocaleString('es-PE') ?? 0}
              </span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
