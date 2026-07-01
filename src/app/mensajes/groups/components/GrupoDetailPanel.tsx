'use client'

import { useLeaveGroup } from '@/presentation/hooks/useContacts';
import { LogOut, ChevronLeft, MessageSquare, Users } from 'lucide-react';
import { EntityIcon } from '@/utils/entityIcons';
import { GrupoPostsPanel } from './GroupPostsPanel';

export function GrupoDetailPanel({ group, user, onBack }: { group: any; user: any; onBack: () => void }) {
    const leaveGroup = useLeaveGroup();

    const handleLeaveGroup = () => {
        if (confirm(`¿Estás seguro de que quieres salir del grupo "${group.name}"?`)) {
            leaveGroup.mutate(group.id);
            onBack(); 
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            {/* Header del grupo */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 text-white">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 flex-1 ml-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <EntityIcon name={group.name} className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-lg font-bold truncate">{group.name}</h1>
                    </div>
                    <button
                        onClick={handleLeaveGroup}
                        disabled={leaveGroup.isPending}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                        {leaveGroup.isPending ? (
                            <>
                                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                Saliendo...
                            </>
                        ) : (
                            <>
                                <LogOut className="w-4 h-4" />
                                Salir
                            </>
                        )}
                    </button>
                </div>
                <div className="flex items-center gap-4 mt-3 ml-1">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{group.memberCount || 0} miembros</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">{group.postCount || 0} publicaciones</span>
                    </div>
                </div>
            </div>

            {/* Área de publicaciones dinámica */}
            <div className="flex-1 overflow-hidden">
                <GrupoPostsPanel
                    groupId={group.id ?? group.groupId ?? 0}
                    groupName={group.name}
                    currentUserId={user?.id || 0}
                    currentUser={user}
                    onCreatePost={() => {
                    }}
                />
            </div>
        </div>
    );
};