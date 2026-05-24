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
  hideViewAll?: boolean;
}

export function FeaturedItems<T>({
  repository,
  ItemCard,
  itemName,
  emptyMessage = `No hay ${itemName}s destacados disponibles`,
  emptyIcon = '',
  emptyAction,
  hideViewAll = false
}: FeaturedItemsProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Set default emptyAction if not provided
  const defaultEmptyAction = emptyAction || {
    text: `Crear ${itemName}`,
    href: `/my-projects/new`,
    icon: ''
  };
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -scrollContainerRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollContainerRef.current.clientWidth, behavior: 'smooth' });
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
        
        // Si es un error de red, mostrar mensaje específico
        if (error instanceof Error && error.message.includes('Network Error')) {
          setError('Error de conexión. Verifica tu internet o intenta más tarde.');
        } else {
          setError(`No se pudieron cargar los ${itemName}s`);
        }
        
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
        <div className="flex overflow-x-auto scrollbar-hide">
          <div className="flex-1 min-w-0" />
          <div className="flex gap-4 sm:gap-5 md:gap-6 pb-4 px-4 flex-shrink-0">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="w-[85vw] sm:w-[280px] md:w-[320px] lg:w-[240px] xl:w-[190px] 2xl:w-[220px] flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                  <div className="w-full aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded-full w-24" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-5 bg-gray-200 rounded w-20 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0" />
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
            href="/projects"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <span>Explorar {itemName}s</span>
            <span>🔍</span>
          </Link>
          <div className="flex-1 min-w-0" />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .carousel-wrapper-dynamic {
          max-width: calc(2 * 280px + 8.25rem);
        }
        @media (min-width: 768px) { .carousel-wrapper-dynamic { max-width: calc(2 * 330px + 10.5rem); } }
        @media (min-width: 1024px) { .carousel-wrapper-dynamic { max-width: calc(3 * 280px + 12rem); } }
        @media (min-width: 1280px) { .carousel-wrapper-dynamic { max-width: calc(5 * 210px + 15rem); } }
        @media (min-width: 1536px) { .carousel-wrapper-dynamic { max-width: calc(6 * 230px + 16.5rem); } }
      `}</style>
      <div className="w-full mx-auto relative group/carousel carousel-wrapper-dynamic px-12 md:px-16">
      
      {/* Flechas de navegación */}
      <button
        onClick={scrollLeft}
        className="absolute -left-4 md:-left-8 top-[35%] -translate-y-1/2 z-20 bg-white shadow-md border border-gray-100 rounded-full p-2 hover:scale-105 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0"
        aria-label="Scroll izquierda"
      >
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={scrollRight}
        className="absolute -right-4 md:-right-8 top-[35%] -translate-y-1/2 z-20 bg-white shadow-md border border-gray-100 rounded-full p-2 hover:scale-105 transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0"
        aria-label="Scroll derecha"
      >
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Horizontal scroll container */}
      <div ref={scrollContainerRef} className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth">
        <div className="flex-1 min-w-0" />
        <div className="flex gap-4 sm:gap-5 md:gap-6 pb-4 pl-4 flex-shrink-0">
          {items.map((item: any) => (
            <div key={item.id} className="w-[85vw] sm:w-[280px] md:w-[330px] lg:w-[280px] xl:w-[210px] 2xl:w-[230px] flex-shrink-0 snap-start">
              <ItemCard item={item} />
            </div>
          ))}
          {/* Tarjeta de Ver Todos */}
          {!hideViewAll && (
            <div className="w-[85vw] sm:w-[280px] md:w-[330px] lg:w-[280px] xl:w-[210px] 2xl:w-[230px] flex-shrink-0 snap-start">
              <Link href={itemName === 'proyecto' ? '/projects' : '/properties'} className="flex flex-col items-center justify-center h-full min-h-[250px] w-full bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 transition-colors group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
                <span className="text-gray-600 font-medium group-hover:text-blue-600 transition-colors text-center px-4">Ver todos los<br/>{itemName}s</span>
              </Link>
            </div>
          )}
          <div className="w-4 flex-shrink-0" />
        </div>
        <div className="flex-1 min-w-0" />
      </div>
    </div>
    </>
  );
}
