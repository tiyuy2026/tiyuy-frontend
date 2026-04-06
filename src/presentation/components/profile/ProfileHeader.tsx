'use client';

import { User } from '@/core/domain/entities';
import { Camera, MapPin, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';

interface ProfileHeaderProps {
  user: User;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      case 'AGENT':
        return 'bg-green-100 text-green-800';
      case 'DEVELOPER':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'USER':
        return 'Usuario';
      case 'AGENT':
        return 'Agente Inmobiliario';
      case 'DEVELOPER':
        return 'Desarrollador';
      case 'ADMIN':
        return 'Administrador';
      default:
        return role;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black opacity-10"></div>
      </div>

      {/* Profile Info */}
      <div className="px-8 pb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <div className="relative group">
            <UserAvatar user={user} size="2xl" className="shadow-xl border-4 border-white" />
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex items-center justify-center sm:justify-start mt-2 space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    <Shield className="w-4 h-4 mr-1" />
                    {getRoleLabel(user.role)}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    Miembro desde {new Date(user.createdAt).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">{user.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">Lima, Perú</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Shield className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-sm">
                  {user.emailVerified ? 'Email verificado' : 'Email no verificado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{user.publishedPropertiesCount}</div>
            <div className="text-sm text-gray-500">Propiedades Publicadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Favoritos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Visitas Recibidas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Mensajes</div>
          </div>
        </div>
      </div>
    </div>
  );
};
