'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGroupPosts, useGroupInteractions } from '@/presentation/hooks/useGroups';
import { GroupUseCases } from '@/core/domain/use-cases/GroupUseCases';
import { GroupRepositoryImpl } from '@/infrastructure/repositories/GroupRepositoryImpl';
import { Plus, MessageSquare, Heart, Share2, Image, MapPin, X, Send, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { GroupPost } from '@/core/domain/entities/GroupPost';
import { useQueryClient } from '@tanstack/react-query';

interface GrupoPostsPanelProps {
  groupId: number;
  groupName: string;
  currentUserId: number;
  currentUser: any; // Add complete user with real name
  onCreatePost: () => void;
}

export function GrupoPostsPanel({ groupId, groupName, currentUserId, currentUser, onCreatePost }: GrupoPostsPanelProps) {
  
  // QueryClient for manual cache invalidation
  const queryClient = useQueryClient();
  
  // Real name of authenticated user - use firstName + lastName
  const currentUserName = currentUser?.firstName && currentUser?.lastName 
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser?.firstName 
    || currentUser?.lastName
    || currentUser?.name
    || currentUser?.username
    || `Usuario ${currentUserId}`;
  const currentUserInitial = currentUserName.charAt(0).toUpperCase();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { 
    posts, 
    postsLoading, 
    postsError, 
    createPost,
    createPostAsync,
    deletePost,
    isCreatingPost,
    isDeletingPost 
  } = useGroupPosts(groupId);

  console.log('GrupoPostsPanel render - posts.length:', posts?.length || 0);
  console.log('GrupoPostsPanel render - posts:', posts);
  
  // Debug: Check imageUrls in each post
  posts?.forEach((post, index) => {
    console.log(`Post ${index + 1} (ID: ${post.id}):`, {
      content: post.content,
      imageUrls: post.imageUrls,
      imageUrlsLength: post.imageUrls?.length || 0
    });
  });

  // Smart derived state - after having posts and postsLoading
  const hasPosts = !postsLoading && posts.length > 0;
  const [newPost, setNewPost] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [location, setLocation] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [fontStyle, setFontStyle] = useState<'normal' | 'bold' | 'italic'>('normal');
  const [borderStyle, setBorderStyle] = useState<'none' | 'solid' | 'dashed' | 'rounded'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    likePost, 
    sharePost,
    isLikingPost,
    isSharingPost 
  } = useGroupInteractions(currentUserId);

  const [showWelcome, setShowWelcome] = useState(true); // controls if user skipped banner

  // Posts already filtered by groupId from hook
  const filteredPosts = posts;

  // Predefined colors for backgrounds
  const backgroundColors = [
    { name: 'Blanco', value: '#ffffff' },
    { name: 'Azul claro', value: '#eff6ff' },
    { name: 'Verde claro', value: '#f0fdf4' },
    { name: 'Amarillo claro', value: '#fef3c7' },
    { name: 'Rosado claro', value: '#fdf2f8' },
    { name: 'Morado claro', value: '#faf5ff' },
    { name: 'Azul oscuro', value: '#1e3a8a' },
    { name: 'Verde oscuro', value: '#14532d' },
    { name: 'Morado oscuro', value: '#581c87' },
    { name: 'Rojo oscuro', value: '#7f1d1d' },
    { name: 'Gris oscuro', value: '#1f2937' },
    { name: 'Negro', value: '#000000' },
  ];

  // Function to calculate optimal text color based on background
  const getOptimalTextColor = (backgroundColor: string): string => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminosity (WCAG formula)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // If background is dark (luminance < 0.5), use white text
    // If background is light (luminance >= 0.5), use black text
    return luminance < 0.5 ? '#ffffff' : '#000000';
  };

  // Automatically update text color when background changes
  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    const optimalTextColor = getOptimalTextColor(color);
    setTextColor(optimalTextColor);
    console.log(`Background: ${color} → Text: ${optimalTextColor}`);
  };

  // State for managing comments per post - Initialize properly to prevent undefined
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});
  const [showComments, setShowComments] = useState<{[key: number]: boolean}>({});
  
  // State for comment likes and replies
  const [commentLikes, setCommentLikes] = useState<{[key: number]: boolean}>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyingToName, setReplyingToName] = useState<string>('');
  const [replyInputs, setReplyInputs] = useState<{[key: number]: string}>({});
  const [commentLikeCounts, setCommentLikeCounts] = useState<{[key: number]: number}>({});
  const [commentRefreshTriggers, setCommentRefreshTriggers] = useState<Record<number, number>>({});
  
  // State for sharing posts
  const [showShareModal, setShowShareModal] = useState<{[key: number]: boolean}>({});
  
  // States for menu options and editing
  const [showPostMenu, setShowPostMenu] = useState<{[key: number]: boolean}>({});
  const [editingPost, setEditingPost] = useState<{[key: number]: boolean}>({});
  const [editContent, setEditContent] = useState<{[key: number]: string}>({});

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate that it doesn't exceed 3 images limit
      const remainingSlots = 3 - selectedImages.length;
      const filesToAdd = files.slice(0, remainingSlots);
      setSelectedImages([...selectedImages, ...filesToAdd]);
    }
  };

  // Functions for managing posts
  const handleEditPost = (post: GroupPost) => {
    setEditContent({ ...editContent, [post.id]: post.content });
    setEditingPost({ ...editingPost, [post.id]: true });
    setShowPostMenu({ ...showPostMenu, [post.id]: false });
  };

  const handleSaveEdit = async (post: GroupPost) => {
    try {
      const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());
      await groupUseCases.updateGroupPost(post.id, { content: editContent[post.id] }, currentUserId, groupId);
      
      // Invalidate cache to refresh posts
      queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
      
      setEditingPost({ ...editingPost, [post.id]: false });
      console.log('Post edited successfully');
    } catch (error) {
      console.error('Error editing post:', error);
      alert('Error editing post. Please try again.');
    }
  };

  const handleCancelEdit = (postId: number) => {
    setEditingPost({ ...editingPost, [postId]: false });
    setEditContent({ ...editContent, [postId]: '' });
  };

  const handleDeletePost = async (post: GroupPost) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await deletePost(post.id);
      setShowPostMenu({ ...showPostMenu, [post.id]: false });
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && selectedImages.length === 0) return;
    
    const postData: any = {
      content: newPost.trim(),
      backgroundColor,
      textColor,
      fontStyle,
      borderStyle,
    };

    try {
      // 1. Create post first (without images) - use mutateAsync to get result
      const createdPost = await createPostAsync({ ...postData, userId: currentUserId });
      console.log('Post created successfully:', createdPost);

      // 2. Upload images if any
      if (selectedImages.length > 0 && createdPost?.id) {
        console.log('Uploading', selectedImages.length, 'images to post', createdPost.id);
        
        try {
          // Use GroupRepositoryImpl directly to upload images
          const groupRepository = new GroupRepositoryImpl();
          const uploadedUrls = await groupRepository.uploadGroupPostImages(createdPost.id, selectedImages);
          
          console.log('Images uploaded successfully:', uploadedUrls);
          console.log('Images already associated to post', createdPost.id);
          
          // Invalidate cache to force posts refresh
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
            console.log('Cache invalidated - refreshing posts...');
          }, 500); // Small delay to ensure backend updated
          
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          alert('Error uploading images. Post created but without images.');
        }
      }
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating post. Please try again.');
      return; // Don't reset form if there was error
    }
    
    // Reset form
    setNewPost('');
    setSelectedImages([]);
    setLocation('');
    setBackgroundColor('#ffffff');
    setTextColor('#000000');
    setFontStyle('normal');
    setBorderStyle('none');
    setShowCreateForm(false);
  };

  // Functions for initial buttons
  const handleWriteFirstPost = () => {
    setShowCreateForm(true);
  };

  const handleSkip = () => {
    setShowCreateForm(false);
  };

  const handleLike = (postId: number) => {
    if (currentUserId) {
      likePost(postId);
    }
  };

  const handleShare = (post: GroupPost) => {
    if (currentUserId) {
      sharePost({ postId: post.id, message: undefined });
      // Mostrar modal de compartir
      setShowShareModal(prev => ({ ...prev, [post.id]: true }));
    }
  };

  const handleComment = (post: GroupPost) => {
    // Toggle mostrar/ocultar comentarios - Handle undefined properly
    setShowComments(prev => ({ 
      ...prev, 
      [post.id]: !(prev[post.id] || false)
    }));
    console.log('Toggle comentarios para post:', post.id, 'new state:', !(showComments[post.id] || false));
  };

  const handleCommentInputChange = (postId: number, value: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const handleCommentLike = async (commentId: number) => {
    try {
      // Toggle like state
      const isCurrentlyLiked = commentLikes[commentId] || false;
      setCommentLikes(prev => ({ ...prev, [commentId]: !isCurrentlyLiked }));
      
      // Update like count
      const currentCount = commentLikeCounts[commentId] || 0;
      setCommentLikeCounts(prev => ({ 
        ...prev, 
        [commentId]: isCurrentlyLiked ? currentCount - 1 : currentCount + 1 
      }));
      
      // TODO: Call backend API to toggle like
      console.log('Toggle like for comment:', commentId, 'new state:', !isCurrentlyLiked);
      
      // For now, just toggle the UI state
    } catch (error) {
      console.error('Error toggling comment like:', error);
      // Revert state on error
      setCommentLikes(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    }
  };

  const handleReplyToComment = (commentId: number, userName: string) => {
    setReplyingTo(commentId);
    setReplyingToName(userName || 'Usuario');
    // Clear any existing reply input for this comment
    setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
  };

  const handleReplyInputChange = (commentId: number, value: string) => {
    setReplyInputs(prev => ({ ...prev, [commentId]: value }));
  };

  const handleReplySubmit = async (commentId: number, postId: number) => {
    const reply = replyInputs[commentId];
    if (!reply || !reply.trim()) return;
    
    try {
      console.log('Sending reply:', { groupId, postId, commentId, reply, userId: currentUserId });
      
      const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());
      await groupUseCases.createGroupComment(groupId, postId, {
        content: reply.trim(),
        replyToCommentId: commentId
      }, currentUserId);
      
      console.log('Reply sent successfully');
      
      // Clear input and close reply
      setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
      setReplyingToName('');
      
      // 👇 LIMPIA TAMBIÉN EL INPUT PRINCIPAL para evitar doble submit
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      
      // Trigger refresh in PostCommentsList
      setCommentRefreshTriggers(prev => ({ 
        ...prev, 
        [postId]: (prev[postId] || 0) + 1 
      }));
      
      // Also refresh posts to update comment counts
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply. Please try again.');
    }
  };

  const handleCommentSubmit = async (postId: number) => {
    const comment = commentInputs[postId];
    if (!comment || !comment.trim()) return;
    
    try {
      console.log('Sending comment:', { groupId, postId, comment, userId: currentUserId });
      
      // Use GroupUseCases directly
      const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());
      await groupUseCases.createGroupComment(groupId, postId, {
        content: comment.trim()
      }, currentUserId);
      
      console.log('Comment sent successfully');
      
      // Clear input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      
      // Note: We can't directly modify PostCommentsList state from here
      // The comment will appear after cache invalidation and re-render
      
      // Refresh posts to update counter
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      queryClient.invalidateQueries({ queryKey: ['group-comments', postId] });
      
      console.log('Comment created and cache invalidated');
      
    } catch (error) {
      console.error('Error sending comment:', error);
      alert('Error sending comment. Please try again.');
    }
  };

  const timeAgo = (date: Date): string => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const getTextStyleClass = () => {
    switch (fontStyle) {
      case 'bold':
        return 'font-bold';
      case 'italic':
        return 'italic';
      default:
        return '';
    }
  };

  const getBorderStyleClass = () => {
    switch (borderStyle) {
      case 'solid':
        return 'border-2';
      case 'dashed':
        return 'border-2 border-dashed';
      case 'rounded':
        return 'border-2 rounded-2xl';
      default:
        return 'border';
    }
  };

  if (postsError) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-600">Error al cargar las publicaciones</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative" style={{
      backgroundColor: '#e5ddd5',
      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
      backgroundSize: '24px 24px',
    }}>
      {/* Conditional area: initial buttons or chat line */}
      {!hasPosts && showWelcome && !postsLoading ? (
        // Initial state: "write first post" and "skip" buttons
        <div className="bg-white m-4 rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {currentUserInitial}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Bienvenido a {groupName}!
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Este es el inicio del grupo. Sé el primero en compartir algo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleWriteFirstPost}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Escribir mi primera publicación
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Omitir
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Interacted state: Facebook-style chat line
        <div className="bg-white m-4 rounded-lg shadow-sm border border-gray-200">
          <div className="p-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                {currentUserInitial}
              </div>
              <div className="flex-1">
                <div
                  onClick={() => setShowCreateForm(true)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-lg text-gray-500 cursor-text hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-500">¿Qué estás pensando?</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de creación de posts que cubre toda la parte derecha */}
      {showCreateForm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="relative bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Crear publicación</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                  {currentUserId ? currentUserId.toString().charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="¿Qué estás pensando?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    autoFocus
                  />
                </div>
              </div>

              {/* Opciones de estilo mejoradas */}
              <div className="space-y-4 mb-4">
                {/* Tipos de letra */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Tipo de letra:</label>
                  <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Negrita</option>
                    <option value="italic">Cursiva</option>
                    <option value="bold italic">Negrita y Cursiva</option>
                  </select>

                  <select
                    value={borderStyle}
                    onChange={(e) => setBorderStyle(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">Sin borde</option>
                    <option value="solid">Borde sólido</option>
                    <option value="dashed">Borde discontinuo</option>
                    <option value="rounded">Borde redondeado</option>
                  </select>

                  {/* Indicador de color de texto automático */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600">Texto:</span>
                    <div 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: textColor }}
                      title={`Color automático: ${textColor === '#ffffff' ? 'blanco' : 'negro'}`}
                    />
                  </div>
                </div>

                {/* Selector de color de fondo mejorado */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Color de fondo:</label>
                  <div className="flex gap-2 flex-wrap">
                    {backgroundColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleBackgroundColorChange(color.value)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          backgroundColor === color.value ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={`${color.name} - Texto auto: ${getOptimalTextColor(color.value) === '#ffffff' ? 'blanco' : 'negro'}`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    💡 El color del texto se ajusta automáticamente
                  </div>
                </div>

                {/* Emojis */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Emojis:</label>
                  <div className="flex gap-2 flex-wrap">
                    {['😀', '😂', '❤️', '👍', '🎉', '🔥', '😎', '🤔', '👏', '🙏', '💪', '🌟'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setNewPost(newPost + emoji)}
                        className="text-2xl hover:bg-gray-100 p-1 rounded transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Imágenes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={selectedImages.length >= 3}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Image className="w-4 h-4" />
                      <span>Agregar imagen ({selectedImages.length}/3)</span>
                    </button>
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ubicación */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Agregar ubicación (opcional)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPost('');
                    setSelectedImages([]);
                    setLocation('');
                    setBackgroundColor('#ffffff');
                    setTextColor('#000000');
                    setFontStyle('normal');
                    setBorderStyle('none');
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() && selectedImages.length === 0 || isCreatingPost}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingPost ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publicar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de posts tipo Facebook - Full right container */}
      <div className="flex-1 overflow-y-auto p-4">
        {postsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? null : (
          <div className="space-y-4 w-full">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 w-full"
              >
                {/* Header del post tipo Facebook */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-semibold">
                      {post.userId === currentUserId 
                        ? currentUserInitial 
                        : post.userName?.charAt(0).toUpperCase() || 'U'
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-900">
                            {post.userId === currentUserId 
                              ? currentUserName 
                              : post.userName || 'Usuario'
                            }
                          </span>
                          {post.isPinned && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                              Fijado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {post.timeAgo}
                          </span>
                          {post.userId === currentUserId && (
                            <div className="relative">
                              <button
                                onClick={() => setShowPostMenu({ ...showPostMenu, [post.id]: !showPostMenu[post.id] })}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>
                              
                              {/* Menú desplegable */}
                              {showPostMenu[post.id] && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                                  <button
                                    onClick={() => handleEditPost(post)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(post)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {groupName}
                      </div>
                    </div>
                  </div>

                  {/* Post content */}
                  <div 
                    className="mb-3 p-3 rounded-lg"
                    style={{ 
                      backgroundColor: post.backgroundColor || '#ffffff',
                      border: post.borderStyle === 'solid' ? '2px solid #e5e7eb' : 
                              post.borderStyle === 'dashed' ? '2px dashed #e5e7eb' :
                              post.borderStyle === 'rounded' ? '2px solid #e5e7eb' : 'none'
                    }}
                  >
                    {editingPost[post.id] ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent[post.id] || ''}
                          onChange={(e) => setEditContent({ ...editContent, [post.id]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleCancelEdit(post.id)}
                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(post)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p 
                        className={`whitespace-pre-wrap break-words ${
                          post.fontStyle === 'bold' ? 'font-bold' : 
                          post.fontStyle === 'italic' ? 'italic' : ''
                        }`}
                        style={{ color: post.textColor || '#000000' }}
                      >
                        {post.content}
                      </p>
                    )}
                  </div>

                  {/* Imágenes tipo Facebook */}
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="mb-3">
                      <div className={`
                        grid gap-2
                        ${post.imageUrls.length === 1 ? 'grid-cols-1' : ''}
                        ${post.imageUrls.length === 2 ? 'grid-cols-2' : ''}
                        ${post.imageUrls.length >= 3 ? 'grid-cols-3' : ''}
                      `}>
                        {post.imageUrls.map((imageUrl, index) => (
                          <div key={index} className="relative rounded-lg overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                            {post.imageUrls.length > 3 && index === 2 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                  +{post.imageUrls.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Facebook-style interaction counter - ABOVE buttons */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{post.likeCount}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span>{post.commentCount}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4 text-green-500" />
                        <span>{post.shareCount}</span>
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {post.viewCount} views
                    </span>
                  </div>

                  {/* Facebook-style action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      disabled={isLikingPost}
                      className={`flex-1 py-2 px-3 rounded-lg transition-colors font-medium disabled:opacity-50 ${
                        post.hasUserLiked 
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isLikingPost ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent animate-spin inline mr-1" />
                      ) : (
                        <Heart className={`w-4 h-4 inline mr-1 ${post.hasUserLiked ? 'fill-current' : ''}`} />
                      )}
                      Like
                    </button>
                    <button
                      onClick={() => handleComment(post)}
                      className="flex-1 py-2 px-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Comment
                    </button>
                    <button
                      onClick={() => handleShare(post)}
                      disabled={isSharingPost}
                      className={`flex-1 py-2 px-3 rounded-lg transition-colors font-medium disabled:opacity-50 ${
                        isSharingPost 
                          ? 'bg-gray-100 text-gray-400' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {isSharingPost ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent animate-spin inline mr-1" />
                      ) : (
                        <Share2 className="w-4 h-4 inline mr-1" />
                      )}
                      Share
                    </button>
                  </div>
                </div>

                {/* Área de comentarios tipo Facebook */}
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                  
                  {/* Input para nuevo comentario */}
                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                      {currentUserInitial}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                        placeholder={`Escribe un comentario como ${currentUserName}...`}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>

                  {/* Ver comentarios - toggle - Always show for debugging */}
                  <div>
                    <button
                      onClick={() => handleComment(post)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2"
                    >
                      {(showComments[post.id] || false) 
                        ? '▲ Ver menos' 
                        : `▼ Ver comentarios (${post.commentCount || 0})` 
                      }
                    </button>

                    {/* Lista de comentarios - siempre mostrar si showComments[post.id] */}
                    {(showComments[post.id] || false) && (
                      <PostCommentsList 
                        postId={post.id} 
                        groupId={groupId}
                        currentUserId={currentUserId}
                        currentUserName={currentUserName}
                        currentUserInitial={currentUserInitial}
                        handleCommentLike={handleCommentLike}
                        handleReplyToComment={handleReplyToComment}
                        handleReplyInputChange={handleReplyInputChange}
                        handleReplySubmit={handleReplySubmit}
                        commentLikes={commentLikes}
                        commentLikeCounts={commentLikeCounts}
                        replyingTo={replyingTo}
                        replyingToName={replyingToName}
                        setReplyingTo={setReplyingTo}
                        replyInputs={replyInputs}
                        refreshTrigger={commentRefreshTriggers[post.id] || 0}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share modal - positioned to the right and lower */}
      {filteredPosts?.map((post) => (
        showShareModal[post.id] && (
          <div key={`share-${post.id}`} className="fixed right-8 bottom-20 z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-96 shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share post</h3>
                <button 
                  onClick={() => setShowShareModal(prev => ({ ...prev, [post.id]: false }))} 
                  className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-xl leading-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                <p className="text-xs text-gray-500 mt-2">by {post.userName} in {groupName}</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {/* Copy link */}
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/dashboard/my-contacts/groups/${groupId}`;
                    const shareText = `Check out this post from ${post.userName} in "${groupName}": ${post.content?.substring(0, 100)}...`;
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    setShowShareModal(prev => ({ ...prev, [post.id]: false }));
                    alert('Link copied to clipboard!');
                  }}
                  className="flex flex-col items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600 mb-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.9 12c0 1.71 1.39 3.1 3.1 3.1h4V7H7.9c-.53 0-1.04.21-1.41.59L2.59 8.41c-.38.38-.59.89-.59 1.41V16c0 1.11.89 2 2 2h4c1.11 0 2-.89 2-2v-4.68l2.29 2.29c.38.38.89.59 1.41.59H16c1.11 0 2-.89 2-2V7.9c0-.53-.21-1.04-.59-1.41L12.59 4.41c-.38-.38-.89-.59-1.41-.59H7.9c-1.11 0-2 .89-2 2v4.68z"/>
                  </svg>
                  <span className="text-xs font-medium">Copy link</span>
                </button>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this post from ${post.userName} in "${groupName}": ${post.content?.substring(0, 100)}... ${window.location.origin}/dashboard/my-contacts/groups/${groupId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareModal(prev => ({ ...prev, [post.id]: false }))}
                  className="flex flex-col items-center p-3 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-green-600 mb-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-xs text-green-700 font-medium">WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/dashboard/my-contacts/groups/${groupId}`)}&quote=${encodeURIComponent(`Mira esta publicación de ${post.userName} en "${groupName}": ${post.content?.substring(0, 100)}...`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareModal(prev => ({ ...prev, [post.id]: false }))}
                  className="flex flex-col items-center p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-blue-600 mb-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-xs text-blue-700 font-bold">Facebook</span>
                </a>

                {/* TikTok */}
                <a
                  href={`https://www.tiktok.com/@tiktok/upload?text=${encodeURIComponent(`Mira esta publicación de ${post.userName} en "${groupName}": ${post.content?.substring(0, 100)}... ${window.location.origin}/dashboard/my-contacts/groups/${groupId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareModal(prev => ({ ...prev, [post.id]: false }))}
                  className="flex flex-col items-center p-3 bg-black hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white mb-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  <span className="text-xs text-white font-bold">TikTok</span>
                </a>
              </div>
            </div>
          </div>
        )
      ))}
    </div>
  );
}

// ──── COMPONENTE POST COMMENTS LIST ────────────────────────────────────────────────────────
function PostCommentsList({ postId, groupId, currentUserId, currentUserName, currentUserInitial,
  handleCommentLike, handleReplyToComment, handleReplyInputChange, handleReplySubmit,
  commentLikes, commentLikeCounts, replyingTo, replyingToName, setReplyingTo, replyInputs, refreshTrigger }: {
  postId: number;
  groupId: number;
  currentUserId: number;
  currentUserName: string;
  currentUserInitial: string;
  handleCommentLike: (commentId: number) => void;
  handleReplyToComment: (commentId: number, userName: string) => void;
  handleReplyInputChange: (commentId: number, value: string) => void;
  handleReplySubmit: (commentId: number, postId: number) => Promise<void>;
  commentLikes: {[key: number]: boolean};
  commentLikeCounts: {[key: number]: number};
  replyingTo: number | null;
  replyingToName: string;
  setReplyingTo: (value: number | null) => void;
  replyInputs: {[key: number]: string};
  refreshTrigger?: number;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        console.log('🔍 Fetching comments for postId:', postId, 'groupId:', groupId);
        console.log('🔍 Full URL should be: /contacts/extended/groups/' + groupId + '/posts/' + postId + '/comments');
        
        const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());
        
        // Add retry logic for mobile
        let response;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            response = await groupUseCases.getGroupComments(groupId, postId);
            break; // Success, exit retry loop
          } catch (retryError: any) {
            retryCount++;
            console.warn(`🔄 Retry ${retryCount}/${maxRetries} for comments:`, retryError.message);
            
            if (retryCount >= maxRetries) {
              throw retryError; // Max retries reached, throw error
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
        
        console.log('🔍 Comments response:', response);
        console.log('🔍 Comments response type:', typeof response);
        console.log('🔍 Comments response keys:', Object.keys(response || {}));
        console.log('🔍 Comments content:', response?.content);
        console.log('🔍 Comments content type:', typeof response?.content);
        console.log('🔍 Comments array:', response?.content || []);
        console.log('🔍 Comments length:', (response?.content || []).length);
        
        // Try different possible response structures
        let commentsArray = [];
        if (response?.content && Array.isArray(response.content)) {
          commentsArray = response.content;
        } else if ((response as any)?.data && Array.isArray((response as any).data)) {
          commentsArray = (response as any).data;
        } else if (Array.isArray(response)) {
          commentsArray = response;
        } else if ((response as any)?.comments && Array.isArray((response as any).comments)) {
          commentsArray = (response as any).comments;
        } else {
          console.warn('🔍 Unknown response structure:', response);
        }
        
        console.log('🔍 Final comments array:', commentsArray);
        console.log('🔍 Final comments length:', commentsArray.length);
        
        if (commentsArray.length === 0) {
          console.warn('⚠️ No comments found - Check backend logs for this postId:', postId);
        }
        
        setComments(commentsArray);
      } catch (error: any) {
        console.error('Error cargando comentarios:', error);
        
        // Handle network errors gracefully for mobile
        if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_CLOSED')) {
          console.warn('🔗 Mobile network error - showing placeholder');
          setComments([]); // Set empty array to avoid infinite loading
          
          // Show user-friendly message for mobile
          if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            console.log('📱 Mobile detected - showing mobile-friendly message');
          }
        } else {
          console.error('🔥 Different error type:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId, groupId, refreshTrigger]);

  if (loading) return <div className="text-xs text-gray-400 py-2">Cargando comentarios...</div>;
  if (comments.length === 0) return (
    <div className="text-xs text-gray-400 py-2">
      No hay comentarios visibles. 
      <br />
      <span className="text-xs">Escribe un comentario abajo para verlo aquí inmediatamente</span>
    </div>
  );

  return (
    <div className="space-y-2 mt-2" data-comments-for={postId}>
      {comments
            .filter((comment: any) => !comment.replyToCommentId) // ← SOLO comentarios principales
            .map((comment: any, index: number) => (
        <div key={comment.id || index} className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {comment.userId === currentUserId
              ? currentUserInitial
              : (comment.userName || 'U').charAt(0).toUpperCase()
            }
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
              <span className="font-semibold text-xs text-gray-900">
                {comment.userId === currentUserId ? currentUserName : comment.userName || 'Usuario'}
              </span>
              <p className="text-sm text-gray-800 mt-0.5">{comment.content}</p>
              <span className="text-xs text-gray-400">{comment.timeAgo}</span>
            </div>
            
            {/* Like and Reply buttons */}
            <div className="flex gap-4 px-3 py-1">
              <button
                onClick={() => handleCommentLike(comment.id)}
                className={`text-xs flex items-center gap-1 transition-colors ${
                  commentLikes[comment.id] || comment.hasUserLiked
                    ? 'text-blue-500 hover:text-blue-600 font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className={commentLikes[comment.id] || comment.hasUserLiked ? 'text-blue-500' : ''}>
                  {commentLikes[comment.id] || comment.hasUserLiked ? '👍' : '👍'}
                </span>
                {(commentLikeCounts[comment.id] || 0) + (commentLikes[comment.id] || comment.hasUserLiked ? 1 : 0) > 0 && (
                  <span className="text-xs font-medium">
                    {(commentLikeCounts[comment.id] || 0) + (commentLikes[comment.id] || comment.hasUserLiked ? 1 : 0)}
                  </span>
                )}
                Me gusta
              </button>
              
              <button
                onClick={() => handleReplyToComment(comment.id, comment.userName)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Responder
              </button>
            </div>
            
            {/* Reply input (WhatsApp style) */}
            {replyingTo === comment.id && (
              <div className="mt-2 px-3">
                <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                    <span>Respondiendo a {replyingToName}</span>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {currentUserInitial}
                    </div>
                    <input
                      type="text"
                      value={replyInputs[comment.id] || ''}
                      onChange={(e) => handleReplyInputChange(comment.id, e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit(comment.id, postId)}
                      placeholder={`Escribe una respuesta...`}
                      className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleReplySubmit(comment.id, postId)}
                      disabled={!replyInputs[comment.id]?.trim()}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Replies to this comment */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2 space-y-1">
                {comment.replies.map((reply: any, replyIndex: number) => (
                  <div key={reply.id || replyIndex} className="flex gap-2 pl-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {reply.userId === currentUserId
                        ? currentUserInitial
                        : (reply.userName || 'U').charAt(0).toUpperCase()
                      }
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
                      <span className="font-semibold text-xs text-gray-900">
                        {reply.userId === currentUserId ? currentUserName : reply.userName || 'Usuario'}
                      </span>
                      <p className="text-xs text-gray-800 mt-0.5">{reply.content}</p>
                      <span className="text-xs text-gray-400">{reply.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
