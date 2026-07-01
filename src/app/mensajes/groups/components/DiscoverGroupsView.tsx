'use client';

import { useState } from 'react';
import { useGetGroups, useJoinGroup } from '@/presentation/hooks/useContacts';
import { formatCompactNumber } from '@/utils/formatters';
import { FileText, Search, Users } from 'lucide-react';
import { EntityIcon } from '@/utils/entityIcons';

export default function DiscoverGroupsView({ user, onGroupSelect }: { user: any; onGroupSelect: (group: any) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: groups, isLoading } = useGetGroups(0, 50);
  const joinGroup = useJoinGroup();
  const availableGroups = groups?.filter((g: any) => !g.isMember) ?? [];
  const filteredGroups = availableGroups.filter((group: any) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleJoinGroup = (groupId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (joinGroup.mutate) {
      joinGroup.mutate(groupId);
    }
  };


  return (
    <div className="h-full bg-white p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Descubrir Grupos</h2>
          <div className="text-sm text-gray-500">
            {filteredGroups.length} grupos disponibles
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar grupos..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>
        )}

        {/* No groups available */}
        {!isLoading && filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl"></span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {searchTerm ? 'No se encontraron grupos' : 'No hay grupos disponibles'}
            </h3>
            <p className="text-gray-600 text-sm text-center max-w-md leading-relaxed">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'No hay grupos disponibles para unirte en este momento'
              }
            </p>
          </div>
        )}

        {/* Grid de grupos disponibles */}
        {!isLoading && filteredGroups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group: any) => (
              <div
                key={group.id}
                className="bg-white border border-brand/30 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={(e) => {
                  if (!group.isMember) {
                    handleJoinGroup(group.id, e);
                  }
                  setTimeout(() => onGroupSelect(group), 300);
                }}
              >
                {/* Banner del grupo */}
                <div className="h-24 bg-gray-100 flex items-center justify-center">
                  <EntityIcon name={group.name} className="w-12 h-12 text-brand" />
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                    {group.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {group.description || 'Sin descripción disponible'}
                  </p>
                  
                  {/* Group stats aligned */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>{formatCompactNumber(group.memberCount)} members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>{group.postCount || 0} posts</span>
                    </div>
                  </div>

                  {/* Indicador de estado */}
                  <div className="w-full py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg text-center hover:bg-gray-700 transition-colors">
                    {group.isMember ? 'Entrar al grupo' : joinGroup.isPending ? 'Uniéndose...' : 'Entrar'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
