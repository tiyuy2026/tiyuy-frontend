'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PropertyCard } from '../PropertyCard/PropertyCard';
import { PropertySummary } from '@/core/domain/entities/Property';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';

interface FeaturedPropertiesProps {
  hideViewAll?: boolean;
}

export function FeaturedProperties({ hideViewAll = false }: FeaturedPropertiesProps = {}) {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecommended, setIsRecommended] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Crear instancia del repositorio
  const propertyRepo = new PropertyRepository();

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
  }, [properties]);

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

  // Combinaciones de tipo/transacción para obtener una mezcla diversa
  const DIVERSITY_QUERIES: Array<{ transactionType: string; type: string }> = [
    { transactionType: 'SALE', type: 'APARTMENT' },
    { transactionType: 'RENT', type: 'APARTMENT' },
    { transactionType: 'SALE', type: 'HOUSE' },
    { transactionType: 'RENT', type: 'HOUSE' },
    { transactionType: 'SALE', type: 'LAND' },
    { transactionType: 'SALE', type: 'OFFICE' },
    { transactionType: 'SALE', type: 'COMMERCIAL' },
    { transactionType: 'RENT', type: 'ROOM' },
  ];

  /**
   * Obtiene una mezcla diversa de propiedades de diferentes tipos y transacciones.
   * Toma 2 propiedades de cada categoría para asegurar variedad.
   */
  const loadDiverseProperties = async (): Promise<PropertySummary[]> => {
    const allProperties: PropertySummary[] = [];
    const seenIds = new Set<number>();

    // Hacer consultas en paralelo para cada combinación
    const promises = DIVERSITY_QUERIES.map(async ({ transactionType, type }) => {
      try {
        const result = await propertyRepo.search({
          transactionType: transactionType as any,
          type: type as any,
          page: 0,
          size: 3,
          sort: 'isFeatured,desc,createdAt,desc',
        });
        return result.properties || [];
      } catch {
        return [];
      }
    });

    const results = await Promise.all(promises);

    // Intercalar propiedades de diferentes categorías para máxima diversidad
    let maxLen = Math.max(...results.map(r => r.length));
    for (let i = 0; i < maxLen; i++) {
      for (const props of results) {
        if (i < props.length && !seenIds.has(props[i].id)) {
          seenIds.add(props[i].id);
          allProperties.push(props[i]);
          if (allProperties.length >= 15) break;
        }
      }
      if (allProperties.length >= 15) break;
    }

    return allProperties;
  };

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Intentar cargar una mezcla diversa de propiedades
        const diverseProps = await loadDiverseProperties();
        
        if (diverseProps.length > 0) {
          console.log('✅ Propiedades diversas recibidas:', diverseProps.length);
          setProperties(diverseProps);
          setIsRecommended(true);
          return;
        }
        
        // Fallback: propiedades destacadas
        console.log('🔍 Cargando propiedades destacadas...');
        const result = await propertyRepo.getFeaturedProperties(0, 15);
        let featuredProps = result.properties || [];
        console.log('✅ Propiedades destacadas recibidas:', featuredProps.length);
        
        // Si hay menos de 15, rellenar con propiedades recientes
        if (featuredProps.length < 15) {
          console.log(`⚠️ Solo hay ${featuredProps.length} destacadas, rellenando con recientes...`);
          try {
            const recentResult = await propertyRepo.search({ page: 0, size: 15, sort: 'createdAt,desc' } as any);
            const recentProps = recentResult.properties || [];
            const existingIds = new Set(featuredProps.map(p => p.id));
            const additionalProps = recentProps.filter(p => !existingIds.has(p.id));
            featuredProps = [...featuredProps, ...additionalProps].slice(0, 15);
          } catch (recentError) {
            console.log('❌ Error cargando propiedades recientes:', recentError);
          }
        }
        
        setProperties(featuredProps);
        setIsRecommended(false);
      } catch (error) {
        console.error('❌ Error loading featured properties:', error);
        setError('No se pudieron cargar las propiedades');
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
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
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          Error al cargar propiedades
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

  if (properties.length === 0) {
    if (isRecommended) {
      return (
        <div className="text-center py-20 bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No tenemos recomendaciones disponibles
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            No encontramos propiedades similares a tu búsqueda. Intenta con otros criterios o vuelve más tarde.
          </p>
        </div>
      );
    }
    return (
      <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          No hay propiedades disponibles
        </h3>
        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
          Sé el primero en publicar una propiedad o vuelve más tarde para descubrir nuevas oportunidades
        </p>
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
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            {isRecommended ? (
              <>Más recomendaciones para ti <span className="text-gray-500 text-lg">🎯</span></>
            ) : (
              <>Alojamientos populares</>
            )}
            <Link href="/properties" className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ml-1">
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </h2>

          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:shadow-md transition-all bg-white text-gray-600 hover:text-gray-900 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              aria-label="Scroll izquierda"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:shadow-md transition-all bg-white text-gray-600 hover:text-gray-900 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              aria-label="Scroll derecha"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div 
          ref={scrollContainerRef} 
          onScroll={updateScrollState}
          className="flex overflow-x-auto gap-4 sm:gap-5 md:gap-6 hide-scrollbar snap-x snap-mandatory scroll-smooth pb-4"
        >
          {properties.map((property) => (
            <div key={property.id} className="carousel-card flex-shrink-0 snap-start">
              <PropertyCard property={property} />
            </div>
          ))}
          
          {/* Tarjeta de Ver Todos al final */}
          <div className="carousel-card flex-shrink-0 snap-start">
              <Link href="/properties" className="flex flex-col items-center justify-center h-full min-h-[320px] w-full bg-white hover:bg-gray-50 rounded-2xl border border-gray-200 transition-all hover:shadow-md group">
                <div className="relative w-32 h-24 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute top-0 left-0 w-20 h-20 bg-gray-200 rounded-xl border-2 border-white shadow-sm -rotate-6 transform origin-bottom-left z-10 overflow-hidden">
                    <div className="w-full h-full bg-blue-100/50"></div>
                  </div>
                  <div className="absolute top-2 right-0 w-20 h-20 bg-gray-200 rounded-xl border-2 border-white shadow-sm rotate-6 transform origin-bottom-right z-20 overflow-hidden">
                    <div className="w-full h-full bg-green-100/50"></div>
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-20 h-20 bg-gray-100 rounded-xl border-2 border-white shadow-md z-30 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                </div>
                <span className="text-[#003B95] font-semibold text-lg group-hover:text-blue-800 transition-colors">Ver todo</span>
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
