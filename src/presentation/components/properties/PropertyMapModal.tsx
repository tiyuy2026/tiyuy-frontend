'use client';

import React, { useEffect } from 'react';
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

  // Load initial search when modal opens
  useEffect(() => {
    if (filters) {
      search(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content */}
      <div className="relative w-full h-full flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-96 md:max-w-md bg-white md:rounded-l-2xl overflow-hidden z-10
          order-2 md:order-1 h-1/3 md:h-full">
          <PropertyMapSidebar
            properties={searchResult?.properties || []}
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
        </div>

        {/* Map */}
        <div className="flex-1 order-1 md:order-2 h-2/3 md:h-full">
          <PropertyMapView
            properties={searchResult?.properties || []}
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
