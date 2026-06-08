'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUnifiedNotifications } from '@/presentation/hooks/useUnifiedNotifications';
import { useAuthStore } from '@/presentation/store/authStore';
import { PushNotificationToggle } from '@/presentation/components/notifications/PushNotificationToggle';
import { 
  Bell, 
  Clock, 
  History, 
  CheckCheck, 
  Settings,
  Shield,
  Calendar,
  Heart,
  Home,
  Check,
  AlertTriangle,
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CreditCard,
  RefreshCw,
  Eye,
  X,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';

type TabType = 'all' | 'unread' | 'alerts' | 'history';
type SortType = 'newest' | 'oldest' | 'unread' | 'important';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortOpen, setSortOpen] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const { notifications, unreadCount: rawUnreadCount, isLoading, markAsRead, markAllAsRead, isMarkingAllAsRead } = useUnifiedNotifications('all');

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
  [notifications]);

  const alertsCount = useMemo(() =>
    notifications.filter(n => n.type === 'ADMIN_NOTIFICATION').length,
  [notifications]);

  const historyCount = useMemo(() =>
    notifications.filter(n => n.read).length,
  [notifications]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleMarkAsRead = (id: string) => {
    setMarkingIds(prev => new Set(prev).add(id));
    markAsRead(id);
    // Después de un tiempo, remover el id de marking (aunque la query se recargue sola)
    setTimeout(() => {
      setMarkingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 3000);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    switch (activeTab) {
      case 'unread':
        result = result.filter(n => !n.read);
        break;
      case 'alerts':
        result = result.filter(n => n.type === 'ADMIN_NOTIFICATION' || n.type === 'SUBSCRIPTION_EXPIRING');
        break;
      case 'history':
        result = result.filter(n => n.read);
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q) ||
        n.type?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'unread':
        result.sort((a, b) => (a.read === b.read ? 0 : a.read ? 1 : -1));
        break;
      case 'important':
        result.sort((a, b) => {
          const aImportant = a.type === 'ADMIN_NOTIFICATION' || a.type === 'SUBSCRIPTION_EXPIRING' ? 1 : 0;
          const bImportant = b.type === 'ADMIN_NOTIFICATION' || b.type === 'SUBSCRIPTION_EXPIRING' ? 1 : 0;
          return bImportant - aImportant;
        });
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [notifications, activeTab, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredNotifications.length / pageSize);
  const paginatedNotifications = useMemo(() =>
    filteredNotifications.slice(page * pageSize, (page + 1) * pageSize),
  [filteredNotifications, page, pageSize]);

  useEffect(() => {
    setPage(0);
  }, [activeTab, searchQuery, sortBy]);

  const sortLabels: Record<SortType, string> = {
    newest: 'Más recientes',
    oldest: 'Más antiguas',
    unread: 'No leídas primero',
    important: 'Importantes primero'
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Bell className="w-4 h-4 text-slate-600" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <h1 className="text-base font-bold text-slate-900">Centro de Notificaciones</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <PushNotificationToggle />
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors text-xs font-medium disabled:opacity-50"
                >
                  {isMarkingAllAsRead ? (
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  {isMarkingAllAsRead ? 'Guardando...' : 'Marcar todo'}
                </button>
              )}
              <button 
                onClick={() => router.push('/preferences')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-100 text-xs font-medium"
              >
                <Settings className="w-3.5 h-3.5" />
                Configuración
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - full width grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-brand-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <Bell className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
                <p className="text-sm text-slate-500">Sin leer</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-amber-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{alertsCount}</p>
                <p className="text-sm text-slate-500">Importantes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-slate-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <History className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{historyCount}</p>
                <p className="text-sm text-slate-500">En historial</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card - full width */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {[
              { id: 'all' as TabType, label: 'Todas', icon: Bell, count: notifications.length },
              { id: 'unread' as TabType, label: 'No leídas', icon: Eye, count: unreadCount },
              { id: 'alerts' as TabType, label: 'Alertas', icon: AlertTriangle, count: alertsCount },
              { id: 'history' as TabType, label: 'Historial', icon: History, count: historyCount },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all relative ${
                    isActive 
                      ? 'text-brand-600' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      tab.id === 'alerts'
                        ? 'bg-red-50 text-red-600'
                        : tab.id === 'unread'
                        ? 'bg-brand-50 text-brand-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar notificación..."
                  className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Custom Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm hover:border-slate-300 transition-all min-w-[180px]"
                >
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <span className="flex-1 text-left text-slate-700">{sortLabels[sortBy]}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                      {(Object.entries(sortLabels) as [SortType, string][]).map(([value, label]) => (
                        <button
                          key={value}
                          onClick={() => {
                            setSortBy(value);
                            setSortOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                            sortBy === value ? 'text-brand-600 font-medium bg-brand-50/50' : 'text-slate-600'
                          }`}
                        >
                          {sortBy === value && <Check className="w-4 h-4 text-brand-600" />}
                          <span className={sortBy === value ? '' : 'ml-6'}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
              </div>
            ) : paginatedNotifications.length === 0 ? (
              <EmptyState 
                icon={activeTab === 'alerts' ? <AlertTriangle className="w-16 h-16" /> : activeTab === 'history' ? <History className="w-16 h-16" /> : <Bell className="w-16 h-16" />} 
                title={
                  searchQuery 
                    ? 'Sin resultados para tu búsqueda'
                    : activeTab === 'unread' 
                      ? 'No hay notificaciones sin leer'
                      : activeTab === 'alerts'
                        ? 'No hay alertas importantes'
                        : activeTab === 'history'
                          ? 'Historial vacío'
                          : 'No hay notificaciones'
                }
                description={
                  searchQuery
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Las notificaciones aparecerán aquí cuando tengas nuevas actualizaciones.'
                }
              />
            ) : (
              <div className="space-y-3">
                {paginatedNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    isHistory={activeTab === 'history'}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Mostrar</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(0);
                    }}
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value={10}>10 por página</option>
                    <option value={25}>25 por página</option>
                    <option value={50}>50 por página</option>
                  </select>
                  <span className="text-sm text-slate-500 ml-2">
                    {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filteredNotifications.length)} de {filteredNotifications.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(prev => Math.max(0, prev - 1))}
                    disabled={page === 0}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
                      const pageNum = startPage + i;
                      if (pageNum >= totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === pageNum
                              ? 'bg-brand-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-1 text-slate-400">...</span>
                        <button
                          onClick={() => setPage(totalPages - 1)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === totalPages - 1
                              ? 'bg-brand-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-slate-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      )}
    </div>
  );
}

interface NotificationCardProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  isHistory?: boolean;
}

function NotificationCard({ notification, onMarkAsRead, isHistory }: NotificationCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'ADMIN_NOTIFICATION':
        return <Shield className="w-5 h-5" />;
      case 'SUBSCRIPTION_EXPIRING':
        return <CreditCard className="w-5 h-5" />;
      case 'EVENT_CREATED':
      case 'EVENT_UPDATED':
      case 'EVENT_REMINDER':
      case 'EVENT_JOINED':
        return <Calendar className="w-5 h-5" />;
      case 'FAVORITE':
        return <Heart className="w-5 h-5" />;
      case 'PROPERTY_PUBLISHED':
        return <Home className="w-5 h-5" />;
      case 'CONTACT':
        return <MessageSquare className="w-5 h-5" />;
      case 'MARKETING':
        return <RefreshCw className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColors = (type: string) => {
    switch (type) {
      case 'ADMIN_NOTIFICATION':
        return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/30';
      case 'SUBSCRIPTION_EXPIRING':
        return 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/30';
      case 'EVENT_CREATED':
      case 'EVENT_UPDATED':
      case 'EVENT_REMINDER':
      case 'EVENT_JOINED':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30';
      case 'FAVORITE':
        return 'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-pink-500/30';
      case 'PROPERTY_PUBLISHED':
        return 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30';
      case 'CONTACT':
        return 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-500/30';
      case 'MARKETING':
        return 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-cyan-500/30';
      default:
        return 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand-500/30';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ADMIN_NOTIFICATION': return 'Notificación del sistema';
      case 'SUBSCRIPTION_EXPIRING': return 'Renovación de plan';
      case 'EVENT_CREATED': return 'Evento creado';
      case 'EVENT_UPDATED': return 'Evento actualizado';
      case 'EVENT_REMINDER': return 'Recordatorio de evento';
      case 'EVENT_JOINED': return 'Te uniste a un evento';
      case 'FAVORITE': return 'Favorito';
      case 'PROPERTY_PUBLISHED': return 'Propiedad publicada';
      case 'CONTACT': return 'Mensaje de contacto';
      case 'MARKETING': return 'Marketing';
      default: return 'Notificación';
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'PROPERTY_PUBLISHED': return 'Ver propiedad';
      case 'CONTACT': return 'Responder';
      case 'EVENT_CREATED':
      case 'EVENT_UPDATED':
      case 'EVENT_REMINDER':
      case 'EVENT_JOINED': return 'Ver evento';
      case 'SUBSCRIPTION_EXPIRING': return 'Ver recibo';
      case 'FAVORITE': return 'Ver propiedad';
      default: return 'Ver detalle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const isImportant = notification.type === 'ADMIN_NOTIFICATION' || notification.type === 'SUBSCRIPTION_EXPIRING';
  const isUnread = !notification.read && !isHistory;

  return (
    <div
      className={`group flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 ${
        isUnread
          ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-brand-200' 
          : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
      } ${isImportant && isUnread ? 'ring-1 ring-amber-200' : ''}`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${getIconColors(notification.type)}`}>
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className={`font-semibold text-base ${isUnread ? 'text-slate-900' : 'text-slate-600'}`}>
                {notification.title}
              </h3>
              {isUnread && (
                <span className="px-2 py-0.5 bg-brand-50 text-brand-600 text-xs font-bold rounded-full">
                  NUEVO
                </span>
              )}
              {isImportant && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  IMPORTANTE
                </span>
              )}
            </div>
            <p className={`text-sm leading-relaxed ${isUnread ? 'text-slate-600' : 'text-slate-500'}`}>
              {notification.message}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(notification.createdAt)}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">{getTypeLabel(notification.type)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-start gap-1">
            {isUnread && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                title="Marcar como leída"
              >
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
