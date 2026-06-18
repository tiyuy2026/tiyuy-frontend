'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { formatDistanceToNow } from '@/utils/formatters';
import { useCommentStatusPost, useStatusComments, useLikeStatusPost, useUnlikeStatusPost, useShareStatusPost, useLikeComment, useUnlikeComment, useGetActiveStatusPosts } from '@/presentation/hooks/useContacts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/presentation/store/toastStore';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';
import { X, Heart, MessageCircle, Share2, ThumbsUp, CornerDownRight, SendHorizontal, Copy, MessageSquare, Facebook } from 'lucide-react';
import { Icon } from '@iconify/react';

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
    <div className="flex flex-col h-full bg-white antialiased">
      {/* Header con información del publicador */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <UserAvatar
              user={status.user?.id === user?.id || status.userId === user?.id ? user : status.user}
              size="sm"
            />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
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
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Contenido del estado */}
        <div className="mb-4">
          <p className="text-gray-800 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{status.content}</p>

          {/* Tags si existen */}
          {status.tags && status.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {status.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Botones de interacción */}
        <div className="flex items-center gap-6 border-t border-gray-50 pt-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likeCount > 0 ? likeCount : 'Me gusta'}</span>
          </button>

          <button className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
            <MessageCircle className="w-5 h-5" />
            <span>Comentar</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            <span>Compartir</span>
            {shareCount > 0 && (
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {shareCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
        <h4 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          <span>Comentarios ({updatedStatus.commentCount || 0})</span>
        </h4>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-xs font-medium animate-pulse">Cargando comentarios...</p>
            </div>
          ) : localComments && Array.isArray(localComments) && localComments.length > 0 ? (
            localComments.map((comment: any, index: number) => (
              <div key={comment.id || index} className="space-y-3">
                {/* Comentario principal */}
                <div className="flex gap-3">
                  <UserAvatar
                    user={isCurrentUserComment(comment) ? user : comment.user}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">
                            {isCurrentUserComment(comment)
                              ? currentUserName
                              : comment.userName || comment.user?.name || 'Usuario'
                            }
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
                            {comment.timeAgo || formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">{comment.content}</p>
                    </div>

                    {/* Botones de interacción */}
                    <div className="flex items-center gap-4 mt-1.5 ml-2">
                      <button
                        onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                        className={`text-xs flex items-center gap-1 font-semibold transition-colors cursor-pointer ${comment.hasUserLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                          }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${comment.hasUserLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likeCount || 0}</span>
                      </button>
                      <button
                        onClick={() => handleReply(comment)}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                      >
                        Responder
                      </button>
                    </div>
                  </div>
                </div>

                {/* Respuestas anidadas */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-12 space-y-3 border-l-2 border-gray-100 pl-4">
                    {comment.replies.map((reply: any, replyIndex: number) => (
                      <div key={reply.id || replyIndex} className="flex gap-2">
                        <UserAvatar
                          user={isCurrentUserComment(reply) ? user : reply.user}
                          size="xs"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 text-xs">
                                {isCurrentUserComment(reply)
                                  ? currentUserName
                                  : reply.userName || reply.user?.name || 'Usuario'
                                }
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {reply.timeAgo || formatDistanceToNow(new Date(reply.createdAt), {
                                  addSuffix: true
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 text-xs leading-relaxed">{reply.content}</p>

                            {/* Botón de like para respuestas */}
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => handleLikeComment(reply.id, reply.hasUserLiked)}
                                className={`text-[11px] flex items-center gap-1 font-semibold transition-colors cursor-pointer ${reply.hasUserLiked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                                  }`}
                              >
                                <ThumbsUp className={`w-3 h-3 ${reply.hasUserLiked ? 'fill-current' : ''}`} />
                                <span>{reply.likeCount || 0}</span>
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
            status.recentComments.map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                <UserAvatar
                  user={isCurrentUserComment(comment) ? user : comment.user}
                  size="xs"
                />
                <div className="flex-1">
                  <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs sm:text-sm text-gray-900">
                        {isCurrentUserComment(comment)
                          ? currentUserName
                          : comment.userName || 'Usuario'
                        }
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {comment.timeAgo || formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 ml-2">
                    <button
                      onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                      className={`text-xs flex items-center gap-1 font-semibold cursor-pointer ${comment.hasUserLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        }`}
                    >
                      <Heart className={`w-3 h-3 ${comment.hasUserLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likeCount > 0 && comment.likeCount}</span>
                    </button>
                    <button
                      onClick={() => handleReply(comment)}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : localComments && localComments.length > 0 ? (
            localComments.map((comment: any, index: number) => (
              <div key={index} className="flex gap-3">
                <UserAvatar
                  user={comment.user}
                  size="xs"
                />
                <div className="flex-1">
                  <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-gray-900">
                        {comment.user?.name || 'Usuario'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 ml-2">
                    <button
                      onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                      className={`text-xs flex items-center gap-1 font-semibold cursor-pointer ${comment.hasUserLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                        }`}
                    >
                      <Heart className={`w-3 h-3 ${comment.hasUserLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likeCount > 0 && comment.likeCount}</span>
                    </button>
                    <button
                      onClick={() => handleReply(comment)}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 text-xs sm:text-sm font-medium">No hay comentarios aún</p>
              <p className="text-gray-400 text-[11px] sm:text-xs mt-0.5">Sé el primero en comentar esta publicación</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 p-4 bg-white">
        {replyingTo && (
          <div className="mb-3 p-3 bg-blue-50/70 border-l-4 border-blue-500 rounded-r-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CornerDownRight className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 font-bold text-xs sm:text-sm">Respondiendo a</span>
                  <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                    {replyingTo.userName || replyingTo.user?.name || 'Usuario'}
                  </span>
                </div>
                <div className="bg-white/90 rounded-lg p-2 border border-blue-100 shadow-sm">
                  <p className="text-gray-600 text-xs italic line-clamp-2">
                    "{replyingTo.content}"
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelReply}
                className="ml-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-3 items-center">
          <UserAvatar size="sm" />
          <div className="flex-1">
            <div className="relative">
              <input
                id="comment-input"
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingTo ? `Escribe una respuesta a ${replyingTo.userName || replyingTo.user?.name || 'Usuario'}...` : `Escribe un comentario como ${currentUserName}...`}
                className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
              />
              {commentText && (
                <button
                  onClick={handleComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div onClick={() => setShowShareModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
          >
            <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-black text-base sm:text-lg tracking-tight">Compartir Estado</h2>
                  <p className="text-white/80 text-[11px] sm:text-xs font-medium mt-0.5">Elige dónde quieres compartir la publicación</p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors font-bold cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    setShowShareModal(false);
                  }}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100/70 transition-colors cursor-pointer group"
                >
                  <div className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                    <Copy className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-gray-700 font-bold">Copiar</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encoded}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 bg-green-50/50 border border-green-100 rounded-xl hover:bg-green-50 transition-colors group"
                >
                  <div className="w-11 h-11 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                    <Icon icon="mdi:whatsapp" className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] text-green-700 font-bold">WhatsApp</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-2 p-3 bg-[#1877F2]/5 border border-[#1877F2]/20 rounded-xl hover:bg-[#1877F2]/10 transition-colors group"
                >
                  <div className="w-11 h-11 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                    <Facebook className="w-5 h-5 fill-current text-white" />
                  </div>
                  <span className="text-[11px] text-[#1877F2] font-bold">Facebook</span>
                </a>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
