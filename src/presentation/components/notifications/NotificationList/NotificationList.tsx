'use client';

import { useUnifiedNotifications } from '../../../hooks/useUnifiedNotifications';
import { useAuthStore } from '@/presentation/store/authStore';
import { Bell, MessageCircle, Heart, Home, Clock, Megaphone } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'CONTACT' | 'FAVORITE' | 'PROPERTY_PUBLISHED' | 'SUBSCRIPTION_EXPIRING' | 'MARKETING' | 'ADMIN_NOTIFICATION' | 'EVENT_CREATED' | 'EVENT_UPDATED' | 'EVENT_REMINDER' | 'EVENT_JOINED';
  read: boolean;
  createdAt: string;
}

export function NotificationList() {
  const { notifications, isLoading, markAsRead } = useUnifiedNotifications('all');
  const { user, isAuthenticated } = useAuthStore();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'CONTACT':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'FAVORITE':
        return <Heart className="w-4 h-4 text-pink-600" />;
      case 'PROPERTY_PUBLISHED':
        return <Home className="w-4 h-4 text-green-600" />;
      case 'SUBSCRIPTION_EXPIRING':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'MARKETING':
        return <Megaphone className="w-4 h-4 text-purple-600" />;
      case 'ADMIN_NOTIFICATION':
        return <Bell className="w-4 h-4 text-red-600" />;
      case 'EVENT_CREATED':
      case 'EVENT_UPDATED':
      case 'EVENT_REMINDER':
      case 'EVENT_JOINED':
        return <Bell className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'CONTACT':
        return 'bg-blue-50 border-blue-200';
      case 'FAVORITE':
        return 'bg-pink-50 border-pink-200';
      case 'PROPERTY_PUBLISHED':
        return 'bg-green-50 border-green-200';
      case 'SUBSCRIPTION_EXPIRING':
        return 'bg-orange-50 border-orange-200';
      case 'MARKETING':
        return 'bg-purple-50 border-purple-200';
      case 'ADMIN_NOTIFICATION':
        return 'bg-red-50 border-red-200';
      case 'EVENT_CREATED':
      case 'EVENT_UPDATED':
      case 'EVENT_REMINDER':
      case 'EVENT_JOINED':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Notificaciones</h3>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si el usuario no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Notificaciones</h3>
        </div>
        <div className="p-8 text-center">
          <div className="text-4xl mb-2"></div>
          <p className="text-gray-500 text-sm mb-4">Inicia sesión para ver tus notificaciones</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Notificaciones</h3>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {notifications.filter(n => !n.read).length}
          </span>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-80">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-500 text-sm">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:shadow-sm ${
                  notification.read ? 'bg-white border-gray-200' : getNotificationColor(notification.type)
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`text-sm font-medium text-gray-900 ${
                        !notification.read ? 'font-semibold' : ''
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleDateString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          Ver todas las notificaciones
        </button>
      </div>
    </div>
  );
}
