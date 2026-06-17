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
import { ToastContainer, showToast } from '@/presentation/components/ui/Toast/Toast';
import { format } from 'date-fns';
import {
  Send,
  History,
  Bell,
  AlertTriangle,
  Settings,
  Megaphone,
  TrendingUp,
  Smartphone,
  Mail,
  BellRing,
  Users,
  Calendar,
  Trash2,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Copy,
  RotateCw,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  List,
  Loader,
  Shield
} from 'lucide-react';

type TabType = 'send' | 'alerts' | 'history';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const sendNotification = useSendNotification();
  const { isSuperAdmin, isRegularAdmin } = usePermissions();
  
  // Server-side search hooks for users and agents
  const userSearch = useUserSearch(300);
  const agentSearch = useUserSearch(300);

  // Pagination and filter state for history
  const [historyPage, setHistoryPage] = useState(0);
  const [historySize, setHistorySize] = useState(10);
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Notification hooks
  const { data: notificationHistory, isLoading: isLoadingHistory } = useNotificationHistory(30, historyTypeFilter || undefined, historyPage, historySize);
  const { data: notificationHistoryAll, isLoading: isLoadingHistoryAll } = useNotificationHistory(30, historyTypeFilter || undefined, 0, 1000);
  const { data: notificationTypes, isLoading: isLoadingTypes } = useNotificationTypes();
  const { data: alertStats } = useAdminAlertStats();

  // Admin Alerts pagination state
  const [alertsPage, setAlertsPage] = useState(0);
  const [alertsSize, setAlertsSize] = useState(10);

  // Admin Alerts hooks with pagination
  const { data: adminAlerts, isLoading: isLoadingAdminAlerts } = useAdminAlerts({ page: alertsPage, size: alertsSize });
  const createAdminAlert = useCreateAdminAlert();
  const sendAdminAlertNow = useSendAdminAlertNow();
  const deleteAdminAlert = useDeleteAdminAlert();

  // Notification history delete hook
  const deleteNotificationHistory = useDeleteNotificationHistory();

  // Alert filter state
  const [alertFilter, setAlertFilter] = useState<{ status?: string; type?: string }>({});

  const [activeTab, setActiveTab] = useState<TabType>('send');

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

  // Action menu state
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  
  // Detail modal state
  const [detailItem, setDetailItem] = useState<{ type: 'notification' | 'alert'; data: any } | null>(null);

  const handleSendNotification = () => {
    if (!newNotification.subject || !newNotification.message) {
      return;
    }

    const hasTargets = newNotification.sendToAll ||
      newNotification.userIds.length > 0 ||
      newNotification.roles.length > 0 ||
      newNotification.agencyIds.length > 0;
    if (!hasTargets) {
      alert('Selecciona al menos un destinatario: todos los usuarios, roles especificos, usuarios especificos, inmobiliarias o agentes');
      return;
    }

    console.log('Sending notification:', JSON.stringify(newNotification, null, 2));
    
    sendNotification.mutate(newNotification, {
      onSuccess: () => {
        showToast('success', 'Notificación enviada exitosamente', 'La notificación se ha enviado a los destinatarios seleccionados');
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
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
      onError: (error: any) => {
        showToast('error', 'Error al enviar notificación', error?.message || 'Ocurrió un error al enviar la notificación');
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

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY': return <AlertTriangle className="w-5 h-5" />;
      case 'SYSTEM': return <Settings className="w-5 h-5" />;
      case 'ANNOUNCEMENT': return <Megaphone className="w-5 h-5" />;
      case 'MARKETING': return <TrendingUp className="w-5 h-5" />;
      case 'SECURITY': return <Shield className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'EMERGENCY': return 'Emergencia';
      case 'SYSTEM': return 'Sistema';
      case 'ANNOUNCEMENT': return 'Anuncio';
      case 'MARKETING': return 'Marketing';
      case 'SECURITY': return 'Seguridad';
      default: return type;
    }
  };

  const getDeliveryStatus = (item: any) => {
    if (item.status === 'SENT' || item.status === 'completed') return { label: 'Entregado', color: 'text-green-600 bg-green-50 border-green-200', dot: 'bg-green-500' };
    if (item.status === 'FAILED' || item.status === 'error') return { label: 'Error', color: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-500' };
    if (item.status === 'PARTIAL') return { label: 'Parcial', color: 'text-orange-600 bg-orange-50 border-orange-200', dot: 'bg-orange-500' };
    if (item.status === 'SCHEDULED') return { label: 'Programado', color: 'text-blue-600 bg-blue-50 border-blue-200', dot: 'bg-blue-500' };
    if (item.status === 'DRAFT') return { label: 'Borrador', color: 'text-gray-600 bg-gray-50 border-gray-200', dot: 'bg-gray-500' };
    return { label: 'Pendiente', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' };
  };

  const getChannels = (item: any) => {
    const channels: { label: string; active: boolean }[] = [];
    if (item.sendEmail) channels.push({ label: 'Email', active: true });
    if (item.sendInApp) channels.push({ label: 'Web', active: true });
    if (item.sendPush) channels.push({ label: 'Push', active: true });
    return channels;
  };

  // Filter notifications by search query
  const filteredNotifications = useMemo(() => {
    if (!notificationHistory?.content) return [];
    if (!historySearchQuery) return notificationHistory.content;
    const q = historySearchQuery.toLowerCase();
    return notificationHistory.content.filter((n: any) =>
      (n.title?.toLowerCase().includes(q)) ||
      (n.message?.toLowerCase().includes(q)) ||
      (n.recipientCount?.toString().includes(q))
    );
  }, [notificationHistory, historySearchQuery]);

  // Filter alerts by search query
  const filteredAlerts = useMemo(() => {
    if (!adminAlerts?.content) return [];
    if (!historySearchQuery) return adminAlerts.content;
    const q = historySearchQuery.toLowerCase();
    return adminAlerts.content.filter((a: any) =>
      (a.subject?.toLowerCase().includes(q)) ||
      (a.message?.toLowerCase().includes(q)) ||
      (a.targetUserCount?.toString().includes(q))
    );
  }, [adminAlerts, historySearchQuery]);

  const tabs: { id: TabType; label: string; icon: typeof Bell }[] = [
    { id: 'send', label: 'Notificaciones', icon: Bell },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
    { id: 'history', label: 'Historial', icon: History },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <ToastContainer />
      {/* KPI Cards - Siempre visibles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white shadow-lg shadow-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-xs font-medium uppercase tracking-wider">Total Notificaciones</p>
              <p className="text-3xl font-bold mt-1">{notificationHistoryAll?.totalElements || 0}</p>
              <p className="text-teal-200 text-xs mt-1">Notificaciones enviadas</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Bell className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg shadow-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Total Alertas</p>
              <p className="text-3xl font-bold mt-1">{adminAlerts?.totalElements || 0}</p>
              <p className="text-red-200 text-xs mt-1">Alertas generadas</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg shadow-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium uppercase tracking-wider">Últimos 7 Días</p>
              <p className="text-3xl font-bold mt-1">
                {(notificationHistoryAll?.content?.filter((n: any) => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0) +
                 (adminAlerts?.content?.filter((a: any) => new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0)}
              </p>
              <p className="text-green-200 text-xs mt-1">Actividad reciente</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium uppercase tracking-wider">Total Destinatarios</p>
              <p className="text-3xl font-bold mt-1">
                {(notificationHistoryAll?.content?.reduce((acc: number, n: any) => acc + (n.recipientCount || 1), 0) || 0) +
                 (adminAlerts?.content?.reduce((acc: number, a: any) => acc + (a.targetUserCount || 0), 0) || 0)}
              </p>
              <p className="text-purple-200 text-xs mt-1">Usuarios alcanzados</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[56px] ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50 border border-gray-200 scale-[1.02]'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-teal-600' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Send Notification Section */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enviar Notificación</h2>

            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
                <input
                  type="text"
                  value={newNotification.subject}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Ingresa el asunto del email"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="Ingresa el mensaje de la notificación"
                />
              </div>

              {/* Target Selection */}
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
                              ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-500/30'
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
                    <div className="mb-2">
                      <input
                        type="text"
                        value={userSearch.searchQuery}
                        onChange={(e) => userSearch.setSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre, email o DNI (mín. 2 caracteres)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                      />
                    </div>
                    {userSearch.isLoading && (
                      <p className="text-sm text-gray-500 mb-2">Buscando usuarios...</p>
                    )}
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

                {/* By Agency */}
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
                        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg shadow-teal-500/30"
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

                {/* By Agent */}
                {!newNotification.sendToAll && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Agentes específicos:</p>
                    <div className="mb-2">
                      <input
                        type="text"
                        value={agentSearch.searchQuery}
                        onChange={(e) => agentSearch.setSearchQuery(e.target.value)}
                        placeholder="Buscar agente por nombre, email o DNI (mín. 2 caracteres)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                      />
                    </div>
                    {agentSearch.isLoading && (
                      <p className="text-sm text-gray-500 mb-2">Buscando agentes...</p>
                    )}
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

              {/* Channels */}
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
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                <p className="text-sm text-teal-800">
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
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/30"
                >
                  {sendNotification.isPending ? 'Enviando...' : 'Enviar Notificación'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Alerts Section */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Create Alert Card */}
          <Card className="overflow-hidden border-red-200">
            <div className="bg-gradient-to-r from-red-50 to-red-100/50 p-6 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900">Crear Alerta</h2>
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
                        showToast('success', 'Alerta enviada exitosamente', 'La alerta se ha enviado a los destinatarios seleccionados');
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
                      },
                      onError: (error: any) => {
                        showToast('error', 'Error al enviar alerta', error?.message || 'Ocurrió un error al enviar la alerta');
                      }
                    });
                  }}
                  disabled={createAdminAlert.isPending}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {createAdminAlert.isPending ? (
                    <>
                      <Loader className="animate-spin w-5 h-5" />
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

        </div>
      )}

      {/* History Section - Independent */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* History Header */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Historial de Envíos</h2>
                  <p className="text-sm text-gray-500 mt-1">Notificaciones y alertas enviadas</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Buscar por asunto, mensaje o destinatarios..."
                      className="w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>
                  {/* Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={historyTypeFilter}
                      onChange={(e) => {
                        setHistoryTypeFilter(e.target.value);
                        setHistoryPage(0);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    >
                      <option value="">Todas</option>
                      <option value="NOTIFICATION">Notificaciones</option>
                      <option value="ALERT">Alertas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {isLoadingHistory || isLoadingAdminAlerts ? (
              <div className="p-12 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : filteredNotifications.length === 0 && filteredAlerts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                <p className="text-gray-500">No se encontraron notificaciones o alertas en el historial</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Notifications */}
                {filteredNotifications.map((notification: any) => {
                  const status = getDeliveryStatus(notification);
                  const channels = getChannels(notification);
                  return (
                    <div
                      key={`notif-${notification.id}`}
                      className="p-5 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-teal-100 text-teal-600">
                          <Bell className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                  NOTIFICACIÓN
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`}></span>
                                  {status.label}
                                </span>
                              </div>
                              <h3 className="text-base font-semibold text-gray-900">{notification.title}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                            </div>

                            {/* Action Menu */}
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenu(openActionMenu === notification.id ? null : notification.id);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                              </button>
                              {openActionMenu === notification.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenActionMenu(null)} />
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20 py-1">
                                    <button
                                      onClick={() => {
                                        setDetailItem({ type: 'notification', data: notification });
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Eye className="w-4 h-4" /> Ver detalle
                                    </button>
                                    <hr className="my-1 border-gray-100" />
                                    <button
                                      onClick={() => {
                                        if (confirm('¿Eliminar esta notificación del historial?')) {
                                          deleteNotificationHistory.mutate(notification.id);
                                        }
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" /> Eliminar
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(notification.createdAt), 'dd MMM yyyy, HH:mm')}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {notification.recipientCount || 1} {notification.recipientCount === 1 ? 'destinatario' : 'destinatarios'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              {channels.map((ch, i) => (
                                <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  ch.active ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                                }`}>
                                  {ch.label}
                                </span>
                              ))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Alerts */}
                {filteredAlerts.map((alert: any) => {
                  const status = getDeliveryStatus(alert);
                  const channels = getChannels(alert);
                  return (
                    <div
                      key={`alert-${alert.id}`}
                      className="p-5 hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                          alert.alertType === 'EMERGENCY' ? 'bg-red-100 text-red-600' :
                          alert.alertType === 'SYSTEM' ? 'bg-blue-100 text-blue-600' :
                          alert.alertType === 'ANNOUNCEMENT' ? 'bg-teal-100 text-teal-600' :
                          alert.alertType === 'SECURITY' ? 'bg-purple-100 text-purple-600' :
                          'bg-cyan-100 text-cyan-600'
                        }`}>
                          {getAlertTypeIcon(alert.alertType)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  ALERTA: {getAlertTypeLabel(alert.alertType)}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`}></span>
                                  {status.label}
                                </span>
                              </div>
                              <h3 className="text-base font-semibold text-gray-900">{alert.subject}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                            </div>

                            {/* Action Menu */}
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenu(openActionMenu === alert.id ? null : alert.id);
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                              </button>
                              {openActionMenu === alert.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenActionMenu(null)} />
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20 py-1">
                                    <button
                                      onClick={() => {
                                        setDetailItem({ type: 'alert', data: alert });
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Eye className="w-4 h-4" /> Ver detalle
                                    </button>
                                    <hr className="my-1 border-gray-100" />
                                    <button
                                      onClick={() => {
                                        if (confirm('¿Eliminar esta alerta del historial?')) {
                                          deleteAdminAlert.mutate(alert.id);
                                        }
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" /> Eliminar
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(alert.createdAt), 'dd MMM yyyy, HH:mm')}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {alert.targetUserCount || 0} destinatarios
                            </span>
                            <span className="flex items-center gap-1.5">
                              {channels.map((ch, i) => (
                                <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  ch.active ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                                }`}>
                                  {ch.label}
                                </span>
                              ))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* History Pagination */}
            {notificationHistory && notificationHistory.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Mostrar</span>
                    <select
                      value={historySize}
                      onChange={(e) => {
                        setHistorySize(Number(e.target.value));
                        setHistoryPage(0);
                      }}
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value={10}>10 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                      <option value={100}>100 por página</option>
                    </select>
                    <span className="text-sm text-gray-500 ml-2">
                      {historyPage * historySize + 1}-{Math.min((historyPage + 1) * historySize, notificationHistory.totalElements)} de {notificationHistory.totalElements}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHistoryPage(prev => Math.max(0, prev - 1))}
                      disabled={historyPage === 0}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(notificationHistory.totalPages, 5) }, (_, i) => {
                        const startPage = Math.max(0, Math.min(historyPage - 2, notificationHistory.totalPages - 5));
                        const pageNum = startPage + i;
                        if (pageNum >= notificationHistory.totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setHistoryPage(pageNum)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              historyPage === pageNum
                                ? 'bg-teal-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                      {notificationHistory.totalPages > 5 && (
                        <>
                          <span className="px-1 text-gray-400">...</span>
                          <button
                            onClick={() => setHistoryPage(notificationHistory.totalPages - 1)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              historyPage === notificationHistory.totalPages - 1
                                ? 'bg-teal-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {notificationHistory.totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setHistoryPage(prev => Math.min(notificationHistory.totalPages - 1, prev + 1))}
                      disabled={historyPage >= notificationHistory.totalPages - 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetailItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${detailItem.type === 'alert' ? 'border-red-100 bg-gradient-to-r from-red-50 to-red-100/50' : 'border-teal-100 bg-gradient-to-r from-teal-50 to-teal-100/50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${detailItem.type === 'alert' ? 'bg-red-500' : 'bg-teal-500'}`}>
                    {detailItem.type === 'alert' ? (
                      <AlertTriangle className="w-6 h-6 text-white" />
                    ) : (
                      <Bell className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {detailItem.type === 'alert' ? 'Detalle de Alerta' : 'Detalle de Notificación'}
                    </h3>
                    <p className="text-sm text-gray-500">Información completa del envío</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailItem(null)}
                  className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getDeliveryStatus(detailItem.data).color
                }`}>
                  <span className={`w-2 h-2 rounded-full ${getDeliveryStatus(detailItem.data).dot} mr-2`}></span>
                  {getDeliveryStatus(detailItem.data).label}
                </span>
                {detailItem.type === 'alert' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    {getAlertTypeLabel(detailItem.data.alertType)}
                  </span>
                )}
                {detailItem.type === 'notification' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-700">
                    NOTIFICACIÓN
                  </span>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Asunto</label>
                <p className="text-lg font-semibold text-gray-900">{detailItem.data.title || detailItem.data.subject}</p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Mensaje</label>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-100">{detailItem.data.message}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Fecha de Envío</label>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {format(new Date(detailItem.data.createdAt), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Destinatarios</label>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    {detailItem.type === 'notification'
                      ? `${detailItem.data.recipientCount || 1} ${detailItem.data.recipientCount === 1 ? 'usuario' : 'usuarios'}`
                      : `${detailItem.data.targetUserCount || 0} usuarios`}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Canales</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {getChannels(detailItem.data).map((ch, i) => (
                      <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        ch.active ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {ch.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ID</label>
                  <p className="text-sm font-mono text-gray-900">#{detailItem.data.id}</p>
                </div>
              </div>

              {/* Roles / Targets */}
              {detailItem.data.roles && detailItem.data.roles.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Roles Destinatarios</label>
                  <div className="flex flex-wrap gap-2">
                    {detailItem.data.roles.map((role: string) => (
                      <span key={role} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Send to All */}
              {detailItem.data.sendToAll && (
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <p className="text-sm text-teal-800 font-medium">Enviado a todos los usuarios</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar esta ${detailItem.type === 'alert' ? 'alerta' : 'notificación'} del historial?`)) {
                    if (detailItem.type === 'alert') {
                      deleteAdminAlert.mutate(detailItem.data.id);
                    } else {
                      deleteNotificationHistory.mutate(detailItem.data.id);
                    }
                    setDetailItem(null);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
