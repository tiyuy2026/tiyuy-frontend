'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PropertyMedia } from '@/core/domain/entities/Property';

interface PropertyGalleryProps {
  media: PropertyMedia[];
  coverPhotoUrl?: string;
}

export function PropertyGallery({ media, coverPhotoUrl }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Crear array de imágenes con fallbacks
  const images = media?.filter((m) => m.type === 'IMAGE') || [];

  // Función para obtener URL del proxy
  const getProxyUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    // Usar proxy para todas las URLs externas
    return `/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <span className="text-gray-500 text-6xl">🏠</span>
          <p className="text-gray-400 mt-2">No hay imágenes disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative w-full h-96 md:h-[500px] bg-gray-200 rounded-lg overflow-hidden">
        {images[selectedIndex]?.url ? (
          <img
            src={getProxyUrl(images[selectedIndex].url)}
            alt={`Foto ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Error loading main image:', images[selectedIndex]?.url);
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
              e.currentTarget.parentElement!.innerHTML = '<div class="text-center"><span class="text-gray-500 text-6xl">🏠</span><p class="text-gray-400 mt-2">Error cargando imagen</p></div>';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500 text-6xl">🏠</span>
          </div>
        )}
        
        {/* Navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-colors"
            >
              →
            </button>
          </>
        )}

        {/* Contador */}
        {images.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((img: any, index: number) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`
                relative h-20 rounded-lg overflow-hidden border-2 transition-all
                ${selectedIndex === index ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}
              `}
            >
              {img.url ? (
                <img
                  src={getProxyUrl(img.url)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Error loading thumbnail:', img.url);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-gray-400 text-2xl">🏠</span>';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">🏠</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
