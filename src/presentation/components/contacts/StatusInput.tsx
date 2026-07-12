'use client';

import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smile, MapPin, Home, Bold, Palette, ChevronDown } from 'lucide-react';

interface StatusInputProps {
  onSendStatus: (content: string, textStyle?: string, customColor?: string, location?: string, propertyType?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

// ─── CUSTOM DROPDOWN ───
function CustomSelect({ value, options, onChange, icon: Icon, label }: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  icon: React.ElementType;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || label || 'Seleccionar';

  return (
    <div ref={ref} className="relative flex-1">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-left flex items-center justify-between cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      >
        <span className={value ? '' : 'text-gray-400 dark:text-gray-500'}>{selectedLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-9 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${value === opt.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StatusInput({ 
  onSendStatus, 
  placeholder = "¿Qué estás pensando?", 
  disabled = false,
  maxLength = 500 
}: StatusInputProps) {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [textStyle, setTextStyle] = useState('NORMAL');
  const [customColor, setCustomColor] = useState('#14b8a6');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const textStyleOptions = [
    { value: 'NORMAL', label: 'Normal' },
    { value: 'BOLD', label: 'Negrita' },
    { value: 'ITALIC', label: 'Cursiva' },
    { value: 'COLORFUL', label: 'Colorido' },
    { value: 'CODE', label: 'Código' },
    { value: 'HIGHLIGHT', label: 'Destacado' },
  ];

  const propertyOptions = [
    { value: '', label: 'Tipo de propiedad' },
    { value: 'HOUSE', label: 'Casa' },
    { value: 'APARTMENT', label: 'Departamento' },
    { value: 'LAND', label: 'Terreno' },
    { value: 'COMMERCIAL', label: 'Comercial' },
    { value: 'OFFICE', label: 'Oficina' },
    { value: 'GARAGE', label: 'Garaje' },
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [content]);

  const getTextStyleClass = () => {
    switch (textStyle) {
      case 'BOLD': return 'font-bold';
      case 'ITALIC': return 'italic';
      case 'COLORFUL': return 'text-red-600';
      case 'CODE': return 'font-mono text-green-700';
      case 'HIGHLIGHT': return 'bg-yellow-100 px-1';
      default: return '';
    }
  };

  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSendStatus(content.trim(), textStyle, customColor, location, propertyType);
      setContent(''); setTextStyle('NORMAL'); setCustomColor(''); setLocation(''); setPropertyType('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800">
      {/* Input principal */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { if (e.target.value.length <= maxLength) setContent(e.target.value); }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm dark:text-white dark:placeholder-gray-400"
          rows={3}
          style={{ minHeight: '80px', maxHeight: '120px' }}
        />
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="absolute right-3 top-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Insertar emoji">
          <Smile className="w-5 h-5" />
        </button>
        <div className="absolute bottom-2 right-12 text-xs text-gray-400">{content.length}/{maxLength}</div>
        {showEmojiPicker && (
          <div className="absolute right-0 top-12 z-50 shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600" onClick={(e) => e.stopPropagation()}>
            <EmojiPicker
              onEmojiClick={(emojiData: any) => {
                setContent(prev => prev + (emojiData.emoji || ''));
                setShowEmojiPicker(false);
                setTimeout(() => textareaRef.current?.focus(), 100);
              }}
              searchDisabled={false} skinTonesDisabled={true} previewConfig={{ showPreview: false }} width={300} height={340} />
          </div>
        )}
      </div>

      {/* Opciones de formato */}
      <div className="space-y-3">
        {/* Estilos de texto - CUSTOM DROPDOWN */}
        <CustomSelect
          value={textStyle}
          options={textStyleOptions}
          onChange={setTextStyle}
          icon={Bold}
        />

        {/* Colores predefinidos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500" />
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Color del estado:</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {predefinedColors.map((color) => (
              <button key={color.value} onClick={() => setCustomColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${customColor === color.value ? 'border-gray-800 scale-110 ring-2 ring-offset-1 ring-gray-300' : 'border-gray-300 hover:border-gray-400'}`}
                style={{ backgroundColor: color.value }} title={color.name} />
            ))}
            <input type="color" value={customColor} onChange={(e) => setCustomColor(e.target.value)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer" title="Color personalizado" />
          </div>
        </div>

        {/* Ubicación y tipo de propiedad */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Ubicación (ej: Miraflores, Lima)"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
          </div>
          {/* Tipo propiedad - CUSTOM DROPDOWN */}
          <CustomSelect
            value={propertyType}
            options={propertyOptions}
            onChange={setPropertyType}
            icon={Home}
            label="Tipo de propiedad"
          />
        </div>
      </div>

      {/* Preview - Estilo Facebook */}
      {content.trim() && (
        <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-md">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1 bg-gray-50 dark:bg-gray-700">Vista previa:</p>
          <div 
            className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
            style={{ backgroundColor: customColor || '#14b8a6' }}
          >
            <div className={`
              text-white leading-relaxed max-w-sm
              ${textStyle === 'BOLD' ? 'font-bold' : ''}
              ${textStyle === 'ITALIC' ? 'italic' : ''}
              ${textStyle === 'COLORFUL' ? 'text-yellow-200' : ''}
              ${textStyle === 'CODE' ? 'font-mono' : ''}
              ${textStyle === 'HIGHLIGHT' ? 'bg-white/20 px-2 py-1 rounded-lg' : ''}
              ${(!textStyle || textStyle === 'NORMAL') ? 'font-medium' : 'font-medium'}
              ${content.length < 30 ? 'text-2xl sm:text-3xl' : ''}
              ${content.length >= 30 && content.length < 80 ? 'text-xl sm:text-2xl' : ''}
              ${content.length >= 80 && content.length < 150 ? 'text-lg sm:text-xl' : ''}
              ${content.length >= 150 ? 'text-sm sm:text-base' : ''}
            `}>
              {content}
            </div>
            {(location || propertyType) && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {location && <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">📍 {location}</span>}
                {propertyType && <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">🏠 {propertyType}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón publicar */}
      <button onClick={handleSend} disabled={disabled || !content.trim()}
        className={`w-full py-3 rounded-2xl font-medium transition-all ${content.trim() && !disabled ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-md hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
        {disabled ? 'Publicando...' : 'Publicar estado'}
      </button>
    </div>
  );
}