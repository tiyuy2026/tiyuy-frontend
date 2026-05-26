'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { ProjectCard } from '@/presentation/components/project/ProjectCard/ProjectCard';
import { ProjectSummary } from '@/core/domain/entities/Project';

export default function ProjectsFilterPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const projectRepo = new ProjectRepository();

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtener filtros de la URL
        const type = searchParams.get('type') || '';
        const location = searchParams.get('location') || '';
        const minArea = searchParams.get('minArea');
        
        // Construir filtros para la búsqueda
        const filters: any = {
          page: 0,
          size: 50
        };
        
        if (type) filters.type = type;
        if (location) filters.location = location;
        if (minArea) filters.minArea = parseInt(minArea);
        
        // Cargar proyectos con filtros
        const result = await projectRepo.searchProjects(filters);
        setProjects(result.content || []);
        
      } catch (err) {
        console.error('Error cargando proyectos:', err);
        setError('No se pudieron cargar los proyectos');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Proyectos Inmobiliarios
          </h1>
          <p className="text-gray-600">
            Descubre los mejores proyectos de vivienda e inversión
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando proyectos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="text-teal-600 hover:text-teal-700 underline"
            >
              Reintentar
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No se encontraron proyectos con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
