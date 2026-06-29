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
    maxInfinitePages: 4, 
  });

  return (
    <main className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Estilos globales inyectados para forzar la reducción estética y simetría en móviles */}
      <style>{`
        @media (max-width: 639px) {
          /* Reset de tarjetas inferiores para imitar tamaño mini de Airbnb */
          .compact-mobile-card > div {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }
          .compact-mobile-card img,
          .compact-mobile-card .relative {
            border-radius: 14px !important;
            aspect-ratio: 1 / 1 !important;
            margin-bottom: 6px !important;
          }
          .compact-mobile-card h3 {
            font-size: 13px !important;
            font-weight: 600 !important;
            line-height: 1.2 !important;
          }
          .compact-mobile-card p, 
          .compact-mobile-card span {
            font-size: 11px !important;
          }
          .compact-mobile-card svg {
            width: 12px !important;
            height: 12px !important;
          }
          .compact-mobile-card .hide-on-compact {
            display: none !important;
          }
        }
      `}</style>

      {/* Sección de Proyectos Destacados (Carrusel) */}
      <section className="py-6 sm:py-16 bg-[var(--bg-primary)] w-full">
        <div className="max-w-[1920px] mx-auto">
          {/* Sincronizado a px-4 en móvil para calzar con la sección inferior */}
          <div className="text-center mb-6 sm:mb-12 px-4 sm:px-8 xl:px-16">
            <div className="inline-flex items-center gap-2 bg-[var(--brand-primary-light)] text-brand px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              <Icon icon="mdi:star" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>PROYECTOS DESTACADOS</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-brand mb-2">
              Proyectos destacados cerca de ti
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-lg max-w-2xl mx-auto">
              Descubre los mejores proyectos de vivienda e inversión de las principales inmobiliarias del Perú
            </p>
          </div>
          
          <FeaturedProjects />
        </div>
      </section>

      {/* Todos los Proyectos (Grid Estilo Airbnb Compacto) */}
      {/* Sincronizado el padding lateral de la sección (px-4 en móvil) */}
      <section className="py-6 sm:py-16 bg-[var(--bg-primary)] border-t border-[var(--border-light)]">
        <div className="w-full px-4 sm:px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="text-xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2 sm:mb-4">
                Todos los Proyectos
              </h2>
              <p className="text-sm sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                Explora nuestro catálogo completo de proyectos inmobiliarios en todo el Perú
              </p>
              {totalElements > 0 && (
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5">
                  {totalElements} proyecto{totalElements !== 1 ? 's' : ''} encontrado{totalElements !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="w-full aspect-square bg-gray-200 rounded-[14px] mb-2" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 sm:py-20 bg-red-50 dark:bg-red-950/30 rounded-2xl mx-4 sm:mx-0">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="w-12 h-12 sm:w-16 h-16 text-red-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2 sm:mb-4">
                  Error al cargar proyectos
                </h3>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-6 px-4">{error}</p>
                <button 
                  onClick={reload}
                  className="bg-red-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Reintentar
                </button>
              </div>
            ) : allProjects.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-[var(--bg-tertiary)] rounded-2xl mx-4 sm:mx-0">
                <div className="flex justify-center mb-4">
                  <Icon icon="mdi:building-outline" className="w-12 h-12 sm:w-16 h-16 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2 sm:mb-4">
                  No hay proyectos disponibles
                </h3>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-6 px-4">
                  Pronto tendremos nuevos proyectos inmobiliarios para ti
                </p>
              </div>
            ) : (
              <>
                {/* Grid con gap-3 en móvil de 2 columnas perfecto para las mini cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6">
                  {allProjects.map((project, index) => {
                    const isLastItem = index === allProjects.length - 1;
                    return (
                      <div
                        key={project.id}
                        ref={isLastItem ? lastItemRef : undefined}
                        className="w-full min-w-0 compact-mobile-card"
                      >
                        <ProjectCard project={project} />
                      </div>
                    );
                  })}
                </div>

                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 mt-8 py-4">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-spin" />
                    <span className="text-xs sm:text-sm text-[var(--text-secondary)]">Cargando más proyectos...</span>
                  </div>
                )}

                {showPagination && (
                  <div className="mt-6 sm:mt-0">
                    <PaginationNav
                      currentPage={page}
                      totalPages={totalPages}
                      totalElements={totalElements}
                      pageSize={6}
                      onPageChange={goToPage}
                      getPageNumbers={getPageNumbers}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}