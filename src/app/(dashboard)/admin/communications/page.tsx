/**
 * Communications and Events Page
 * Monitor user interactions, chat usage, and engagement metrics
 */

'use client';

import { useState } from 'react';
import { useUserActivities, useActivityStats, useCommunicationStats } from '@/presentation/hooks/useAnalytics';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { useAuthStore } from '@/presentation/store/authStore';
import { useAllAssociationRequests, useApproveDeveloperAssociation, useRejectDeveloperAssociation } from '@/presentation/hooks/admin/useDeveloperAssociations';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { format } from 'date-fns';
import { UserActivity, ActivityStats } from '@/core/domain/entities/Analytics';
import { DeveloperAgentAssociation } from '@/core/domain/entities/Admin';
import { Users, Clock, CheckCircle, XCircle, Building2, User } from 'lucide-react';

export default function CommunicationsPage() {
  const { data: activities, isLoading: isLoadingActivities } = useUserActivities();
  const { data: stats, isLoading: isLoadingStats } = useActivityStats();
  const { data: commStats, isLoading: isLoadingComm } = useCommunicationStats();
  
  // Association requests state with pagination
  const [associationStatus, setAssociationStatus] = useState<string | null>(null);
  const [associationPage, setAssociationPage] = useState(0);
  const associationSize = 6;
  
  const { data: associationsData, isLoading: isLoadingAssociations, refetch: refetchAssociations, error: associationsError } = 
    useAllAssociationRequests(associationStatus, associationPage, associationSize);
  
  const approveMutation = useApproveDeveloperAssociation();
  const rejectMutation = useRejectDeveloperAssociation();
  const { isSuperAdmin, isRegularAdmin, isSupport } = usePermissions();
  const { user } = useAuthStore();

  // Check if user can view association requests (from auth store role or permissions)
  const userRole = user?.role?.toString().toUpperCase();
  const canViewAssociations = isSuperAdmin || isRegularAdmin || isSupport || 
                            ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(userRole || '');

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Association status tabs
  const statusTabs = [
    { key: null, label: 'Todas', count: associationsData?.totalElements || 0 },
    { key: 'PENDING', label: 'Pendientes', color: 'yellow' },
    { key: 'ACTIVE', label: 'Activas', color: 'green' },
    { key: 'REJECTED', label: 'Rechazadas', color: 'red' },
  ];

  const handleStatusChange = (status: string | null) => {
    setAssociationStatus(status);
    setAssociationPage(0);
  };

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

  // Handler functions for association requests
  const handleApproveAssociation = async (associationId: number) => {
    try {
      await approveMutation.mutateAsync({
        associationId,
        data: {}
      });
      refetchAssociations();
    } catch (error) {
      console.error('Error approving association:', error);
    }
  };

  const handleRejectAssociation = async (associationId: number) => {
    try {
      await rejectMutation.mutateAsync({
        associationId,
        data: {}
      });
      refetchAssociations();
    } catch (error) {
      console.error('Error rejecting association:', error);
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

        {/* Association Requests Section (Admin Only) */}
        {canViewAssociations && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Solicitudes de Asociación</h2>
                  <p className="text-sm text-gray-600">Gestiona solicitudes de agentes a inmobiliarias</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {associationsData?.totalElements || 0} total
                </span>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key || 'all'}
                  onClick={() => handleStatusChange(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    associationStatus === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'PENDING' && associationsData && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-xs">
                      {associationsData.content?.filter((a: DeveloperAgentAssociation) => a.status === 'PENDING').length || 0}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {isLoadingAssociations ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : associationsError ? (
              <div className="text-center py-8">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                <p className="text-red-600">Error al cargar solicitudes</p>
                <p className="text-sm text-gray-500 mt-1">
                  {associationsError instanceof Error ? associationsError.message : 'Error desconocido'}
                </p>
                <button 
                  onClick={() => refetchAssociations()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            ) : associationsData?.content && associationsData.content.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {associationsData.content.map((association: DeveloperAgentAssociation) => (
                  <div key={association.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    {/* Agent Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-semibold">
                        {association.agentFirstName?.[0] || association.agentEmail?.[0] || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {association.agentFirstName} {association.agentLastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{association.agentEmail}</p>
                      </div>
                    </div>

                    {/* Developer Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Building2 className="w-4 h-4" />
                      <span className="truncate">Inmobiliaria ID: {association.developerId}</span>
                    </div>

                    {/* Request Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>
                        {association.requestedAt 
                          ? new Date(association.requestedAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '-'
                        }
                      </span>
                    </div>

                    {/* Notes */}
                    {association.notes && (
                      <div className="bg-white rounded p-2 text-sm text-gray-600 mb-3">
                        <span className="font-medium">Notas:</span> {association.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <Button
                        onClick={() => handleApproveAssociation(association.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        onClick={() => handleRejectAssociation(association.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {associationsData && associationsData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Mostrando {associationsData.content.length} de {associationsData.totalElements} solicitudes
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssociationPage(p => Math.max(0, p - 1))}
                      disabled={associationPage === 0}
                      className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                      Página {associationPage + 1} de {associationsData.totalPages}
                    </span>
                    <button
                      onClick={() => setAssociationPage(p => Math.min(associationsData.totalPages - 1, p + 1))}
                      disabled={associationPage >= associationsData.totalPages - 1}
                      className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No hay solicitudes de asociación {associationStatus ? `en estado ${associationStatus}` : ''}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Las solicitudes aparecerán aquí cuando los agentes soliciten unirse a una inmobiliaria
                </p>
              </div>
            )}
          </Card>
        )}

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