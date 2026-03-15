'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from '@/utils/formatters';
import { useCommentStatusPost, useStatusComments } from '@/presentation/hooks/useContacts';
import { useQueryClient } from '@tanstack/react-query';

interface StatusDetailPanelProps {
  status: any;
  user: any;
  onClose?: () => void;
}

export default function StatusDetailPanel({ status, user, onClose }: StatusDetailPanelProps) {
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  // Los contadores se sincronizan con el estado actual
  const [likeCount, setLikeCount] = useState(status.likes || 0);
  const [shareCount, setShareCount] = useState(status.shares || 0);
  
  const queryClient = useQueryClient();
  const commentMutation = useCommentStatusPost();
  
  // Cargar comentarios desde el backend
  const { data: commentsData, isLoading: commentsLoading } = useStatusComments(status.id);
  
  // Los comentarios se cargan desde el backend
  const [localComments, setLocalComments] = useState(commentsData || []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      // Enviar comentario al backend primero
      commentMutation.mutate(
        { postId: status.id, content: commentText },
        {
          onSuccess: (response) => {
            console.log('Comentario guardado exitosamente');
            // Limpiar el input
            setCommentText('');
            // Recargar los comentarios desde el backend para asegurar sincronización
            queryClient.invalidateQueries({ 
              queryKey: ['status-comments', status.id] 
            });
            // También recargar el estado completo para asegurar que se guarden likes y shares
            queryClient.invalidateQueries({ 
              queryKey: ['status', status.id] 
            });
          },
          onError: (error) => {
            console.warn('Error al enviar comentario al backend:', error);
            // Si hay error, mostrar mensaje al usuario
          }
        }
      );
    }
  };

  // Efecto para sincronizar contadores con el estado actual
  useEffect(() => {
    if (status) {
      setLikeCount(status.likes || 0);
      setShareCount(status.shares || 0);
      // Verificar si el usuario actual ya dio like
      if (status.userLiked) {
        setIsLiked(true);
      }
    } else {
      // Si el estado se elimina o expira, limpiar todo
      setLikeCount(0);
      setShareCount(0);
      setIsLiked(false);
      setLocalComments([]);
    }
  }, [status]);

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
    setShowShareModal(true);
    setShareCount((prev: number) => prev + 1); // Incrementar contador de compartidos
  };

  const shareUrl = `${window.location.origin}/dashboard/mis-contactos/status/${status.id}`;
  const shareText = `Mira este estado de ${status.user?.name || 'Usuario'}: ${status.content?.substring(0, 100)}...`;
  const encoded = encodeURIComponent(`${shareText} ${shareUrl}`);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header con información del publicador */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-semibold">
              {status.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {status.user?.name || 'Usuario'}
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
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
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
        <h4 className="font-semibold text-gray-900 mb-4">Comentarios ({localComments.length})</h4>
        
        {/* Lista de comentarios */}
        <div className="space-y-4">
          {localComments && localComments.length > 0 ? (
            localComments.map((comment: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                  {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
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
                    <button className="text-xs text-gray-500 hover:text-gray-700">
                      Me gusta
                    </button>
                    <button className="text-xs text-gray-500 hover:text-gray-700">
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
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleComment()}
            />
            <button
              onClick={handleComment}
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!commentText.trim()}
            >
              Enviar
            </button>
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
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">Copiar</span>
                </button>

                {/* WhatsApp */}
                <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
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
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
