'use client';

import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useSentContacts } from '@/presentation/hooks/useContacts';
import Link from 'next/link';

export default function SentMessagesPage() {
  const { data, isLoading } = useSentContacts();

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mensajes Enviados</h1>
            <p className="text-gray-600 mt-1">
              Historial de mensajes que has enviado
            </p>
          </div>

          <Link
            href="/messages"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Ver Recibidos
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
            <div className="text-6xl mb-4">📤</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No has enviado mensajes
            </h3>
            <p className="text-gray-500 mb-4">
              Cuando contactes propietarios, verás el historial aquí
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Buscar propiedades
            </Link>
          </div>
        )}

        {/* Messages List */}
        {!isLoading && data && data.content.length > 0 && (
          <div className="space-y-4">
            {data.content.map((contact) => (
              <div key={contact.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {contact.propertyTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Estado:{' '}
                      <span
                        className={`font-semibold ${
                          contact.status === 'PENDING'
                            ? 'text-yellow-600'
                            : contact.status === 'CONTACTED'
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {contact.status === 'PENDING' && 'Pendiente'}
                        {contact.status === 'CONTACTED' && 'Contactado'}
                        {contact.status === 'CLOSED' && 'Cerrado'}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(contact.createdAt).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700">{contact.message}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <p>Enviado desde: {contact.contactEmail}</p>
                  </div>

                  {contact.status === 'PENDING' && (
                    <span className="text-xs text-yellow-600 font-semibold">
                      ⏳ Esperando respuesta
                    </span>
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
