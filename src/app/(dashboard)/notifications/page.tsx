'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUnifiedNotifications } from '@/presentation/hooks/useUnifiedNotifications';
import { useAuthStore } from '@/presentation/store/authStore';
import { PushNotificationToggle } from '@/presentation/components/notifications/PushNotificationToggle';
import { 
  Bell, 
  Clock, 
  History, 
  CheckCheck, 
  Trash2, 
  Settings,
  Shield,
  Calendar,
  Heart,
  Home,
  Mail,
  Check,
  Smartphone
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('recent');
  const [localReadIds, setLocalReadIds] = useState<string[]>([]);
  const { notifications: rawNotifications, unreadCount: rawUnreadCount, isLoading, markAsRead, markAllAsRead } = useUnifiedNotifications('all');

  // Apply local read state to notifications
  const notifications = rawNotifications.map(n => ({
    ...n,
    read: n.read || localReadIds.includes(n.id)
  }));

  // Calculate unread count based on local state
  const unreadCount = notifications.filter(n => !n.read).length;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleMarkAsRead = (id: string) => {
    // Update local state immediately
    setLocalReadIds(prev => [...prev, id]);
    // Call API
    markAsRead(id);
    // Switch to history tab immediately
    setActiveTab('history');
  };

  const handleMarkAllAsRead = () => {
    // Get all unread IDs and mark them locally
    const unreadIds = recentNotifications.filter(n => !n.read).map(n => n.id);
    setLocalReadIds(prev => [...prev, ...unreadIds]);
    // Call API
    markAllAsRead();
    // Switch to history tab immediately
    setActiveTab('history');
  };

  // Separate notifications into recent (unread) and history (read)
  const recentNotifications = notifications.filter(n => !n.read);

  const historyNotifications = notifications.filter(n => n.read);

  // Show loading while checking auth
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg shadow-brand-500/25">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#4A9A3E] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Centro de Notificaciones</h1>
                <p className="text-sm text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} notificaciones pendientes` : 'Todas las notificaciones leídas'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Push Notification Toggle */}
              <PushNotificationToggle />
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors text-sm font-medium"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todo
                </button>
              )}
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#4A9A3E]/10 rounded-lg">
                <Bell className="w-6 h-6 text-[#4A9A3E]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
                <p className="text-sm text-slate-500">Sin leer</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#4A9A3E]/10 rounded-lg">
                <Clock className="w-6 h-6 text-[#4A9A3E]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{recentNotifications.length}</p>
                <p className="text-sm text-slate-500">Recientes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <History className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{historyNotifications.length}</p>
                <p className="text-sm text-slate-500">En historial</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all relative ${
                activeTab === 'recent' 
                  ? 'text-brand-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              Notificaciones Recientes
              {recentNotifications.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-[#4A9A3E]/10 text-[#4A9A3E] rounded-full text-xs font-bold">
                  {recentNotifications.length}
                </span>
              )}
              {activeTab === 'recent' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all relative ${
                activeTab === 'history' 
                  ? 'text-brand-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" />
              Historial
              {historyNotifications.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                  {historyNotifications.length}
                </span>
              )}
              {activeTab === 'history' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
              </div>
            ) : activeTab === 'recent' ? (
              recentNotifications.length === 0 ? (
                <EmptyState icon={<Bell className="w-16 h-16" />} title="No hay notificaciones recientes" />
              ) : (
                <div className="space-y-4">
                  {recentNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              )
            ) : (
              historyNotifications.length === 0 ? (
                <EmptyState icon={<History className="w-16 h-16" />} title="Historial vacío" />
              ) : (
                <div className="space-y-4">
                  {historyNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      isHistory
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-slate-700 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto">
        Las notificaciones aparecerán aquí cuando tengas nuevas actualizaciones o mensajes importantes.
      </p>
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
        return <Mail className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColors = (type: string) => {
    switch (type) {
      case 'ADMIN_NOTIFICATION':
        return 'bg-gradient-to-br from-[#4A9A3E] to-[#3d8b35] text-white shadow-[#4A9A3E]/30';
      case 'EVENT_CREATED':
      case 'EVENT_UPDATED':
      case 'EVENT_REMINDER':
      case 'EVENT_JOINED':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30';
      case 'FAVORITE':
        return 'bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-pink-500/30';
      case 'PROPERTY_PUBLISHED':
        return 'bg-gradient-to-br from-[#4A9A3E] to-[#3d8b35] text-white shadow-[#4A9A3E]/30';
      default:
        return 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  return (
    <div
      className={`group flex items-start gap-4 p-5 rounded-xl border transition-all duration-300 ${
        !notification.read && !isHistory
          ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' 
          : 'bg-slate-50/50 border-slate-100'
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${getIconColors(notification.type)}`}>
        {getIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold text-base ${!notification.read && !isHistory ? 'text-slate-900' : 'text-slate-600'}`}>
                {notification.title}
              </h3>
              {!notification.read && !isHistory && (
                <span className="px-2 py-0.5 bg-[#4A9A3E]/10 text-[#4A9A3E] text-xs font-bold rounded-full">
                  NUEVO
                </span>
              )}
            </div>
            <p className={`text-sm leading-relaxed ${!notification.read && !isHistory ? 'text-slate-600' : 'text-slate-500'}`}>
              {notification.message}
            </p>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(notification.createdAt)}
            </p>
          </div>

          {/* Actions */}
          {!notification.read && !isHistory && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="flex-shrink-0 p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Marcar como leída"
            >
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
