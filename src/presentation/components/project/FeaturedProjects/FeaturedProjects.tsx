'use client';

import { FeaturedItems } from '@/presentation/components/shared/FeaturedItems/FeaturedItems';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import { ProjectSummary } from '@/core/domain/entities/Project';

// Wrapper component to adapt props from FeaturedItems format to ProjectCard format
const ProjectCardWrapper = ({ item }: { item: ProjectSummary }) => (
  <ProjectCard project={item} />
);

export function FeaturedProjects() {
  const projectRepo = new ProjectRepository();

  return (
    <FeaturedItems
      repository={projectRepo}
      ItemCard={ProjectCardWrapper}
      itemName="proyecto"
      emptyMessage="No tenemos recomendaciones disponibles"
      emptyIcon="🏢"
      emptyAction={{
        text: "Crear Proyecto",
        href: "/my-projects/new",
        icon: "🏢"
      }}
    />
  );
}
