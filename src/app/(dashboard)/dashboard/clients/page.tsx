'use client';

import { useState } from 'react';
import { useClientCRM } from '@/presentation/hooks/useClientCRM';
import { useAuthStore } from '@/presentation/store/authStore';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { StockTickerCards } from './components/StockTickerCards';
import { RealTimeHeatmap } from './components/RealTimeHeatmap';
import { InteractiveActivityChart } from './components/InteractiveActivityChart';
import { ClientList } from './components/ClientList';
import { ClientInsightsPanel } from './components/ClientInsightsPanel';
import { HotLeadsPanel } from './components/HotLeadsPanel';
import { ConversionPipeline } from './components/ConversionPipeline';
import { PropertyMatchesPanel } from './components/PropertyMatchesPanel';
import { CRMClient } from '@/core/domain/entities/CRM';
import {
  ArrowLeft,
  Users,
  Zap,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

type TabView = 'principal' | 'estadisticas' | 'avanzado';

export default function CRMDashboardPage() {
  const { user } = useAuthStore();
  const {
    clients,
    metrics,
    heatmapData,
    isLoading,
    filterClients,
  } = useClientCRM(user?.id);

  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>('principal');

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['AGENT', 'DEVELOPER', 'ADMIN']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando panel de clientes...</p>
            <p className="text-sm text-gray-400 mt-2">Sincronizando contactos, leads y propiedades</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['AGENT', 'DEVELOPER', 'ADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal-50 rounded-lg">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Clientes CRM</h1>
                  </div>
                  <p className="text-sm text-gray-400 ml-[42px]">
                    Panel inteligente de análisis y seguimiento
                  </p>
                </div>
              </div>

              {/* Tabs pequeños y elegantes en el header */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('principal')}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                    ${activeTab === 'principal'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Users className="w-3.5 h-3.5" />
                  Principal
                </button>
                <button
                  onClick={() => setActiveTab('estadisticas')}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                    ${activeTab === 'estadisticas'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Estadísticas
                </button>
                <button
                  onClick={() => setActiveTab('avanzado')}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                    ${activeTab === 'avanzado'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Zap className="w-3.5 h-3.5" />
                  CRM Avanzado
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* VISTA PRINCIPAL - Tarjetas + Heatmap */}
          {activeTab === 'principal' && (
            <>
              <StockTickerCards metrics={metrics} />
              <RealTimeHeatmap clients={clients} heatmapData={heatmapData} />
            </>
          )}

          {/* VISTA ESTADÍSTICAS */}
          {activeTab === 'estadisticas' && (
            <div className="space-y-6">
              {/* KPI Cards - ancho completo */}
              <ClientInsightsPanel
                metrics={metrics}
                topClients={metrics.topEngagedClients}
                atRiskClients={metrics.clientsAtRisk}
              />

              {/* ClientList + Top Clientes lado a lado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClientList
                  clients={clients}
                  filterClients={filterClients}
                  selectedClientId={selectedClient?.id}
                  onClientSelect={setSelectedClient}
                />
                {/* Top Clientes */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Más Comprometidos
                    </h3>
                    <span className="text-xs text-gray-400">Top 5</span>
                  </div>
                  <div className="space-y-2">
                    {metrics.topEngagedClients.length === 0 ? (
                      <p className="text-gray-500 text-center py-3 text-sm">No hay datos suficientes</p>
                    ) : (
                      metrics.topEngagedClients.slice(0, 5).map((client, index) => (
                        <div key={client.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 
                              flex items-center justify-center text-white font-semibold text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{client.name}</p>
                              <p className="text-xs text-gray-500">
                                {client.messageActivity.totalMessages} mensajes · {client.totalInteractions} interacciones
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                              <span className="font-bold text-blue-600 text-sm">{client.interactionScore}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {client.daysSinceLastActivity <= 7 ? 'Activo reciente' : `Hace ${client.daysSinceLastActivity} días`}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Gráfica al final */}
              <InteractiveActivityChart metrics={metrics} />
            </div>
          )}

          {/* VISTA CRM AVANZADO */}
          {activeTab === 'avanzado' && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">CRM Avanzado</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <HotLeadsPanel />
                  <ConversionPipeline />
                  <PropertyMatchesPanel />
                </div>
              </div>
            </>
          )}

          {/* Selected Client Detail */}
          {selectedClient && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-white">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-1 bg-teal-100 rounded-lg">
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  Detalle: {selectedClient.name}
                </h3>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2 text-sm">
                      Mensajes
                    </h4>
                    <div className="space-y-1">
                      <p className="text-blue-700 text-sm">
                        <span className="font-semibold">{selectedClient.messageActivity.totalMessages}</span> total
                      </p>
                      <p className="text-blue-600 text-sm">
                        <span className="font-semibold">{selectedClient.messageActivity.sentMessages}</span> enviados
                      </p>
                      <p className="text-blue-600 text-sm">
                        <span className="font-semibold">{selectedClient.messageActivity.receivedMessages}</span> recibidos
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                    <h4 className="font-medium text-teal-900 mb-2 flex items-center gap-2 text-sm">
                      Grupos
                    </h4>
                    <div className="space-y-1">
                      <p className="text-teal-700 text-sm">
                        <span className="font-semibold">{selectedClient.groupActivity.groupsJoined}</span> grupos
                      </p>
                      <p className="text-teal-600 text-sm">
                        <span className="font-semibold">{selectedClient.groupActivity.postsCreated}</span> posts
                      </p>
                      <p className="text-teal-600 text-sm">
                        <span className="font-semibold">{selectedClient.groupActivity.commentsMade}</span> comentarios
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2 text-sm">
                      Canales
                    </h4>
                    <div className="space-y-1">
                      <p className="text-purple-700 text-sm">
                        <span className="font-semibold">{selectedClient.channelActivity.channelsSubscribed}</span> suscripciones
                      </p>
                      <p className="text-purple-600 text-sm">
                        <span className="font-semibold">{selectedClient.channelActivity.eventsAttended}</span> eventos
                      </p>
                      <p className="text-purple-600 text-sm">
                        <span className="font-semibold">{selectedClient.channelActivity.eventResponses}</span> respuestas
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2 text-sm">
                      Propiedades
                    </h4>
                    <div className="space-y-1">
                      <p className="text-amber-700 text-sm">
                        <span className="font-semibold">{selectedClient.propertyActivity.propertiesViewed}</span> vistas
                      </p>
                      <p className="text-amber-600 text-sm">
                        <span className="font-semibold">{selectedClient.propertyActivity.inquiriesMade}</span> consultas
                      </p>
                      <p className="text-amber-600 text-sm">
                        <span className="font-semibold">{selectedClient.propertyActivity.favoritesAdded}</span> favoritos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <span className="text-xs text-gray-400">Score</span>
                      <p className="text-lg font-bold text-teal-600">{selectedClient.interactionScore}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-400">Engagement</span>
                      <p className="text-lg font-bold text-emerald-600">{selectedClient.engagementRate}%</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-400">Última Actividad</span>
                      <p className="text-sm font-medium text-gray-700">
                        {selectedClient.daysSinceLastActivity === 0 ? 'Hoy' :
                         selectedClient.daysSinceLastActivity === 1 ? 'Ayer' :
                         `Hace ${selectedClient.daysSinceLastActivity} días`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/clients/${selectedClient.id}`}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    Ver Detalle →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}