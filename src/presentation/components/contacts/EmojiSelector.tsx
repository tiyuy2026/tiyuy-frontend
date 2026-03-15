'use client';

import React, { useState, useRef, useEffect } from 'react';

interface EmojiSelectorProps {
  onEmojiSelect: (emoji: string) => void;
  onTextSelect: (text: string) => void;
  show: boolean;
  onClose: () => void;
}

// Categorías de emojis como WhatsApp
const EMOJI_CATEGORIES = {
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😎', '🤩', '🤔', '🤐', '🤨', '😐', '😑', '😶', '🙁',
    '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😛',
    '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙁', '😖', '😞',
    '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬',
    '😰', '😱', '😳', '😵', '😡', '😠', '😤', '😡', '😷', '🤒',
    '🤕', '🤠', '🥸', '🥶', '🥹', '🥵', '🥴', '🥳', '🥲', '🥱'
  ],
  hearts: [
    '❤️', '🧡', '💙', '💚', '💛', '💜', '💖', '💗', '💘', '💝',
    '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '💭', '🗯️',
    '💤', '💣', '💢', '👍', '👎', '👌', '🤞', '🤟', '🤘', '🤙', '👈',
    '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '👌'
  ],
  people: [
    '👍', '👎', '👌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇',
    '☝️', '✋', '🤚', '🖐', '🖖', '👋', '👌', '👍', '👎', '✊',
    '👊', '✌️', '👏', '👐', '🙌', '👐', '🐍', '🐱', '🐭',
    '🐹', '🐰', '🦊', '🦝', '🐻', '🦄', '🦓', '🦃', '🦌', '🦅',
    '🦆', '🦉', '🦎', '🦏', '🦐', '🦑', '🦒', '🐢', '🍎', '🍊'
  ],
  animals: [
    '🐍', '🐱', '🐭', '🐹', '🐰', '🦊', '🦝', '🐻', '🦄', '🦓', '🦃',
    '🦌', '🦅', '🦆', '🦉', '🦎', '🦏', '🦐', '🦑', '🦒', '🐢',
    '🍎', '🍊', '🐍', '🦎', '🦏', '🐸', '🦎', '🦏', '🐢', '🦎', '🦏', '🐸'
  ],
  objects: [
    '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '💭', '🗯️',
    '💤', '💣', '💢', '👍', '👎', '👌', '🤞', '🤟', '🤘', '🤙', '👈',
    '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '👌'
  ]
};

// 5 tipos de letras especiales
const LETTER_TYPES = {
  normal: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  special1: 'ÁÉÍÓÚÄËÏÜÂÊÎÔÅÆØŪ',
  special2: 'ÀÈÌÒÛÃËÏÕĀĒĪŌĀ',
  special3: '4€1!0°@#5$%&',
  special4: 'áéíóúäëïüâêîôåæøū',
  special5: 'àèìòùãëïõāēīōā'
};

export default function EmojiSelector({ onEmojiSelect, onTextSelect, show, onClose }: EmojiSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');
  const [activeLetterType, setActiveLetterType] = useState<keyof typeof LETTER_TYPES>('normal');
  const [customText, setCustomText] = useState('');
  const selectorRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!show) return null;

  const handleLetterClick = (letter: string) => {
    onTextSelect(letter);
  };

  const handleCustomTextSubmit = () => {
    if (customText.trim()) {
      onTextSelect(customText);
      setCustomText('');
    }
  };

  return (
    <div 
      ref={selectorRef}
      className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-80 overflow-hidden"
    >
      {/* Header con categorías */}
      <div className="flex border-b border-gray-200">
        <div className="flex-1 flex">
          {Object.keys(EMOJI_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
              className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeCategory === category
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category === 'smileys' && '😊'}
              {category === 'hearts' && '❤️'}
              {category === 'people' && '👍'}
              {category === 'animals' && '🐰'}
              {category === 'objects' && '💯'}
            </button>
          ))}
        </div>
      </div>

      {/* Panel de emojis con scroll simple */}
      <div className="overflow-y-auto p-3" style={{ maxHeight: '200px' }}>
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
            <button
              key={index}
              onClick={() => onEmojiSelect(emoji)}
              className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center text-lg transition-colors"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Footer simple */}
      <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Selecciona un emoji para insertar
          </span>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
