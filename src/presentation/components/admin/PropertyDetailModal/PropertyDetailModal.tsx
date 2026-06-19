/**
 * Property Detail Modal Component
 * Muestra el modal con detalles completos de la propiedad
 */

'use client';

import { PropertyModerationItem } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { Ban, Check, ChevronRight, Home, LayoutDashboard, Loader, Mail, Settings, User, Zap } from 'lucide-react';

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
      <div className="bg-white rounded-xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header Profesional */}
        <div className="bg-[#00E676] px-4 py-3">
          <div className="flex items-center gap-3">
            {property.thumbnailUrl ? (
              <img
                src={property.thumbnailUrl}
                alt={property.title}
                className="w-14 h-14 rounded-xl object-cover border-2 border-green-300 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-green-200 flex items-center justify-center text-green-800 text-xl font-bold border-2 border-green-300 shadow-sm">
                {property.title?.[0]?.toUpperCase() || 'P'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-green-900 truncate">
                {property.title}
              </h3>
              <p className="text-green-700 text-xs mt-0.5 truncate">{property.slug}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(property.status)}`}>
                  {getStatusLabel(property.status)}
                </span>
                {property.isFeatured && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-200 text-purple-800">
                    Destacada
                  </span>
                )}
              </div>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <Loader className="animate-spin h-4 w-4" />
                <span className="text-xs">Cargando...</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* Grid de Información Profesional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información de la Propiedad */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Home className="w-4 h-4 text-teal-600" />
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
                  <User className="w-4 h-4 text-blue-600" />
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
                  <LayoutDashboard className="w-4 h-4 text-purple-600" />
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
                  <Zap className="w-4 h-4 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Acciones Rápidas</h4>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => onNotifyOwner(property)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all text-sm"
                >
                  <span className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-teal-500" />
                    Notificar Propietario
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Status Actions Section */}
          <div className="mt-6 p-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-teal-600" />
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
                      <Loader className="animate-spin h-4 w-4" />
                      Habilitando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
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
                      <Loader className="animate-spin h-4 w-4" />
                      Deshabilitando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Ban className="w-4 h-4" />
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
