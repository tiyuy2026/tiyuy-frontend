/**
 * Communications and Events Page
 * Monitor user interactions, chat usage, and engagement metrics
 */

'use client';

import { useState } from 'react';
import { useUserActivities, useActivityStats, useCommunicationStats } from '@/presentation/hooks/useAnalytics';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card } from '@/presentation/components/ui/Card';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { format } from 'date-fns';
import { UserActivity, ActivityStats } from '@/core/domain/entities/Analytics';

export default function CommunicationsPage() {
  const { data: activities, isLoading: isLoadingActivities } = useUserActivities();
  const { data: stats, isLoading: isLoadingStats } = useActivityStats();
  const { data: commStats, isLoading: isLoadingComm } = useCommunicationStats();
  const { isSuperAdmin, isRegularAdmin, isSupport } = usePermissions();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const isLoading = isLoadingActivities || isLoadingStats || isLoadingComm;

  const handleTypeFilter = (type: string) => {
    setSelectedType(type === selectedType ? 'all' : type);
  };

  const handlePeriodFilter = (period: string) => {
    setSelectedPeriod(period === selectedPeriod ? 'all' : period);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact': return '✉️';
      case 'favorite': return '❤️';
      case 'view': return '👁️';
      case 'publication': return '📢';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'contact': return 'text-blue-600 bg-blue-100';
      case 'favorite': return 'text-red-600 bg-red-100';
      case 'view': return 'text-green-600 bg-green-100';
      case 'publication': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando datos de comunicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunicaciones y Eventos</h1>
          <p className="text-gray-600 mt-1">Monitorea interacciones de usuarios, uso de chat y métricas de engagement</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Vistas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalViews || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                ?
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Vistas de propiedades</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Contactos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalContacts || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                ?
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Solicitudes de contacto</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Mensajes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalMessages || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                ?
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Mensajes de chat</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Acciones Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.pendingActions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                ?
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Esperando respuesta</p>
          </Card>
        </div>

        {/* Communication Stats */}
        {(isSuperAdmin || isRegularAdmin) && commStats && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Comunicaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">Tasa de Entrega</p>
                <p className="text-2xl font-bold text-green-600">{commStats.deliveryRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {commStats.totalDelivered} / {commStats.totalSent}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tasa de Apertura</p>
                <p className="text-2xl font-bold text-blue-600">{commStats.openRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {commStats.totalOpened} / {commStats.totalDelivered}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tasa de Clics</p>
                <p className="text-2xl font-bold text-purple-600">{commStats.clickRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {commStats.totalClicked} / {commStats.totalOpened}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Enviados</p>
                <p className="text-2xl font-bold text-gray-900">{commStats.totalSent}</p>
                <p className="text-xs text-gray-500 mt-1">Todas las comunicaciones</p>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          
          <div className="flex flex-wrap gap-4">
            {/* Activity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Actividad</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'contact', 'favorite', 'view', 'publication'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeFilter(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? 'Todos' : type === 'contact' ? 'Contacto' : type === 'favorite' ? 'Favorito' : type === 'view' ? 'Vista' : type === 'publication' ? 'Publicación' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período de Tiempo</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Todo' },
                  { id: 'week', label: 'Semana' },
                  { id: 'month', label: 'Mes' },
                  { id: 'year', label: 'Año' }
                ].map((period) => (
                  <button
                    key={period.id}
                    onClick={() => handlePeriodFilter(period.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedPeriod === period.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Timeline */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Línea de Tiempo de Actividad</h2>
            <div className="text-sm text-gray-500">
              {activities?.length || 0} actividades
            </div>
          </div>

          <div className="space-y-4">
            {activities?.map((activity: UserActivity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                {/* Activity Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                        {activity.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status === 'completed' ? 'Completado' : activity.status === 'pending' ? 'Pendiente' : activity.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      <span>Propiedad: {activity.propertyTitle}</span>
                      <span className="mx-2">-</span>
                      <span>ID de Usuario: {activity.userId}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(activity.date), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {showDetails === activity.id && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">ID de Actividad:</span>
                          <span className="ml-1 font-medium">{activity.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Estado:</span>
                          <span className="ml-1 font-medium">{activity.status}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">ID de Usuario:</span>
                          <span className="ml-1 font-medium">{activity.userId}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Fecha:</span>
                          <span className="ml-1 font-medium">{activity.date}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show/Hide Details Button */}
                  <button
                    onClick={() => setShowDetails(showDetails === activity.id ? null : activity.id)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showDetails === activity.id ? 'Ocultar Detalles' : 'Mostrar Detalles'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activities?.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                ?
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron actividades</h3>
              <p className="text-gray-500">Intenta ajustar tus filtros o vuelve a revisar más tarde.</p>
            </div>
          )}
        </Card>

        {/* Engagement Metrics */}
        {stats && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Engagement</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.totalFavorites}</div>
                <p className="text-sm text-gray-500 mt-1">Total Favoritos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.totalPublications}</div>
                <p className="text-sm text-gray-500 mt-1">Total Publicaciones</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{stats.pendingActions}</div>
                <p className="text-sm text-gray-500 mt-1">Acciones Pendientes</p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="text-sm text-gray-500 mb-2">Período de Actividad</div>
              <div className="text-xs text-gray-400">
                Desde: {stats.periodStart ? format(new Date(stats.periodStart), 'MMM dd, yyyy HH:mm') : 'N/A'}
                <br />
                Hasta: {stats.periodEnd ? format(new Date(stats.periodEnd), 'MMM dd, yyyy HH:mm') : 'N/A'}
              </div>
            </div>
          </Card>
        )}
      </div>
  )
}