'use client';

import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useReceivedContacts, useMarkAsRead, useUnreadCount } from '@/presentation/hooks/useContacts';
import Link from 'next/link';

export default function MessagesPage() {
  const { data, isLoading } = useReceivedContacts();
  const { data: unreadCount } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();

  const handleMarkAsRead = (contactId: number) => {
    markAsReadMutation.mutate(contactId);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mensajes Recibidos</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount && unreadCount > 0 && (
                <span className="text-blue-600 font-semibold">
                  {unreadCount} mensaje{unreadCount !== 1 ? 's' : ''} sin leer
                </span>
              )}
            </p>
          </div>

          <Link
            href="/mensajes/enviados"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Ver Enviados
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data && data.content.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No tienes mensajes recibidos
            </h3>
            <p className="text-gray-500">
              Los mensajes de interesados en tus propiedades aparecerán aquí
            </p>
          </div>
        )}

        {/* Messages List */}
        {!isLoading && data && data.content.length > 0 && (
          <div className="space-y-4">
            {data.content.map((contact) => (
              <div
                key={contact.id}
                className={`
                  bg-white rounded-lg shadow p-6 transition-all
                  ${!contact.isRead ? 'border-l-4 border-blue-600' : ''}
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {contact.contactName}
                      {!contact.isRead && (
                        <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Interesado en: <span className="font-semibold">{contact.propertyTitle}</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700">{contact.message}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📧 {contact.contactEmail}</p>
                    <p>📞 {contact.contactPhone}</p>
                  </div>

                  {!contact.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(contact.id)}
                      disabled={markAsReadMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Marcar como leído
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
