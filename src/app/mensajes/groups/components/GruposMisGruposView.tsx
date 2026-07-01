'use client';

import { useState } from 'react';
import { useLeaveGroup, useGetGroups } from '@/presentation/hooks/useContacts';
import { ShareModal } from "@/app/mensajes/page";
import { EntityIcon } from '@/utils/entityIcons';

export function GruposMisGruposView({ user, onGroupSelect }: { user: any; onGroupSelect: (g: any) => void }) {
    const { data: groups, isLoading } = useGetGroups(0, 50);
    const leaveGroup = useLeaveGroup();
    const [shareTarget, setShareTarget] = useState<{ title: string; link: string } | null>(null);
    const misGrupos = groups?.filter((g: any) => g.isMember) ?? [];

    return (
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
            {/* Header estilo Facebook */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Todos los grupos a los que te uniste ({misGrupos.length})
                </h2>
                <button className="text-sm text-blue-600 font-medium hover:underline">
                    Ordenar
                </button>
            </div>

            {isLoading && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                </div>
            )}

            {!isLoading && misGrupos.length === 0 && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4"></div>
                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">No eres miembro de ningún grupo aún</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Ve a "Descubrir" para unirte a grupos</p>
                </div>
            )}

            {/* Grid de tarjetas estilo Facebook */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {misGrupos.map((group: any) => (
                    <div
                        key={group.id}
                        className="bg-white dark:bg-gray-800 border border-brand/30 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer"
                    >
                        {/* Banner del grupo */}
                        <div
                            className="h-28 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center"
                            onClick={() => {
                                onGroupSelect(group);
                            }}
                        >
                            <EntityIcon name={group.name} className="w-14 h-14 text-brand" />
                        </div>

                        {/* Info */}
                        <div className="p-3" onClick={() => {
                            onGroupSelect(group);
                        }}>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 leading-snug mb-1">
                                {group.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {group.memberCount || 0} miembros  {group.postCount || 0} publicaciones
                            </p>
                        </div>

                        {/* Acciones */}
                        <div className="px-3 pb-3 flex items-center gap-2">
                            <button
                                onClick={() => {
                                    onGroupSelect(group);
                                }}
                                className="flex-1 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                            >
                                Ver grupo
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShareTarget({
                                        title: group.name,
                                        link: `${window.location.origin}/groups/${group.id}`
                                    });
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <span className="text-gray-500 dark:text-gray-400 text-xs">···</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {shareTarget && (
                <ShareModal
                    title={shareTarget.title}
                    link={shareTarget.link}
                    onClose={() => setShareTarget(null)}
                />
            )}
        </div>
    );
}