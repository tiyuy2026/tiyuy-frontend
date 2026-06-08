'use client';

import { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { ProjectCard } from '@/presentation/components/project/ProjectCard/ProjectCard';
import { FeaturedProjects } from '@/presentation/components/project/FeaturedProjects/FeaturedProjects';
import { ProjectSummary } from '@/core/domain/entities/Project';
import { useInfiniteScroll } from '@/presentation/hooks/useInfiniteScroll';
import PaginationNav from '@/presentation/components/shared/PaginationNav';

// Filtros específicos para proyectos
interface ProjectFilters {
  district?: string;
  province?: string;
  region?: string;
  type?: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED';
  phase?: 'PRE_SALE' | 'SALE' | 'DELIVERY';
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  sort?: string;
}

export default function ProjectsContent() {
  const [filters] = useState<ProjectFilters>({
    sort: 'createdAt,desc'
  });

  const projectRepo = new ProjectRepository();

  const fetchProjects = useCallback(async (page: number, size: number) => {
    const result = await projectRepo.searchProjects({
      ...filters,
      page,
      size,
    });
    return result;
  }, [filters, projectRepo]);

  const {
    items: allProjects,
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
  } = useInfiniteScroll<ProjectSummary>({
    fetchFn: fetchProjects,
    pageSize: 6,
    threshold: 400,
    deps: [filters],
    maxInfinitePages: 4, // 4 páginas (24 items) con infinite scroll, luego paginación numérica
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sección de Proyectos Destacados */}
      <section className="py-16 bg-white">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-brand-light text-brand px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Icon icon="mdi:star" className="w-4 h-4" />
                <span>PROYECTOS DESTACADOS</span>
              </div>
              <h2 className="text-3xl font-bold text-brand mb-2">
                Proyectos destacados cerca de ti
              </h2>
              <p className="text-gray-600 text-lg">
                Descubre los mejores proyectos de vivienda e inversión de las principales inmobiliarias del Perú
              </p>
            </div>
            
            <FeaturedProjects />
          </div>
        </div>
      </section>

      {/* Todos los Proyectos */}
      <section className="py-16 bg-white">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Todos los Proyectos
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explora nuestro catálogo completo de proyectos inmobiliarios en todo el Perú
              </p>
              {totalElements > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  {totalElements} proyecto{totalElements !== 1 ? 's' : ''} encontrado{totalElements !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-20" />
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
                  Error al cargar proyectos
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button 
                  onClick={reload}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : allProjects.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <div className="flex justify-center mb-4">
                  <Icon icon="mdi:building-outline" className="w-16 h-16 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No hay proyectos disponibles
                </h3>
                <p className="text-gray-600 mb-6">
                  Pronto tendremos nuevos proyectos inmobiliarios para ti
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                  {allProjects.map((project, index) => {
                    const isLastItem = index === allProjects.length - 1;
                    return (
                      <div
                        key={project.id}
                        ref={isLastItem ? lastItemRef : undefined}
                      >
                        <ProjectCard project={project} />
                      </div>
                    );
                  })}
                </div>

                {/* Indicador de carga de más items */}
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 mt-8 py-4">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm text-gray-500">Cargando más proyectos...</span>
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
