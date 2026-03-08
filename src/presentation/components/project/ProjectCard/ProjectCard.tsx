import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@/core/domain/entities/Project';  // ✅ Import del dominio

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatPrice = (price: number) => `Desde S/ ${price.toLocaleString()}`;

  return (
    <Link href={`/proyectos/${project.slug}`} className="group">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200 w-full h-full flex flex-col">
        {/* Imagen */}
        <div className="relative w-full h-64 bg-gray-200 overflow-hidden flex-shrink-0">
          {project.coverImageUrl ? (
            <Image
              src={project.coverImageUrl}
              alt={project.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
              priority={project.isFeatured}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <span className="text-6xl">🏗️</span>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2 z-10">
            {project.isFeatured && (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ⭐ DESTACADO
              </span>
            )}
            {project.isVerified && (
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ✓ VERIFICADO
              </span>
            )}
          </div>
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
            <span className="text-red-500">📍</span>
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
              <span>👁️</span>
              <span>{project.viewsCount} vistas</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>💬</span>
              <span>{project.contactsCount} contactos</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
