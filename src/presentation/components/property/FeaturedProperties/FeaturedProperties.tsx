'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PropertyCard } from '../PropertyCard/PropertyCard';
import { PropertySummary } from '@/core/domain/entities/Property';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';

export function FeaturedProperties() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Crear instancia del repositorio
  const propertyRepo = new PropertyRepository();

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
    const loadFeaturedProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔍 Cargando propiedades destacadas...');
        
        // Cargar propiedades destacadas (isFeatured: true)
        const result = await propertyRepo.getFeaturedProperties(0, 8); // Aumentamos a 8 para más variedad
        console.log('✅ Propiedades destacadas recibidas:', result);
        setProperties(result.properties || []);
        
        // Si no hay propiedades destacadas, cargar propiedades recientes
        if (!result.properties || result.properties.length === 0) {
          console.log('⚠️ No hay propiedades destacadas, cargando propiedades recientes...');
          try {
            const recentResult = await propertyRepo.getMyProperties(0, 8);
            console.log('✅ Propiedades recientes recibidas:', recentResult);
            setProperties(recentResult.properties || []);
          } catch (recentError) {
            console.log('❌ Error cargando propiedades recientes:', recentError);
            setProperties([]);
          }
        }
      } catch (error) {
        console.error('❌ Error loading featured properties:', error);
        setError('No se pudieron cargar las propiedades');
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedProperties();
  }, []);

  // Refrescar propiedades cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const refreshProperties = async () => {
        try {
          const result = await propertyRepo.getFeaturedProperties(0, 8);
          if (result.properties && result.properties.length > 0) {
            setProperties(result.properties);
          }
        } catch (error) {
          console.error('Error refreshing properties:', error);
        }
      };
      
      refreshProperties();
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
                    <div className="h-4 bg-gray-300 rounded w-full" />
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-300 rounded w-8" />
                      <div className="h-4 bg-gray-300 rounded w-8" />
                      <div className="h-4 bg-gray-300 rounded w-12" />
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <div className="h-6 bg-gray-300 rounded w-24" />
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
        <div className="text-8xl mb-6"></div>
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
          <span>🔄</span>
        </button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="text-8xl mb-6">🏠</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          No hay propiedades disponibles
        </h3>
        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
          Sé el primero en publicar una propiedad o vuelve más tarde para descubrir nuevas oportunidades
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/alquiler" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <span>Explorar alquileres</span>
            <span>→</span>
          </Link>
          <Link 
            href="/venta" 
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <span>Explorar ventas</span>
            <span>→</span>
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
          {properties.map((property) => (
            <div key={property.id} className="w-[320px] flex-shrink-0">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
