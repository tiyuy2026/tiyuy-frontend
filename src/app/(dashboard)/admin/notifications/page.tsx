/**
 * Notifications UI Page
 * Manage admin notifications, system alerts, and user communication preferences
 */

'use client';

import { useState } from 'react';
import { 
  useNotificationPreferences, 
  useUpdateNotificationPreferences,
  useSendNotification,
  useSystemAlerts,
  useResolveSystemAlert
} from '@/presentation/hooks/useAnalytics';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card } from '@/presentation/components/ui/Card';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { format } from 'date-fns';
import { NotificationPreference, SystemAlert } from '@/core/domain/entities/Analytics';

export default function NotificationsPage() {
  const { data: preferences, isLoading: isLoadingPrefs } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const sendNotification = useSendNotification();
  const { data: alerts, isLoading: isLoadingAlerts } = useSystemAlerts();
  const resolveAlert = useResolveSystemAlert();
  const { isSuperAdmin, isRegularAdmin, isSupport } = usePermissions();

  const [activeTab, setActiveTab] = useState<'preferences' | 'send' | 'alerts'>('preferences');
  const [newNotification, setNewNotification] = useState({
    type: 'info' as const,
    title: '',
    message: '',
    recipients: [] as string[],
    channels: ['email'] as ('push' | 'email' | 'in_app')[],
    priority: 'medium' as const,
    status: 'draft' as const,
  });

  const isLoading = isLoadingPrefs || isLoadingAlerts;

  const handlePreferenceUpdate = (key: keyof NotificationPreference, value: boolean | string) => {
    if (!preferences) return;
    updatePreferences.mutate({
      ...preferences,
      [key]: value,
    });
  };

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      return;
    }

    sendNotification.mutate(newNotification, {
      onSuccess: () => {
        setNewNotification({
          type: 'info',
          title: '',
          message: '',
          recipients: [],
          channels: ['email'],
          priority: 'medium',
          status: 'draft',
        });
      },
    });
  };

  const handleResolveAlert = (alertId: string) => {
    resolveAlert.mutate(alertId);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'security': return '??';
      case 'performance': return '??';
      case 'business': return '??';
      case 'system': return '??';
      default: return '??';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return '??';
      case 'info': return '??';
      case 'warning': return '??';
      case 'success': return '??';
      case 'error': return '??';
      default: return '??';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones y Alertas</h1>
          <p className="text-gray-600 mt-1">Gestiona notificaciones, alertas del sistema y preferencias de comunicación</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'preferences', label: 'Preferencias' },
              { id: 'send', label: 'Enviar' },
              { id: 'alerts', label: 'Alertas' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Preferences Tab */}
        {activeTab === 'preferences' && preferences && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferencias de Notificaciones</h2>
              
              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Notificaciones por Email</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Notificaciones Generales por Email' },
                      { key: 'marketingEmails', label: 'Emails de Marketing' },
                      { key: 'propertyAlerts', label: 'Alertas de Propiedades' },
                      { key: 'messageAlerts', label: 'Alertas de Mensajes' },
                      { key: 'systemAlerts', label: 'Alertas del Sistema' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{label}</label>
                          <p className="text-xs text-gray-500 mt-1">
                            Recibir notificaciones por email
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreferenceUpdate(key as keyof NotificationPreference, !preferences[key as keyof NotificationPreference])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences[key as keyof NotificationPreference]
                              ? 'bg-blue-600'
                              : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              preferences[key as keyof NotificationPreference] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Notificaciones Push</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notificaciones Push en el Navegador</label>
                      <p className="text-xs text-gray-500 mt-1">
                        Recibir notificaciones en tu navegador
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceUpdate('pushNotifications', !preferences.pushNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.pushNotifications
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Frecuencia de Notificaciones</h3>
                  <select
                    value={preferences.frequency}
                    onChange={(e) => handlePreferenceUpdate('frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Inmediato</option>
                    <option value="daily">Resumen Diario</option>
                    <option value="weekly">Resumen Semanal</option>
                    <option value="never">Nunca</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Elige cada cuánto recibir notificaciones
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Send Notification Tab */}
        {(isSuperAdmin || isRegularAdmin) && activeTab === 'send' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enviar Notificación</h2>
              
              <div className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Notificación</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'info', label: 'Info' },
                      { id: 'warning', label: 'Advertencia' },
                      { id: 'success', label: 'Éxito' },
                      { id: 'error', label: 'Error' },
                      { id: 'alert', label: 'Alerta' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setNewNotification(prev => ({ ...prev, type: type.id as any, status: 'draft' }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newNotification.type === type.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className="mr-1">{getNotificationIcon(type.id)}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value, status: 'draft' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa el título de la notificación"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value, status: 'draft' }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa el mensaje de la notificación"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                  <select
                    value={newNotification.priority}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value as any, status: 'draft' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                {/* Channels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canales</label>
                  <div className="flex gap-4">
                    {[
                      { id: 'email', label: 'Email' },
                      { id: 'in_app', label: 'En App' },
                      { id: 'push', label: 'Push' }
                    ].map((channel) => (
                      <label key={channel.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newNotification.channels.includes(channel.id as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewNotification(prev => ({
                                ...prev,
                                channels: [...prev.channels, channel.id as any],
                                status: 'draft'
                              }));
                            } else {
                              setNewNotification(prev => ({
                                ...prev,
                                channels: prev.channels.filter(c => c !== channel.id),
                                status: 'draft'
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {channel.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSendNotification}
                    disabled={!newNotification.title || !newNotification.message || sendNotification.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendNotification.isPending ? 'Enviando...' : 'Enviar Notificación'}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* System Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Alertas del Sistema</h2>
                <div className="text-sm text-gray-500">
                  {alerts?.length || 0} alertas
                </div>
              </div>

              <div className="space-y-4">
                {alerts?.map((alert: SystemAlert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                    alert.resolved ? 'border-gray-300 bg-gray-50' : 'border-red-500 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlertColor(alert.severity)}`}>
                            <span className="mr-1">{getAlertIcon(alert.type)}</span>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            alert.resolved ? 'text-gray-600 bg-gray-100' : 'text-red-600 bg-red-100'
                          }`}>
                            {alert.resolved ? 'RESUELTO' : 'ACTIVO'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        
                        <h3 className="text-md font-medium text-gray-900">{alert.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Origen: {alert.source}
                          {alert.resolved && alert.resolvedAt && (
                            <>
                              <span className="mx-2">-</span>
                              Resuelto: {format(new Date(alert.resolvedAt), 'MMM dd, yyyy HH:mm')}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-4">
                        {!alert.resolved && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            disabled={resolveAlert.isPending}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            {resolveAlert.isPending ? 'Resolviendo...' : 'Resolver'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    {alert.actions && alert.actions.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {alert.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              if (action.url) {
                                window.open(action.url, '_blank');
                              }
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {alerts?.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">?</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sin Alertas del Sistema</h3>
                    <p className="text-gray-500">Todos los sistemas están operando normalmente.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
  )
}
