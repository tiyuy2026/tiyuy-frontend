'use client';

import { UserListItem } from '@/core/domain/entities/Admin';
import { Mail, Phone, Calendar, Shield, CheckCircle, XCircle, Eye, Clock, MapPin } from 'lucide-react';

/**
 * UserCardView Component
 * Vista de tarjetas elegante para mostrar usuarios en el panel admin
 */

interface UserCardViewProps {
  users: UserListItem[];
  onViewDetail: (user: UserListItem) => void;
  onToggleStatus?: (user: UserListItem) => void;
  onDelete?: (user: UserListItem) => void;
  canManage?: boolean;
  canDelete?: boolean;
}

export function UserCardView({
  users,
  onViewDetail,
  onToggleStatus,
  onDelete,
  canManage,
  canDelete,
}: UserCardViewProps) {
  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-200',
      AGENT: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200',
      DEVELOPER: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200',
      USER: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-gray-200',
    };
    return styles[role] || styles.USER;
  };

  const getInitials = (user: UserListItem) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200/50 transition-all duration-300 overflow-hidden"
        >
          {/* Barra superior decorativa con gradiente */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400" />

          <div className="p-5">
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  {user.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {getInitials(user)}
                    </div>
                  )}
                  {/* Indicador de estado */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
                      user.enabled ? 'bg-green-500' : 'bg-red-400'
                    }`}
                  />
                </div>

                {/* Nombre y email */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Badge de rol */}
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${getRoleBadge(user.role)}`}
              >
                {user.role}
              </span>
            </div>

            {/* Información detallada */}
            <div className="space-y-2 mb-4">
              {/* Teléfono */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{user.phone || 'Sin teléfono'}</span>
              </div>

              {/* Ubicación */}
              {(user.city || user.country) && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{[user.city, user.country].filter(Boolean).join(', ')}</span>
                </div>
              )}

              {/* Verificaciones */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.emailVerified ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-yellow-500" />
                  )}
                  <span className="text-gray-400">Email</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {user.phoneVerified ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-yellow-500" />
                  )}
                  <span className="text-gray-400">Tel</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 pt-1">
                {user.publishedPropertiesCount > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-semibold text-blue-600">{user.publishedPropertiesCount}</span>
                    <span className="text-gray-400">props</span>
                  </div>
                )}
                {user.publishedProjectsCount > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-semibold text-emerald-600">{user.publishedProjectsCount}</span>
                    <span className="text-gray-400">proys</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer con fechas */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatDate(user.lastLoginAt)}</span>
              </div>
            </div>
          </div>

          {/* Acciones hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
            <button
              onClick={() => onViewDetail(user)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/90 text-gray-800 hover:bg-white shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver Detalle
            </button>
            {canManage && onToggleStatus && (
              <button
                onClick={() => onToggleStatus(user)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-lg transition-all flex items-center gap-1.5 ${
                  user.enabled
                    ? 'bg-yellow-500/90 text-white hover:bg-yellow-500'
                    : 'bg-green-500/90 text-white hover:bg-green-500'
                }`}
              >
                {user.enabled ? 'Pausar' : 'Reanudar'}
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(user)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/90 text-white hover:bg-red-500 shadow-lg transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Eliminar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
