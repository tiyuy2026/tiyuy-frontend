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
  const shareId = status.shareLink || status.id || '';
  const shareUrl = `${siteUrl}/public/view/status/${shareId}`;
  const shareText = `Mira este estado de ${status.userName || status.user?.name || 'Usuario'} en Tiyuy: ${status.content?.substring(0, 120)}...`;
  const encoded = encodeURIComponent(`${shareText} ${shareUrl}`);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Barra verde delgada solo para avatar + nombre */}
      <div className="bg-green-600 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar 
              user={status.user?.id === user?.id || status.userId === user?.id ? user : status.user} 
              size="sm" 
            />
            <div>
              <h3 className="text-white font-semibold text-sm">
                {status.user?.id === user?.id || status.userId === user?.id
                  ? currentUserName
                  : status.userName || status.user?.name || 'Usuario'
                }
              </h3>
              <p className="text-xs text-white/70">
                {formatDistanceToNow(new Date(status.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido del estado - estilo Facebook */}
      <div 
        className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] p-6 sm:p-10 text-center"
        style={{ 
          backgroundColor: status.customColor || '#14b8a6',
        }}
      >
        <div className="max-w-md w-full mx-auto">
          {/* Texto del estado con auto-sizing y estilo de texto */}
          <div className={`
            text-white leading-relaxed
            ${status.textStyle === 'BOLD' ? 'font-bold' : ''}
            ${status.textStyle === 'ITALIC' ? 'italic' : ''}
            ${status.textStyle === 'COLORFUL' ? 'text-yellow-200' : ''}
            ${status.textStyle === 'CODE' ? 'font-mono' : ''}
            ${status.textStyle === 'HIGHLIGHT' ? 'bg-white/20 px-2 py-1 rounded-lg' : ''}
            ${(!status.textStyle || status.textStyle === 'NORMAL') ? 'font-medium' : 'font-medium'}
            ${status.content?.length < 30 ? 'text-3xl sm:text-4xl' : ''}
            ${status.content?.length >= 30 && status.content?.length < 80 ? 'text-2xl sm:text-3xl' : ''}
            ${status.content?.length >= 80 && status.content?.length < 150 ? 'text-xl sm:text-2xl' : ''}
            ${status.content?.length >= 150 ? 'text-base sm:text-lg' : ''}
          `}>
            {status.content}
          </div>
          
          {/* Metadatos del estado */}
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            {status.location && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                📍 {status.location}
              </span>
            )}
            {status.propertyType && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
                🏠 {status.propertyType}
              </span>
            )}
          </div>

          {status.tags && status.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {status.tags.map((tag: string, index: number) => (
                <span key={index} className="px-2.5 py-1 bg-white/15 text-white/90 text-[11px] rounded-full font-medium backdrop-blur-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="border-b border-[var(--border-light)] p-4">

        <div className="flex items-center gap-6">
          <button onClick={handleLike} className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiked ? 'text-red-600' : 'text-[var(--text-secondary)] hover:text-red-600'}`}>
            <Heart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
            {likeCount > 0 && likeCount}
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-brand transition-colors">
            <MessageCircle className="w-5 h-5" /> Comentar
          </button>
          <div className="relative">
            <button onClick={handleShare} className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-green-600 transition-colors">
              <Share2 className="w-5 h-5" /> Compartir
              {shareCount > 0 && <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">{shareCount}</span>}
            </button>
            {showShareModal && (
              <div className="absolute left-[calc(100%+24px)] top-0 z-50 w-[220px]">
                <div className="bg-[var(--bg-card)] rounded-2xl shadow-2xl overflow-hidden border-0">
                  <div className="p-3 flex items-center justify-between border-b border-[var(--border-light)]">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Compartir</h3>
                    <button onClick={() => setShowShareModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(`${shareText} ${shareUrl}`); setShowShareModal(false); }}
                        className="flex flex-col items-center gap-2 py-3 px-2 bg-[var(--bg-tertiary)] rounded-xl hover:bg-[var(--border-color)] transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shadow-sm">
                          <Copy className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Copiar</span>
                      </button>
                      <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 py-3 px-2 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                          <Icon icon="fa6-brands:whatsapp" className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-green-700 dark:text-green-400">WhatsApp</span>
                      </a>
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
                        target="_blank" rel="noopener noreferrer" onClick={() => setShowShareModal(false)}
                        className="flex flex-col items-center gap-2 py-3 px-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                          <Icon icon="fa6-brands:facebook" className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">Facebook</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de comentarios */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="font-semibold text-[var(--text-primary)] mb-4">Comentarios ({updatedStatus.commentCount || 0})</h4>

        {/* Lista de comentarios */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-[var(--text-muted)] text-sm">Cargando comentarios...</p>
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
                    <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)] text-sm">
                            {isCurrentUserComment(comment)
                              ? currentUserName
                              : comment.userName || comment.user?.name || 'Usuario'
                            }
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            {comment.timeAgo || formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-[var(--text-primary)] text-sm leading-relaxed">{comment.content}</p>
                    </div>

                    {/* Botones de interacción */}
                    <div className="flex items-center gap-4 mt-2 ml-2">
                      <button
                        onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                        className={`text-xs flex items-center gap-1 transition-colors ${comment.hasUserLiked ? 'text-brand' : 'text-[var(--text-muted)] hover:text-brand'
                          }`}
                      >
                        <ThumbsUp className="w-4 h-4" fill={comment.hasUserLiked ? 'currentColor' : 'none'} />
                        <span className="font-medium">{comment.likeCount || 0}</span>
                      </button>
                      <button
                        onClick={() => handleReply(comment)}
                        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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
                          <div className="bg-[var(--bg-tertiary)] rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-[var(--text-primary)] text-xs">
                                {isCurrentUserComment(reply)
                                  ? currentUserName
                                  : reply.userName || reply.user?.name || 'Usuario'
                                }
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">
                                {reply.timeAgo || formatDistanceToNow(new Date(reply.createdAt), {
                                  addSuffix: true
                                })}
                              </span>
                            </div>
                            <p className="text-[var(--text-secondary)] text-xs">{reply.content}</p>

                            {/* Botón de like para respuestas */}
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => handleLikeComment(reply.id, reply.hasUserLiked)}
                                className={`text-xs flex items-center gap-1 transition-colors ${reply.hasUserLiked ? 'text-brand' : 'text-[var(--text-muted)] hover:text-brand'
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
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-[var(--text-primary)]">
                        {isCurrentUserComment(comment)
                          ? currentUserName
                          : comment.userName || 'Usuario'
                        }
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {comment.timeAgo || formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)]">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 ml-3">
                    <button
                      onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                      className={`text-xs flex items-center gap-1 ${comment.hasUserLiked ? 'text-red-600' : 'text-[var(--text-muted)] hover:text-red-600'
                        }`}
                    >
                      <Heart className="w-3 h-3" />
                      {comment.likeCount > 0 && comment.likeCount}
                    </button>
                    <button
                      onClick={() => handleReply(comment)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
                  <div className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-[var(--text-primary)]">
                        {comment.userName || 'Usuario'}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {comment.timeAgo || formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)]">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 ml-3">
                    <button
                      onClick={() => handleLikeComment(comment.id, comment.hasUserLiked)}
                      className={`text-xs flex items-center gap-1 ${comment.hasUserLiked ? 'text-red-600' : 'text-[var(--text-muted)] hover:text-red-600'
                        }`}
                    >
                      <Heart className="w-3 h-3" />
                      {comment.likeCount > 0 && comment.likeCount}
                    </button>
                    <button
                      onClick={() => handleReply(comment)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-[var(--text-muted)] text-sm">No hay comentarios aún</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
