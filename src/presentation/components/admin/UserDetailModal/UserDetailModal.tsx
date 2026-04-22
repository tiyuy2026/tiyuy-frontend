/**
 * User Detail Modal Component
 * Muestra el modal con detalles completos del usuario
 */

'use client';

import { UserListItem } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';

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
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
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
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
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
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Estado de Verificación</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200/60">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">Email</span>
                  </div>
                  {user.emailVerified ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verificado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Pendiente
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-600">Teléfono</span>
                  </div>
                  {user.phoneVerified ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verificado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
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
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
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
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
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
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
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
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Ver Proyectos
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Verificando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
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
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Verificando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
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
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
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
