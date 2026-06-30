'use client'

import { useState } from "react";
import { Icon } from '@iconify/react';
import { Avatar } from '@/app/mensajes/chats/components/ChatsPanel';
import { useShareStatusPost } from "@/presentation/hooks/useContacts";
import { expiresPercent, timeLeft } from "@/app/mensajes/page";
import { ShareModal } from "@/app/mensajes/page";
import { useGetActiveStatusPosts } from "@/presentation/hooks/useContacts";
import { IC } from "@/app/mensajes/page";

const ROLE_BADGE: Record<string, string> = {
    USER: 'bg-brand/10 text-brand',
    AGENT: 'bg-brand/10 text-brand',
    DEVELOPER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-slate-100 text-slate-700',
};

const ROLE_LABEL: Record<string, string> = {
    USER: 'Propietario',
    AGENT: 'Agente',
    DEVELOPER: 'Desarrollador',
    ADMIN: 'Admin',
};

export default function EstadosPanel({ user, onNewStatus, onStatusSelect, selectedStatusId }: {
    user: any;
    onNewStatus: () => void;
    onStatusSelect?: (id: number) => void;
    selectedStatusId?: number | null;
}) {
    const [shareTarget, setShareTarget] = useState<{ title: string; link: string } | null>(null);
    const [locationFilter, setLocationFilter] = useState('');
    const shareStatus = useShareStatusPost();

    const { data: statusData, isLoading, fetchNextPage, hasNextPage } = useGetActiveStatusPosts({
        location: locationFilter || undefined,
    });

    const allPosts = statusData?.pages?.flatMap((p: any) => p.content) ?? [];

    const handleShare = async (postId: number, postTitle: string) => {
        // Mostrar feedback inmediato al usuario
        setShareTarget({ title: postTitle, link: window.location.origin });

        // Intentar registrar el share en el backend de forma asíncrona (sin bloquear)
        shareStatus.mutate(postId, {
            onError: (error: any) => {
                console.warn('No se pudo registrar el share en el backend:', error);
                // No mostrar error al usuario ya que el compartido ya funcionó
            },
            onSuccess: () => {
                console.log('Share registrado exitosamente en el backend');
            }
        });
    };

    const handleStatusClick = (postId: number) => {
        if (onStatusSelect) {
            onStatusSelect(postId);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800">Estados · 48h</h2>
                <button onClick={onNewStatus}
                    className="text-xs bg-brand text-white px-4 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity shadow-sm">
                    + Publicar
                </button>
            </div>

            {/* Filtro ubicación */}
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5">
                    <IC.Search />
                    <input
                        value={locationFilter}
                        onChange={e => setLocationFilter(e.target.value)}
                        placeholder="Filtrar por zona o distrito..."
                        className="bg-transparent text-xs text-gray-700 placeholder-gray-400 flex-1 focus:outline-none"
                    />
                </div>
            </div>

            {/* Mi estado */}
            <div onClick={onNewStatus}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full p-0.5 bg-brand">
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                            <Avatar name={user?.firstName ?? 'U'} role={user?.role} size="md" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-brand rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-white text-xs font-bold leading-none">+</span>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">Mi estado</p>
                    <p className="text-xs text-gray-400">Toca para publicar · dura 48 horas</p>
                </div>
            </div>

            {/* Sección recientes */}
            {!isLoading && allPosts.length > 0 && (
                <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Recientes
                    </p>
                </div>
            )}

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
                    </div>
                ) : allPosts.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <p className="text-gray-500 text-sm font-medium">No hay estados activos</p>
                        <p className="text-gray-400 text-xs mt-1">Sé el primero en publicar una búsqueda</p>
                    </div>
                ) : (
                    <>
                        {allPosts.map((post: any) => {
                            const percent = expiresPercent(new Date(post.createdAt), new Date(post.expiresAt));
                            const isUrgent = percent >= 75;
                            const badge = ROLE_BADGE[post.userRole] ?? 'bg-gray-100 text-gray-600';
                            const roleLabel = ROLE_LABEL[post.userRole] ?? 'Usuario';
                            return (
                                <div key={post.id}
                                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors cursor-pointer ${selectedStatusId === post.id ? 'bg-brand/10 dark:bg-gray-600' : ''}`}
                                    onClick={() => handleStatusClick(post.id)}>
                                    <div className="relative flex-shrink-0 w-12 h-12">
                                        <Icon icon="svg-spinners:ring-resize" className={`w-12 h-12 ${isUrgent ? 'text-red-400' : 'text-blue-500'}`} />
                                        <div className="absolute inset-1.5">
                                            <Avatar name={post.userName ?? 'U'} role={post.userRole} size="md" src={post.userAvatar} />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-900">{post.userName}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge}`}>{roleLabel}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                                <span className={`text-[10px] font-medium ${isUrgent ? 'text-red-400' : 'text-gray-400'}`}>
                                                    {isUrgent ? '️ ' : ''}{timeLeft(new Date(post.expiresAt))}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{post.content}</p>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            {post.location && (
                                                <span className="inline-flex items-center gap-1 text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
                                                    {post.location}
                                                </span>
                                            )}
                                            {post.propertyType && (
                                                <span className="inline-flex items-center gap-1 text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
                                                    {post.propertyType}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-400 ml-auto">{post.viewCount} vistas</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {hasNextPage && (
                            <div className="flex justify-center py-4">
                                <button onClick={() => fetchNextPage()}
                                    className="text-xs text-brand font-medium hover:underline">
                                    Cargar más estados
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {shareTarget && (
                <ShareModal title={shareTarget.title} link={shareTarget.link} onClose={() => setShareTarget(null)} />
            )}
        </div>
    );
}