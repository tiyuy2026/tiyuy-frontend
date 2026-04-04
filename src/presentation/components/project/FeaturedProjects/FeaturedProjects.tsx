'use client';

import { FeaturedItems } from '@/presentation/components/shared/FeaturedItems/FeaturedItems';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import { Project } from '@/core/domain/entities/Project';

// Wrapper component to adapt props from FeaturedItems format to ProjectCard format
const ProjectCardWrapper = ({ item }: { item: Project }) => (
  <ProjectCard project={item} />
);

export function FeaturedProjects() {
  const projectRepo = new ProjectRepository();

  return (
    <FeaturedItems
      repository={projectRepo}
      ItemCard={ProjectCardWrapper}
      itemName="proyectos"
      emptyMessage="No hay proyectos destacados disponibles"
      emptyIcon="🏢"
      emptyAction={{
        text: "Crear Proyecto",
        href: "/my-projects/new",
        icon: "🏢"
      }}
    />
  );
}
