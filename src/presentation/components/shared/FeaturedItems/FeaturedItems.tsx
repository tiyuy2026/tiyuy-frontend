'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Image } from 'lucide-react';

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
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Set default emptyAction if not provided
  const defaultEmptyAction = emptyAction || {
    text: `Crear ${itemName}`,
    href: `/my-projects/new`,
    icon: ''
  };
  
  const updateScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(updateScrollState, 100);
    window.addEventListener('resize', updateScrollState);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [items]);

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
        let itemsContent = result.content || [];
        console.log(`✅ ${itemName}s destacados recibidos:`, itemsContent.length);
        
        // Si hay menos de 15, rellenar con recientes para que el carrusel se vea completo
        if (itemsContent.length < 15) {
          console.log(`⚠️ Solo hay ${itemsContent.length} destacados, rellenando con recientes...`);
          try {
            let recentResult;
            if ('searchProjects' in repository) {
              recentResult = await (repository as any).searchProjects({ page: 0, size: 15, sort: 'createdAt,desc' });
            } else if ('search' in repository) {
              recentResult = await (repository as any).search({ page: 0, size: 15, sort: 'createdAt,desc' });
            }

            if (recentResult && recentResult.content) {
              const recentProps = recentResult.content || [];
              const existingIds = new Set(itemsContent.map((p: any) => p.id));
              const additionalProps = recentProps.filter((p: any) => !existingIds.has(p.id));
              
              itemsContent = [...itemsContent, ...additionalProps].slice(0, 15);
            }
          } catch (recentError) {
            console.log('❌ Error cargando items recientes:', recentError);
          }
        }
        
        setItems(itemsContent);
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
    <div className="w-full">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .carousel-card {
          width: 85vw;
        }
        @media (min-width: 640px) {
          .carousel-card { width: calc((100% - 20px) / 2); }
        }
        @media (min-width: 768px) {
          .carousel-card { width: calc((100% - 2 * 24px) / 3); }
        }
        @media (min-width: 1024px) {
          .carousel-card { width: calc((100% - 3 * 24px) / 4); }
        }
        @media (min-width: 1280px) {
          .carousel-card { width: calc((100% - 4 * 24px) / 5); }
        }
        @media (min-width: 1536px) {
          .carousel-card { width: calc((100% - 5 * 24px) / 6); }
        }
        @media (min-width: 1800px) {
          .carousel-card { width: calc((100% - 6 * 24px) / 7); }
        }
      `}</style>

      <div className="w-full max-w-[1920px] mx-auto px-8 xl:px-16">
        
        {/* Header and Navigation Controls */}
        <div className="flex justify-between items-end mb-4 pr-4">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2 capitalize">
            {itemName}s destacados
            <Link href={itemName === 'proyecto' ? '/projects' : '/properties'} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ml-1">
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </Link>
          </h2>

          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:shadow-md transition-all bg-white text-gray-600 hover:text-gray-900 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              aria-label="Scroll izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:shadow-md transition-all bg-white text-gray-600 hover:text-gray-900 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              aria-label="Scroll derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div 
          ref={scrollContainerRef} 
          onScroll={updateScrollState}
          className="flex overflow-x-auto gap-4 sm:gap-5 md:gap-6 hide-scrollbar snap-x snap-mandatory scroll-smooth pb-4"
        >
          {items.map((item: any) => (
            <div key={item.id} className="carousel-card flex-shrink-0 snap-start">
              <ItemCard item={item} />
            </div>
          ))}
          
          {/* Tarjeta de Ver Todos al final */}
          {!hideViewAll && (
            <div className="carousel-card flex-shrink-0 snap-start">
              <Link href={itemName === 'proyecto' ? '/projects' : '/properties'} className="flex flex-col items-center justify-center h-full min-h-[320px] w-full bg-white hover:bg-gray-50 rounded-2xl border border-gray-200 transition-all hover:shadow-md group">
                <div className="relative w-32 h-24 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-gray-200 rounded-xl border-2 border-white shadow-sm -rotate-6 transform origin-bottom-left z-10 overflow-hidden">
                    <div className="w-full h-full bg-blue-100/50"></div>
                  </div>
                  <div className="absolute top-2 right-0 w-20 h-20 bg-gray-200 rounded-xl border-2 border-white shadow-sm rotate-6 transform origin-bottom-right z-20 overflow-hidden">
                    <div className="w-full h-full bg-green-100/50"></div>
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-20 bg-gray-100 rounded-xl border-2 border-white shadow-md z-30 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </div>
                <span className="text-[#003B95] font-semibold text-lg group-hover:text-blue-800 transition-colors">Ver todo</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
