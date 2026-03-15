'use client';

import React, { useState, useRef, useEffect } from 'react';
import EmojiSelector from './EmojiSelector';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export default function MessageInput({ 
  onSendMessage, 
  placeholder = "Escribe un mensaje...", 
  disabled = false,
  maxLength = 500 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-ajustar altura del textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Resetear altura del textarea
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
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
    const newMessage = message + emoji;
    setMessage(newMessage);
    setShowEmojiSelector(false);
    
    // Enfocar el input después de seleccionar emoji
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleTextSelect = (text: string) => {
    const newMessage = message + text;
    setMessage(newMessage);
    setShowEmojiSelector(false);
    
    // Enfocar el input después de seleccionar texto
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    if (newMessage.length <= maxLength) {
      setMessage(newMessage);
    }
  };

  return (
    <div className="relative">
      {/* Input de mensaje */}
      <div className="flex items-end gap-2 p-3 bg-white border-t border-gray-200">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            rows={1}
            style={{
              minHeight: '44px',
              maxHeight: '120px'
            }}
          />
          
          {/* Botón de emoji */}
          <button
            onClick={() => setShowEmojiSelector(!showEmojiSelector)}
            className="absolute right-2 bottom-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Insertar emoji"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-1.25-2.75L8 12.25l2.75 5.25L14 17l-4-9zm-4.5 0l1.5-1.5L9 9.5l1.5 1.5L12 9l-1.5 1.5z"/>
            </svg>
          </button>
        </div>

        {/* Botón de enviar */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`px-4 py-3 rounded-2xl font-medium transition-all ${
            message.trim() && !disabled
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {disabled ? (
            <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 0 0-7H17"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 9 12l-6.99 9z"/>
            </svg>
          )}
        </button>
      </div>

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
