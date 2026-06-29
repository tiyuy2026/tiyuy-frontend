'use client';

import React, { useState, useRef, useEffect } from 'react';
import EmojiSelector from '@/presentation/components/contacts/EmojiSelector';
import { Globe } from 'lucide-react';

interface StatusInputProps {
  onSendStatus: (content: string, textStyle?: string, customColor?: string, location?: string, propertyType?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

// ─── COMPONENTE DE INTERACCIONES DE ESTADO ─────────────────────────────────────
interface StatusInteractionsProps {
  statusId: number;
  onComment?: (comment: string) => void;
  onLike?: () => void;
  onShare?: () => void;
}

function StatusInteractions({ statusId, onComment, onLike, onShare }: StatusInteractionsProps) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Array<{id: number; user: string; content: string; createdAt: string}>>([
    { id: 1, user: 'Carlos Rodríguez', content: '¡Excelente ubicación! ¿Aceptan visitas?', createdAt: '2024-03-15T10:30:00Z' },
    { id: 2, user: 'María García', content: 'Yo también estoy interesado, ¿cuál es el precio?', createdAt: '2024-03-15T11:15:00Z' },
    { id: 3, user: 'Juan Pérez', content: '¿Tiene garaje incluido?', createdAt: '2024-03-15T12:00:00Z' },
  ]);
  const [likes, setLikes] = useState(24);
  const [isLiked, setIsLiked] = useState(false);
  const [shares, setShares] = useState(8);

  const handleComment = () => {
    if (comment.trim() && onComment) {
      const newComment = {
        id: Date.now(),
        user: 'Tú',
        content: comment.trim(),
        createdAt: new Date().toISOString()
      };
      setComments([...comments, newComment]);
      onComment(comment.trim());
      setComment('');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    if (onLike) onLike();
  };

  const handleShare = () => {
    setShares(shares + 1);
    if (onShare) onShare();
  };

  return (
    <div className="bg-white border-t border-gray-100">
      {/* Botones de interacción */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isLiked 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{likes}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              showComments 
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>💬</span>
            <span>{comments.length}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium transition-all"
          >
            <span></span>
            <span>{shares}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>⏰ Expira en 24h</span>
          <span>👁️ 156 vistas</span>
        </div>
      </div>

      {/* Sección de comentarios */}
      {showComments && (
        <div className="max-h-96 overflow-y-auto">
          {/* Lista de comentarios */}
          <div className="p-4 space-y-3 border-b border-gray-100">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {comment.user.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{comment.user}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleTimeString('es-PE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input para nuevo comentario */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Agrega un comentario..."
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { StatusInteractions };

export default function StatusInput({ 
  onSendStatus, 
  placeholder = "¿Qué estás pensando?", 
  disabled = false,
  maxLength = 500 
}: StatusInputProps) {
  const [content, setContent] = useState('');
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [textStyle, setTextStyle] = useState('NORMAL');
  const [customColor, setCustomColor] = useState('#14b8a6'); // Color por defecto teal
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Colores predefinidos
  const predefinedColors = [
    { name: 'Verde', value: '#14b8a6' },
    { name: 'Azul', value: '#2563eb' },
    { name: 'Morado', value: '#8b5cf6' },
    { name: 'Rosado', value: '#ec4899' },
    { name: 'Naranja', value: '#f97316' },
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Amarillo', value: '#eab308' },
    { name: 'Gris', value: '#6b7280' },
  ];

  // Auto-ajustar altura del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [content]);

  // Aplicar estilo al texto según selección
  const getTextStyleClass = () => {
    switch (textStyle) {
      case 'BOLD':
        return 'font-bold';
      case 'ITALIC':
        return 'italic';
      case 'MONOSPACE':
        return 'font-mono';
      default:
        return '';
    }
  };

  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSendStatus(content.trim(), textStyle, customColor, location, propertyType);
      setContent('');
      setTextStyle('NORMAL');
      setCustomColor('');
      setLocation('');
      setPropertyType('');
      
      // Resetear altura del textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const newContent = content + emoji;
    setContent(newContent);
    setShowEmojiSelector(false);
    
    // Enfocar el textarea después de seleccionar emoji
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleTextSelect = (text: string) => {
    const newContent = content + text;
    setContent(newContent);
    setShowEmojiSelector(false);
    
    // Enfocar el textarea después de seleccionar texto
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxLength) {
      setContent(newContent);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800">
      {/* Input principal */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm dark:text-white dark:placeholder-gray-400"
          rows={3}
          style={{
            minHeight: '80px',
            maxHeight: '120px'
          }}
        />
        
        {/* Botón de emoji */}
        <button
          onClick={() => setShowEmojiSelector(!showEmojiSelector)}
          className="absolute right-3 top-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Insertar emoji"
        >
          <Globe className="w-5 h-5" />
        </button>
        
        {/* Contador de caracteres */}
        <div className="absolute bottom-2 right-12 text-xs text-gray-400">
          {content.length}/{maxLength}
        </div>
      </div>

      {/* Opciones de formato */}
      <div className="space-y-3">
        {/* Estilos de texto */}
        <div className="flex gap-2">
          <select
            value={textStyle}
            onChange={(e) => setTextStyle(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="NORMAL">Normal</option>
            <option value="BOLD">Negrita</option>
            <option value="ITALIC">Cursiva</option>
            <option value="MONOSPACE">Monoespaciado</option>
          </select>
        </div>
        
        {/* Colores predefinidos */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Color del estado:</p>
          <div className="flex gap-2 flex-wrap">
            {predefinedColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setCustomColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  customColor === color.value ? 'border-gray-800 scale-110' : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
              title="Color personalizado"
            />
          </div>
        </div>
        
        {/* Ubicación y tipo de propiedad */}
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="📍 Ubicación (ej: Miraflores, Lima)"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="">🏠 Tipo de propiedad</option>
            <option value="HOUSE">🏠 Casa</option>
            <option value="APARTMENT">🏢 Departamento</option>
            <option value="LAND">🏞️ Terreno</option>
            <option value="COMMERCIAL">🏪 Comercial</option>
            <option value="OFFICE">🏢 Oficina</option>
            <option value="GARAGE">🚗 Garaje</option>
          </select>
        </div>
      </div>

      {/* Preview del estado */}
      {content.trim() && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Preview del estado:</p>
          <div 
            className={`p-3 rounded-lg text-sm leading-relaxed ${getTextStyleClass()}`}
            style={{ 
              backgroundColor: customColor + '15', // Color con 15% de opacidad
              borderLeft: `4px solid ${customColor}`
            }}
          >
            {content}
            {(location || propertyType) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {location && (
                  <span className="text-xs bg-white px-2 py-1 rounded-full">
                    📍 {location}
                  </span>
                )}
                {propertyType && (
                  <span className="text-xs bg-white px-2 py-1 rounded-full">
                    🏠 {propertyType}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón de enviar */}
      <button
        onClick={handleSend}
        disabled={disabled || !content.trim()}
        className={`w-full py-3 rounded-2xl font-medium transition-all ${
          content.trim() && !disabled
            ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md hover:opacity-90'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {disabled ? 'Publicando...' : 'Publicar estado'}
      </button>

      {/* Selector de emojis */}
      <EmojiSelector
        show={showEmojiSelector}
        onEmojiSelect={handleEmojiSelect}
        onTextSelect={handleTextSelect}
        onClose={() => setShowEmojiSelector(false)}
      />
    </div>
  );
}
