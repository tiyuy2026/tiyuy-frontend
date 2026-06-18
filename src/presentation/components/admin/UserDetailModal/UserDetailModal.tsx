/**
 * User Detail Modal Component
 * Muestra el modal con detalles completos del usuario
 */

'use client';

import { UserListItem } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { Building, CheckCircle, CheckSquare, ChevronRight, Home, LayoutDashboard, Loader, Mail, Phone, User, XCircle, Zap } from 'lucide-react';

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
      <div className="bg-white rounded-xl p-0 max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-5">
          <div className="flex items-center gap-4">
            {user.profilePhotoUrl ? (
              <img
                src={user.profilePhotoUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30 shadow-lg">
                {user.firstName?.[0] || user.email[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">
                {user.firstName || ''} {user.lastName || ''}
              </h3>
              <p className="text-blue-100 text-sm mt-0.5 truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  user.enabled
                    ? 'bg-green-400/30 text-green-50 border border-green-400/40'
                    : 'bg-red-400/30 text-red-50 border border-red-400/40'
                }`}>
                  {user.enabled ? 'Activo' : 'Desactivado'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30">
                  {user.role}
                </span>
              </div>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Loader className="animate-spin h-4 w-4" />
                <span className="text-xs">Cargando...</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Grid de Información Profesional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información de Contacto */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Información de Contacto</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900 truncate max-w-[180px]">{user.email || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                  <span className="text-gray-500">Teléfono</span>
                  <span className="font-medium text-gray-900">{user.phone || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                  <span className="text-gray-500">DNI</span>
                  <span className="font-medium text-gray-900">{user.dni || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Ubicación</span>
                  <span className="font-medium text-gray-900">
                    {user.city && user.country
                      ? `${user.city}, ${user.country}`
                      : user.city || user.country || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado de Verificación */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Estado de Verificación</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200/60">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Email</span>
                  </div>
                  {user.emailVerified ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckSquare className="w-3.5 h-3.5" />
                      Verificado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3.5 h-3.5" />
                      Pendiente
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Teléfono</span>
                  </div>
                  {user.phoneVerified ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckSquare className="w-3.5 h-3.5" />
                      Verificado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3.5 h-3.5" />
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actividad */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Actividad</h4>
              </div>
              <div className="space-y-3 text-sm">
                {(user.role === 'AGENT' || user.role === 'USER') && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                    <span className="text-gray-500">Propiedades</span>
                    <span className="font-semibold text-gray-900">{user.publishedPropertiesCount || 0}</span>
                  </div>
                )}
                {user.role === 'DEVELOPER' && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                    <span className="text-gray-500">Proyectos</span>
                    <span className="font-semibold text-gray-900">{user.publishedProjectsCount || 0}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                  <span className="text-gray-500">Último acceso</span>
                  <span className="font-medium text-gray-900">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
                      : 'Nunca'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Miembro desde</span>
                  <span className="font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de Acción Rápida */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Acciones Rápidas</h4>
              </div>
              <div className="space-y-2">
                {(user.role === 'AGENT' || user.role === 'USER') && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewProperties(user);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-sm"
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      <Home className="w-4 h-4 text-blue-500" />
                      Ver Propiedades
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
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
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all text-sm"
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      <Building className="w-4 h-4 text-teal-500" />
                      Ver Proyectos
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        
        {/* Verification Section */}
        {user && (!user.emailVerified || !user.phoneVerified) && (
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Verificación Pendiente</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Este usuario tiene verificaciones pendientes. Revise la documentación antes de proceder.
            </p>
            <div className="flex gap-3 flex-wrap">
              {!user.emailVerified && (
                <Button
                  onClick={() => onVerifyEmail(user.id)}
                  disabled={isEmailVerifying || isLoading}
                  variant="primary"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 transition-all duration-200"
                >
                  {isEmailVerifying ? (
                    <span className="flex items-center gap-2">
                      <Loader className="animate-spin h-4 w-4" />
                      Verificando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
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
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/30 transition-all duration-200"
                >
                  {isPhoneVerifying ? (
                    <span className="flex items-center gap-2">
                      <Loader className="animate-spin h-4 w-4" />
                      Verificando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Verificar Teléfono
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Verification Status */}
        {user.emailVerified && user.phoneVerified && (
          <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <span className="font-semibold text-green-800 block">Usuario Completamente Verificado</span>
                <p className="text-sm text-green-600">
                  Email y teléfono verificados correctamente
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
      </div>
    </Modal>
  );
}
