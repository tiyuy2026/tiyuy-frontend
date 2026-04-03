// 🏗️ PÁGINA DE GRUPOS - Arquitectura Hexagonal
// Este archivo pertenece al módulo de GRUPOS (Presentation Layer - Página)

'use client';

import { useState, useEffect } from 'react';
import { useGroups } from '@/presentation/hooks/useGroups';
import { GrupoPostsPanel } from './components/GrupoPostsPanel';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { Group } from '@/core/domain/entities/Group';

export default function GruposPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const { groups, groupsLoading, groupsError } = useGroups();

  // Obtener ID del usuario autenticado
  useEffect(() => {
    const getUserId = () => {
      try {
        // Intentar obtener desde el store de autenticación
        const { useAuthStore } = require('@/presentation/store/authStore');
        const { user } = useAuthStore.getState();
        if (user?.id) {
          setCurrentUserId(user.id);
          return;
        }
      } catch (error) {
        console.warn('No se pudo obtener el usuario desde el store:', error);
      }

      // Fallback: intentar desde localStorage
      try {
        const userData = localStorage.getItem('tiyuy-user') || 
                        localStorage.getItem('user') || 
                        localStorage.getItem('auth-user');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.id) {
            setCurrentUserId(parsedUser.id);
            return;
          }
        }
      } catch (error) {
        console.warn('No se pudo obtener el usuario desde localStorage:', error);
      }

      // Último fallback: usar un ID por defecto (solo para desarrollo)
      console.warn('Usando ID de usuario por defecto - esto debería ser configurado correctamente');
      setCurrentUserId(1);
    };

    getUserId();
  }, []);

  const filteredGroups = groups.filter(grupo =>
    grupo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grupo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePost = () => {
    if (selectedGrupo) {
      // El formulario está integrado en GrupoPostsPanel
      console.log('Crear post en grupo:', selectedGrupo.id);
    } else {
      alert('Por favor selecciona un grupo primero');
    }
  };

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (groupsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error al cargar los grupos</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Panel izquierdo - Lista de grupos */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Mis Grupos</h1>
          <div className="flex items-center space-x-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar grupos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{groups.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {groups.filter(g => g.isUserMember).length}
              </div>
              <div className="text-xs text-gray-600">Unidos</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {groups.reduce((sum, g) => sum + g.postCount, 0)}
              </div>
              <div className="text-xs text-gray-600">Posts</div>
            </div>
          </div>
        </div>

        {/* Lista de grupos */}
        <div className="flex-1 overflow-y-auto">
          {groupsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {searchTerm ? 'No se encontraron grupos' : 'No tienes grupos'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {filteredGroups.map((grupo) => (
                <div
                  key={grupo.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedGrupo?.id === grupo.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedGrupo(grupo as Group)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {grupo.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{grupo.name}</div>
                      <div className="text-sm text-gray-600 truncate">{grupo.description}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{grupo.memberCount} miembros</span>
                        {grupo.postCount > 0 && (
                          <span className="text-xs text-blue-600">{grupo.postCount} posts</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {grupo.isUserMember ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel derecho - Detalles del grupo seleccionado */}
      {selectedGrupo ? (
        <div className="flex-1 flex flex-col">
          {/* Header del grupo */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedGrupo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedGrupo.name}</h2>
                  <p className="text-sm text-gray-600">{selectedGrupo.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGrupo(null)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Área de posts del grupo - Todo integrado */}
          {currentUserId && (
            <GrupoPostsPanel
              groupId={selectedGrupo.id}
              groupName={selectedGrupo.name}
              currentUserId={currentUserId}
              onCreatePost={handleCreatePost}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona un grupo</h3>
            <p className="text-gray-600">
              Elige un grupo de la lista para ver sus publicaciones y participar
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
