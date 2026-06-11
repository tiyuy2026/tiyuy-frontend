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
  Settings,
  Shield,
  Calendar,
  Heart,
  Home,
  Mail,
  Check
} from 'lucide-react';

const NOTIFICATION_CONFIG: Record<string, { icon: React.ComponentType<any>; colorClass: string }> = {
  ADMIN_NOTIFICATION: { icon: Shield, colorClass: 'bg-[var(--brand-primary)] text-[var(--bg-primary)] shadow-md' },
  EVENT_CREATED:      { icon: Calendar, colorClass: 'bg-blue-500 text-white shadow-blue-500/30' },
  EVENT_UPDATED:      { icon: Calendar, colorClass: 'bg-blue-500 text-white shadow-blue-500/30' },
  EVENT_REMINDER:     { icon: Calendar, colorClass: 'bg-blue-500 text-white shadow-blue-500/30' },
  EVENT_JOINED:       { icon: Calendar, colorClass: 'bg-blue-500 text-white shadow-blue-500/30' },
  FAVORITE:           { icon: Heart, colorClass: 'bg-pink-500 text-white shadow-pink-500/30' },
  PROPERTY_PUBLISHED: { icon: Home, colorClass: 'bg-[var(--brand-primary)] text-[var(--bg-primary)] shadow-md' },
  CONTACT:            { icon: Mail, colorClass: 'bg-[var(--brand-primary)] text-[var(--bg-primary)] shadow-md' },
  DEFAULT:            { icon: Bell, colorClass: 'bg-[var(--brand-primary)] text-[var(--bg-primary)] shadow-md' }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('recent');
  const [localReadIds, setLocalReadIds] = useState<string[]>([]);
  const { notifications: rawNotifications, isLoading, markAsRead, markAllAsRead } = useUnifiedNotifications('all');

  const notifications = rawNotifications.map(n => ({
    ...n,
    read: n.read || localReadIds.includes(n.id)
  }));

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.filter(n => !n.read);
  const historyNotifications = notifications.filter(n => n.read);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleMarkAsRead = (id: string) => {
    setLocalReadIds(prev => [...prev, id]);
    markAsRead(id);
    setActiveTab('history');
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = recentNotifications.filter(n => !n.read).map(n => n.id);
    setLocalReadIds(prev => [...prev, ...unreadIds]);
    markAllAsRead();
    setActiveTab('history');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    );
  }

  const statCards = [
    { value: unreadCount, label: 'Sin leer', icon: Bell, iconBg: 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)]', className: 'col-span-1' },
    { value: recentNotifications.length, label: 'Recientes', icon: Clock, iconBg: 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)]', className: 'col-span-1' },
    { value: historyNotifications.length, label: 'En historial', icon: History, iconBg: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]', className: 'col-span-2 md:col-span-1' }
  ];

  const tabsConfig = [
    { id: 'recent', label: 'Recientes', count: recentNotifications.length, icon: Clock, badgeBg: 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)]' },
    { id: 'history', label: 'Historial', count: historyNotifications.length, icon: History, badgeBg: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]' }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] sticky top-0 z-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:h-16 gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="p-2.5 bg-[var(--brand-primary)] rounded-xl shadow-lg">
                  <Bell className="w-5 h-5 text-[var(--bg-primary)]" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--brand-primary)] text-[var(--bg-primary)] text-xs font-bold rounded-full flex items-center justify-center border-2 border-[var(--bg-primary)]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">Centro de Notificaciones</h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate">
                  {unreadCount > 0 ? `${unreadCount} pendientes` : 'Todas leídas'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-light)]">
              <PushNotificationToggle />
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--brand-primary-light)] text-[var(--brand-primary)] rounded-lg hover:bg-[var(--brand-primary-light-hover)] transition-colors text-xs sm:text-sm font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Marcar todo</span>
                    <span className="xs:hidden">Todo</span>
                  </button>
                )}
                <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--bg-tertiary)]">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {statCards.map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <div key={idx} className={`bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 shadow-sm border border-[var(--border-color)] ${card.className}`}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`p-2.5 sm:p-3 rounded-lg flex-shrink-0 ${card.iconBg}`}>
                    <CardIcon className="w-5 h-5 sm:w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">{card.value}</p>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate">{card.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
          <div className="flex border-b border-[var(--border-color)] overflow-x-auto scrollbar-none">
            {tabsConfig.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 sm:py-4 px-4 text-xs sm:text-sm font-medium transition-all relative ${
                    isSelected
                      ? 'text-[var(--brand-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <TabIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-full flex-shrink-0 ${tab.badgeBg}`}>
                      {tab.count}
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 sm:py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--brand-primary)]"></div>
              </div>
            ) : activeTab === 'recent' ? (
              recentNotifications.length === 0 ? (
                <EmptyState icon={<Bell className="w-12 h-12 sm:w-16 sm:h-16" />} title="No hay notificaciones recientes" />
              ) : (
                <div className="space-y-3 sm:space-y-4">
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
                <EmptyState icon={<History className="w-12 h-12 sm:w-16 sm:h-16" />} title="Historial vacío" />
              ) : (
                <div className="space-y-3 sm:space-y-4">
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
    <div className="text-center py-12 sm:py-16 px-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-medium text-[var(--text-primary)] mb-1 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
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
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.DEFAULT;
  const IconComponent = config.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${Math.floor(diffInHours)}h`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      className={`group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-300 ${
        !notification.read && !isHistory
          ? 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-sm' 
          : 'bg-[var(--bg-secondary)] border-[var(--border-light)] opacity-80'
      }`}
    >
      {/* Icono adaptable en tamaño */}
      <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${config.colorClass}`}>
        <IconComponent className="w-4 h-4 sm:w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-0.5 sm:mb-1">
              <h3 className={`font-semibold text-sm sm:text-base truncate max-w-[180px] xs:max-w-none ${
                !notification.read && !isHistory 
                  ? 'text-[var(--text-primary)]' 
                  : 'text-[var(--text-secondary)]'
              }`}>
                {notification.title}
              </h3>
              {!notification.read && !isHistory && (
                <span className="px-1.5 py-0.5 bg-[var(--brand-primary-light)] text-[var(--brand-primary)] text-[9px] font-bold rounded-full flex-shrink-0">
                  NEW
                </span>
              )}
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed break-words ${
              !notification.read && !isHistory 
                ? 'text-[var(--text-primary)] opacity-90' 
                : 'text-[var(--text-secondary)]'
            }`}>
              {notification.message}
            </p>
            <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(notification.createdAt)}
            </p>
          </div>

          {/* Botón de leído: Siempre visible en móvil para usabilidad táctil, u opacidad con hover en desktop */}
          {!notification.read && !isHistory && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="flex-shrink-0 p-2 text-[var(--brand-primary)] hover:bg-[var(--brand-primary-light)] rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
              title="Marcar como leída"
            >
              <Check className="w-4 h-4 sm:w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}