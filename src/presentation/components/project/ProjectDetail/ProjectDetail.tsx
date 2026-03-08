'use client';

import Image from 'next/image';
import { Project } from '@/core/domain/entities/Project';
import { FeatureProjectButton } from './FeatureProjectButton';
import { useAuthStore } from '@/presentation/store/authStore';

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const { user } = useAuthStore();
  
  // Debug: Verificar qué contiene coverImageUrl
  console.log('🖼️ ProjectDetail - coverImageUrl:', project.coverImageUrl);
  console.log('🖼️ ProjectDetail - project completo:', project);
  
  // Asegurar que la URL sea absoluta
  const coverImageUrl = project.coverImageUrl 
    ? (project.coverImageUrl.startsWith('http') 
        ? project.coverImageUrl 
        : `https://wasyn-properties-images.s3.us-east-1.amazonaws.com/${project.coverImageUrl}`)
    : null;
  
  console.log('🖼️ coverImageUrl procesada:', coverImageUrl);
  
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-screen bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
        {/* Imagen de portada */}
        {coverImageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={coverImageUrl}
              alt={project.name}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                console.error('❌ Error cargando imagen:', e);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-teal-600" />
        )}

        {/* Contenido del hero */}
        <div className="relative z-10 h-full flex items-center justify-center text-white">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              {project.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-6 max-w-3xl mx-auto">
              {project.description}
            </p>
            
            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
                {project.phase}
              </span>
              <span className="px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-semibold">
                {project.type}
              </span>
              {project.isFeatured && (
                <span className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-semibold">
                  ⭐ Destacado
                </span>
              )}
            </div>

            {/* Información clave */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {project.priceFrom && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-gray-300 text-sm">Desde</p>
                  <p className="text-2xl font-bold">
                    S/. {project.priceFrom.toLocaleString()}
                  </p>
                </div>
              )}
              
              {project.totalUnits && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-gray-300 text-sm">Unidades</p>
                  <p className="text-2xl font-bold">
                    {project.totalUnits}
                  </p>
                </div>
              )}
              
              {project.district && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-gray-300 text-sm">Ubicación</p>
                  <p className="text-xl font-bold">
                    {project.district}, {project.province}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7v-13" />
            </svg>
          </div>
        </div>
      </section>

      {/* Resto del contenido del proyecto */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Descripción completa */}
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Descripción del Proyecto</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Características */}
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Características</h2>
              <div className="grid grid-cols-2 gap-4">
                {project.priceFrom && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Precio desde</p>
                    <p className="text-xl font-semibold">
                      S/. {project.priceFrom.toLocaleString()}
                    </p>
                  </div>
                )}
                {project.priceTo && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Precio hasta</p>
                    <p className="text-xl font-semibold">
                      S/. {project.priceTo.toLocaleString()}
                    </p>
                  </div>
                )}
                {project.totalUnits && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Unidades totales</p>
                    <p className="text-xl font-semibold">{project.totalUnits}</p>
                  </div>
                )}
                {project.availableUnits && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Unidades disponibles</p>
                    <p className="text-xl font-semibold">{project.availableUnits}</p>
                  </div>
                )}
                {project.soldUnits && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Unidades vendidas</p>
                    <p className="text-xl font-semibold">{project.soldUnits}</p>
                  </div>
                )}
                {project.estimatedDelivery && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Entrega estimada</p>
                    <p className="text-xl font-semibold">
                      {new Date(project.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Botón de destacar proyecto */}
            <FeatureProjectButton
              projectId={project.id}
              developerId={user?.id || 0}
              isFeatured={project.isFeatured}
              status={project.status}
            />

            {/* Información de contacto */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Información de Contacto</h3>
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Contactar Desarrollador
              </button>
            </div>

            {/* Ubicación */}
            {project.district && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Ubicación</h3>
                <p className="text-gray-600">
                  {project.district}, {project.province}, {project.region}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
