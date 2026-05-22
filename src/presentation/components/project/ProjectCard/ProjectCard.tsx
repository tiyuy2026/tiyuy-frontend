import Link from 'next/link';
import Image from 'next/image';
import { Clock, AlertCircle } from 'lucide-react';
import { Project } from '@/core/domain/entities/Project';  // Import del dominio

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatPrice = (price: number) => `Desde S/ ${price.toLocaleString()}`;
  
  // SIMPLE: Usar la primera imagen del array como portada
  const coverImage = project.images?.[0] || null;

  // Helper to render lifecycle status badge
  const renderLifecycleBadge = () => {
    const lifecycleStatus = project.lifecycleStatus;
    const remainingDays = project.remainingGraceDays;

    if (lifecycleStatus === 'GRACE_PERIOD' && remainingDays !== undefined && remainingDays > 0) {
      return (
        <div className="absolute bottom-3 left-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Plan vencido - {remainingDays} dias para renovar</span>
        </div>
      );
    }

    if (lifecycleStatus === 'PENDING_DELETION' || lifecycleStatus === 'DELETED') {
      return (
        <div className="absolute bottom-3 left-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Proyecto eliminado</span>
        </div>
      );
    }

    if (project.status === 'PAUSED') {
      return (
        <div className="absolute bottom-3 left-3 right-3 bg-gray-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Inactivo - requiere renovacion</span>
        </div>
      );
    }

    return null;
  };

  return (
    <Link href={`/projects/${project.slug}`} className="group flex flex-col w-full h-full cursor-pointer">
      {/* Imagen */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={project.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
            priority={project.isFeatured}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z" /></svg>
          </div>
        )}

        {/* Overlay gradient para contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent opacity-60" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {project.isFeatured && (
            <div className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              Destacado
            </div>
          )}
          {project.isVerified && (
            <div className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
              ✓ Verificado
            </div>
          )}
        </div>

        {/* Lifecycle status badge */}
        {renderLifecycleBadge()}
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-[15px] font-semibold text-gray-900 line-clamp-1">
            {project.name}
          </h3>
        </div>

        <p className="text-[14px] text-gray-500 line-clamp-1 mt-0.5">
          {project.type === 'RESIDENTIAL' ? 'Proyecto Residencial' : 'Proyecto Comercial'} en {project.district}
        </p>

        <p className="text-[14px] text-gray-500 truncate mt-0.5">
          {project.phase === 'PRE_SALE' ? 'Preventa' : project.phase === 'SALE' ? 'En venta' : 'Entrega'}
          {' · '}
          {project.availableUnits} unidades
        </p>

        <div className="mt-1.5 flex items-center gap-1">
          <span className="text-[15px] text-gray-900">Desde</span>
          <span className="text-[15px] font-semibold text-gray-900">
            S/ {project.priceFrom.toLocaleString('es-PE')}
          </span>
        </div>
      </div>
    </Link>
  );
}
