'use client';

import { useState, useEffect } from 'react';

export interface TextStyleOption {
  name: string;
  color: string;
  description: string;
  isDefault: boolean;
}

export function useTextStyles() {
  const [textStyles, setTextStyles] = useState<TextStyleOption[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<TextStyleOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar estilos disponibles del backend
  const loadTextStyles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/contacts/extended/status/styles');
      
      if (!response.ok) {
        throw new Error('Error cargando estilos de texto');
      }
      
      const data = await response.json();
      setTextStyles(data.styles || []);
      
      // Establecer el estilo por defecto
      const defaultStyle = data.defaultStyle;
      if (defaultStyle && textStyles.length > 0) {
        const defaultOption = textStyles.find(style => style.name === defaultStyle);
        if (defaultOption) {
          setSelectedStyle(defaultOption);
        }
      }
      
    } catch (err) {
      console.error('Error cargando estilos de texto:', err);
      setError('No se pudieron cargar los estilos de texto');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar estilos al montar el componente
  useEffect(() => {
    loadTextStyles();
  }, []);

  const applyStyle = (content: string, style: TextStyleOption, customColor?: string) => {
    const effectiveColor = customColor || style.color;
    
    switch (style.name) {
      case 'bold':
        return `<span style="font-weight: bold; color: ${effectiveColor}">${content}</span>`;
      case 'italic':
        return `<span style="font-style: italic; color: ${effectiveColor}">${content}</span>`;
      case 'colorful':
        return `<span style="color: ${effectiveColor}; font-weight: 600;">${content}</span>`;
      case 'code':
        return `<span style="color: ${effectiveColor}; font-family: 'Courier New', monospace; background: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-size: 0.9em;">${content}</span>`;
      case 'highlight':
        return `<span style="background: ${effectiveColor}20; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 500;">${content}</span>`;
      default:
        return `<span style="color: ${effectiveColor}">${content}</span>`;
    }
  };

  const applyStyleToElement = (element: HTMLElement, style: TextStyleOption, customColor?: string) => {
    const effectiveColor = customColor || style.color;
    
    switch (style.name) {
      case 'bold':
        element.style.fontWeight = 'bold';
        element.style.color = effectiveColor;
        break;
      case 'italic':
        element.style.fontStyle = 'italic';
        element.style.color = effectiveColor;
        break;
      case 'colorful':
        element.style.color = effectiveColor;
        element.style.fontWeight = '600';
        break;
      case 'code':
        element.style.color = effectiveColor;
        element.style.fontFamily = "'Courier New', monospace";
        element.style.background = '#f3f4f6';
        element.style.padding = '2px 4px';
        element.style.borderRadius = '4px';
        element.style.fontSize = '0.9em';
        break;
      case 'highlight':
        element.style.background = `${effectiveColor}20`;
        element.style.color = 'white';
        element.style.padding = '2px 6px';
        element.style.borderRadius = '4px';
        element.style.fontWeight = '500';
        break;
      default:
        element.style.color = effectiveColor;
        break;
    }
  };

  return {
    textStyles,
    selectedStyle,
    setSelectedStyle,
    isLoading,
    error,
    applyStyle,
    applyStyleToElement,
    loadTextStyles,
    // Para facilitar el uso
    getStyleByName: (name: string) => textStyles.find(s => s.name === name),
    getDefaultStyle: () => textStyles.find(s => s.isDefault),
    getEffectiveColor: (style: TextStyleOption, customColor?: string) => {
      return customColor || style.color;
    }
  };
}
