'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { PropertyCard } from '../PropertyCard/PropertyCard';
import { useFilteredProperties } from '@/presentation/hooks/useFilteredProperties';
import type { PropertyFilter } from '@/core/domain/entities/PropertyFilter';

interface FilteredPropertiesProps {
  title: string;
  viewAllLink: string;
  filter: PropertyFilter;
  hideViewAll?: boolean;
  emptyMessage?: string;
}

export function FilteredProperties({
  title,
  viewAllLink,
  filter,
  hideViewAll = false,
  emptyMessage = 'No hay propiedades disponibles en esta categoria',
}: FilteredPropertiesProps) {
  const { data: properties = [], isLoading, error } = useFilteredProperties(filter);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const canScrollLeft = false;
  const canScrollRight = true;

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

  if (isLoading) {
    return (
      <div className="relative">
        <div className="flex overflow-x-auto scrollbar-hide">
          <div className="flex-1 min-w-0" />
          <div className="flex gap-4 sm:gap-5 md:gap-6 pb-4 px-4 flex-shrink-0">
            {[1, 2, 3, 4, 5].map((i) => (
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
      <div className="text-center py-10">
        <p className="text-gray-500">{error instanceof Error ? error.message : 'Error al cargar'}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">{emptyMessage}</p>
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
            {title}
            <Link href={viewAllLink} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ml-1">
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
          className="flex overflow-x-auto gap-4 sm:gap-5 md:gap-6 hide-scrollbar snap-x snap-mandatory scroll-smooth pb-4"
        >
          {properties.map((property) => (
            <div key={property.id} className="carousel-card flex-shrink-0 snap-start">
              <PropertyCard property={property} />
            </div>
          ))}

          {/* Tarjeta de Ver Todos al final */}
          {!hideViewAll && (
            <div className="carousel-card flex-shrink-0 snap-start">
              <Link href={viewAllLink} className="flex flex-col items-center justify-center h-full min-h-[320px] w-full bg-white hover:bg-gray-50 rounded-2xl border border-gray-200 transition-all hover:shadow-md group">
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
          )}
        </div>
      </div>
    </div>
  );
}
