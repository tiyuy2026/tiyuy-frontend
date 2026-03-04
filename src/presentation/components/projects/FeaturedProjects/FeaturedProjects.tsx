'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Project {
  id: number;
  name: string;
  developer: string;
  location: string;
  type: 'residencial' | 'comercial' | 'mixto';
  status: 'en-construccion' | 'entrega-inmediata' | 'preventa';
  priceFrom: number;
  currency: string;
  image: string;
  featured: boolean;
  description: string;
  units: number;
  deliveryDate: string;
}

const PROJECT_TYPE_LABELS = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  mixto: 'Mixto'
};

const STATUS_LABELS = {
  'en-construccion': 'En Construcción',
  'entrega-inmediata': 'Entrega Inmediata',
  'preventa': 'Preventa'
};

const STATUS_COLORS = {
  'en-construccion': 'bg-orange-100 text-orange-700',
  'entrega-inmediata': 'bg-green-100 text-green-700',
  'preventa': 'bg-blue-100 text-blue-700'
};

export function FeaturedProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Aquí se cargarán los proyectos desde tu base de datos
        // Por ahora, simulamos que no hay proyectos
        console.log('Cargando proyectos desde la base de datos...');
        
        // Simulación de carga (reemplazar con llamada real a tu API)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Cuando tengas la API, reemplaza esto con:
        // const result = await projectRepository.getFeaturedProjects(0, 8);
        // setProjects(result.projects || []);
        
        setProjects([]); // Temporal: sin proyectos
        
      } catch (error) {
        console.error('Error loading projects:', error);
        setError('No se pudieron cargar los proyectos');
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Refrescar proyectos cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const refreshProjects = async () => {
        try {
          console.log('Refrescando proyectos...');
          // Aquí iría tu llamada real a la API
          // const result = await projectRepository.getFeaturedProjects(0, 8);
          // if (result.projects && result.projects.length > 0) {
          //   setProjects(result.projects);
          // }
        } catch (error) {
          console.error('Error refreshing projects:', error);
        }
      };
      
      refreshProjects();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? 'US$' : 'S/';
    return `${symbol} ${price.toLocaleString('es-PE')}`;
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="text-right text-sm text-gray-500 mb-4">
          Cargando proyectos...
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4 min-w-max">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[380px] flex-shrink-0">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded-full w-20" />
                      <div className="h-4 bg-gray-300 rounded-full w-24" />
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 bg-gray-300 rounded w-full" />
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <div className="h-6 bg-gray-300 rounded w-28" />
                      <div className="h-4 bg-gray-300 rounded w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="text-center py-20 bg-gradient-to-br from-red-50 to-orange-100 rounded-2xl">
          <div className="text-8xl mb-6">⚠️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Error al cargar proyectos
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <span>Reintentar</span>
            <span>🔄</span>
          </button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center py-20 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl">
          <div className="text-8xl mb-6">🏗️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Próximamente proyectos inmobiliarios
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            Estamos trabajando para traerte los mejores proyectos de vivienda e inversión del Perú
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Scroll indicator */}
      <div className="text-right text-sm text-gray-500 mb-4">
        Desliza horizontalmente →
      </div>
      
      {/* Flechas de navegación */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 hover:bg-white transition-all duration-200"
        aria-label="Scroll izquierda"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200 hover:bg-white transition-all duration-200"
        aria-label="Scroll derecha"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Horizontal scroll container */}
      <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 pb-4 min-w-max">
          {projects.map((project) => (
            <div key={project.id} className="w-[380px] flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-purple-200">
                {/* Imagen */}
                <Link href={`/proyecto/${project.id}`} className="relative block">
                  <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
                        priority={project.featured}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200">
                        <span className="text-gray-400 text-6xl">🏗️</span>
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2 z-10">
                      {project.featured && (
                        <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          ⭐ DESTACADO
                        </span>
                      )}
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ${STATUS_COLORS[project.status]}`}>
                        {STATUS_LABELS[project.status]}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Contenido */}
                <div className="p-6">
                  {/* Tipo y Desarrollador */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      {PROJECT_TYPE_LABELS[project.type]}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {project.units} unidades
                    </span>
                  </div>

                  {/* Nombre */}
                  <Link href={`/proyecto/${project.id}`}>
                    <h3 className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors mb-2 leading-tight">
                      {project.name}
                    </h3>
                  </Link>

                  {/* Desarrollador y Ubicación */}
                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">{project.developer}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                    <span className="text-purple-500">📍</span>
                    <span>{project.location}</span>
                  </p>

                  {/* Entrega */}
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <span className="text-purple-500">📅</span>
                    <span className="font-medium">Entrega:</span>
                    <span>{project.deliveryDate}</span>
                  </div>

                  {/* Precio */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-sm text-gray-500">Desde</span>
                      <span className="text-2xl font-bold text-purple-600 ml-2">
                        {formatPrice(project.priceFrom, project.currency)}
                      </span>
                    </div>
                    <Link 
                      href={`/proyecto/${project.id}`}
                      className="inline-flex items-center gap-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                      <span>Ver más</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
