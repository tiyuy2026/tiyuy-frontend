'use client';

import React, { useState } from 'react';
import { useEventNotifications } from '@/presentation/hooks/useEventNotifications';
import { Bell, Calendar, Users, MapPin, Clock, X, Check, ChevronRight } from 'lucide-react';

interface EventNotificationsPanelProps {
  currentUserId: number;
  channelId?: number;
}

export default function EventNotificationsPanel({ currentUserId, channelId }: EventNotificationsPanelProps) {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useEventNotifications();
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EVENT_CREATED':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'EVENT_UPDATED':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'EVENT_REMINDER':
        return <Bell className="w-4 h-4 text-purple-600" />;
      case 'EVENT_JOINED':
        return <Users className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white border-gray-200';
    
    switch (type) {
      case 'EVENT_CREATED':
        return 'bg-blue-50 border-blue-200';
      case 'EVENT_UPDATED':
        return 'bg-orange-50 border-orange-200';
      case 'EVENT_REMINDER':
        return 'bg-purple-50 border-purple-200';
      case 'EVENT_JOINED':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    setSelectedNotification(notificationId);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notificaciones de Eventos</h3>
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
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

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">Notificaciones de Eventos</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No tienes notificaciones</h4>
            <p className="text-gray-500 text-sm">
              Las notificaciones de eventos aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedNotification === notification.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !notification.read ? 'bg-white' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className={`text-sm font-medium text-gray-900 ${
                        !notification.read ? 'font-semibold' : ''
                      }`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>

                    {/* Event Details */}
                    {notification.eventTitle && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{notification.eventTitle}</span>
                      </div>
                    )}

                    {notification.channelName && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Users className="w-3 h-3" />
                        <span>{notification.channelName}</span>
                      </div>
                    )}

                    {/* Time */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(notification.createdAt).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {notification.eventId && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to event
                          console.log('Navigate to event:', notification.eventId);
                        }}
                        className="flex-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                      >
                        Ver Evento
                      </button>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Marcar leída
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
}
