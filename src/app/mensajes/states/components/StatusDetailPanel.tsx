'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Copy, Heart, MessageCircle, Navigation, Reply, Send, Share2, ThumbsUp, X, Zap } from 'lucide-react';
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
  const currentUserName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.firstName
    || user?.lastName
    || `Usuario ${user?.id || ''}`;

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
  const hasLocalLikeRef = useRef(false);
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

  // console.log('Render comments:', comments.length, comments[0]); //  Comentado para evitar payload errors

  const handleComment = () => {
    if (!commentText.trim()) return;

    commentMutation.mutate({
      content: commentText,
      ...(replyingTo && { replyToCommentId: replyingTo.id })
    }, {
      onSuccess: () => {
        setCommentText(''); //  Limpiar input
        setReplyingTo(null); //  Limpiar respuesta
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
      if (!hasLocalLikeRef.current) {
        setLikeCount(updatedStatus.likeCount || 0);
        setIsLiked(!!updatedStatus.hasUserLiked);
      }
      setShareCount(updatedStatus.shareCount || 0);
    } else {
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
    hasLocalLikeRef.current = true;
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

  const siteUrl = window.location.origin;
  const shareLink = status.shareLink || `status-${status.id}`;
  const shareUrl = `${siteUrl}/public/view/status/${shareLink}`;
  const shareText = `Mira este estado de ${status.user?.name || status.userName || 'Usuario'}: ${status.content?.substring(0, 100)}...`;
  const encoded = encodeURIComponent(`${shareText} ${shareUrl}`);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header con información del publicador */}
      <div className="border-b border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <UserAvatar 
              user={status.user?.id === user?.id || status.userId === user?.id ? user : status.user} 
              size="sm" 
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {status.user?.id === user?.id || status.userId === user?.id
                  ? currentUserName
                  : status.userName || status.user?.name || 'Usuario'
                }
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(status.createdAt), {
                  addSuffix: true
                })}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Contenido del estado */}
        <div className="mb-4">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{status.content}</p>

          {/* Tags si existen */}
          {status.tags && status.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {status.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-brand/10 text-brand text-xs rounded-full font-medium"
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
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400 hover:text-red-600'
              }`}
          >
            <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
            {likeCount > 0 && likeCount}
          </button>

          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand transition-colors">
            <MessageCircle className="w-5 h-5" />
            Comentar
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Compartir
            {shareCount > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {shareCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sección de comentarios */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Comentarios ({updatedStatus.commentCount || 0})</h4>

        {/* Lista de comentarios */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Cargando comentarios...</p>
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
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 shadow-sm dark:shadow-none">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {isCurrentUserComment(comment)
                              ? currentUserName
                              : comment.userName || comment.user?.name || 'Usuario'
                            }
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.timeAgo || formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{comment.content}</p>
                    </div>

                    {/* Botones de interacción */}
                    <div className="flex items-center gap-4 mt-2 ml-2">
                      <button
                        onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                        className={`text-xs flex items-center gap-1 transition-colors ${comment.hasUserLiked ? 'text-brand' : 'text-gray-500 hover:text-brand'
                          }`}
                      >
                        <ThumbsUp className="w-4 h-4" fill={comment.hasUserLiked ? 'currentColor' : 'none'} />
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
                          <div className="bg-gray-100 dark:bg-gray-600 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white text-xs">
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
                            <p className="text-gray-700 dark:text-gray-300 text-xs">{reply.content}</p>

                            {/* Botón de like para respuestas */}
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => handleLikeComment(reply.id, reply.hasUserLiked)}
                                className={`text-xs flex items-center gap-1 transition-colors ${reply.hasUserLiked ? 'text-brand' : 'text-gray-400 hover:text-brand'
                                  }`}
                              >
                                <ThumbsUp className="w-3 h-3" fill={reply.hasUserLiked ? 'currentColor' : 'none'} />
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
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
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
                      <Heart className="w-3 h-3" />
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
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {comment.user?.name || 'Usuario'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 ml-3">
                    <button
                      onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                      className={`text-xs flex items-center gap-1 ${comment.hasUserLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        }`}
                    >
                      <Heart className="w-3 h-3" />
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
              <p className="text-gray-500 dark:text-gray-400 text-sm">No hay comentarios aún</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Sé el primero en comentar</p>
            </div>
          )}
        </div>
      </div>

      {/* Input para nuevo comentario */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-4">
        {/* Mostrar respuesta seleccionada */}
        {replyingTo && (
          <div className="mb-3 p-3 bg-brand/10 border-l-4 border-blue-500 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-brand" />
                  <span className="text-brand-dark font-semibold text-sm">Respondiendo a</span>
                  <span className="text-brand font-medium text-sm">
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
                className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <X className="w-4 h-4" />
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
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white dark:placeholder-gray-400"
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
              />
              {commentText && (
                <button
                  onClick={handleComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de compartir */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-brand p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-lg">Compartir Estado</h2>
                  <p className="text-white/70 text-xs mt-0.5">Elige dónde quieres compartir</p>
                </div>
                <button onClick={() => setShowShareModal(false)} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-xl leading-none"><X className="w-5 h-5" /></button>
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
                  className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <Copy className="w-5 h-5 fill-white" />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Copiar</span>
                </button>

                {/* WhatsApp */}
                <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 fill-white" />
                  </div>
                  <span className="text-xs text-green-700 font-medium">WhatsApp</span>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-2 p-3 bg-brand/10 rounded-xl hover:bg-brand/20 transition-colors border-2 border-blue-200"
                >
                  <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center">
                    <Icon icon="mdi:facebook" className="w-5 h-5 fill-white" />
                  </div>
                  <span className="text-xs text-brand-dark font-bold">Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
