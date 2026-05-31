 'use client';

import React from 'react';
import { MapPropertySummary, MapCoverageInfo } from '@/core/domain/entities/Property';
import { PropertyMapCard } from './PropertyMapCard';

interface PropertyMapSidebarProps {
  properties: MapPropertySummary[];
  selectedPropertyId: number | null;
  isLoading: boolean;
  totalResults: number;
  coverageInfo: MapCoverageInfo | null;
  onSelectProperty: (id: number | null) => void;
  onClose: () => void;
}

export function PropertyMapSidebar({
  properties,
  selectedPropertyId,
  isLoading,
  totalResults,
  coverageInfo,
  onSelectProperty,
  onClose,
}: PropertyMapSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Propiedades</h2>
          {!isLoading && (
            <p className="text-sm text-gray-500">
              {totalResults} {totalResults === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Coverage message - colores según nivel */}
      {coverageInfo?.message && (
        <div className={`mx-4 mt-3 px-3 py-2 rounded-lg border ${
          coverageInfo.coverage === 'EXACT_DISTRICT' 
            ? 'bg-green-50 border-green-200' 
            : coverageInfo.coverage === 'NEARBY_DISTRICTS'
              ? 'bg-amber-50 border-amber-200'
              : coverageInfo.coverage === 'NO_RESULTS'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-2">
            {/* Icono según nivel */}
            {coverageInfo.coverage === 'EXACT_DISTRICT' && (
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {coverageInfo.coverage === 'NEARBY_DISTRICTS' && (
              <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {coverageInfo.coverage === 'NO_RESULTS' && (
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            {coverageInfo.coverage !== 'EXACT_DISTRICT' && coverageInfo.coverage !== 'NEARBY_DISTRICTS' && coverageInfo.coverage !== 'NO_RESULTS' && (
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-xs ${
                coverageInfo.coverage === 'EXACT_DISTRICT' 
                  ? 'text-green-700' 
                  : coverageInfo.coverage === 'NEARBY_DISTRICTS'
                    ? 'text-amber-700'
                    : coverageInfo.coverage === 'NO_RESULTS'
                      ? 'text-red-700'
                      : 'text-blue-700'
              }`}>{coverageInfo.message}</p>
              
              {/* Mostrar distritos cercanos cuando es NEARBY_DISTRICTS */}
              {coverageInfo.coverage === 'NEARBY_DISTRICTS' && coverageInfo.nearbyDistricts.length > 1 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {coverageInfo.nearbyDistricts
                    .filter(d => d.toLowerCase() !== coverageInfo.searchedDistrict?.toLowerCase())
                    .slice(0, 5)
                    .map((district, i) => (
                      <span key={i} className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                        {district}
                      </span>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Buscando propiedades...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && properties.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">No se encontraron propiedades en esta zona</p>
            <p className="text-xs text-gray-400 mt-1">Intenta buscar en otra ubicación</p>
          </div>
        </div>
      )}

      {/* Property list */}
      {!isLoading && properties.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {properties.map((property) => (
            <PropertyMapCard
              key={property.id}
              property={property}
              isSelected={selectedPropertyId === property.id}
              onClick={() => onSelectProperty(
                selectedPropertyId === property.id ? null : property.id
              )}
              requestedDistrict={coverageInfo?.searchedDistrict}
            />
          ))}
        </div>
      )}
    </div>
  );
}
