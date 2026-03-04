'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { 
  useDashboardStats, 
  usePropertyStats 
} from '@/presentation/hooks/useAnalytics';
import { StatsCard } from '@/presentation/components/analytics/StatsCard/StatsCard';
import { PropertyChart } from '@/presentation/components/analytics/PropertyChart/PropertyChart';

export default function AnalyticsPage() {
  const { data: dashboardStats, isLoading } = useDashboardStats();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const { data: propertyStats } = usePropertyStats(selectedPropertyId);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 h-32" />
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!dashboardStats) return null;

  const { globalSummary, topPropertiesByViews, periodComparison } = dashboardStats;

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Analytics</h1>
          <p className="text-xl text-gray-600">
            Estadísticas de rendimiento de tus propiedades
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard
            title="Vistas totales"
            value={globalSummary.totalViews.toLocaleString()}
            change={periodComparison.viewsGrowth * 100}
            trend={periodComparison.viewsGrowth > 0 ? 'UP' : 'DOWN'}
            icon="👁️"
          />
          <StatsCard
            title="Contactos"
            value={globalSummary.totalContacts.toLocaleString()}
            change={periodComparison.contactsGrowth * 100}
            trend={periodComparison.contactsGrowth > 0 ? 'UP' : 'DOWN'}
            icon="💬"
          />
          <StatsCard
            title="Favoritos"
            value={globalSummary.totalFavorites.toLocaleString()}
            change={0}
            trend="STABLE"
            icon="❤️"
          />
          <StatsCard
            title="Propiedades"
            value={globalSummary.totalProperties}
            change={0}
            trend="STABLE"
            icon="🏠"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top propiedades por vistas - con selector */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold mb-6">🏆 Top propiedades por vistas</h3>
            <div className="space-y-4">
              {topPropertiesByViews.slice(0, 5).map((prop, index) => (
                <div 
                  key={prop.propertyId} 
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedPropertyId(prop.propertyId)}
                >
                  <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{prop.title}</p>
                    <p className="text-sm text-gray-500 truncate">/{prop.slug}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-gray-900">{prop.views}</p>
                    <p className="text-xs text-gray-500">vistas</p>
                  </div>
                  {selectedPropertyId === prop.propertyId && (
                    <span className="ml-2 text-blue-500 text-sm">📊 Ver detalle</span>
                  )}
                </div>
              ))}
            </div>
            {selectedPropertyId && (
              <button
                onClick={() => setSelectedPropertyId(null)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Ver todas las propiedades
              </button>
            )}
          </div>

          {/* Gráfico de crecimiento */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold mb-6">📈 Crecimiento semanal</h3>
            <div className="space-y-4 text-center">
              <div className="text-4xl font-bold text-gray-900">
                {periodComparison.viewsCurrent.toLocaleString()}
              </div>
              <div className={`text-2xl font-bold ${
                periodComparison.viewsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {periodComparison.viewsGrowth >= 0 ? '+' : ''}{periodComparison.viewsGrowth.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">
                vs semana anterior ({periodComparison.viewsPrevious.toLocaleString()})
              </p>
            </div>
          </div>
        </div>

        {/* Charts - solo para propiedad seleccionada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {selectedPropertyId && propertyStats ? (
            <>
              <PropertyChart 
                data={propertyStats.viewsByDay} 
                title={`Vistas por día (${propertyStats.summary.totalViews.toLocaleString()})`} 
              />
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-lg font-semibold mb-4">📱 Dispositivos</h3>
                <div className="space-y-3">
                  {Object.entries(propertyStats.viewsByDevice || {}).map(([device, count]) => (
                    <div key={device} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">{device.toLowerCase()}</span>
                      <span className="font-bold text-lg">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 col-span-full lg:col-span-2">
              <h3 className="text-xl font-bold mb-6">📊 Gráficos detallados</h3>
              <p className="text-gray-600 mb-4">
                Haz clic en una propiedad del top para ver sus gráficos de vistas por día, dispositivos y más.
              </p>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-lg font-semibold text-gray-900">Selecciona una propiedad</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
