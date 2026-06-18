import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { ProjectFull } from '@/core/domain/entities/Project';
import Script from 'next/script';
import Image from 'next/image';  
import ProjectDetail from '@/presentation/components/project/ProjectDetail/ProjectDetail';  

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
};

const projectRepo = new ProjectRepository();

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const project = await projectRepo.getBySlug(slug);
    
    return {
      title: `${project.name} | Proyecto Inmobiliario ${project.district} | TIYUY`,
      description: project.description.slice(0, 160),
      keywords: `${project.name}, proyecto inmobiliario, ${project.district}, ${project.phase.toLowerCase()}, ${project.type.toLowerCase()}`,
      alternates: {
        canonical: `https://tiyuy.com/projects/${project.slug}`,
      },
      openGraph: {
        title: `${project.name} - ${project.district}`,
        description: project.description,
        url: `https://tiyuy.com/projects/${project.slug}`,
        images: [project.coverImageUrl || ''],
        type: 'website',
        siteName: 'TIYUY',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${project.name}`,
        description: project.description,
        images: [project.coverImageUrl || ''],
      },
    };
  } catch {
    return {
      title: 'Proyecto no encontrado | TIYUY',
    };
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    const projectFull = await projectRepo.getBySlug(slug) as ProjectFull;
    
    if (!projectFull) notFound();

    // JSON-LD para SEO
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ApartmentComplex',
      name: projectFull.name,
      description: projectFull.description,
      image: projectFull.coverImageUrl,
      address: {
        '@type': 'PostalAddress',
        addressLocality: projectFull.district,
        addressRegion: projectFull.province,
        addressCountry: 'PE',
      },
      numberOfAvailableUnits: projectFull.availableUnits,
      numberOfRooms: projectFull.totalUnits,
    };

    return (
      <>
        <Script
          id="project-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <ProjectDetail project={projectFull} />
      </>
    );
  } catch (error) {
    console.error('Error cargando proyecto:', error);
    notFound();
  }
}
