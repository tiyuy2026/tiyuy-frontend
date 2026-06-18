import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { ProjectFull, ProjectUnit } from '@/core/domain/entities/Project';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
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
    if (!project) throw new Error('Project not found');
    const fullProject = await projectRepo.getProjectFull(project.id);
    
    return {
      title: `${fullProject.name} | Proyecto Inmobiliario ${fullProject.district} | TIYUY`,
      description: fullProject.description.slice(0, 160),
      keywords: `${fullProject.name}, proyecto inmobiliario, ${fullProject.district}, ${fullProject.phase.toLowerCase()}, ${fullProject.type.toLowerCase()}`,
      alternates: {
        canonical: `https://tiyuy.com/projects/detail/${fullProject.slug}`,
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
  } catch {
    return {
      title: 'Proyecto no encontrado | TIYUY',
      description: 'El proyecto que buscas no está disponible.',
    };
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await projectRepo.getBySlug(slug);

  if (!project) {
    return <PlanRequiredPage />;
  }

  let fullProject: ProjectFull;
  try {
    fullProject = await projectRepo.getProjectFull(project.id);
  } catch {
    return <PlanRequiredPage />;
  }

  // Get project units to calculate bedroom information
  let bedroomRange = 'Variable bedrooms';
  try {
    const unitsResponse = await projectRepo.getProjectUnits(fullProject!.id);
    const bedroomCounts = unitsResponse.content
      .map((unit: ProjectUnit) => unit.bedrooms)
      .filter((count: number | undefined): count is number => count !== undefined);
    
    if (bedroomCounts.length > 0) {
      bedroomRange = bedroomCounts.length === 1 
        ? `${bedroomCounts[0]} bedrooms`
        : `${Math.min(...bedroomCounts)}-${Math.max(...bedroomCounts)} bedrooms`;
    }
  } catch {
    // Silently handle units fetch failure
  }

  // Estructura de datos para SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: fullProject!.name,
    description: fullProject!.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: fullProject!.district,
      addressRegion: 'Lima',
      addressCountry: 'PE',
    },
    numberOfRooms: bedroomRange,
    floorSize: `${fullProject!.areaFrom || fullProject!.areaTo || 'Variable'} m²`,
    image: fullProject!.images || [],
    offers: {
      '@type': 'Offer',
      price: fullProject!.priceFrom,
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
      
      <ProjectDetail project={fullProject!} />
    </>
  );
}

function PlanRequiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Plan Empresa requerido</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Este proyecto solo está disponible con el plan <strong>Empresa</strong>. Para verlo, necesitas contratar o renovar tu suscripción.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/plans"
            className="w-full py-3 bg-[#00a63e] text-white font-semibold rounded-xl hover:bg-[#009135] transition-colors text-center block"
          >
            Ver Planes
          </Link>
          <Link
            href="/my-projects"
            className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-center block"
          >
            Ir a Mis Proyectos
          </Link>
        </div>
      </div>
    </div>
  );
}
