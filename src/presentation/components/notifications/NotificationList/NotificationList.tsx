'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '../../../hooks/useNotifications';
import { useAuthStore } from '@/presentation/store/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'CONTACT' | 'FAVORITE' | 'PROPERTY_PUBLISHED' | 'SUBSCRIPTION_EXPIRING' | 'MARKETING';
  read: boolean;
  createdAt: string;
}

export function NotificationList() {
  const { preferences } = useNotifications();
  const { user, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Solo cargar notificaciones si el usuario está autenticado
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    // Aquí deberías llamar a la API real para obtener las notificaciones del usuario
    // Por ahora, usamos datos mock pero filtrados por usuario y contexto
    const mockNotifications: Notification[] = [];

    // Notificación de bienvenida - solo para nuevos usuarios
    mockNotifications.push({
      id: `user-${user.id}-welcome`,
      title: '¡Bienvenido a TIYUY!',
      message: `Gracias por unirte a nuestra plataforma, ${user.firstName}. Encuentra la propiedad de tus sueños.`,
      type: 'MARKETING',
      read: false,
      createdAt: new Date().toISOString()
    });

    // Notificación de nuevas propiedades - SOLO si tiene búsquedas guardadas REALES
    if (user.role === 'USER' || user.role === 'AGENT') {
      // En la app real, esto vendría de las búsquedas guardadas del usuario
      // Por ahora, mostramos mensaje explicativo hasta que se conecte con la API real
      mockNotifications.push({
        id: `user-${user.id}-no-searches`,
        title: 'Activa tus búsquedas guardadas',
        message: 'Guarda tus búsquedas en el mapa para recibir notificaciones de nuevas propiedades en tus zonas de interés.',
        type: 'MARKETING',
        read: false,
        createdAt: new Date(Date.now() - 1800000).toISOString()
      });
    }

    // Notificación de suscripción - SOLO si tiene plan con límites y está cerca del límite
    // NO para usuarios que solo buscan o tienen planes ilimitados
    if ((user.role === 'AGENT' || user.role === 'DEVELOPER')) {
      
      // Simular que tiene propiedades publicadas y está cerca del límite
      // En la app real, esto vendría de la API: user.publishedPropertiesCount vs user.subscriptionLimit
      const publishedPropertiesCount = user.publishedPropertiesCount || 0;
      
      // Simular límites según el rol (en la app real vendría del backend)
      let subscriptionLimit = 999; // Default para DEVELOPER (ilimitado)
      if (user.role === 'AGENT') {
        subscriptionLimit = 10; // Límite para AGENTES en plan FREE/BASIC
      }
      
      // Solo mostrar alerta si está cerca del límite y no es DEVELOPER con plan ilimitado
      if (user.role === 'AGENT' && publishedPropertiesCount >= subscriptionLimit - 2) {
        mockNotifications.push({
          id: `user-${user.id}-subscription`,
          title: 'Alcanzando límite de publicaciones',
          message: `Has publicado ${publishedPropertiesCount} de ${subscriptionLimit} propiedades. Considera actualizar tu plan para más publicaciones.`,
          type: 'SUBSCRIPTION_EXPIRING',
          read: false,
          createdAt: new Date(Date.now() - 7200000).toISOString()
        });
      }
    }

    // Notificaciones de contactos - solo para agentes con propiedades publicadas
    if (user.role === 'AGENT') {
      mockNotifications.push({
        id: `user-${user.id}-contact`,
        title: 'Nuevo contacto interesado',
        message: 'María García está interesada en tu departamento en Miraflores. Contáctala pronto.',
        type: 'CONTACT',
        read: false,
        createdAt: new Date(Date.now() - 1800000).toISOString()
      });
    }

    // Simular llamada a la API
    setTimeout(() => {
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 500);
  }, [isAuthenticated, user]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'CONTACT':
        return '💬';
      case 'FAVORITE':
        return '❤️';
      case 'PROPERTY_PUBLISHED':
        return '🏠';
      case 'SUBSCRIPTION_EXPIRING':
        return '⏰';
      case 'MARKETING':
        return '📢';
      default:
        return '📬';
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
          <div className="text-4xl mb-2">🔒</div>
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
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">
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
