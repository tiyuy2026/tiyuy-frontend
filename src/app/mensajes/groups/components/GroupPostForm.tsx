// Este archivo pertenece al módulo de GRUPOS (Presentation Layer - Componentes UI)

'use client';

import React, { useState, useRef } from 'react';
import { useGroupPosts } from '@/presentation/hooks/useGroups';
import { useGroupImages } from '@/presentation/hooks/useGroups';
import { toast } from '@/presentation/store/toastStore';
import { useMutation } from '@tanstack/react-query';
import { GroupUseCases } from '@/core/domain/use-cases/GroupUseCases';
import { GroupRepositoryImpl } from '@/infrastructure/repositories/GroupRepositoryImpl';
import { CreateGroupPostData } from '@/core/domain/repositories/GroupRepository';
import { X, Upload, Palette, Type, Image as ImageIcon } from 'lucide-react';

interface GrupoPostFormProps {
  groupId: number;
  currentUserId?: number;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function GrupoPostForm({ groupId, currentUserId, onClose, onSuccess }: GrupoPostFormProps) {
  const [content, setContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [fontStyle, setFontStyle] = useState<'normal' | 'bold' | 'italic'>('normal');
  const [borderStyle, setBorderStyle] = useState<'none' | 'solid' | 'dashed' | 'rounded'>('none');
  const [postStyle, setPostStyle] = useState<'default' | 'modern' | 'classic' | 'minimal'>('default');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const { createPost, isCreatingPost } = useGroupPosts(groupId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create upload mutation directly
  const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());
  const uploadImagesMutation = useMutation({
    mutationFn: ({ postId, files }: { postId: number; files: File[] }) => 
      groupUseCases.uploadGroupPostImages(postId, files),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('El contenido es obligatorio');
      return;
    }

    try {
      const postData: CreateGroupPostData = {
        content: content.trim(),
        backgroundColor,
        textColor,
        fontStyle,
        borderStyle,
        postStyle,
        imageUrls,
        userId: currentUserId ?? 0,
      };

      await createPost(postData);
      
      // Resetear formulario
      setContent('');
      setBackgroundColor('#ffffff');
      setTextColor('#000000');
      setFontStyle('normal');
      setBorderStyle('none');
      setPostStyle('default');
      setImageUrls([]);
      
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error al crear publicación:', error);
      toast.error('Error al crear la publicación');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > 3) {
      toast.error('Máximo 3 imágenes permitidas');
      return;
    }

    try {
      // Subir imágenes directamente
      const fileArray = Array.from(files);
      const uploadedUrls = await uploadImagesMutation.mutateAsync({ 
        postId: 1, // Temporal, se actualizará después
        files: fileArray 
      });
      
      setImageUrls([...imageUrls, ...uploadedUrls]);
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      toast.error('Error al subir las imágenes');
    }
  };

  const removeImage = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
  };

  const predefinedColors = [
    '#ffffff', '#f3f4f6', '#fef3c7', '#dbeafe', '#e0e7ff', '#fce7f3',
    '#000000', '#374151', '#b91c1c', '#059669', '#1d4ed8', '#7c3aed'
  ];

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Crear Publicación en Grupo</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contenido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿ quieres compartir con el grupo?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            maxLength={2000}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {content.length}/2000 caracteres
          </div>
        </div>

        {/* Estilos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Estilos de Publicación
          </h3>

          {/* Color de fondo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de Fondo
            </label>
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-6 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBackgroundColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      backgroundColor === color ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-8 rounded border border-gray-300"
              />
            </div>
          </div>

          {/* Color de texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de Texto
            </label>
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-6 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTextColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      textColor === color ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-12 h-8 rounded border border-gray-300"
              />
            </div>
          </div>

          {/* Estilo de fuente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estilo de Fuente
            </label>
            <div className="flex gap-2">
              {(['normal', 'bold', 'italic'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setFontStyle(style)}
                  className={`px-3 py-1 rounded-lg border ${
                    fontStyle === style
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                    <Type className="w-4 h-4 inline mr-1" />
                    {style === 'normal' ? 'Normal' : style === 'bold' ? 'Negrita' : 'Cursiva'}
                  </button>
              ))}
            </div>
          </div>

          {/* Estilo de borde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estilo de Borde
            </label>
            <div className="flex gap-2">
              {(['none', 'solid', 'dashed', 'rounded'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setBorderStyle(style)}
                  className={`px-3 py-1 rounded-lg border ${
                    borderStyle === style
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="w-4 h-4 inline mr-1" />
                  {style === 'none' ? 'Sin borde' : style === 'solid' ? 'Sólido' : style === 'dashed' ? 'Discontinuo' : 'Redondeado'}
                </button>
              ))}
            </div>
          </div>

          {/* Estilo de publicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estilo de Publicación
            </label>
            <div className="flex gap-2">
              {(['default', 'modern', 'classic', 'minimal'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setPostStyle(style)}
                  className={`px-3 py-1 rounded-lg border ${
                    postStyle === style
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {style === 'default' ? 'Por defecto' : style === 'modern' ? 'Moderno' : style === 'classic' ? 'Clásico' : 'Minimalista'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes (máximo 3)
          </label>
          
          {/* Upload */}
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImagesMutation.isPending || imageUrls.length >= 3}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploadImagesMutation.isPending ? 'Subiendo...' : 'Subir imágenes'}
            </button>
          </div>

          {/* Preview de imágenes */}
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vista Previa
          </label>
          <div
            className="p-4 rounded-lg border border-gray-200"
            style={{
              backgroundColor,
              color: textColor,
              border: borderStyle === 'none' 
                ? 'none' 
                : borderStyle === 'solid' 
                  ? '1px solid' 
                  : borderStyle === 'dashed' 
                    ? '2px dashed' 
                    : '4px solid',
              borderRadius: borderStyle === 'rounded' ? '12px' : '8px',
              fontStyle: fontStyle === 'bold' ? 'bold' : fontStyle === 'italic' ? 'italic' : 'normal'
            }}
          >
            <div className="text-sm text-gray-500 mb-2">Vista previa:</div>
            <p className="whitespace-pre-wrap">
              {content || 'Tu contenido aparecerá aquí...'}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isCreatingPost || !content.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isCreatingPost ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}
