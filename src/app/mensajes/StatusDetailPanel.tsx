'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { formatDistanceToNow } from '@/utils/formatters';
import { useCommentStatusPost, useStatusComments, useLikeStatusPost, useUnlikeStatusPost, useShareStatusPost, useLikeComment, useUnlikeComment, useGetActiveStatusPosts } from '@/presentation/hooks/useContacts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/presentation/store/toastStore';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';

interface StatusDetailPanelProps {
  status: any;
  user: any;
  onClose?: () => void;
}

export default function StatusDetailPanel({ status, user, onClose }: StatusDetailPanelProps) {

  //  Nombre real del usuario autenticado - usar firstName + lastName (campos válidos)
  console.log(' StatusDetailPanel - user:', user); // ← DEBUG
  const currentUserName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName
    || user?.lastName
    || `Usuario ${user?.id || ''}`;
  console.log(' StatusDetailPanel - currentUserName:', currentUserName); // ← DEBUG

  //  Función helper para detectar si un comentario es del usuario actual
  const isCurrentUserComment = (comment: any) => {
    return comment.userId === user?.id
      || comment.user?.id === user?.id;
  };


  const [commentText, setCommentText] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<any>(null);

  // Ref para evitar bucle infinito Y persistir isInitialized
  const localCommentsRef = useRef(localComments);
  const isInitializedRef = useRef(false);
  localCommentsRef.current = localComments;

  const queryClient = useQueryClient();

  // Hooks para interacciones con el estado
  const likeMutation = useLikeStatusPost();
  const unlikeMutation = useUnlikeStatusPost();
  const shareMutation = useShareStatusPost();

  // Hooks para interacciones con comentarios
  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();

  //  FIX 1: PASAR status.id al hook
  const commentMutation = useCommentStatusPost(status.id);

  //  FIX 2: Usar comentarios del backend (NO local)
  const { data: rawComments = [], isLoading, error } = useStatusComments(status.id);

  // Obtener datos actualizados del estado para sincronizar contadores
  const { data: statusPostsData } = useGetActiveStatusPosts();

  // Encontrar el estado actualizado en la lista
  const updatedStatus = statusPostsData?.pages?.flat()?.find(s => s.id === status.id) || status;

  //  DEBUG en consola (limitado para evitar payload errors)
  console.log('StatusDetailPanel comments:', {
    statusId: status.id,
    length: rawComments?.length || 0,
    error
  });

  //  Usar rawComments directamente sin useMemo para evitar bucles
  const comments = rawComments || [];

  //  Sincronización inteligente - preservar likes locales al invalidar cache
  useEffect(() => {
    if (comments && comments.length > 0) {
      if (localCommentsRef.current.length === 0) {
        // Primera carga - inicializar todo
        setLocalComments(comments);
      } else {
        // Sincronizar preservando likes locales
        const mergedComments = comments.map((comment: any) => {
          const localComment = localCommentsRef.current.find(c => c.id === comment.id);

          // Si existe localmente y tiene diferente estado de like, preservar el estado local
          if (localComment && localComment.hasUserLiked !== comment.hasUserLiked) {
            return {
              ...comment,
              hasUserLiked: localComment.hasUserLiked,
              likeCount: localComment.likeCount
            };
          }

          return comment;
        });

        setLocalComments(mergedComments);
      }
    }
  }, [comments]);

  // console.log('Render comments:', comments.length, comments[0]); // ← Comentado para evitar payload errors

  const handleComment = () => {
    if (!commentText.trim()) return;

    commentMutation.mutate({
      content: commentText,
      ...(replyingTo && { replyToCommentId: replyingTo.id })
    }, {
      onSuccess: () => {
        setCommentText(''); // ← Limpiar input
        setReplyingTo(null); // ← Limpiar respuesta
        toast.success('Comentario enviado');
        // Refrescar los comentarios para mostrar el nuevo
        queryClient.invalidateQueries({ queryKey: ['status-comments', status.id] });
      },
      onError: (error) => {
        console.error('Error:', error);
        toast.error('Error al enviar comentario');
      }
    });
  };

  // Efecto para sincronizar contadores con el estado actual
  useEffect(() => {
    if (updatedStatus) {
      setLikeCount(updatedStatus.likeCount || 0);
      setShareCount(updatedStatus.shareCount || 0);
      // Verificar si el usuario actual ya dio like
      if (updatedStatus.hasUserLiked) {
        setIsLiked(true);
      } else {
        setIsLiked(false);
      }
    } else {
      // Si el estado se elimina o expira, limpiar todo
      setLikeCount(0);
      setShareCount(0);
      setIsLiked(false);
      setLocalComments([]);
    }
  }, [updatedStatus]);

  // Efecto para ocultar estado después de 48 horas
  useEffect(() => {
    if (status) {
      const now = new Date();
      const createdAt = new Date(status.createdAt);
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      // Si han pasado más de 48 horas, ocultar el estado
      if (hoursSinceCreation > 48) {
        // No guardar más información de este estado
        console.log('Estado expirado, ocultando...');
        // El estado se dejará de mostrar en la lista principal
        // Esto evita saturar el backend con información antigua
      }
    }
  }, [status]);

  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = () => {
    shareMutation.mutate(status.id);
    setShowShareModal(true);
    setShareCount((prev: number) => prev + 1); // Incrementar contador de compartidos
  };

  const handleLike = () => {
    if (isLiked) {
      unlikeMutation.mutate(status.id);
    } else {
      likeMutation.mutate(status.id);
    }
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleLikeComment = (commentId: number, isCommentLiked: boolean) => {
    //  Feedback visual inmediato
    setLocalComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          hasUserLiked: !isCommentLiked,
          likeCount: isCommentLiked
            ? Math.max((comment.likeCount || 0) - 1, 0)
            : (comment.likeCount || 0) + 1
        };
      }
      return comment;
    }));

    // Llamar a la mutación
    if (isCommentLiked) {
      unlikeCommentMutation.mutate(commentId);
    } else {
      likeCommentMutation.mutate(commentId);
    }
  };

  const handleReply = (comment: any) => {
    setReplyingTo(comment);
    // Focus en el input de comentario
    setTimeout(() => {
      const input = document.getElementById('comment-input');
      input?.focus();
    }, 100);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const shareUrl = `${window.location.origin}/dashboard/my-contacts/status/${status.id}`;
  const shareText = `Mira este estado de ${status.user?.name || 'Usuario'}: ${status.content?.substring(0, 100)}...`;
  const encoded = encodeURIComponent(`${shareText} ${shareUrl}`);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header con información del publicador */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <UserAvatar 
              user={status.user?.id === user?.id || status.userId === user?.id ? user : status.user} 
              size="sm" 
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {status.user?.id === user?.id || status.userId === user?.id
                  ? currentUserName
                  : status.userName || status.user?.name || 'Usuario'
                }
              </h3>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(status.createdAt), {
                  addSuffix: true
                })}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Contenido del estado */}
        <div className="mb-4">
          <p className="text-gray-800 whitespace-pre-wrap">{status.content}</p>

          {/* Tags si existen */}
          {status.tags && status.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {status.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Botones de interacción */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likeCount > 0 && likeCount}
          </button>

          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comentar
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
            </svg>
            Compartir
            {shareCount > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {shareCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sección de comentarios */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Comentarios ({updatedStatus.commentCount || 0})</h4>

        {/* Lista de comentarios */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Cargando comentarios...</p>
            </div>
          ) : localComments && Array.isArray(localComments) && localComments.length > 0 ? (
            // Mostrar comentarios locales (con estado de likes actualizado)
            localComments.map((comment: any, index: number) => (
              <div key={comment.id || index} className="space-y-3">
                {/* Comentario principal */}
                <div className="flex gap-3">
                  <UserAvatar 
                    user={isCurrentUserComment(comment) ? user : comment.user} 
                    size="sm" 
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">
                            {isCurrentUserComment(comment)
                              ? currentUserName
                              : comment.userName || comment.user?.name || 'Usuario'
                            }
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.timeAgo || formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed">{comment.content}</p>
                    </div>

                    {/* Botones de interacción */}
                    <div className="flex items-center gap-4 mt-2 ml-2">
                      <button
                        onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                        className={`text-xs flex items-center gap-1 transition-colors ${comment.hasUserLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                          }`}
                      >
                        <svg className="w-4 h-4" fill={comment.hasUserLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span className="font-medium">{comment.likeCount || 0}</span>
                      </button>
                      <button
                        onClick={() => handleReply(comment)}
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Responder
                      </button>
                    </div>
                  </div>
                </div>

                {/* Respuestas anidadas (placeholder por ahora) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-12 space-y-2">
                    {comment.replies.map((reply: any, replyIndex: number) => (
                      <div key={reply.id || replyIndex} className="flex gap-2">
                        <UserAvatar 
                          user={isCurrentUserComment(reply) ? user : reply.user} 
                          size="xs" 
                        />
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-xs">
                                {isCurrentUserComment(reply)
                                  ? currentUserName
                                  : reply.userName || reply.user?.name || 'Usuario'
                                }
                              </span>
                              <span className="text-xs text-gray-400">
                                {reply.timeAgo || formatDistanceToNow(new Date(reply.createdAt), {
                                  addSuffix: true
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 text-xs">{reply.content}</p>

                            {/* Botón de like para respuestas */}
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => handleLikeComment(reply.id, reply.hasUserLiked)}
                                className={`text-xs flex items-center gap-1 transition-colors ${reply.hasUserLiked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                                  }`}
                              >
                                <svg className="w-3 h-3" fill={reply.hasUserLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                <span className="font-medium">{reply.likeCount || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : status.recentComments && status.recentComments.length > 0 ? (
            // Fallback a comentarios recientes del status
            status.recentComments.map((comment: any, index: number) => (
              <div key={comment.id} className="flex gap-3">
                <UserAvatar 
                  user={isCurrentUserComment(comment) ? user : comment.user} 
                  size="xs" 
                />
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {isCurrentUserComment(comment)
                          ? currentUserName
                          : comment.userName || 'Usuario'
                        }
                      </span>
                      <span className="text-xs text-gray-500">
                        {comment.timeAgo || formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 ml-3">
                    <button
                      onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                      className={`text-xs flex items-center gap-1 ${comment.hasUserLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        }`}
                    >
                      <svg className="w-3 h-3" fill={comment.hasUserLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {comment.likeCount > 0 && comment.likeCount}
                    </button>
                    <button
                      onClick={() => handleReply(comment)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : localComments && localComments.length > 0 ? (
            // Fallback a comentarios locales
            localComments.map((comment: any, index: number) => (
              <div key={index} className="flex gap-3">
                <UserAvatar 
                  user={comment.user} 
                  size="xs" 
                />
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.user?.name || 'Usuario'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 ml-3">
                    <button
                      onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                      className={`text-xs flex items-center gap-1 ${comment.hasUserLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        }`}
                    >
                      <svg className="w-3 h-3" fill={comment.hasUserLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {comment.likeCount > 0 && comment.likeCount}
                    </button>
                    <button
                      onClick={() => handleReply(comment)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No hay comentarios aún</p>
              <p className="text-gray-400 text-xs mt-1">Sé el primero en comentar</p>
            </div>
          )}
        </div>
      </div>

      {/* Input para nuevo comentario */}
      <div className="border-t border-gray-100 p-4">
        {/* Mostrar respuesta seleccionada */}
        {replyingTo && (
          <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-blue-700 font-semibold text-sm">Respondiendo a</span>
                  <span className="text-blue-600 font-medium text-sm">
                    {replyingTo.userName || replyingTo.user?.name || 'Usuario'}
                  </span>
                </div>
                <div className="bg-white rounded p-2 border border-blue-200">
                  <p className="text-gray-700 text-xs italic">
                    "{replyingTo.content?.substring(0, 80)}{replyingTo.content?.length > 80 ? '...' : ''}"
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelReply}
                className="ml-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <UserAvatar size="sm" />
          <div className="flex-1">
            <div className="relative">
              <input
                id="comment-input"
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingTo ? `Escribe una respuesta a ${replyingTo.userName || replyingTo.user?.name || 'Usuario'}...` : `Escribe un comentario como ${currentUserName}...`}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
              />
              {commentText && (
                <button
                  onClick={handleComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de compartir */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-lg">Compartir Estado</h2>
                  <p className="text-white/70 text-xs mt-0.5">Elige dónde quieres compartir</p>
                </div>
                <button onClick={() => setShowShareModal(false)} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-xl leading-none">✕</button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-3"> {/* 3 columnas: Copiar, WhatsApp, Facebook */}
                {/* Copiar Link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    setShowShareModal(false);
                  }}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">Copiar</span>
                </button>

                {/* WhatsApp */}
                <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                    </svg>
                  </div>
                  <span className="text-xs text-green-700 font-medium">WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border-2 border-blue-200"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <span className="text-xs text-blue-700 font-bold">Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
