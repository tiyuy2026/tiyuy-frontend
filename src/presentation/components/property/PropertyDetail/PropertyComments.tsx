'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PropertyComment {
  id: number;
  text: string;
  author: string;
  createdAt: string;
  lat?: number;
  lng?: number;
}

interface PropertyCommentsProps {
  propertyId: number;
  location: { latitude?: number; longitude?: number };
}

export function PropertyComments({ propertyId, location }: PropertyCommentsProps) {
  const [comments, setComments] = useState<PropertyComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Cargar comentarios desde el backend
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/properties/${propertyId}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Error cargando comentarios:', error);
        // Si falla el backend, no mostrar errores al usuario
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [propertyId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/properties/${propertyId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tiyuy-auth-token')}`
        },
        body: JSON.stringify({
          text: newComment.trim(),
          // Opcional: si el usuario quiere compartir su ubicación
          latitude: location.latitude,
          longitude: location.longitude
        })
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        setShowForm(false);
        toast.success('Comentario agregado exitosamente');
      } else {
        toast.error('No se pudo agregar el comentario');
      }
    } catch (error) {
      console.error('Error agregando comentario:', error);
      toast.error('Error al agregar comentario');
    }
  };

  if (loading) {
    return (
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-green-800">Cargando comentarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Formulario para agregar comentario */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-blue-800">Comentarios de la zona</h4>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : 'Agregar Comentario'}
          </button>
        </div>
        
        {showForm && (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Comparte tu experiencia sobre esta zona..."
              className="w-full p-3 border border-blue-200 rounded-lg resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{newComment.length}/500 caracteres</span>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publicar Comentario
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lista de comentarios */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment, index) => (
            <div key={comment.id || `comment-${index}-${comment.createdAt}`} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{comment.author}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {comment.lat && comment.lng && (
                  <button
                    onClick={() => {
                      // Aquí puedes agregar lógica para mostrar en mapa
                      console.log('Mostrar en mapa:', comment.lat, comment.lng);
                    }}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    📍 Ver ubicación
                  </button>
                )}
              </div>
              <p className="text-gray-700 leading-relaxed">{comment.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600">
            😊 Sé el primero en comentar sobre esta zona
          </p>
        </div>
      )}
    </div>
  );
}
