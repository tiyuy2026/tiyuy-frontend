'use client';

import React, { useState, useCallback } from 'react';
import { useAuthStore } from '@/presentation/store';
import { 
  Search, 
  UserPlus, 
  UserX, 
  Shield, 
  Crown, 
  Users,
  Loader2,
  X
} from 'lucide-react';
import { toast } from '@/presentation/store/toastStore';
import {
  useChannelCollaborators,
  useSearchUsersForDelegation,
  useGrantPublishingPermission,
  useRevokePublishingPermission,
  type ChannelCollaborator,
} from '@/presentation/hooks/useContacts';

interface ChannelAccessManagerProps {
  channelId: number;
  channelName: string;
  isChannelAdmin: boolean;
  adminUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  } | null;
  onClose: () => void;
}

interface SearchResult {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  dni?: string;
  avatar?: string;
  role?: string;
}

export function ChannelAccessManager({
  channelId,
  channelName,
  isChannelAdmin,
  adminUser,
  onClose,
}: ChannelAccessManagerProps) {
  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?.id;

  // Queries
  const { data: collaborators, isLoading: collaboratorsLoading } = useChannelCollaborators(channelId);
  const searchMutation = useSearchUsersForDelegation();
  const grantPermission = useGrantPublishingPermission();
  const revokePermission = useRevokePublishingPermission();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      toast.error('Ingresa al menos 3 caracteres para buscar');
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const results = await searchMutation.mutateAsync(searchQuery.trim());
      // Filter out users who are already collaborators
      const existingIds = new Set(collaborators?.map(c => c.userId) || []);
      const filteredResults = results.filter(r => !existingIds.has(r.id) && r.id !== adminUser?.id);
      setSearchResults(filteredResults);
    } catch (error) {
      toast.error('Error al buscar usuarios');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchMutation, collaborators, adminUser]);

  // Handle grant permission
  const handleGrantPermission = async (userId: number) => {
    try {
      await grantPermission.mutateAsync({ channelId, userId });
      // Remove from search results
      setSearchResults(prev => prev.filter(r => r.id !== userId));
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle revoke permission
  const handleRevokePermission = async (userId: number) => {
    try {
      await revokePermission.mutateAsync({ channelId, userId });
    } catch (error) {
      // Error handled by hook
    }
  };

  // Check if current user can manage permissions (only channel admin)
  const canManagePermissions = isChannelAdmin;

  return (
    <div className="fixed right-0 top-[64px] bottom-0 w-80 bg-white border-l border-gray-200 flex flex-col z-50 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Gestión de Acceso</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500">{channelName}</p>
      </div>

      {/* Admin Section */}
      <div className="p-4 border-b border-gray-200 bg-blue-50/50">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-500" />
          Administrador del Canal
        </h4>
        {adminUser ? (
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
              {adminUser.avatar ? (
                <img src={adminUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                adminUser.firstName?.charAt(0).toUpperCase() || 'A'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {adminUser.firstName} {adminUser.lastName}
              </p>
              <p className="text-sm text-gray-500 truncate">{adminUser.email}</p>
            </div>
            <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Información del admin no disponible</p>
        )}
      </div>

      {/* Search Section - Only for Admin */}
      {canManagePermissions && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-green-500" />
            Agregar Colaborador
          </h4>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length < 3) {
                  setShowSearchResults(false);
                }
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por DNI, Email o Nombre..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Presiona Enter para buscar. Mínimo 3 caracteres.
          </p>

          {/* Search Results */}
          {showSearchResults && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {searchResults.length === 0 && !isSearching ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No se encontraron usuarios disponibles
                </p>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.firstName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {user.dni && (
                        <p className="text-xs text-gray-400">DNI: {user.dni}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleGrantPermission(user.id)}
                      disabled={grantPermission.isPending}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Dar permiso de publicación"
                    >
                      {grantPermission.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Collaborators List */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          Colaboradores con Acceso
          {collaborators && collaborators.length > 0 && (
            <span className="ml-auto bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
              {collaborators.length}
            </span>
          )}
        </h4>

        {collaboratorsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : collaborators && collaborators.length > 0 ? (
          <div className="space-y-2">
            {collaborators.map((collaborator) => (
              <CollaboratorCard
                key={collaborator.id}
                collaborator={collaborator}
                canManage={canManagePermissions}
                onRevoke={() => handleRevokePermission(collaborator.userId)}
                isRevoking={revokePermission.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No hay colaboradores con permiso de publicación
            </p>
            {canManagePermissions && (
              <p className="text-xs text-gray-400 mt-1">
                Usa la búsqueda arriba para agregar colaboradores
              </p>
            )}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600">
            Los colaboradores pueden publicar y gestionar contenido, pero{' '}
            <span className="font-semibold text-red-600">no pueden</span> dar permisos a otros usuarios.
            Solo el administrador del canal puede otorgar o revocar accesos.
          </p>
        </div>
      </div>
    </div>
  );
}

// Collaborator Card Component
interface CollaboratorCardProps {
  collaborator: ChannelCollaborator;
  canManage: boolean;
  onRevoke: () => void;
  isRevoking: boolean;
}

function CollaboratorCard({ collaborator, canManage, onRevoke, isRevoking }: CollaboratorCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
        {collaborator.avatar ? (
          <img 
            src={collaborator.avatar} 
            alt="" 
            className="w-full h-full rounded-full object-cover" 
          />
        ) : (
          collaborator.firstName?.charAt(0).toUpperCase() || 'U'
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {collaborator.firstName} {collaborator.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate">{collaborator.email}</p>
        {collaborator.dni && (
          <p className="text-xs text-gray-400">DNI: {collaborator.dni}</p>
        )}
        {collaborator.grantedBy && (
          <p className="text-xs text-gray-400 mt-1">
            Autorizado por: {collaborator.grantedBy.firstName} {collaborator.grantedBy.lastName}
          </p>
        )}
      </div>
      {canManage && (
        <button
          onClick={onRevoke}
          disabled={isRevoking}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Quitar permiso de publicación"
        >
          {isRevoking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserX className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
