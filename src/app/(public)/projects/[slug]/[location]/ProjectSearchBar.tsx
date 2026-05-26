'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LocationSearch } from '@/presentation/components/forms/LocationSearch/LocationSearch';

const PROJECT_TYPES = [
  { value: 'departamentos', label: 'Residencial' },
  { value: 'locales', label: 'Comercial' },
  { value: 'mixto', label: 'Mixto' },
  { value: 'industrial', label: 'Industrial' },
];

export function ProjectSearchBar({ projectType, location }: { projectType: string; location: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedType, setSelectedType] = useState(projectType);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedType(projectType);
  }, [projectType]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    const currentFilters = ['minPrice', 'maxPrice', 'minArea', 'maxArea', 'phase'];

    currentFilters.forEach(filter => {
      if (searchParams.get(filter)) params.set(filter, searchParams.get(filter)!);
    });

    const slug = selectedLocation
      ? selectedLocation.mainText.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      : location;

    if (selectedLocation) params.set('filtered', '1');

    const finalUrl = `/projects/${selectedType}/${slug}?${params.toString()}`;
    window.location.href = finalUrl;
  };

  const selectedLabel = PROJECT_TYPES.find(t => t.value === selectedType)?.label || 'Tipo';

  return (
    <div className="w-full max-w-8xl mx-auto bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 antialiased text-gray-900">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">

        {/* Tipo de proyecto — dropdown */}
        <div className="relative shrink-0 h-12" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full lg:w-auto h-full px-4 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-none flex items-center justify-between lg:justify-start gap-4 cursor-pointer transition-colors"
          >
            <span className="truncate">{selectedLabel}</span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-full lg:min-w-[240px] py-2">
              <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo de proyecto</p>
              <div className="max-h-60 overflow-y-auto">
                {PROJECT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => { 
                      setSelectedType(t.value); 
                      localStorage.setItem('selectedProjectType', t.value);
                      setDropdownOpen(false); 
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <span className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 transition-colors ${
                      selectedType === t.value ? 'bg-brand border-brand' : 'border-gray-300 group-hover:border-gray-400 bg-white'
                    }`}>
                      {selectedType === t.value && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-2 pt-2 px-3 pb-1 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedType('departamentos');
                    localStorage.removeItem('selectedProjectType');
                    setDropdownOpen(false);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-white bg-brand rounded-lg hover:opacity-90 transition-opacity"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input ubicación con Google Maps */}
        <div className="flex-1 min-w-0 h-12">
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            placeholder="Distrito o zona..."
            defaultValue={location}
            className="w-full h-full"
          />
        </div>

        {/* Botón BUSCAR */}
        <button
          onClick={handleSearch}
          className="h-12 px-10 bg-brand text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm shrink-0 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          BUSCAR
        </button>

      </div>
    </div>
  );
}
