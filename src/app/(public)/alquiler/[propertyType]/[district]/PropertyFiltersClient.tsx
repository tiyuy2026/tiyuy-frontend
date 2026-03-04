'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { UrbaniaFilters } from '@/presentation/components/property/PropertyFilters/UrbaniaFilters';

interface PropertyFiltersClientProps {
  initialFilters: any;
  propertyType: string;
}

export function PropertyFiltersClient({ initialFilters, propertyType }: PropertyFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const TYPE_TO_SLUG: Record<string, string> = {
    APARTMENT: 'departamentos',
    HOUSE: 'casas',
    LAND: 'terrenos',
    OFFICE: 'oficinas',
    COMMERCIAL: 'locales',
    ROOM: 'habitaciones',
  };

  const toSlug = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleFilterChange = (filters: any) => {
    const params = new URLSearchParams();
    
    // Mantener parámetros existentes
    const currentParams = ['page', 'minPrice', 'maxPrice', 'bedrooms', 'bathrooms', 'minArea', 'maxArea', 'parking', 'hasPrivateBathroom'];
    currentParams.forEach(param => {
      if (searchParams.get(param)) {
        params.set(param, searchParams.get(param)!);
      }
    });

    // Obtener path actual
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    
    // Intentar obtener el tipo seleccionado del SearchBar desde localStorage
    let currentType = pathParts[pathParts.length - 2]; // Por defecto, el de la URL
    
    // Si hay un tipo guardado en localStorage (del SearchBar), usar ese
    const savedType = localStorage.getItem('selectedPropertyType');
    if (savedType) {
      currentType = savedType;
    }
    
    let currentDistrict = pathParts[pathParts.length - 1];
    
    // Si hay una ubicación seleccionada, actualizar el distrito
    if (filters.location?.mainText) {
      currentDistrict = toSlug(filters.location.mainText);
    }
    
    // Solo agregar parámetros que tienen valores
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    if (filters.bathrooms) params.set('bathrooms', filters.bathrooms);
    if (filters.minArea) params.set('minArea', filters.minArea);
    if (filters.maxArea) params.set('maxArea', filters.maxArea);
    if (filters.parking) params.set('parking', filters.parking);
    if (filters.hasPrivateBathroom !== undefined) params.set('hasPrivateBathroom', filters.hasPrivateBathroom.toString());
    if (filters.minLand) params.set('minLand', filters.minLand);
    if (filters.maxLand) params.set('maxLand', filters.maxLand);
    if (filters.minFrontis) params.set('minFrontis', filters.minFrontis);
    if (filters.maxFrontis) params.set('maxFrontis', filters.maxFrontis);
    
    // Construir URL con los filtros - MANTENER EL TIPO DE PROPIEDAD SELECCIONADO
    const baseUrl = `/alquiler/${currentType}/${currentDistrict}`;
    
    // Verificar si hay filtros activos
    const hasActiveFilters = Boolean(
      filters.minPrice ||
      filters.maxPrice ||
      filters.bedrooms ||
      filters.bathrooms ||
      filters.minArea ||
      filters.maxArea ||
      filters.parking ||
      filters.hasPrivateBathroom !== undefined ||
      filters.minLand ||
      filters.maxLand ||
      filters.minFrontis ||
      filters.maxFrontis ||
      filters.location
    );

    if (hasActiveFilters) {
      params.set('filtered', '1');
      const qs = params.toString();
      window.location.href = `${baseUrl}?${qs}`; // Forzar recarga completa
    } else {
      // Si no hay filtros, ir a la URL limpia - PERO MANTENER EL TIPO DE PROPIEDAD
      window.location.href = baseUrl; // Forzar recarga completa
    }
  };

  return (
    <UrbaniaFilters
      initialFilters={initialFilters}
      onFilterChange={handleFilterChange}
      propertyType={propertyType}
    />
  );
}
