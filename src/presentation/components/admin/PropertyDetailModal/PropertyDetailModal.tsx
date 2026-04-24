/**
 * Property Detail Modal Component
 * Muestra el modal con detalles completos de la propiedad
 */

'use client';

import { PropertyModerationItem } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';

interface PropertyDetailModalProps {
  property: PropertyModerationItem | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onEnableProperty: (property: PropertyModerationItem) => void;
  onDisableProperty: (property: PropertyModerationItem, reason: string) => void;
  onNotifyOwner: (property: PropertyModerationItem) => void;
  isEnabling: boolean;
  isDisabling: boolean;
}

export function PropertyDetailModal({
  property,
  isLoading,
  isOpen,
  onClose,
  onEnableProperty,
  onDisableProperty,
  onNotifyOwner,
  isEnabling,
  isDisabling,
}: PropertyDetailModalProps) {
  if (!property) return null;

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'PUBLISHED': 'Publicada',
      'PENDING': 'Pendiente',
      'REJECTED': 'Rechazada',
      'SUSPENDED': 'Suspendida',
      'DRAFT': 'Borrador',
      'PAUSED': 'Pausada',
      'EXPIRED': 'Expirada',
      'DISABLED_BY_ADMIN': 'Deshabilitada',
      'RENTED': 'Alquilada',
      'SOLD': 'Vendida'
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-400/30 text-green-50 border border-green-400/40';
      case 'PENDING':
        return 'bg-amber-400/30 text-amber-50 border border-amber-400/40';
      case 'REJECTED':
        return 'bg-red-400/30 text-red-50 border border-red-400/40';
      case 'DISABLED_BY_ADMIN':
        return 'bg-red-400/30 text-red-50 border border-red-400/40';
      default:
        return 'bg-gray-400/30 text-gray-50 border border-gray-400/40';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-0 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-5">
          <div className="flex items-center gap-4">
            {property.thumbnailUrl ? (
              <img
                src={property.thumbnailUrl}
                alt={property.title}
                className="w-20 h-20 rounded-xl object-cover border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30 shadow-lg">
                {property.title?.[0]?.toUpperCase() || 'P'}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">
                {property.title}
              </h3>
              <p className="text-teal-100 text-sm mt-0.5 truncate">{property.slug}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
                  {getStatusLabel(property.status)}
                </span>
                {property.isFeatured && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-400/30 text-purple-50 border border-purple-400/40">
                    Destacada
                  </span>
                )}
              </div>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span className="text-xs">Cargando...</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Grid de Información Profesional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información de la Propiedad */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Información de la Propiedad</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Precio</span>
                  <span className="font-semibold text-green-600">${property.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ubicación</span>
                  <span className="font-medium text-gray-900 truncate max-w-[150px]">{property.district}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Creada</span>
                  <span className="font-medium text-gray-900">{new Date(property.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Propietario */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Propietario</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500">Nombre</span>
                  <div className="font-medium text-gray-900 truncate">{property.ownerName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Email</span>
                  <div className="font-medium text-gray-900 truncate">{property.ownerEmail}</div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Estadísticas</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start py-2 border-b border-gray-200/60 gap-2">
                  <span className="text-gray-500 whitespace-nowrap">Vistas</span>
                  <span className="font-semibold text-gray-900 text-right">{(property.viewsCount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-gray-200/60 gap-2">
                  <span className="text-gray-500 whitespace-nowrap">Reportes</span>
                  <span className={`font-semibold text-right ${property.reportCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {property.reportCount} {property.reportCount === 1 ? 'reporte' : 'reportes'}
                  </span>
                </div>
                <div className="flex justify-between items-start py-2 gap-2">
                  <span className="text-gray-500 whitespace-nowrap">Publicada</span>
                  <span className="font-medium text-gray-900 text-right break-words">
                    {property.publishedAt
                      ? new Date(property.publishedAt).toLocaleDateString('es-ES')
                      : 'No publicada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Acciones Rápidas</h4>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => onNotifyOwner(property)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all text-sm"
                >
                  <span className="flex items-center gap-2 text-gray-700">
                    <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Notificar Propietario
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Status Actions Section */}
          <div className="mt-6 p-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">Gestión de Estado</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Administra el estado de esta propiedad según sea necesario.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              {property.status === 'DISABLED_BY_ADMIN' && (
                <Button
                  onClick={() => onEnableProperty(property)}
                  disabled={isEnabling || isLoading}
                  variant="primary"
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/30 transition-all duration-200"
                >
                  {isEnabling ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Habilitando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Habilitar Propiedad
                    </span>
                  )}
                </Button>
              )}
              {property.status !== 'DISABLED_BY_ADMIN' && (
                <Button
                  onClick={() => onDisableProperty(property, 'Deshabilitado por administrador desde el modal de detalles')}
                  disabled={isDisabling || isLoading}
                  variant="danger"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/30 transition-all duration-200"
                >
                  {isDisabling ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Deshabilitando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Deshabilitar Propiedad
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 p-4 pt-4 border-t bg-white">
          <Button variant="outline" onClick={onClose} className="px-8">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
