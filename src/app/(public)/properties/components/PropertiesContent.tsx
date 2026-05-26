'use client';

import { useState, useCallback } from 'react';
import { Home, AlertTriangle, Loader2 } from 'lucide-react';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';
import { PropertyCard } from '@/presentation/components/property/PropertyCard/PropertyCard';
import { FeaturedProperties } from '@/presentation/components/property/FeaturedProperties/FeaturedProperties';
import { PropertySummary } from '@/core/domain/entities/Property';
import { useInfiniteScroll } from '@/presentation/hooks/useInfiniteScroll';
import PaginationNav from '@/presentation/components/shared/PaginationNav';

export default function PropertiesContent() {
  const propertyRepo = new PropertyRepository();

  const fetchProperties = useCallback(async (page: number, size: number) => {
    const result = await propertyRepo.search({
      page,
      size,
      sort: 'createdAt,desc',
    });

    // Adaptar PropertySearchResult al formato que espera useInfiniteScroll
    return {
      content: result.properties,
      totalElements: result.pagination.totalElements,
      totalPages: result.pagination.totalPages,
      page: result.pagination.currentPage,
      size: result.pagination.pageSize,
      last: !result.pagination.hasNext,
    };
  }, [propertyRepo]);

  const {
    items: allProperties,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalElements,
    totalPages,
    page,
    showPagination,
    lastItemRef,
    reload,
    goToPage,
    getPageNumbers,
  } = useInfiniteScroll<PropertySummary>({
    fetchFn: fetchProperties,
    pageSize: 6,
    threshold: 400,
    deps: [],
    maxInfinitePages: 4, // 4 páginas (24 items) con infinite scroll, luego paginación numérica
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sección de Propiedades Destacadas */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Home className="w-4 h-4" />
                <span>PROPIEDADES DESTACADAS</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Propiedades destacadas cerca de ti
              </h2>
              <p className="text-gray-600 text-lg">
                Descubre los mejores departamentos, casas y terrenos en las principales zonas del Perú
              </p>
            </div>
            
            <FeaturedProperties hideViewAll />
          </div>
        </div>
      </section>

      {/* Todas las Propiedades */}
      <section className="py-16 bg-white">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Todas las Propiedades
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explora nuestro catálogo completo de propiedades inmobiliarias en todo el Perú
              </p>
              {totalElements > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  {totalElements} propiedad{totalElements !== 1 ? 'es' : ''} encontrada{totalElements !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                    <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300" />
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4" />
                      <div className="h-4 bg-gray-300 rounded w-1/2" />
                      <div className="flex justify-between">
                        <div className="h-6 bg-gray-300 rounded w-20" />
                        <div className="h-6 bg-gray-300 rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-red-50 rounded-2xl">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="w-16 h-16 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Error al cargar propiedades
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button 
                  onClick={reload}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : allProperties.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <div className="flex justify-center mb-4">
                  <Home className="w-16 h-16 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No hay propiedades disponibles
                </h3>
                <p className="text-gray-600 mb-6">
                  Pronto tendremos nuevas propiedades inmobiliarias para ti
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                  {allProperties.map((property, index) => {
                    const isLastItem = index === allProperties.length - 1;
                    return (
                      <div
                        key={property.id}
                        ref={isLastItem ? lastItemRef : undefined}
                      >
                        <PropertyCard property={property} />
                      </div>
                    );
                  })}
                </div>

                {/* Indicador de carga de más items */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 mt-8 py-4">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm text-gray-500">Cargando más propiedades...</span>
                  </div>
                )}

                {/* Paginación numérica (aparece después de 4 páginas de infinite scroll) */}
                {showPagination && (
                  <PaginationNav
                    currentPage={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={6}
                    onPageChange={goToPage}
                    getPageNumbers={getPageNumbers}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
