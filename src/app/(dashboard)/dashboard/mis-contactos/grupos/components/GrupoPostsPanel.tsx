'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGroupPosts, useGroupInteractions } from '@/presentation/hooks/useGroups';
import { GroupUseCases } from '@/core/domain/use-cases/GroupUseCases';
import { GroupRepositoryImpl } from '@/infrastructure/repositories/GroupRepositoryImpl';
import { Plus, MessageSquare, Heart, Share2, Image, MapPin, X, Send } from 'lucide-react';
import { GroupPost } from '@/core/domain/entities/GroupPost';

interface GrupoPostsPanelProps {
  groupId: number;
  groupName: string;
  currentUserId: number;
  currentUser: any; // ✅ Añadir usuario completo con nombre real
  onCreatePost: () => void;
}

export function GrupoPostsPanel({ groupId, groupName, currentUserId, currentUser, onCreatePost }: GrupoPostsPanelProps) {
  
  // ✅ Nombre real del usuario autenticado - usar firstName + lastName
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
    deletePost,
    isCreatingPost,
    isDeletingPost 
  } = useGroupPosts(groupId);

  console.log('🔄 GrupoPostsPanel render - posts.length:', posts?.length || 0);
  console.log('🔄 GrupoPostsPanel render - posts:', posts);

  // ✅ Estado derivado inteligente - después de tener posts y postsLoading
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
  } = useGroupInteractions();

  const [showWelcome, setShowWelcome] = useState(true); // solo controla si omitió el banner

  // Los posts ya vienen filtrados por groupId desde el hook
  const filteredPosts = posts;

  // Colores predefinidos para backgrounds
  const backgroundColors = [
    { name: 'Blanco', value: '#ffffff' },
    { name: 'Azul claro', value: '#eff6ff' },
    { name: 'Verde claro', value: '#f0fdf4' },
    { name: 'Amarillo claro', value: '#fef3c7' },
    { name: 'Rosado claro', value: '#fdf2f8' },
    { name: 'Morado claro', value: '#faf5ff' },
  ];

  // Estado para manejar comentarios por post
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});
  const [showComments, setShowComments] = useState<{[key: number]: boolean}>({});
  
  // Estado para compartir posts
  const [showShareModal, setShowShareModal] = useState<{[key: number]: boolean}>({});

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validar que no exceda el límite de 3 imágenes
      const remainingSlots = 3 - selectedImages.length;
      const filesToAdd = files.slice(0, remainingSlots);
      setSelectedImages([...selectedImages, ...filesToAdd]);
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

    // Subir imágenes a S3 si hay
    if (selectedImages.length > 0) {
      // ✅ Por ahora simplemente skip - el upload real requiere el postId que aún no existe
      postData.imageUrls = [];
      console.log('📸 {} imágenes seleccionadas - upload temporalmente desactivado', selectedImages.length);
    }

    // Importante: incluir el userId en la llamada
    createPost({ ...postData, userId: currentUserId });
    
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

  // Funciones para los botones iniciales
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
    // Toggle mostrar/ocultar comentarios
    setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }));
    console.log('Toggle comentarios para post:', post.id);
  };

  const handleCommentInputChange = (postId: number, value: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId: number) => {
    const comment = commentInputs[postId];
    if (!comment || !comment.trim()) return;
    
    try {
      console.log('Enviando comentario:', { groupId, postId, comment, userId: currentUserId });
      
      // Usar GroupUseCases directamente
      const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());
      await groupUseCases.createGroupComment(groupId, postId, {
        content: comment.trim()
      }, currentUserId);
      
      console.log('✅ Comentario enviado exitosamente');
      
      // Limpiar input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      
      // Refrescar posts para actualizar contador
      window.location.reload(); // Temporal, idealmente usar refetch
      
    } catch (error) {
      console.error('❌ Error al enviar comentario:', error);
      alert('Error al enviar comentario. Por favor intenta nuevamente.');
    }
  };

  const timeAgo = (date: Date): string => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'ahora';
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
      {/* Área condicional: botones iniciales o línea de chat */}
      {!hasPosts && showWelcome && !postsLoading ? (
        // Estado inicial: botones "escribir mi primera publicación" y "omitir"
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
        // Estado interactuado: línea de chat tipo Facebook
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
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="#000000">Negro</option>
                    <option value="#FF0000">Rojo</option>
                    <option value="#0000FF">Azul</option>
                    <option value="#008000">Verde</option>
                    <option value="#800080">Morado</option>
                    <option value="#FFA500">Naranja</option>
                    <option value="#FFC0CB">Rosa</option>
                    <option value="#808080">Gris</option>
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
                </div>

                {/* Selector de color de fondo mejorado */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Color de fondo:</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { name: 'Blanco', value: '#ffffff' },
                      { name: 'Azul claro', value: '#e3f2fd' },
                      { name: 'Verde claro', value: '#e8f5e8' },
                      { name: 'Amarillo', value: '#fff9c4' },
                      { name: 'Rosa claro', value: '#fce4ec' },
                      { name: 'Morado claro', value: '#f3e5f5' },
                      { name: 'Naranja claro', value: '#ffe0b2' },
                      { name: 'Gris claro', value: '#f5f5f5' },
                      { name: 'Azul', value: '#2196f3' },
                      { name: 'Verde', value: '#4caf50' },
                      { name: 'Rojo', value: '#f44336' },
                      { name: 'Morado', value: '#9c27b0' }
                    ].map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBackgroundColor(color.value)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          backgroundColor === color.value ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
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

      {/* Lista de posts tipo Facebook */}
      <div className="flex-1 overflow-y-auto p-4">
        {postsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPosts.length === 0 ? null : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
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
                        <span className="text-xs text-gray-500">
                          {post.timeAgo}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {groupName}
                      </div>
                    </div>
                  </div>

                  {/* Contenido del post */}
                  <div className="mb-3">
                    <p 
                      className={`text-gray-900 whitespace-pre-wrap break-words ${
                        post.fontStyle === 'bold' ? 'font-bold' : 
                        post.fontStyle === 'italic' ? 'italic' : ''
                      }`}
                      style={{ color: post.textColor || '#000000' }}
                    >
                      {post.content}
                    </p>
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

                  {/* Barra de interacciones tipo Facebook */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span></span> {post.likeCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <span></span> {post.commentCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <span></span> {post.shareCount}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {post.viewCount} vistas
                    </span>
                  </div>

                  {/* Botones de acción tipo Facebook */}
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
                      Me gusta
                    </button>
                    <button
                      onClick={() => handleComment(post)}
                      className="flex-1 py-2 px-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Responder
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
                      Compartir
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

                  {/* Ver comentarios - toggle */}
                  {post.commentCount > 0 && (
                    <div>
                      <button
                        onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2"
                      >
                        {showComments[post.id] 
                          ? '▲ Ver menos' 
                          : `▼ Ver los ${post.commentCount} comentarios` 
                        }
                      </button>

                      {/* Lista de comentarios - solo si showComments[post.id] */}
                      {showComments[post.id] && (
                        <PostCommentsList 
                          postId={post.id} 
                          groupId={groupId}
                          currentUserId={currentUserId}
                          currentUserName={currentUserName}
                          currentUserInitial={currentUserInitial}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de compartir posts */}
      {filteredPosts?.map((post) => (
        showShareModal[post.id] && (
          <div key={`share-${post.id}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Compartir publicación</h3>
                <button 
                  onClick={() => setShowShareModal(prev => ({ ...prev, [post.id]: false }))} 
                  className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-xl leading-none"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                <p className="text-xs text-gray-500 mt-2">por {post.userName} en {groupName}</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {/* Copiar enlace */}
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/dashboard/mis-contactos/grupos/${groupId}`;
                    const shareText = `Mira esta publicación de ${post.userName} en el grupo "${groupName}": ${post.content?.substring(0, 100)}...`;
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    setShowShareModal(prev => ({ ...prev, [post.id]: false }));
                    alert('¡Enlace copiado al portapapeles!');
                  }}
                  className="flex flex-col items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">Copiar</span>
                </button>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Mira esta publicación de ${post.userName} en "${groupName}": ${post.content?.substring(0, 100)}... ${window.location.origin}/dashboard/mis-contactos/grupos/${groupId}`)}`}
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
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/dashboard/mis-contactos/grupos/${groupId}`)}&quote=${encodeURIComponent(`Mira esta publicación de ${post.userName} en "${groupName}": ${post.content?.substring(0, 100)}...`)}`}
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
                  href={`https://www.tiktok.com/@tiktok/upload?text=${encodeURIComponent(`Mira esta publicación de ${post.userName} en "${groupName}": ${post.content?.substring(0, 100)}... ${window.location.origin}/dashboard/mis-contactos/grupos/${groupId}`)}`}
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
function PostCommentsList({ postId, groupId, currentUserId, currentUserName, currentUserInitial }: {
  postId: number;
  groupId: number;
  currentUserId: number;
  currentUserName: string;
  currentUserInitial: string;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());
        const response = await groupUseCases.getGroupComments(groupId, postId);
        setComments(response?.content || []);
      } catch (error) {
        console.error('Error cargando comentarios:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId, groupId]);

  if (loading) return <div className="text-xs text-gray-400 py-2">Cargando comentarios...</div>;
  if (comments.length === 0) return null;

  return (
    <div className="space-y-2 mt-2" data-comments-for={postId}>
      {comments.map((comment: any, index: number) => (
        <div key={comment.id || index} className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {comment.userId === currentUserId
              ? currentUserInitial
              : (comment.userName || 'U').charAt(0).toUpperCase()
            }
          </div>
          <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <span className="font-semibold text-xs text-gray-900">
              {comment.userId === currentUserId ? currentUserName : comment.userName || 'Usuario'}
            </span>
            <p className="text-sm text-gray-800 mt-0.5">{comment.content}</p>
            <span className="text-xs text-gray-400">{comment.timeAgo}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
