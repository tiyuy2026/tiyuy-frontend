'use client';

import { Metadata } from 'next';
import { useState, useEffect } from 'react';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { ProjectCard } from '@/presentation/components/project/ProjectCard/ProjectCard';
import { FeaturedProjects } from '@/presentation/components/project/FeaturedProjects/FeaturedProjects';
import { Project } from '@/core/domain/entities/Project';

export default function ProjectsPage() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const projectRepo = new ProjectRepository();

  useEffect(() => {
    const loadAllProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Cargar todos los proyectos publicados
        const result = await projectRepo.searchProjects({
          page: 0,
          size: 50
        });
        
        setAllProjects(result.content || []);
        console.log('✅ Todos los proyectos cargados:', result.content?.length || 0);
        
      } catch (error) {
        console.error('❌ Error loading all projects:', error);
        setError('No se pudieron cargar los proyectos');
        setAllProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllProjects();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sección de Proyectos Destacados */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span>🏗️</span>
                <span>PROYECTOS DESTACADOS</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                Proyectos
                <span className="text-purple-600"> cerca de ti</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Descubre los mejores proyectos de vivienda e inversión de las principales inmobiliarias del Perú
              </p>
            </div>
            
            <FeaturedProjects />
          </div>
        </div>
      </section>

      {/* Todos los Proyectos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Todos los Proyectos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explora nuestro catálogo completo de proyectos inmobiliarios en todo el Perú
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 bg-gray-300 rounded w-1/2" />
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-300 rounded w-20" />
                      <div className="h-6 bg-gray-300 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-2xl">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Error al cargar proyectos
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : allProjects.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No hay proyectos disponibles
              </h3>
              <p className="text-gray-600 mb-6">
                Pronto tendremos nuevos proyectos inmobiliarios para ti
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
