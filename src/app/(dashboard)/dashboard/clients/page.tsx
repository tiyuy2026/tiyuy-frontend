'use client';

import { useState } from 'react';
import { useClientCRM } from '@/presentation/hooks/useClientCRM';
import { useAuthStore } from '@/presentation/store/authStore';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { CRMMetricsCharts } from './components/CRMMetricsCharts';
import { ClientActivityHeatmap } from './components/ClientActivityHeatmap';
import { ClientInsightsPanel } from './components/ClientInsightsPanel';
import { ClientList } from './components/ClientList';
import { HotLeadsPanel } from './components/HotLeadsPanel';
import { ConversionPipeline } from './components/ConversionPipeline';
import { PropertyMatchesPanel } from './components/PropertyMatchesPanel';
import { CRMClient } from '@/core/domain/entities/CRM';
import { 
  Users, 
  RefreshCw, 
  ArrowLeft,
  BarChart3,
  Activity,
  Target,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Clock,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function CRMDashboardPage() {
  const { user } = useAuthStore();
  const { 
    clients, 
    metrics, 
    heatmapData, 
    isLoading, 
    filterClients,
    refetch 
  } = useClientCRM(user?.id);
  
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);

  if (isLoading) {
    return (
      <ProtectedRoute requiredRoles={['AGENT', 'DEVELOPER', 'ADMIN']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando panel de clientes...</p>
            <p className="text-sm text-gray-400 mt-2">Sincronizando contactos, leads y propiedades</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['AGENT', 'DEVELOPER', 'ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
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
                  <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
                  <p className="text-sm text-gray-500">Panel de análisis y seguimiento de clientes</p>
                </div>
              </div>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Total Clientes</span>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalClients}</p>
              {metrics.newClientsThisWeek > 0 && (
                <p className="text-xs text-green-600 mt-1">+{metrics.newClientsThisWeek} esta semana</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Activos</span>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeClients}</p>
              <p className="text-xs text-gray-400 mt-1">
                {Math.round((metrics.activeClients / Math.max(metrics.totalClients, 1)) * 100)}% del total
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Alto Interés</span>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.highInterestClients}</p>
              <p className="text-xs text-gray-400 mt-1">Prioridad de seguimiento</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Interacciones</span>
                <div className="p-2 bg-teal-50 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.messagesExchanged}</p>
              <p className="text-xs text-gray-400 mt-1">Mensajes + Contactos</p>
            </div>
          </div>

          {/* Charts + Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CRMMetricsCharts metrics={metrics} />
            </div>
            <div>
              <ClientActivityHeatmap 
                heatmapData={heatmapData}
                clients={clients}
                selectedClientId={selectedClient?.id}
                onClientSelect={(id) => {
                  const client = clients.find(c => c.id === id);
                  if (client) setSelectedClient(client);
                }}
              />
            </div>
          </div>

          {/* Client List + Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ClientList 
                clients={clients}
                filterClients={filterClients}
                selectedClientId={selectedClient?.id}
                onClientSelect={setSelectedClient}
              />
            </div>
            <div className="lg:col-span-2">
              <ClientInsightsPanel 
                metrics={metrics}
                topClients={metrics.topEngagedClients}
                atRiskClients={metrics.clientsAtRisk}
              />
            </div>
          </div>

          {/* CRM Avanzado */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">CRM Avanzado</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <HotLeadsPanel />
              <ConversionPipeline />
              <PropertyMatchesPanel />
            </div>
          </div>

          {/* Selected Client Detail */}
          {selectedClient && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  Detalle: {selectedClient.name}
                </h3>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2 text-sm">
                      <MessageSquare className="w-4 h-4" />
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

                  <div className="p-4 bg-teal-50 rounded-lg">
                    <h4 className="font-medium text-teal-900 mb-2 flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
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

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4" />
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

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4" />
                      Propiedades
                    </h4>
                    <div className="space-y-1">
                      <p className="text-orange-700 text-sm">
                        <span className="font-semibold">{selectedClient.propertyActivity.propertiesViewed}</span> vistas
                      </p>
                      <p className="text-orange-600 text-sm">
                        <span className="font-semibold">{selectedClient.propertyActivity.inquiriesMade}</span> consultas
                      </p>
                      <p className="text-orange-600 text-sm">
                        <span className="font-semibold">{selectedClient.propertyActivity.favoritesAdded}</span> favoritos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-xs text-gray-500">Score</span>
                      <p className="text-lg font-bold text-blue-600">{selectedClient.interactionScore}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Engagement</span>
                      <p className="text-lg font-bold text-teal-600">{selectedClient.engagementRate}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Última Actividad</span>
                      <p className="text-sm font-medium text-gray-700">
                        {selectedClient.daysSinceLastActivity === 0 ? 'Hoy' :
                         selectedClient.daysSinceLastActivity === 1 ? 'Ayer' :
                         `Hace ${selectedClient.daysSinceLastActivity} días`}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/clients/${selectedClient.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Ver Detalle
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
