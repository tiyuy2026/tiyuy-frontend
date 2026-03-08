'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface FeaturedItemsProps<T> {
  repository: {
    getFeaturedItems: (district?: string) => Promise<{
      content: T[];
      totalElements: number;
      totalPages: number;
      page: number;
      size: number;
      last: boolean;
      numberOfElements: number;
      first: boolean;
      empty: boolean;
    }>;
  }
  ItemCard: React.ComponentType<{ item: T }>;
  itemName: string;
  emptyMessage?: string;
  emptyIcon?: string;
  emptyAction?: {
    text: string;
    href: string;
    icon?: string;
  };
}

export function FeaturedItems<T>({
  repository,
  ItemCard,
  itemName,
  emptyMessage = `No hay ${itemName}s destacados disponibles`,
  emptyIcon = '',
  emptyAction
}: FeaturedItemsProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Set default emptyAction if not provided
  const defaultEmptyAction = emptyAction || {
    text: `Crear ${itemName}`,
    href: `/dashboard/inmobiliarias/proyectos/nuevo`,
    icon: ''
  };
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const loadFeaturedItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`🔍 Cargando ${itemName}s destacados...`);
        
        // Cargar items destacados
        const result = await repository.getFeaturedItems();
        console.log(`✅ ${itemName}s destacados recibidos:`, result);
        setItems(result.content || []);
        
        // Si no hay items destacados, cargar items recientes
        if (!result.content || result.content.length === 0) {
          console.log(`⚠️ No hay ${itemName}s destacados, cargando ${itemName}s recientes...`);
          // TODO: Implementar getRecentItems cuando exista
        }
      } catch (error) {
        console.error(`❌ Error loading featured ${itemName}s:`, error);
        setError(`No se pudieron cargar los ${itemName}s`);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedItems();
  }, []);

  // Refrescar items cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const refreshItems = async () => {
        try {
          const result = await repository.getFeaturedItems();
          if (result.content && result.content.length > 0) {
            setItems(result.content);
          }
        } catch (error) {
          console.error('Error refreshing items:', error);
        }
      };
      
      refreshItems();
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-[320px] flex-shrink-0">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300" />
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded-full w-16" />
                      <div className="h-4 bg-gray-300 rounded-full w-20" />
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-3/4" />
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-300 rounded w-8" />
                      <div className="h-4 bg-gray-300 rounded w-8" />
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <div className="h-4 bg-gray-300 rounded w-24" />
                      <div className="h-4 bg-gray-300 rounded w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-red-50 to-orange-100 rounded-2xl">
        <div className="text-8xl mb-6">{emptyIcon}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Error al cargar {itemName}s
        </h3>
        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          <span>Reintentar</span>
          <span>🔄</span>
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="text-8xl mb-6">{emptyIcon}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
          Sé el primero en destacar un {itemName} o vuelve más tarde para descubrir nuevas oportunidades
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href={defaultEmptyAction.href}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <span>{defaultEmptyAction.text}</span>
            <span>{defaultEmptyAction.icon}</span>
          </Link>
          <Link 
            href="/proyectos"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <span>Explorar {itemName}s</span>
            <span>🔍</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      
      {/* Flechas de navegación */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 hover:bg-white transition-all duration-200"
        aria-label="Scroll izquierda"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 hover:bg-white transition-all duration-200"
        aria-label="Scroll derecha"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Horizontal scroll container */}
      <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 pb-4 min-w-max">
          {items.map((item: any) => (
            <div key={item.id} className="w-[320px] flex-shrink-0">
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
