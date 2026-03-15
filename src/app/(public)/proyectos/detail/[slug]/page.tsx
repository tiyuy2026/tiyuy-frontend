import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { ProjectFull, ProjectUnit } from '@/core/domain/entities/Project';
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
    const fullProject = await projectRepo.getProjectFull(project.id);
    
    return {
      title: `${fullProject.name} | Proyecto Inmobiliario ${fullProject.district} | TIYUY`,
      description: fullProject.description.slice(0, 160),
      keywords: `${fullProject.name}, proyecto inmobiliario, ${fullProject.district}, ${fullProject.phase.toLowerCase()}, ${fullProject.type.toLowerCase()}`,
      alternates: {
        canonical: `https://tiyuy.com/proyectos/detail/${fullProject.slug}`,
      },
      openGraph: {
        title: `${fullProject.name} | Proyecto Inmobiliario ${fullProject.district} | TIYUY`,
        description: fullProject.description.slice(0, 160),
        images: [
          {
            url: fullProject.images?.[0] || '/images/placeholder-project.jpg',
            width: 1200,
            height: 630,
            alt: fullProject.name,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${fullProject.name} | Proyecto Inmobiliario ${fullProject.district} | TIYUY`,
        description: fullProject.description.slice(0, 160),
        images: [fullProject.images?.[0] || '/images/placeholder-project.jpg'],
      },
    };
  } catch (error) {
    return {
      title: 'Proyecto no encontrado | TIYUY',
      description: 'El proyecto que buscas no está disponible.',
    };
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  try {
    const { slug } = await params;
    const project = await projectRepo.getBySlug(slug);
    const fullProject = await projectRepo.getProjectFull(project.id);

    // Get project units to calculate bedroom information
    let bedroomRange = 'Variable bedrooms';
    try {
      const unitsResponse = await projectRepo.getProjectUnits(fullProject.id);
      const bedroomCounts = unitsResponse.content
        .map((unit: ProjectUnit) => unit.bedrooms)
        .filter((count: number | undefined): count is number => count !== undefined);
      
      if (bedroomCounts.length > 0) {
        bedroomRange = bedroomCounts.length === 1 
          ? `${bedroomCounts[0]} bedrooms`
          : `${Math.min(...bedroomCounts)}-${Math.max(...bedroomCounts)} bedrooms`;
      }
    } catch (unitsError) {
      console.warn('Could not fetch project units:', unitsError);
    }

    // Estructura de datos para SEO
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Residence',
      name: fullProject.name,
      description: fullProject.description,
      address: {
        '@type': 'PostalAddress',
        addressLocality: fullProject.district,
        addressRegion: 'Lima',
        addressCountry: 'PE',
      },
      numberOfRooms: bedroomRange,
      floorSize: `${fullProject.areaFrom || fullProject.areaTo || 'Variable'} m²`,
      image: fullProject.images || [],
      offers: {
        '@type': 'Offer',
        price: fullProject.priceFrom,
        priceCurrency: 'PEN',
        availability: 'https://schema.org/InStock',
      },
    };

    return (
      <>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        <ProjectDetail project={fullProject} />
      </>
    );
  } catch (error) {
    console.error('Error loading project:', error);
    notFound();
  }
}
