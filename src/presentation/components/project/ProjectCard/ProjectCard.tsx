import Link from 'next/link';
import Image from 'next/image';
import { Clock, AlertCircle } from 'lucide-react';
import { Project } from '@/core/domain/entities/Project';  // Import del dominio

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatPrice = (price: number) => `Desde S/ ${price.toLocaleString()}`;
  
  // Intentar con coverImageUrl primero (campo directo), luego con images array
  const coverImage = (project as any).coverImageUrl || project.images?.[0] || null;


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
    <Link href={`/projects/${project.slug}`} className="group">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200 w-full h-full flex flex-col">
        {/* Imagen */}
        <div className="relative w-full h-64 bg-gray-200 overflow-hidden flex-shrink-0">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={project.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
              priority={project.isFeatured}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4z" /></svg>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            {project.isFeatured && (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                DESTACADO
              </span>
            )}
            {project.isVerified && (
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ✓ VERIFICADO
              </span>
            )}
          </div>

          {/* Lifecycle status badge */}
          {renderLifecycleBadge()}
        </div>

        {/* Contenido */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Tipo de operación */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
              {project.phase === 'PRE_SALE' ? 'Preventa' : 
               project.phase === 'SALE' ? 'En venta' : 'Entrega'}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
              {project.type === 'RESIDENTIAL' ? 'Residencial' : 'Comercial'}
            </span>
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
            {project.name}
          </h3>

          {/* Ubicación */}
          <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span className="font-medium">{project.district}</span>
            <span className="text-gray-400">•</span>
            <span>{project.province}</span>
          </p>

          {/* Características */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Unidades disponibles</span>
              <span className="font-bold text-lg">
                {project.availableUnits}/{project.totalUnits}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Precio desde</span>
              <span className="font-bold text-2xl text-blue-600">
                {formatPrice(project.priceFrom)}
              </span>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              <span>{project.viewsCount} vistas</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              <span>{project.contactsCount} contactos</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
