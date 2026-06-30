'use client';

import React, { useEffect, useState } from 'react';
import { usePropertyMap } from '@/presentation/hooks/usePropertyMap';
import { PropertyMapView } from './PropertyMapView';
import { PropertyMapSidebar } from './PropertyMapSidebar';
import { PropertyFilter } from '@/core/domain/entities/PropertyFilter';

interface PropertyMapModalProps {
  filters?: PropertyFilter;
  onClose: () => void;
}

export function PropertyMapModal({ filters, onClose }: PropertyMapModalProps) {
  const {
    searchResult,
    isLoading,
    selectedPropertyId,
    search,
    selectProperty,
    reset,
  } = usePropertyMap();

  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Load all properties when modal opens (sin filtros = todos)
  useEffect(() => {
    search(filters || {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset page when results change
  useEffect(() => {
    setPage(0);
  }, [searchResult?.properties?.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allProperties = searchResult?.properties || [];
  const totalPages = Math.max(1, Math.ceil(allProperties.length / ITEMS_PER_PAGE));
  const paginatedProperties = allProperties.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content */}
      <div className="relative w-full h-full flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-72 lg:w-80 bg-white md:rounded-l-2xl overflow-hidden z-10
          order-2 md:order-1 h-1/3 md:h-full flex flex-col">
          <PropertyMapSidebar
            properties={paginatedProperties}
            selectedPropertyId={selectedPropertyId}
            isLoading={isLoading}
            totalResults={searchResult?.totalResults || 0}
            coverageInfo={searchResult ? {
              coverage: searchResult.effectiveCoverage,
              searchedDistrict: searchResult.requestedArea,
              nearbyDistricts: searchResult.districtsIncluded || [],
              message: searchResult.coverageMessage || '',
            } : null}
            onSelectProperty={selectProperty}
            onClose={onClose}
          />

          {/* Pagination */}
          {!isLoading && allProperties.length > ITEMS_PER_PAGE && (
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-white">
              <button
                onClick={() => setPage((p: number) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-light text-brand-dark hover:bg-brand-light-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-xs text-brand-dark font-semibold">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p: number) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-light text-brand-dark hover:bg-brand-light-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 order-1 md:order-2 h-2/3 md:h-full">
          <PropertyMapView
            properties={allProperties}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={selectProperty}
            requestedDistrict={searchResult?.requestedArea}
            districtsIncluded={searchResult?.districtsIncluded}
          />
        </div>
      </div>
    </div>
  );
}
