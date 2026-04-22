/**
 * Notifications UI Page
 * Manage admin notifications, system alerts, and user communication preferences
 * Matches backend SendNotificationRequest DTO
 */

'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useSendNotification,
  useNotificationHistory,
  useNotificationTypes,
  useAdminAlertStats,
  useCreateAdminAlert,
  useAdminAlerts,
  useSendAdminAlertNow,
  useDeleteAdminAlert,
  useDeleteNotificationHistory
} from '@/presentation/hooks/useAnalytics';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { useUserSearch } from '@/presentation/hooks/useUserSearch';
import { Card } from '@/presentation/components/ui/Card';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { NotificationsHeaderStats } from '@/presentation/components/admin/NotificationsHeaderStats/NotificationsHeaderStats';
import { NotificationsChart } from '@/presentation/components/admin/NotificationsChart/NotificationsChart';
import { format } from 'date-fns';
import {
  Send,
  History,
  Bell,
  BarChart3,
  AlertTriangle,
  Settings,
  Megaphone,
  TrendingUp,
  Smartphone,
  Mail,
  BellRing,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const sendNotification = useSendNotification();
  const { isSuperAdmin, isRegularAdmin } = usePermissions();
  
  // Server-side search hooks for users and agents
  const userSearch = useUserSearch(300);
  const agentSearch = useUserSearch(300);

  // Pagination and filter state
  const [historyPage, setHistoryPage] = useState(0);
  const [historySize] = useState(5);
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('');

  // Notification hooks
  const { data: notificationHistory, isLoading: isLoadingHistory } = useNotificationHistory(30, historyTypeFilter || undefined, historyPage, historySize);
  const { data: notificationHistoryAll, isLoading: isLoadingHistoryAll } = useNotificationHistory(30, historyTypeFilter || undefined, 0, 1000); // Get all data for chart
  const { data: notificationTypes, isLoading: isLoadingTypes } = useNotificationTypes();
  const { data: alertStats } = useAdminAlertStats();

  // Admin Alerts pagination state
  const [alertsPage, setAlertsPage] = useState(0);
  const [alertsSize] = useState(5);

  // Admin Alerts hooks with pagination
  const { data: adminAlerts, isLoading: isLoadingAdminAlerts } = useAdminAlerts({ page: alertsPage, size: alertsSize });
  const createAdminAlert = useCreateAdminAlert();
  const sendAdminAlertNow = useSendAdminAlertNow();
  const deleteAdminAlert = useDeleteAdminAlert();

  // Notification history delete hook
  const deleteNotificationHistory = useDeleteNotificationHistory();

  // Alert filter state
  const [alertFilter, setAlertFilter] = useState<{ status?: string; type?: string }>({});

  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'stats' | 'alerts'>('send');

  // New Alert state
  const [newAlert, setNewAlert] = useState({
    subject: '',
    message: '',
    alertType: 'EMERGENCY' as 'EMERGENCY' | 'SYSTEM' | 'ANNOUNCEMENT' | 'MARKETING',
    status: 'SENDING' as 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED',
    userIds: [] as number[],
    roles: [] as string[],
    sendToAll: false,
    sendEmail: true,
    sendInApp: true,
    sendPush: false,
    scheduledFor: undefined as string | undefined,
  });

  // Matches backend SendNotificationRequest DTO
  const [newNotification, setNewNotification] = useState({
    subject: '',
    message: '',
    userIds: [] as number[],
    roles: [] as string[],
    agencyIds: [] as string[],
    sendToAll: false,
    sendEmail: true,
    sendInApp: true,
  });

  const handleSendNotification = () => {
    if (!newNotification.subject || !newNotification.message) {
      return;
    }

    // Validate at least one target is selected
    const hasTargets = newNotification.sendToAll ||
      newNotification.userIds.length > 0 ||
      newNotification.roles.length > 0 ||
      newNotification.agencyIds.length > 0;
    if (!hasTargets) {
      alert('Selecciona al menos un destinatario: todos los usuarios, roles especificos, usuarios especificos, inmobiliarias o agentes');
      return;
    }

    // Debug: Log what we're sending
    console.log('Sending notification:', JSON.stringify(newNotification, null, 2));
    
    sendNotification.mutate(newNotification, {
      onSuccess: () => {
        // Reset form
        setNewNotification({
          subject: '',
          message: '',
          userIds: [],
          roles: [],
          agencyIds: [],
          sendToAll: false,
          sendEmail: true,
          sendInApp: true,
        });
        // Invalidate notifications query to refresh the bell
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    });
  };

  const toggleUserSelection = (userId: number) => {
    setNewNotification(prev => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId]
    }));
  };

  const toggleRoleSelection = (role: string) => {
    setNewNotification(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const toggleAgencySelection = (agencyRuc: string) => {
    setNewNotification(prev => ({
      ...prev,
      agencyIds: prev.agencyIds.includes(agencyRuc)
        ? prev.agencyIds.filter(r => r !== agencyRuc)
        : [...prev.agencyIds, agencyRuc]
    }));
  };


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-teal-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Process notification history data for chart
  const chartData = useMemo(() => {
    if (!notificationHistoryAll?.content || notificationHistoryAll.content.length === 0) {
      return [];
    }

    const dateMap = new Map<string, number>();
    
    notificationHistoryAll.content.forEach((notification: any) => {
      const date = new Date(notification.createdAt).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    // Convert to array and sort by date (oldest to newest)
    const sortedData = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Get last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentData = sortedData.filter(item => new Date(item.date) >= sevenDaysAgo);

    return recentData;
  }, [notificationHistoryAll]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-4">
      {/* Header - 4 tarjetas en fila */}
      <NotificationsHeaderStats activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Send Notification Section */}
        {activeTab === 'send' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enviar Notificación</h2>

              <div className="space-y-4">
                {/* Subject - matches backend 'subject' field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
                  <input
                    type="text"
                    value={newNotification.subject}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa el asunto del email"
                  />
                </div>

                {/* Message - matches backend 'message' field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa el mensaje de la notificación"
                  />
                </div>

                {/* Target Selection - sendToAll, roles, or userIds */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destinatarios</label>

                  {/* Send to All Option */}
                  <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNotification.sendToAll}
                        onChange={(e) => setNewNotification(prev => ({
                          ...prev,
                          sendToAll: e.target.checked,
                          roles: e.target.checked ? [] : prev.roles,
                          userIds: e.target.checked ? [] : prev.userIds
                        }))}
                        className="mr-3 h-4 w-4"
                      />
                      <span className="font-medium text-gray-900">Enviar a todos los usuarios</span>
                    </label>
                  </div>

                  {/* By Roles */}
                  {!newNotification.sendToAll && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Por Rol:</p>
                      <div className="flex flex-wrap gap-2">
                        {['USER', 'AGENT', 'DEVELOPER', 'ADMIN'].map((role) => (
                          <button
                            key={role}
                            onClick={() => toggleRoleSelection(role)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              newNotification.roles.includes(role)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* By Specific Users */}
                  {!newNotification.sendToAll && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Usuarios específicos:</p>
                      {/* Search input for users - server side */}
                      <div className="mb-2">
                        <input
                          type="text"
                          value={userSearch.searchQuery}
                          onChange={(e) => userSearch.setSearchQuery(e.target.value)}
                          placeholder="Buscar por nombre, email o DNI (mín. 2 caracteres)..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      {/* Loading state */}
                      {userSearch.isLoading && (
                        <p className="text-sm text-gray-500 mb-2">Buscando usuarios...</p>
                      )}
                      {/* Info message */}
                      {!userSearch.hasSearched && (
                        <p className="text-xs text-gray-500 mb-2">
                          Escribe al menos 2 caracteres para buscar usuarios. Se buscará en toda la base de datos.
                        </p>
                      )}
                      <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                        {userSearch.users.map((user: any) => (
                          <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newNotification.userIds.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="mr-3"
                            />
                            <span className="text-sm text-gray-700">
                              {user.firstName} {user.lastName} ({user.email}) - {user.role}
                            </span>
                          </label>
                        ))}
                        {userSearch.hasSearched && userSearch.users.length === 0 && !userSearch.isLoading && (
                          <p className="text-sm text-gray-500 p-2">No se encontraron usuarios</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* By Agency (Inmobiliaria) - RUC input */}
                  {!newNotification.sendToAll && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Por Inmobiliaria (RUC):</p>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          id="agencyRuc"
                          placeholder="Ingresa RUC de inmobiliaria"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                toggleAgencySelection(input.value.trim());
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById('agencyRuc') as HTMLInputElement;
                            if (input?.value.trim()) {
                              toggleAgencySelection(input.value.trim());
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Agregar
                        </button>
                      </div>
                      {newNotification.agencyIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newNotification.agencyIds.map((ruc) => (
                            <span
                              key={ruc}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800"
                            >
                              RUC: {ruc}
                              <button
                                onClick={() => toggleAgencySelection(ruc)}
                                className="ml-2 text-teal-600 hover:text-teal-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* By Agent - Select from AGENT role users */}
                  {!newNotification.sendToAll && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Agentes específicos:</p>
                      {/* Search input for agents - server side */}
                      <div className="mb-2">
                        <input
                          type="text"
                          value={agentSearch.searchQuery}
                          onChange={(e) => agentSearch.setSearchQuery(e.target.value)}
                          placeholder="Buscar agente por nombre, email o DNI (mín. 2 caracteres)..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      {/* Loading state */}
                      {agentSearch.isLoading && (
                        <p className="text-sm text-gray-500 mb-2">Buscando agentes...</p>
                      )}
                      {/* Info message */}
                      {!agentSearch.hasSearched && (
                        <p className="text-xs text-gray-500 mb-2">
                          Escribe al menos 2 caracteres para buscar agentes. Se buscará en toda la base de datos.
                        </p>
                      )}
                      <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                        {agentSearch.users
                          .filter((agent: any) => agent.role === 'AGENT')
                          .map((agent: any) => (
                            <label key={agent.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newNotification.userIds.includes(agent.id)}
                                onChange={() => toggleUserSelection(agent.id)}
                                className="mr-3"
                              />
                              <span className="text-sm text-gray-700">
                                {agent.firstName} {agent.lastName} ({agent.email})
                              </span>
                            </label>
                          ))}
                        {agentSearch.hasSearched && agentSearch.users.filter((agent: any) => agent.role === 'AGENT').length === 0 && !agentSearch.isLoading && (
                          <p className="text-sm text-gray-500 p-2">No se encontraron agentes</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Los agentes seleccionados se agregarán como usuarios específicos</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Channels - matches backend 'sendEmail', 'sendInApp' */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canales</label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNotification.sendEmail}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, sendEmail: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Email (Brevo)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNotification.sendInApp}
                        onChange={(e) => setNewNotification(prev => ({ ...prev, sendInApp: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Notificación en App</span>
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Resumen:</strong>
                    {newNotification.sendToAll
                      ? ' Enviar a todos los usuarios'
                      : newNotification.roles.length > 0
                        ? ` Roles: ${newNotification.roles.join(', ')}`
                        : newNotification.userIds.length > 0
                          ? ` ${newNotification.userIds.length} usuarios seleccionados`
                          : newNotification.agencyIds.length > 0
                            ? ` ${newNotification.agencyIds.length} inmobiliarias`
                              : ' Selecciona destinatarios'}
                    {newNotification.sendEmail && ' via Email'}
                    {newNotification.sendInApp && ' + In-App'}
                  </p>
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSendNotification}
                    disabled={!newNotification.subject || !newNotification.message || sendNotification.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendNotification.isPending ? 'Enviando...' : 'Enviar Notificación'}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* History Section - Admin Alerts History */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Modern History Design */}
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Notificaciones</p>
                      <p className="text-3xl font-bold">{notificationHistory?.content?.length || 0}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Últimos 7 días</p>
                      <p className="text-3xl font-bold">
                        {notificationHistory?.content?.filter((n: any) => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Destinatarios</p>
                      <p className="text-3xl font-bold">
                        {notificationHistory?.content?.reduce((acc: number, n: any) => acc + (n.recipientCount || 1), 0) || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications List with Filter */}
              <Card className="overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Historial de Notificaciones Enviadas</h2>
                      <p className="text-sm text-gray-500 mt-1">Últimas 30 días de notificaciones enviadas a usuarios</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
                      <select
                        value={historyTypeFilter}
                        onChange={(e) => {
                          setHistoryTypeFilter(e.target.value);
                          setHistoryPage(0); // Reset to first page on filter change
                        }}
                        disabled={isLoadingTypes}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Todos los tipos</option>
                        {notificationTypes?.map((t: any) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {isLoadingHistory ? (
                  <div className="p-12 flex items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notificationHistory?.content?.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Las notificaciones que envíes aparecerán aquí. Usa la pestaña "Enviar" para crear nuevas notificaciones.</p>
                      </div>
                    ) : (
                      notificationHistory?.content?.map((notification: any, index: number) => (
                        <div key={notification.id} className="p-5 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                              notification.type === 'ADMIN_NOTIFICATION' 
                                ? 'bg-red-100 text-red-600' 
                                : notification.type === 'EVENT_CREATED' || notification.type === 'EVENT_REMINDER'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-teal-100 text-teal-600'
                            }`}>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                                  <p className="text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Enviado
                                  </span>
                                  <button
                                    onClick={() => {
                                      if (confirm('¿Eliminar esta notificación del historial?')) {
                                        deleteNotificationHistory.mutate(notification.id);
                                      }
                                    }}
                                    disabled={deleteNotificationHistory.isPending}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Eliminar del historial"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {format(new Date(notification.createdAt), 'dd MMM yyyy, HH:mm')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  {notification.recipientCount || 1} {notification.recipientCount === 1 ? 'destinatario' : 'destinatarios'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  {notification.type || 'GENERAL'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Pagination Controls */}
                {notificationHistory && notificationHistory.totalElements > 0 && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Mostrando {historyPage * historySize + 1} - {Math.min((historyPage + 1) * historySize, notificationHistory.totalElements)} de {notificationHistory.totalElements} notificaciones
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setHistoryPage(prev => Math.max(0, prev - 1))}
                          disabled={historyPage === 0 || isLoadingHistory}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <span className="text-sm text-gray-600 px-3">
                          Página {historyPage + 1} de {notificationHistory.totalPages || 1}
                        </span>
                        
                        <button
                          onClick={() => setHistoryPage(prev => Math.min((notificationHistory.totalPages || 1) - 1, prev + 1))}
                          disabled={historyPage >= (notificationHistory.totalPages || 1) - 1 || isLoadingHistory}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Alerts Section - Emergency Alerts Management */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Create Emergency Alert Card */}
            <Card className="overflow-hidden border-red-200">
              <div className="bg-gradient-to-r from-red-50 to-red-100/50 p-6 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-red-900">Crear Alerta de Emergencia</h2>
                    <p className="text-sm text-red-700">Envía alertas urgentes por múltiples canales (in-app, email, push)</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Alert Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Alerta</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'EMERGENCY', label: 'Emergencia', color: 'red', Icon: AlertTriangle },
                      { id: 'SYSTEM', label: 'Sistema', color: 'blue', Icon: Settings },
                      { id: 'ANNOUNCEMENT', label: 'Anuncio', color: 'teal', Icon: Megaphone },
                      { id: 'MARKETING', label: 'Marketing', color: 'cyan', Icon: TrendingUp }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setNewAlert(prev => ({ ...prev, alertType: type.id as any }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          newAlert.alertType === type.id
                            ? type.color === 'red' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                              type.color === 'blue' ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' :
                              type.color === 'teal' ? 'bg-teal-100 text-teal-700 border-2 border-teal-300' :
                              'bg-cyan-100 text-cyan-700 border-2 border-cyan-300'
                            : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <type.Icon className="w-5 h-5" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject and Message */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                    <input
                      type="text"
                      value={newAlert.subject}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Ej: Mantenimiento programado del sistema"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                    <textarea
                      value={newAlert.message}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe la alerta o emergencia..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Scheduling */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="scheduleAlert"
                      checked={!!newAlert.scheduledFor}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Set default to 1 hour from now
                          const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
                          setNewAlert(prev => ({ ...prev, scheduledFor: oneHourFromNow, status: 'SCHEDULED' }));
                        } else {
                          setNewAlert(prev => ({ ...prev, scheduledFor: undefined, status: 'SENDING' }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="scheduleAlert" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Programar envío para más tarde
                    </label>
                  </div>

                  {newAlert.scheduledFor && (
                    <div className="ml-7">
                      <label className="block text-xs text-gray-500 mb-1">Fecha y hora de envío</label>
                      <input
                        type="datetime-local"
                        value={newAlert.scheduledFor}
                        onChange={(e) => {
                          // Convert local datetime to UTC ISO string for backend
                          const localDate = new Date(e.target.value);
                          const utcISO = localDate.toISOString();
                          setNewAlert(prev => ({ ...prev, scheduledFor: utcISO }));
                        }}
                        min={new Date().toISOString().slice(0, 16)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        La alerta se enviará automáticamente en la fecha seleccionada
                      </p>
                    </div>
                  )}
                </div>

                {/* Channels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canales de Envío</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAlert.sendInApp}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, sendInApp: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <Smartphone className="w-4 h-4 text-teal-500" />
                      <span className="text-sm text-gray-700">In-App</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAlert.sendEmail}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, sendEmail: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAlert.sendPush}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, sendPush: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <BellRing className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm text-gray-700">Push</span>
                    </label>
                  </div>
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (!newAlert.subject || !newAlert.message) {
                        alert('Completa el asunto y mensaje');
                        return;
                      }
                      createAdminAlert.mutate(newAlert, {
                        onSuccess: () => {
                          setNewAlert({
                            subject: '',
                            message: '',
                            alertType: 'EMERGENCY',
                            status: 'SENDING',
                            userIds: [],
                            roles: [],
                            sendToAll: true,
                            sendEmail: true,
                            sendInApp: true,
                            sendPush: false,
                            scheduledFor: undefined,
                          });
                        }
                      });
                    }}
                    disabled={createAdminAlert.isPending}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {createAdminAlert.isPending ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {newAlert.scheduledFor ? 'Programando...' : 'Enviando...'}
                      </>
                    ) : (
                      <>
                        {newAlert.scheduledFor ? (
                          <>
                            <Clock className="w-5 h-5" />
                            Programar Alerta
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-5 h-5" />
                            Enviar Alerta
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>

            {/* Alerts List */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Alertas Programadas y Borradores</h2>
              </div>

              {isLoadingAdminAlerts ? (
                <div className="p-12 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {adminAlerts?.content?.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
                      <p className="text-gray-500">Las alertas programadas o borradores aparecerán aquí</p>
                    </div>
                  ) : (
                    adminAlerts?.content?.map((alert: any) => (
                      <div key={alert.id} className={`p-5 hover:bg-gray-50 transition-colors ${
                        alert.alertType === 'EMERGENCY' ? 'bg-red-50/30' : ''
                      }`}>
                        <div className="flex items-start gap-4">
                          {/* Icon based on type */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                            alert.alertType === 'EMERGENCY' 
                              ? 'bg-red-100 text-red-600' 
                              : alert.alertType === 'SYSTEM'
                                ? 'bg-blue-100 text-blue-600'
                                : alert.alertType === 'ANNOUNCEMENT'
                                  ? 'bg-teal-100 text-teal-600'
                                  : 'bg-cyan-100 text-cyan-600'
                          }`}>
                            {alert.alertType === 'EMERGENCY' && <AlertTriangle className="w-6 h-6" />}
                            {alert.alertType === 'SYSTEM' && <Settings className="w-6 h-6" />}
                            {alert.alertType === 'ANNOUNCEMENT' && <Megaphone className="w-6 h-6" />}
                            {alert.alertType === 'MARKETING' && <TrendingUp className="w-6 h-6" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    alert.status === 'SENT' ? 'bg-green-100 text-green-800' :
                                    alert.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                    alert.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                                    alert.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {alert.status}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    {alert.alertType}
                                  </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{alert.subject}</h3>
                                <p className="text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                {alert.status === 'DRAFT' && (
                                  <button
                                    onClick={() => sendAdminAlertNow.mutate(alert.id)}
                                    disabled={sendAdminAlertNow.isPending}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    Enviar
                                  </button>
                                )}
                                {(alert.status === 'DRAFT' || alert.status === 'SCHEDULED') && (
                                  <button
                                    onClick={() => deleteAdminAlert.mutate(alert.id)}
                                    disabled={deleteAdminAlert.isPending}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                                  >
                                    Eliminar
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {format(new Date(alert.createdAt), 'dd MMM yyyy, HH:mm')}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {alert.targetUserCount || 0} destinatarios
                              </span>
                              <span className="flex items-center gap-1">
                                {alert.sendEmail && <Mail className="w-4 h-4 text-blue-500" />}
                                {alert.sendInApp && <Smartphone className="w-4 h-4 text-teal-500" />}
                                {alert.sendPush && <BellRing className="w-4 h-4 text-cyan-500" />}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Pagination Controls for Alerts */}
              {adminAlerts && adminAlerts.totalElements > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando {alertsPage * alertsSize + 1} - {Math.min((alertsPage + 1) * alertsSize, adminAlerts.totalElements)} de {adminAlerts.totalElements} alertas
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAlertsPage(prev => Math.max(0, prev - 1))}
                        disabled={alertsPage === 0 || isLoadingAdminAlerts}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="text-sm text-gray-600 px-3">
                        Página {alertsPage + 1} de {adminAlerts.totalPages || 1}
                      </span>

                      <button
                        onClick={() => setAlertsPage(prev => Math.min((adminAlerts.totalPages || 1) - 1, prev + 1))}
                        disabled={alertsPage >= (adminAlerts.totalPages || 1) - 1 || isLoadingAdminAlerts}
                        className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Stats Section - Admin Alerts Statistics */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Enviadas</p>
                    <p className="text-3xl font-bold text-blue-700">{notificationHistoryAll?.totalElements || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Últimos 7 días</p>
                    <p className="text-3xl font-bold text-green-700">
                      {notificationHistoryAll?.content?.filter((n: any) => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Total Destinatarios</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {notificationHistoryAll?.content?.reduce((acc: number, n: any) => acc + (n.recipientCount || 1), 0) || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <NotificationsChart data={chartData} isLoading={isLoadingHistoryAll} />
          </div>
        )}
    </div>
  );
}
