'use client';

import { useState } from 'react';
import { useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { useGetActiveStatusPosts, useCreateStatusPost } from '@/presentation/hooks/useContacts';
import { toast } from '@/presentation/store/toastStore';
import { Avatar } from './PropertySearchAndContact';

interface StatusPost {
  id: number;
  content: string;
  location?: string;
  propertyType?: string;
  createdAt: string;
  expiresAt: string;
  author: {
    id: number;
    name: string;
    role: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  shareCount: number;
  isLiked?: boolean;
}

interface StatusPostsWithContactProps {
  onChatCreated?: (chatId: number) => void;
}

export default function StatusPostsWithContact({ onChatCreated }: StatusPostsWithContactProps) {
  const [newStatus, setNewStatus] = useState('');
  const [location, setLocation] = useState('');
  
  const {
    data: statusPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useGetActiveStatusPosts({ location: undefined });

  const createStatus = useCreateStatusPost();
  
  // Mutation to create chat from status post interaction
  const createChatFromStatus = useMutation({
    mutationFn: async ({ authorId, statusId, action }: {
      authorId: number;
      statusId: number;
      action: 'like' | 'comment' | 'contact';
    }) => {
      const response = await fetch(`/api/contacts/extended/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiyuy-auth-token') || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          participantId: authorId,
          statusId,
          initialMessage: action === 'like' ? `❤️ Me gustó tu estado` : 
                        action === 'comment' ? `💬 Quiero comentar sobre tu estado` :
                        `📞 Hola, vi tu estado y me gustaría contactarte`
        })
      });
      if (!response.ok) throw new Error('Error al crear chat');
      return response.json();
    },
    onSuccess: (response) => {
      toast.success('¡Chat creado! Ahora puedes conversar.');
      onChatCreated?.(response.id);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear chat');
    }
  });

  const handleCreateStatus = () => {
    if (!newStatus.trim()) return;
    
    createStatus.mutate({
      content: newStatus,
      location: location || undefined,
      propertyType: 'RENT'
    });
    
    setNewStatus('');
    setLocation('');
  };

  const handleLike = (post: StatusPost) => {
    createChatFromStatus.mutate({
      authorId: post.author.id,
      statusId: post.id,
      action: 'like'
    });
  };

  const handleComment = (post: StatusPost) => {
    createChatFromStatus.mutate({
      authorId: post.author.id,
      statusId: post.id,
      action: 'comment'
    });
  };

  const handleContact = (post: StatusPost) => {
    createChatFromStatus.mutate({
      authorId: post.author.id,
      statusId: post.id,
      action: 'contact'
    });
  };

  const allPosts = statusPosts?.pages.flatMap(page => page.content || page) || [];

  const timeAgo = (date: string): string => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const timeLeft = (expiresAt: string): string => {
    const d = new Date(expiresAt);
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return 'Expirado';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Estados de la Comunidad</h2>
      
      {/* Create New Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <textarea
          placeholder="¿Qué estás pensando? Comparte tu estado..."
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <div className="flex gap-3 mt-3">
          <input
            type="text"
            placeholder="Ubicación (opcional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateStatus}
            disabled={!newStatus.trim() || createStatus.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            Publicar
          </button>
        </div>
      </div>

      {/* Status Posts List */}
      <div className="space-y-4">
        {allPosts.map((post: StatusPost) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Post Header */}
            <div className="flex items-start gap-3 mb-4">
              <Avatar name={post.author.name} role={post.author.role} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{post.author.name}</span>
                  <span className="text-xs text-gray-500">
                    {post.author.role === 'USER' ? 'Propietario' : 
                     post.author.role === 'AGENT' ? 'Agente' : 'Desarrollador'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {timeAgo(post.createdAt)} • {timeLeft(post.expiresAt)} restantes
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
              {post.location && (
                <div className="mt-2 text-sm text-gray-600">
                  📍 {post.location}
                </div>
              )}
            </div>

            {/* Post Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>🔄 {post.shareCount}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleLike(post)}
                disabled={createChatFromStatus.isPending}
                className="flex-1 py-2 px-3 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                ❤️ Like
              </button>
              <button
                onClick={() => handleComment(post)}
                disabled={createChatFromStatus.isPending}
                className="flex-1 py-2 px-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                💬 Comentar
              </button>
              <button
                onClick={() => handleContact(post)}
                disabled={createChatFromStatus.isPending}
                className="flex-1 py-2 px-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                📞 Contactar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="text-center mt-6">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12 text-gray-500">
          <p>Cargando estados...</p>
        </div>
      )}

      {!isLoading && allPosts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No hay estados activos ahora mismo. ¡Sé el primero en publicar!</p>
        </div>
      )}
    </div>
  );
}
