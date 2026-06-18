'use client';

import React, { useState, useRef, useEffect } from 'react';
import EmojiSelector from './EmojiSelector';
import { Globe, Loader, Send } from 'lucide-react';;

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
            <Globe className="w-5 h-5" />
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
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
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
