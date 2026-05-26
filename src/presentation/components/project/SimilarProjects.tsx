'use client';

import { useState, useEffect } from 'react';
import { Project, ProjectSummary } from '@/core/domain/entities/Project';
import { ProjectCard } from './ProjectCard/ProjectCard';

interface SimilarProjectsProps {
  currentProject: Project;
  maxItems?: number;
}

interface SimilarProjectsResponse {
  projects: ProjectSummary[];
  totalResults: number;
  locationLevel: string;
  projectType: string;
}

export function SimilarProjects({ currentProject, maxItems = 6 }: SimilarProjectsProps) {
  const [data, setData] = useState<SimilarProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Calcular filtros de precio similar (+/- 30%) y area similar (+/- 30%)
        const params = new URLSearchParams();
        params.set('maxResults', String(maxItems));
        
        if (currentProject.priceFrom) {
          params.set('minPrice', String(Number(currentProject.priceFrom) * 0.7));
          params.set('maxPrice', String(Number(currentProject.priceTo || currentProject.priceFrom) * 1.3));
        }
        if (currentProject.areaFrom) {
          params.set('minArea', String(Number(currentProject.areaFrom) * 0.7));
          params.set('maxArea', String(Number(currentProject.areaTo || currentProject.areaFrom) * 1.3));
        }
        
        // Usar el nuevo endpoint con algoritmo progresivo
        const res = await fetch(`/api/projects/${currentProject.id}/similar?${params.toString()}`);
        if (res.ok) {
          const json: SimilarProjectsResponse = await res.json();
          setData(json);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSimilar();
  }, [currentProject.id, maxItems, currentProject.priceFrom, currentProject.priceTo, currentProject.areaFrom, currentProject.areaTo]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Proyectos similares en {currentProject.district || 'la zona'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: Math.min(maxItems, 6) }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3" />
              <div className="space-y-2 p-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Proyectos similares
        </h3>
        <p className="text-gray-500 text-sm text-center py-8">
          No tenemos recomendaciones disponibles en este momento.
        </p>
      </div>
    );
  }

  if (!data || data.projects.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Proyectos similares
        </h3>
        <p className="text-gray-500 text-sm text-center py-8">
          No tenemos recomendaciones disponibles.
        </p>
      </div>
    );
  }

  // Determinar el titulo segun el nivel de ubicacion alcanzado
  const locationLabel = data.locationLevel !== 'nacional'
    ? `en ${data.locationLevel}`
    : 'en todo el país';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4">
        Proyectos similares {locationLabel}
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        {data.totalResults} proyecto{data.totalResults !== 1 ? 's' : ''} encontrado{data.totalResults !== 1 ? 's' : ''}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  );
}
