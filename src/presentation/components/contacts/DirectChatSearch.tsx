'use client';

import { useState } from 'react';
import { Avatar } from './PropertySearchAndContact';
import { useDirectChatSearch } from '@/presentation/hooks/useDirectChatSearch';

interface User {
  id: number;
  name: string;
  role: 'USER' | 'AGENT' | 'DEVELOPER' | 'ADMIN';
  phone: string;
  properties?: Array<{
    id: number;
    title: string;
    city: string;
    price: number;
  }>;
  avatar?: string;
}

interface DirectChatSearchProps {
  onChatCreated?: (chatId: number) => void;
}

export default function DirectChatSearch({ onChatCreated }: DirectChatSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'name' | 'role' | 'phone' | 'city'>('all');

  const { apiUsers, loadingUsers, createDirectChat } = useDirectChatSearch(
    searchTerm,
    searchType,
    onChatCreated
  );

  const handleStartChat = (user: User) => {
    createDirectChat.mutate({
      userId: user.id,
      initialMessage: `Hola ${user.name}, me gustaría conversar contigo.`
    });
  };

  const filteredUsers = apiUsers.filter((user: User) => {
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    switch (searchType) {
      case 'name':
        return user.name.toLowerCase().includes(term);
      case 'role':
        return user.role.toLowerCase().includes(term);
      case 'phone':
        return user.phone.includes(term);
      case 'city':
        return user.properties?.some(prop => prop.city.toLowerCase().includes(term));
      default:
        return user.name.toLowerCase().includes(term) ||
               user.role.toLowerCase().includes(term) ||
               user.phone.includes(term) ||
               user.properties?.some(prop =>
                 prop.title.toLowerCase().includes(term) ||
                 prop.city.toLowerCase().includes(term)
               );
    }
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'USER': return 'Propietario';
      case 'AGENT': return 'Agente';
      case 'DEVELOPER': return 'Desarrollador';
      case 'ADMIN': return 'Administrador';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'USER': return 'bg-blue-100 text-blue-700';
      case 'AGENT': return 'bg-teal-100 text-teal-700';
      case 'DEVELOPER': return 'bg-purple-100 text-purple-700';
      case 'ADMIN': return 'bg-slate-100 text-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Buscar y Chatear Directamente</h2>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar usuarios (nombre, rol, teléfono, ciudad)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los campos</option>
            <option value="name">Nombre</option>
            <option value="role">Rol</option>
            <option value="phone">Teléfono</option>
            <option value="city">Ciudad</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user: User) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <Avatar name={user.name} role={user.role} size="lg" />

              <div className="flex-1">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>

                <div className="text-gray-600 mb-3">
                  📞 {user.phone}
                </div>

                {/* Properties */}
                {user.properties && user.properties.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Propiedades ({user.properties.length}):
                    </div>
                    <div className="space-y-2">
                      {user.properties.map((property: any) => (
                        <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{property.title}</div>
                            <div className="text-xs text-gray-600">
                              📍 {property.city} • 💰 ${property.price}/mes
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleStartChat(user)}
                  disabled={createDirectChat.isPending}
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                >
                  💬 Iniciar Conversación
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No se encontraron usuarios que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}
