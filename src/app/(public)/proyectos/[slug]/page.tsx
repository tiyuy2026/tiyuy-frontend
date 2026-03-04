import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import Script from 'next/script';
import Image from 'next/image';  // ✅ Agregado
import ProjectDetail from '@/presentation/components/project/ProjectDetail/ProjectDetail';  // ✅ Componente correcto
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute/ProtectedRoute'; 

type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const projectRepo = new ProjectRepository();

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const project = await projectRepo.getBySlug(params.slug);
    
    return {
      title: `${project.name} | Proyecto Inmobiliario ${project.district} | TIYUY`,
      description: project.description.slice(0, 160),
      keywords: `${project.name}, proyecto inmobiliario, ${project.district}, ${project.phase.toLowerCase()}, ${project.type.toLowerCase()}`,
      alternates: {
        canonical: `https://tiyuy.com/proyectos/${project.slug}`,
      },
      openGraph: {
        title: `${project.name} - ${project.district}`,
        description: project.description,
        url: `https://tiyuy.com/proyectos/${project.slug}`,
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
  const project = await projectRepo.getBySlug(params.slug);

  if (!project) notFound();

  // JSON-LD para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: project.name,
    description: project.description,
    image: project.coverImageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: project.district,
      addressRegion: project.province,
      addressCountry: 'PE',
    },
    numberOfAvailableUnits: project.availableUnits,
    numberOfRooms: project.totalUnits,
  };

  return (
    <>
      <Script
        id="project-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProtectedRoute>  {/* ✅ JSX válido */}
        <ProjectDetail project={project} />  {/* ✅ Componente dedicado */}
      </ProtectedRoute>
    </>
  );
}
