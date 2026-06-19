/**
 * User Detail Modal Component
 * Muestra el modal con detalles completos del usuario
 */

'use client';

import { UserListItem } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { Building, CheckCircle, CheckSquare, Home, LayoutDashboard, Loader, Mail, Phone, User, XCircle, Zap } from 'lucide-react';

interface UserDetailModalProps {
  user: UserListItem | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onVerifyEmail: (userId: number) => void;
  onVerifyPhone: (userId: number) => void;
  onViewProperties: (user: UserListItem) => void;
  onViewProjects: (user: UserListItem) => void;
  isEmailVerifying: boolean;
  isPhoneVerifying: boolean;
}

export function UserDetailModal({
  user,
  isLoading,
  isOpen,
  onClose,
  onVerifyEmail,
  onVerifyPhone,
  onViewProperties,
  onViewProjects,
  isEmailVerifying,
  isPhoneVerifying,
}: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#00E676] px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {user.profilePhotoUrl ? (
              <img
                src={user.profilePhotoUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-green-300 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-green-800 text-lg font-bold border-2 border-green-300 shadow-sm flex-shrink-0">
                {user.firstName?.[0] || user.email[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-green-900 truncate">
                {user.firstName || ''} {user.lastName || ''}
              </h3>
              <p className="text-green-700 text-xs mt-0.5 truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  user.enabled
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                }`}>
                  {user.enabled ? 'Activo' : 'Desactivado'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-200 text-green-800">
                  {user.role}
                </span>
              </div>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-green-700 text-sm flex-shrink-0">
                <Loader className="animate-spin h-4 w-4" />
                <span className="text-xs">Cargando...</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Grid de 2 columnas en desktop, 1 en mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Información de Contacto */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Contacto</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60 gap-2">
                  <span className="text-gray-500 flex-shrink-0">Email</span>
                  <span className="font-medium text-gray-900 text-right truncate max-w-[140px]">{user.email || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60 gap-2">
                  <span className="text-gray-500 flex-shrink-0">Teléfono</span>
                  <span className="font-medium text-gray-900 text-right">{user.phone || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60 gap-2">
                  <span className="text-gray-500 flex-shrink-0">DNI</span>
                  <span className="font-medium text-gray-900 text-right">{user.dni || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 gap-2">
                  <span className="text-gray-500 flex-shrink-0">Ubicación</span>
                  <span className="font-medium text-gray-900 text-right truncate max-w-[140px]">
                    {user.city && user.country
                      ? `${user.city}, ${user.country}`
                      : user.city || user.country || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado de Verificación */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Verificación</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-200/60">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600">Email</span>
                  </div>
                  {user.emailVerified ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckSquare className="w-3 h-3" />
                      Verificado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" />
                      Pendiente
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600">Teléfono</span>
                  </div>
                  {user.phoneVerified ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckSquare className="w-3 h-3" />
                      Verificado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" />
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actividad */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <LayoutDashboard className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Actividad</h4>
              </div>
              <div className="space-y-2 text-xs">
                {(user.role === 'AGENT' || user.role === 'USER') && (
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60">
                    <span className="text-gray-500">Propiedades</span>
                    <span className="font-semibold text-gray-900">{user.publishedPropertiesCount || 0}</span>
                  </div>
                )}
                {user.role === 'DEVELOPER' && (
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60">
                    <span className="text-gray-500">Proyectos</span>
                    <span className="font-semibold text-gray-900">{user.publishedProjectsCount || 0}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200/60">
                  <span className="text-gray-500">Último acceso</span>
                  <span className="font-medium text-gray-900 text-right text-[11px]">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
                      : 'Nunca'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-500">Miembro desde</span>
                  <span className="font-medium text-gray-900 text-right text-[11px]">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Acciones</h4>
              </div>
              <div className="space-y-1.5">
                {(user.role === 'AGENT' || user.role === 'USER') && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewProperties(user);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-xs"
                  >
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <Home className="w-3.5 h-3.5 text-blue-500" />
                      Ver Propiedades
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                      {user.publishedPropertiesCount || 0}
                    </span>
                  </button>
                )}
                {user.role === 'DEVELOPER' && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewProjects(user);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all text-xs"
                  >
                    <span className="flex items-center gap-1.5 text-gray-700">
                      <Building className="w-3.5 h-3.5 text-teal-500" />
                      Ver Proyectos
                    </span>
                    <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                      {user.publishedProjectsCount || 0}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Verification Section - Pendiente */}
          {(!user.emailVerified || !user.phoneVerified) && (
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Verificación Pendiente</h4>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Este usuario tiene verificaciones pendientes.
              </p>
              <div className="flex gap-2 flex-wrap">
                {!user.emailVerified && (
                  <Button
                    onClick={() => onVerifyEmail(user.id)}
                    disabled={isEmailVerifying || isLoading}
                    variant="primary"
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30"
                  >
                    {isEmailVerifying ? (
                      <span className="flex items-center gap-1.5 text-xs">
                        <Loader className="animate-spin h-3 w-3" />
                        Verificando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs">
                        <Mail className="w-3 h-3" />
                        Verificar Email
                      </span>
                    )}
                  </Button>
                )}
                {!user.phoneVerified && (
                  <Button
                    onClick={() => onVerifyPhone(user.id)}
                    disabled={isPhoneVerifying || isLoading}
                    variant="primary"
                    size="sm"
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/30"
                  >
                    {isPhoneVerifying ? (
                      <span className="flex items-center gap-1.5 text-xs">
                        <Loader className="animate-spin h-3 w-3" />
                        Verificando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs">
                        <Phone className="w-3 h-3" />
                        Verificar Teléfono
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Verification Status - Completo */}
          {user.emailVerified && user.phoneVerified && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <span className="font-semibold text-green-800 text-sm block">Usuario Verificado</span>
                  <p className="text-xs text-green-600">Email y teléfono verificados</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-center p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="px-8">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
