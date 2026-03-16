// 🏗️ PÁGINA DE GRUPOS - Arquitectura Hexagonal
// Este archivo pertenece al módulo de GRUPOS (Presentation Layer - Página)

'use client';

import React, { useState } from 'react';
import { useGroups } from '@/presentation/hooks/useGroups';
import { GrupoCard } from './components/GrupoCard';
import { GrupoPostForm } from './components/GrupoPostForm';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { Group } from '@/core/domain/entities/Group';

export default function GruposPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { groups, groupsLoading, groupsError } = useGroups();

  const filteredGroups = groups.filter(grupo =>
    grupo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grupo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePost = () => {
    if (selectedGrupo) {
      setShowCreateForm(true);
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mis Grupos
        </h1>
        <p className="text-gray-600">
          Participa en comunidades y comparte experiencias con otros miembros
        </p>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Users className="w-4 h-4" />
            Ver Todos
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{groups.length}</div>
          <div className="text-sm text-gray-600">Total Grupos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {groups.filter(g => g.isUserMember).length}
          </div>
          <div className="text-sm text-gray-600">Mis Grupos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {groups.reduce((sum, g) => sum + g.postCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Posts</div>
        </div>
      </div>

      {/* Lista de grupos */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron grupos' : 'No tienes grupos aún'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta con otra búsqueda' : 'Únete a grupos para empezar a participar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((grupo) => (
            <div key={grupo.id} className="cursor-pointer" onClick={() => setSelectedGrupo(grupo as Group)}>
              <GrupoCard grupo={grupo} currentUserId={1} />
            </div>
          ))}
        </div>
      )}

      {/* Modal de crear post */}
      {showCreateForm && selectedGrupo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <GrupoPostForm
              groupId={selectedGrupo.id}
              currentUserId={1}
              onClose={() => setShowCreateForm(false)}
              onSuccess={() => {
                setShowCreateForm(false);
                // Aquí podrías recargar los posts del grupo
              }}
            />
          </div>
        </div>
      )}

      {/* Panel de detalles del grupo seleccionado */}
      {selectedGrupo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedGrupo.name}
                </h2>
                <button
                  onClick={() => setSelectedGrupo(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Aquí irán los posts del grupo */}
              <div className="text-center py-12">
                <div className="text-gray-500">
                  Posts del grupo {selectedGrupo.name} aparecerán aquí...
                </div>
                <button
                  onClick={handleCreatePost}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Primer Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
