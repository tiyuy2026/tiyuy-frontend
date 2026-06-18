'use client';

import { useState, useRef, useEffect } from 'react';
import { Image } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallback?: string;
  priority?: boolean;
}

/**
 * Componente de imagen con lazy loading nativo + IntersectionObserver fallback.
 * Muestra un placeholder mientras carga y evita layout shift con dimensiones fijas.
 */
export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  fallback = '/assets/images/placeholder.svg',
  priority = false,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const showPlaceholder = !loaded || error;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        minHeight: height ? `${height}px` : '100%',
      }}
    >
      {/* Placeholder mientras carga */}
      {showPlaceholder && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <Image className="w-8 h-8 text-gray-300" />
        </div>
      )}

      {/* Imagen real */}
      {inView && (
        <img
          src={error ? fallback : src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          width={width}
          height={height}
        />
      )}
    </div>
  );
}
