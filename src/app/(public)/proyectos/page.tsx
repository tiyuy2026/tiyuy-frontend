import { Metadata } from 'next';
import { SearchProjects } from '@/core/domain/use-cases/project/SearchProjects';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { ProjectCard } from '@/presentation/components/project/ProjectCard/ProjectCard';
import { FeaturedProjects } from '@/presentation/components/project/FeaturedProjects/FeaturedProjects';
import { useEffect, useState } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Proyectos Inmobiliarios en Lima | TIYUY',
    description: 'Encuentra los mejores proyectos de obra nueva en Lima. Departamentos, casas y oficinas en preventa.',
    keywords: 'proyectos inmobiliarios, obra nueva, Lima, preventa, departamentos',
    openGraph: {
      title: 'Proyectos Inmobiliarios | TIYUY',
      description: 'Los mejores proyectos de obra nueva en Lima',
      type: 'website',
    },
  };
}

const result = await searchProjects.execute(filters);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sección de Proyectos Destacados */}
      <FeaturedProjects />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Todos los Proyectos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra los mejores proyectos de obra nueva en Lima y provincia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {result.content.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </main>
  );
}
