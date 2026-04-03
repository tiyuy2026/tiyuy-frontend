'use client';

import { CRMMetrics, CRMClient } from '@/core/domain/entities/CRM';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  Target,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';

interface ClientInsightsPanelProps {
  metrics: CRMMetrics;
  topClients: CRMClient[];
  atRiskClients: CRMClient[];
}

export function ClientInsightsPanel({ metrics, topClients, atRiskClients }: ClientInsightsPanelProps) {
  const insights = [
    {
      icon: Users,
      title: 'Crecimiento',
      value: `+${metrics.newClientsThisWeek}`,
      label: 'nuevos esta semana',
      color: 'bg-blue-500',
      trend: 'positive'
    },
    {
      icon: MessageSquare,
      title: 'Interacciones',
      value: metrics.interactionsThisWeek.toString(),
      label: 'esta semana',
      color: 'bg-teal-500',
      trend: 'neutral'
    },
    {
      icon: Target,
      title: 'Tasa de Conversión',
      value: `${Math.round((metrics.highInterestClients / Math.max(metrics.totalClients, 1)) * 100)}%`,
      label: 'alto interés',
      color: 'bg-green-500',
      trend: 'positive'
    },
    {
      icon: Activity,
      title: 'Actividad Promedio',
      value: metrics.averageInteractionScore.toString(),
      label: 'score general',
      color: 'bg-violet-500',
      trend: metrics.averageInteractionScore > 50 ? 'positive' : 'warning'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`${item.color} bg-opacity-10 p-2 rounded-lg`}>
                <item.icon className={`w-5 h-5 ${item.color.replace('bg-', 'text-')}`} />
              </div>
              {item.trend === 'positive' && (
                <span className="text-green-500 text-xs font-medium flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  ↑
                </span>
              )}
              {item.trend === 'warning' && (
                <span className="text-yellow-500 text-xs font-medium flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  !
                </span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{item.title}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Clientes */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Clientes Más Comprometidos
          </h3>
          <span className="text-xs text-gray-500">Top 5 por score de interacción</span>
        </div>
        <div className="space-y-3">
          {topClients.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay datos suficientes</p>
          ) : (
            topClients.map((client, index) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 
                    flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-xs text-gray-500">
                      {client.messageActivity.totalMessages} mensajes • {client.totalInteractions} interacciones
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-blue-600">{client.interactionScore}</span>
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

      {/* Clientes en Riesgo */}
      {atRiskClients.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-lg p-6 border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Clientes en Riesgo
            </h3>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              {atRiskClients.length} clientes
            </span>
          </div>
          <p className="text-sm text-orange-600 mb-4">
            Clientes con alto score histórico pero sin actividad reciente (más de 14 días)
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {atRiskClients.slice(0, 5).map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-semibold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-xs text-orange-600">
                      Sin actividad desde hace {client.daysSinceLastActivity} días
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-700">Score: {client.interactionScore}</span>
                  <p className="text-xs text-gray-400">{client.messageActivity.totalMessages} mensajes históricos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Insights y Recomendaciones
        </h3>
        <div className="space-y-3">
          {metrics.highInterestClients > 0 && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{metrics.highInterestClients} clientes con alto interés</p>
                <p className="text-sm text-gray-500">
                  Prioriza el seguimiento con estos clientes. Han mostrado interés consistente en tus publicaciones.
                </p>
              </div>
            </div>
          )}
          
          {atRiskClients.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-600 text-xs">!</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Reactiva clientes inactivos</p>
                <p className="text-sm text-gray-500">
                  {atRiskClients.length} clientes valiosos no han interactuado recientemente. 
                  Considera enviarles una propiedad destacada o invitarlos a un evento.
                </p>
              </div>
            </div>
          )}
          
          {metrics.messagesExchanged > 0 && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MessageSquare className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{metrics.messagesExchanged} mensajes intercambiados</p>
                <p className="text-sm text-gray-500">
                  Tu canal de mensajes está activo. Responde rápido para mantener el engagement.
                </p>
              </div>
            </div>
          )}
          
          {metrics.averageInteractionScore < 30 && metrics.totalClients > 5 && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Target className="w-3 h-3 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Aumenta la actividad</p>
                <p className="text-sm text-gray-500">
                  El score promedio es bajo. Publica más contenido en grupos y canales para aumentar el engagement.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
