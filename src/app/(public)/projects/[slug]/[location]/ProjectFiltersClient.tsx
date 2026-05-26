'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ProjectFilters } from '@/presentation/components/project/ProjectFilters/ProjectFilters';

interface ProjectFiltersClientProps {
  initialFilters: any;
  projectType: string;
}

export function ProjectFiltersClient({ initialFilters, projectType }: ProjectFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    
    // Mantener el tipo y ubicación actuales
    const pathname = window.location.pathname;
    const pathParts = pathname.split('/').filter(Boolean);
    const currentType = pathParts[1] || projectType;
    let currentLocation = pathParts[2] || 'lima';
    
    // Si hay una ubicación seleccionada, actualizar
    if (filters.location?.mainText) {
      currentLocation = toSlug(filters.location.mainText);
    }
    
    // Solo agregar parámetros que tienen valores
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.minArea) params.set('minArea', filters.minArea);
    if (filters.maxArea) params.set('maxArea', filters.maxArea);
    if (filters.phase) params.set('phase', filters.phase);
    if (filters.isFeatured !== undefined) params.set('isFeatured', filters.isFeatured.toString());
    if (filters.isVerified !== undefined) params.set('isVerified', filters.isVerified.toString());
    
    // Construir URL con los filtros
    const baseUrl = `/projects/${currentType}/${currentLocation}`;
    
    // Verificar si hay filtros activos
    const hasActiveFilters = Boolean(
      filters.minPrice ||
      filters.maxPrice ||
      filters.minArea ||
      filters.maxArea ||
      filters.phase ||
      filters.isFeatured !== undefined ||
      filters.isVerified !== undefined ||
      filters.location
    );

    if (hasActiveFilters) {
      params.set('filtered', '1');
      const qs = params.toString();
      window.location.href = `${baseUrl}?${qs}`;
    } else {
      window.location.href = baseUrl;
    }
  };
  
  return <ProjectFilters initialFilters={initialFilters} onFilterChange={handleFilterChange} projectType={projectType} />;
}
