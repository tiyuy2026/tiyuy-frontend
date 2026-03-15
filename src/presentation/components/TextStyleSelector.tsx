'use client';

import { useState, useEffect } from 'react';
import { useTextStyles } from '@/presentation/hooks/useTextStyles';

interface TextStyleSelectorProps {
  selectedStyle?: string;
  onStyleChange?: (style: any) => void;
  customColor?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function TextStyleSelector({ 
  selectedStyle, 
  onStyleChange, 
  customColor, 
  disabled = false,
  placeholder = "Selecciona un estilo" 
}: TextStyleSelectorProps) {
  const { textStyles, selectedStyle: currentStyle, setSelectedStyle, isLoading } = useTextStyles();
  
  const [customColorInput, setCustomColor] = useState(customColor || '');
  const [showCustomColor, setShowCustomColor] = useState(false);

  // Si hay un estilo preseleccionado, usarlo
  useEffect(() => {
    if (selectedStyle && textStyles.length > 0) {
      const style = textStyles.find(s => s.name === selectedStyle);
      if (style && style !== currentStyle) {
        setSelectedStyle(style);
      }
    }
  }, [selectedStyle, textStyles.length]);

  const handleStyleChange = (style: any) => {
    setSelectedStyle(style);
    if (onStyleChange) {
      onStyleChange(style);
    }
  };

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    if (onStyleChange) {
      onStyleChange(currentStyle);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Selector de estilos predefinidos */}
      <select
        value={currentStyle?.name || ''}
        onChange={(e) => {
          const selected = textStyles.find(s => s.name === e.target.value);
          handleStyleChange(selected);
        }}
        disabled={disabled || isLoading}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {isLoading ? 'Cargando...' : (
          <>
            <option value="">{placeholder}</option>
            {textStyles.map((style, index) => (
              <option key={index} value={style.name}>
                {style.description}
              </option>
            ))}
          </>
        )}
      </select>

      {/* Botón para personalizar color */}
      <button
        onClick={() => setShowCustomColor(!showCustomColor)}
        className={`px-3 py-2 rounded-lg border ${
          showCustomColor 
            ? 'border-blue-500 bg-blue-50 text-blue-700' 
            : 'border-gray-300 text-gray-700 hover:border-gray-400'
        } text-sm font-medium transition-colors`}
      >
        🎨️ Color
      </button>

      {/* Input para color personalizado */}
      {showCustomColor && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="#000000"
            className="w-16 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => handleColorChange(e.target.value)}
            placeholder="#000000"
            className="px-2 py-1 rounded border border-gray-300 text-sm"
          />
          <button
            onClick={() => setCustomColor('')}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Vista previa del estilo actual */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div 
          className="text-lg font-medium"
          style={{ 
            color: currentStyle?.color || '#000000',
            ...(currentStyle?.name === 'bold' && { fontWeight: 'bold' }),
            ...(currentStyle?.name === 'italic' && { fontStyle: 'italic' }),
            ...(currentStyle?.name === 'code' && { fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 4px', borderRadius: '4px', fontSize: '0.9em' })
          }}
        >
          Ejemplo: Este es un texto de prueba
        </div>
      </div>
    </div>
  );
}
