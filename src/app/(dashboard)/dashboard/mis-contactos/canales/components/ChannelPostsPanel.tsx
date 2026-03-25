'use client';

import React, { useState } from 'react';
import { useChannelPosts, useChannelInteractions, useCreateChannelPost } from '@/presentation/hooks/useContacts';
import { Plus, MessageSquare, Heart, Share2, Clock, Calendar } from 'lucide-react';
import ChannelEventsPanel from './ChannelEventsPanel';
import CreateEventModal from './CreateEventModal';
import { useQueryClient } from '@tanstack/react-query';

interface ChannelPostsPanelProps {
  channelId: number;
  channelName: string;
  currentUserId: number;
  currentUser: any;
  onCreatePost: () => void;
  onCreateEvent: () => void;
}

export function ChannelPostsPanel({ 
  channelId, 
  channelName, 
  currentUserId, 
  currentUser,
  onCreatePost,
  onCreateEvent
}: ChannelPostsPanelProps) {
  
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const queryClient = useQueryClient();
  
  const currentUserName = currentUser?.firstName && currentUser?.lastName 
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser?.firstName 
    || currentUser?.lastName
    || currentUser?.name
    || currentUser?.username
    || `Usuario ${currentUserId}`;
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState('');
  
  const postsQuery = useChannelPosts(channelId);
  const createPostMutation = useCreateChannelPost();
  
  const { 
    likePost, 
    sharePost,
    isLikingPost,
    isSharingPost 
  } = useChannelInteractions(currentUserId);

  const [showWelcome, setShowWelcome] = useState(true);
  const posts = postsQuery.data;

  const canCreateContent = currentUser?.role === 'AGENT' || currentUser?.role === 'INMOBILIARIA';

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    const postData = {
      content: newPost.trim(),
      postType: 'NOTICIA',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontStyle: 'normal',
      borderStyle: 'none',
      postStyle: 'default',
      userId: currentUserId
    };

    try {
      await createPostMutation.mutateAsync({ channelId, postData });
      setNewPost('');
      setShowCreateForm(false);
      setShowWelcome(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'ahora';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    if (diffInHours < 48) return 'ayer';
    return date.toLocaleDateString('es-ES');
  };

  const getExpirationText = (createdAt: string) => {
    const created = new Date(createdAt);
    const expiresAt = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffInDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 0) return 'Expirado';
    if (diffInDays === 1) return 'Expira mañana';
    if (diffInDays <= 7) return `Expira en ${diffInDays} dias`;
    return `Expira en ${diffInDays} dias`;
  };

  if (postsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (postsQuery.error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error al cargar los posts</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{channelName}</h2>
            <p className="text-sm text-gray-500">Posts del canal</p>
          </div>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'posts'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Posts
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'events'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Eventos
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'posts' ? (
        <div className="h-full overflow-y-auto">
          {/* Create Post Button */}
          {canCreateContent && (
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={onCreatePost}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Post
              </button>
            </div>
          )}

          {/* Posts Content */}
          <div className="p-4 space-y-4">
            {/* Welcome Message */}
            {showWelcome && posts && posts.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Bienvenido a {channelName}</h3>
                    <p className="text-sm text-blue-700">
                      Este es el feed de posts del canal. Aquí verás todas las publicaciones.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  Entendido
                </button>
              </div>
            )}

            {/* Create Post Form */}
            {showCreateForm && (
              <div className="border-b border-gray-200 p-4 bg-gray-50">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold">
                      {currentUserName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{currentUserName}</p>
                      <p className="text-xs text-gray-500">Creando post en {channelName}</p>
                    </div>
                  </div>

                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Escribe tu post aqui..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    maxLength={2000}
                  />

                  {/* Actions */}
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPost.trim() || createPostMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {createPostMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        'Publicar'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts List */}
            {posts?.map((post: any) => (
              <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Post Content - simplified version */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold">
                        {post.userFirstName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {post.userFirstName} {post.userLastName}
                        </p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-orange-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getExpirationText(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-4 rounded-lg bg-white border border-gray-200">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => likePost(post.id)}
                        disabled={isLikingPost}
                        className={`flex items-center gap-1 text-sm ${
                          post.hasUserLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        } transition-colors`}
                      >
                        <Heart className={`w-4 h-4 ${post.hasUserLiked ? 'fill-current' : ''}`} />
                        {post.likeCount}
                      </button>
                      
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        {post.commentCount}
                      </button>
                      
                      <button
                        onClick={() => sharePost(post.id)}
                        disabled={isSharingPost}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        {post.shareCount}
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">
                      {post.viewCount} vistas
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {!showWelcome && (!posts || posts.length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay posts aun</h3>
                <p className="text-gray-600 text-sm">
                  Sé el primero en publicar en este canal
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Events Tab */
        <ChannelEventsPanel
          channelId={channelId}
          channelName={channelName}
          currentUserId={currentUserId}
          currentUser={currentUser}
          onCreateEvent={() => setShowCreateEventModal(true)}
        />
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        channelId={channelId}
        onSuccess={() => {
          setShowCreateEventModal(false);
          // Refrescar eventos de forma eficiente
          queryClient.invalidateQueries({ queryKey: ['channelEvents', channelId] });
          queryClient.invalidateQueries({ queryKey: ['channelUpcomingEvents', channelId] });
        }}
      />
    </div>
  );
}
