'use client';

import { Property } from '@/core/domain/entities/Property';

interface SimilarPropertiesProps {
  currentProperty: Property;
  maxItems?: number;
}

export function SimilarProperties({ currentProperty, maxItems = 6 }: SimilarPropertiesProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Propiedades similares en {currentProperty.location?.district || 'la zona'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(maxItems)].map((_, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <p className="text-gray-500 text-sm">
          <svg className="animate-spin w-4 h-4 inline-block mr-1 text-gray-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          Cargando propiedades similares...
        </p>
      </div>
    </div>
  );
}