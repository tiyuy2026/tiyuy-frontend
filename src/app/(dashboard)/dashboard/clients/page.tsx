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
  MessageSquare
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
            <p className="text-gray-600 font-medium">Analizando datos del CRM...</p>
            <p className="text-sm text-gray-400 mt-2">Agregando interacciones de mensajes, grupos, canales y eventos</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['AGENT', 'DEVELOPER', 'ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-8 xl:px-16 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard" 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 shrink-0" />
                  <span>Análisis de Clientes</span>
                </h1>
              </div>
              <button
                onClick={() => refetch()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar Datos
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 xl:px-16 py-6">
          {/* KPI Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Clientes</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.totalClients}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {metrics.newClientsThisWeek > 0 && (
                  <span className="text-green-600 font-medium">+{metrics.newClientsThisWeek} esta semana</span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Clientes Activos</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.activeClients}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {Math.round((metrics.activeClients / Math.max(metrics.totalClients, 1)) * 100)}% del total
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Alto Interés</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.highInterestClients}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Prioridad de seguimiento
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Interacciones</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics.messagesExchanged}</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Mensajes + Grupos + Canales
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Charts Section - Takes 2 columns */}
            <div className="lg:col-span-2">
              <CRMMetricsCharts metrics={metrics} />
            </div>

            {/* Heatmap Section - Takes 1 column */}
            <div className="lg:col-span-1">
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

          {/* Bottom Section: Client List + Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client List - Takes 1 column */}
            <div className="lg:col-span-1 h-[600px]">
              <ClientList 
                clients={clients}
                filterClients={filterClients}
                selectedClientId={selectedClient?.id}
                onClientSelect={setSelectedClient}
              />
            </div>

            {/* Insights Panel - Takes 2 columns */}
            <div className="lg:col-span-2">
              <ClientInsightsPanel 
                metrics={metrics}
                topClients={metrics.topEngagedClients}
                atRiskClients={metrics.clientsAtRisk}
              />
            </div>
          </div>

          {/* CRM Avanzado */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              CRM Avanzado
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <HotLeadsPanel />
              <ConversionPipeline />
              <PropertyMatchesPanel />
            </div>
          </div>

          {/* Selected Client Detail */}
          {selectedClient && (
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Detalle: {selectedClient.name}
                </h3>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Message Activity */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Mensajes
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-700">
                      <span className="font-semibold">{selectedClient.messageActivity.totalMessages}</span> total
                    </p>
                    <p className="text-blue-600">
                      <span className="font-semibold">{selectedClient.messageActivity.sentMessages}</span> enviados
                    </p>
                    <p className="text-blue-600">
                      <span className="font-semibold">{selectedClient.messageActivity.receivedMessages}</span> recibidos
                    </p>
                    <p className={`text-xs mt-2 font-medium ${
                      selectedClient.messageActivity.interestLevel === 'HIGH' ? 'text-green-600' :
                      selectedClient.messageActivity.interestLevel === 'MEDIUM' ? 'text-yellow-600' :
                      'text-gray-500'
                    }`}>
                      Nivel: {selectedClient.messageActivity.interestLevel}
                    </p>
                  </div>
                </div>

                {/* Group Activity */}
                <div className="p-4 bg-teal-50 rounded-lg">
                  <h4 className="font-medium text-teal-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Grupos
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-teal-700">
                      <span className="font-semibold">{selectedClient.groupActivity.groupsJoined}</span> grupos
                    </p>
                    <p className="text-teal-600">
                      <span className="font-semibold">{selectedClient.groupActivity.postsCreated}</span> posts
                    </p>
                    <p className="text-teal-600">
                      <span className="font-semibold">{selectedClient.groupActivity.commentsMade}</span> comentarios
                    </p>
                  </div>
                </div>

                {/* Channel Activity */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Canales
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-purple-700">
                      <span className="font-semibold">{selectedClient.channelActivity.channelsSubscribed}</span> suscripciones
                    </p>
                    <p className="text-purple-600">
                      <span className="font-semibold">{selectedClient.channelActivity.eventsAttended}</span> eventos
                    </p>
                    <p className="text-purple-600">
                      <span className="font-semibold">{selectedClient.channelActivity.eventResponses}</span> respuestas
                    </p>
                  </div>
                </div>

                {/* Property Activity */}
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Propiedades
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-orange-700">
                      <span className="font-semibold">{selectedClient.propertyActivity.propertiesViewed}</span> vistas
                    </p>
                    <p className="text-orange-600">
                      <span className="font-semibold">{selectedClient.propertyActivity.inquiriesMade}</span> consultas
                    </p>
                    <p className="text-orange-600">
                      <span className="font-semibold">{selectedClient.propertyActivity.favoritesAdded}</span> favoritos
                    </p>
                  </div>
                </div>
              </div>

              {/* Score and Engagement */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-sm text-gray-500">Score de Interacción</span>
                    <p className="text-2xl font-bold text-blue-600">{selectedClient.interactionScore}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tasa de Engagement</span>
                    <p className="text-2xl font-bold text-teal-600">{selectedClient.engagementRate}%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Última Actividad</span>
                    <p className="text-lg font-medium text-gray-700">
                      {selectedClient.daysSinceLastActivity === 0 ? 'Hoy' :
                       selectedClient.daysSinceLastActivity === 1 ? 'Ayer' :
                       `Hace ${selectedClient.daysSinceLastActivity} días`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/clients/${selectedClient.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ver Detalle Completo
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
