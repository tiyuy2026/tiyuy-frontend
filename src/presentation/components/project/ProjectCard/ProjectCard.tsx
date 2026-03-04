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
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2">
        <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50">
          {project.coverImageUrl ? (
            <Image
              src={project.coverImageUrl}
              alt={project.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">🏗️</span>
            </div>
          )}
          
          {project.isFeatured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              ⭐ DESTACADO
            </div>
          )}
          
          {project.isVerified && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              Verificado
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {project.phase === 'PRE_SALE' ? 'Preventa' : 
               project.phase === 'SALE' ? 'En venta' : 'Entrega'}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {project.type === 'RESIDENTIAL' ? 'Residencial' : 'Comercial'}
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            📍 {project.district}, {project.province}
          </p>

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

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              👁️ {project.viewsCount} vistas
            </div>
            <div className="text-sm text-gray-500">
              💬 {project.contactsCount} contactos
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
