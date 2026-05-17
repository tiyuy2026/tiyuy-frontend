'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Footer } from '@/presentation/components/layout/Footer/Footer';
import { FeaturedProperties } from '@/presentation/components/property/FeaturedProperties/FeaturedProperties';
import { FeaturedProjects } from '@/presentation/components/project/FeaturedProjects/FeaturedProjects';
import { LocationSearch } from '@/presentation/components/forms/LocationSearch/LocationSearch';

const HERO_IMAGES = [
  '/assets/images/hero/hero-1.jpg',
  '/assets/images/hero/hero-2.jpg',
  '/assets/images/hero/hero-3.jpg',
  '/assets/images/hero/hero-4.jpg',
];

export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'rent' | 'sale' | 'projects'>('sale');
  const [selectedPropertyType, setSelectedPropertyType] = useState('departamentos');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState('');
  const [selectedBathrooms, setSelectedBathrooms] = useState('');
  const [selectedMinArea, setSelectedMinArea] = useState('');
  const [selectedMaxArea, setSelectedMaxArea] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Detectar si venimos de páginas de alquiler o venta
    const referrer = document.referrer;
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/rent/') || referrer.includes('/rent/')) {
      setActiveTab('rent');
    } else if (currentPath.includes('/sale/') || referrer.includes('/sale/')) {
      setActiveTab('sale');
    } else if (currentPath.includes('/projects') || referrer.includes('/projects')) {
      setActiveTab('projects');
    }

    // También detectar desde localStorage si hay un estado guardado
    const savedTab = localStorage.getItem('selectedTab');
    if (savedTab && ['rent', 'sale', 'projects'].includes(savedTab)) {
      setActiveTab(savedTab as 'rent' | 'sale' | 'projects');
    }
  }, [pathname]);

  const handleTabClick = (tab: 'rent' | 'sale' | 'projects') => {
    setActiveTab(tab);
    localStorage.setItem('selectedTab', tab);
    sessionStorage.setItem('lastActiveTab', tab);
  };

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location.mainText);
  };

  const handleSearch = () => {
    const baseUrl = activeTab === 'rent' ? '/rent' : activeTab === 'sale' ? '/sale' : '/projects';
    const location = selectedLocation || 'lima';
    let url = `${baseUrl}/${selectedPropertyType}/${location}`;
    
    // Agregar parámetros según el tipo de propiedad
    const params = new URLSearchParams();
    
    if ((selectedPropertyType === 'departamentos' || selectedPropertyType === 'casas') && selectedBedrooms) {
      params.append('bedrooms', selectedBedrooms);
    }
    
    if (selectedPropertyType === 'habitaciones' && selectedBathrooms) {
      params.append('bathrooms', selectedBathrooms);
    }
    
    // Para oficinas, terrenos/lotes (igual) y locales - solo área mínima
    if ((selectedPropertyType === 'oficinas' || selectedPropertyType === 'terrenos' || selectedPropertyType === 'lotes' || selectedPropertyType === 'locales') && selectedMinArea) {
      params.append('minArea', selectedMinArea);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    router.push(url);
  };

  const getPropertyTypes = () => {
    switch (activeTab) {
      case 'projects':
        return [
          { value: 'departamentos', label: 'Departamentos' },
          { value: 'casas', label: 'Casas' },
          { value: 'oficinas', label: 'Oficinas' },
          { value: 'locales', label: 'Locales Comerciales' },
          { value: 'lotes', label: 'Lotes' },
        ];
      default:
        return [
          { value: 'departamentos', label: 'Departamentos' },
          { value: 'casas', label: 'Casas' },
          { value: 'habitaciones', label: 'Habitaciones' },
          { value: 'terrenos', label: 'Terrenos' },
          { value: 'oficinas', label: 'Oficinas' },
          { value: 'locales', label: 'Local Comercial' }
        ];
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[540px] overflow-hidden">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full px-8 xl:px-16">
            <div className="max-w-[1920px] mx-auto flex justify-center items-center">
              <div className="max-w-[800px] w-full text-center">
                <h1 className="text-5xl xl:text-6xl font-bold text-white mb-8 drop-shadow-lg">
                  Encuentra tu hogar
                </h1>

                <div className="bg-white rounded-2xl shadow-2xl overflow-visible">
                  <div className="border-b border-gray-200 rounded-t-2xl">
                    <div className="flex rounded-t-2xl">
                      <button
                        onClick={() => handleTabClick('rent')}
                        className={`flex-1 py-4 text-base font-semibold transition-colors ${
                          activeTab === 'rent'
                            ? 'text-[#4A9A3E] bg-white border-b-2 border-[#4A9A3E]'
                            : 'text-gray-600 hover:text-[#4A9A3E]'
                        }`}
                      >
                        Alquilar
                      </button>
                      <button
                        onClick={() => handleTabClick('sale')}
                        className={`flex-1 py-4 text-base font-semibold transition-colors ${
                          activeTab === 'sale'
                            ? 'text-[#4A9A3E] bg-white border-b-2 border-[#4A9A3E]'
                            : 'text-gray-600 hover:text-[#4A9A3E]'
                        }`}
                      >
                        Comprar
                      </button>
                      <button
                        onClick={() => handleTabClick('projects')}
                        className={`flex-1 py-4 text-base font-semibold transition-colors ${
                          activeTab === 'projects'
                            ? 'text-[#4A9A3E] bg-white border-b-2 border-[#4A9A3E]'
                            : 'text-gray-600 hover:text-[#4A9A3E]'
                        }`}
                      >
                        Proyectos
                      </button>
                    </div>
                  </div>

                  <div className="p-6 overflow-visible">
                    <div className="flex flex-col lg:flex-row gap-3 relative">
                      <select 
                        value={selectedPropertyType}
                        onChange={(e) => setSelectedPropertyType(e.target.value)}
                        className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-[#4A9A3E] focus:ring-2 focus:ring-[#4A9A3E] focus:outline-none text-base text-gray-500 bg-white w-full lg:w-[180px]"
                      >
                        {getPropertyTypes().map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>

                      {/* Filtros específicos según tipo de propiedad */}
                      {(selectedPropertyType === 'departamentos' || selectedPropertyType === 'casas') ? (
                        <select 
                          value={selectedBedrooms}
                          onChange={(e) => setSelectedBedrooms(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-[#4A9A3E] focus:ring-2 focus:ring-[#4A9A3E] focus:outline-none text-base text-gray-500 bg-white w-full lg:w-[140px]"
                        >
                          <option value="">Habitaciones</option>
                          <option value="1">1 habitación</option>
                          <option value="2">2 habitaciones</option>
                          <option value="3">3 habitaciones</option>
                          <option value="4">4 habitaciones</option>
                          <option value="5">5+ habitaciones</option>
                        </select>
                      ) : selectedPropertyType === 'habitaciones' ? (
                        <select 
                          value={selectedBathrooms}
                          onChange={(e) => setSelectedBathrooms(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-[#4A9A3E] focus:ring-2 focus:ring-[#4A9A3E] focus:outline-none text-base text-gray-500 bg-white w-full lg:w-[140px]"
                        >
                          <option value="">Baños</option>
                          <option value="propio">Propio</option>
                          <option value="compartido">Compartido</option>
                        </select>
                      ) : selectedPropertyType === 'oficinas' ? (
                        <input
                          type="number"
                          placeholder="Área mínima (m²)"
                          value={selectedMinArea}
                          onChange={(e) => setSelectedMinArea(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-[#4A9A3E] focus:ring-2 focus:ring-[#4A9A3E] focus:outline-none text-base text-gray-500 bg-white w-full lg:w-[140px]"
                        />
                      ) : selectedPropertyType === 'terrenos' ? (
                        <input
                          type="number"
                          placeholder="Área mínima (m²)"
                          value={selectedMinArea}
                          onChange={(e) => setSelectedMinArea(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-[#4A9A3E] focus:ring-2 focus:ring-[#4A9A3E] focus:outline-none text-base text-gray-500 bg-white w-full lg:w-[140px]"
                        />
                      ) : selectedPropertyType === 'locales' ? (
                        <input
                          type="number"
                          placeholder="Área mínima (m²)"
                          value={selectedMinArea}
                          onChange={(e) => setSelectedMinArea(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-[#4A9A3E] focus:ring-2 focus:ring-[#4A9A3E] focus:outline-none text-base text-gray-500 bg-white w-full lg:w-[140px]"
                        />
                      ) : selectedPropertyType === 'lotes' ? (
                        <input
                          type="number"
                          placeholder="Área mínima (m²)"
                          value={selectedMinArea}
                          onChange={(e) => setSelectedMinArea(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-[#4A9A3E] focus:ring-2 focus:ring-[#4A9A3E] focus:outline-none text-base text-gray-500 bg-white w-full lg:w-[140px]"
                        />
                      ) : null}

                      <div className="flex-1 relative">
                        <LocationSearch
                          onLocationSelect={handleLocationSelect}
                          placeholder="Ingresa ubicaciones o características (ej: piscina)"
                          className="w-full"
                        />
                      </div>

                      <button
                        onClick={handleSearch}
                        className="bg-[#4A9A3E] text-white px-10 py-3.5 rounded-xl font-bold text-base hover:bg-[#4A9A3E] transition-colors whitespace-nowrap w-full lg:w-[180px] shadow-md hover:shadow-lg cursor-pointer"
                      >
                        Buscar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="border-b border-gray-200 bg-white">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="flex gap-8">
              <Link
                href="/rent/departamentos/lima"
                className="py-4 text-base font-semibold text-gray-600 hover:text-[#4A9A3E] hover:border-b-4 hover:border-[#4A9A3E]"
              >
                Alquilar
              </Link>
              <Link
                href="/sale/departamentos/lima"
                className="py-4 text-base font-semibold text-[#4A9A3E] border-b-4 border-[#4A9A3E] hover:text-[#4A9A3E]"
              >
                Comprar
              </Link>
              <Link
                href="/my-properties/new"
                className="py-4 text-base font-medium text-gray-600 hover:text-[#4A9A3E] hover:border-b-4 hover:border-[#4A9A3E]"
              >
                Publicar
              </Link>
              <Link
                href="/#projects"
                className="py-4 text-base font-medium text-gray-600 hover:text-[#4A9A3E] hover:border-b-4 hover:border-[#4A9A3E]"
              >
                Proyectos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CARDS */}
      <section className="py-16 bg-gray-50">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Link href="/blog" className="block group h-full">
                <div className="flex flex-col h-full bg-white rounded-xl p-10 shadow-sm hover:shadow-lg transition-all border-2 border-transparent border-[#4A9A3E] group-hover:scale-105">
                  <div className="flex-grow">
                    <div className="w-14 h-14 bg-[#4A9A3E]/10 rounded-xl flex items-center justify-center mb-5 bg-[#4A9A3E]/20 transition-colors">
                      <svg className="w-7 h-7 text-[#4A9A3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-[#4A9A3E] transition-colors">Nuestro blog</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                      Consejos, novedades y noticias del ámbito de la construcción.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[#4A9A3E] font-semibold text-sm ">
                    <span>Ver blog completo</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link href="/rental-guide" className="block group h-full">
                <div className="flex flex-col h-full bg-white rounded-xl p-10 shadow-sm hover:shadow-lg transition-all border-2 border-transparent border-[#4A9A3E] group-hover:scale-105">
                  <div className="flex-grow">
                    <div className="w-14 h-14 bg-[#4A9A3E]/10 rounded-xl flex items-center justify-center mb-5 bg-[#4A9A3E]/20 transition-colors">
                      <svg className="w-7 h-7 text-[#4A9A3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-[#4A9A3E] transition-colors">Guía para alquilar</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                      Lo que necesitas saber a la hora de alquilar en un solo lugar.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[#4A9A3E] font-semibold text-sm ">
                    <span>Ver guía completa</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link href="/projects" className="block group h-full">
                <div className="flex flex-col h-full bg-white rounded-xl p-10 shadow-sm hover:shadow-lg transition-all border-2 border-transparent border-[#4A9A3E] group-hover:scale-105">
                  <div className="flex-grow">
                    <div className="w-14 h-14 bg-[#4A9A3E]/10 rounded-xl flex items-center justify-center mb-5 bg-[#4A9A3E]/20 transition-colors">
                      <svg className="w-7 h-7 text-[#4A9A3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-[#4A9A3E] transition-colors">Proyectos Inmobiliarios</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                      Descubre los mejores proyectos de vivienda y inversión de las principales inmobiliarias.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[#4A9A3E] font-semibold text-sm">
                    <span>Ver proyectos</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link href="/about-tiyuy" className="block group h-full">
                <div className="flex flex-col h-full bg-white rounded-xl p-10 shadow-sm hover:shadow-lg transition-all border-2 border-transparent border-[#4A9A3E] group-hover:scale-105">
                  <div className="flex-grow">
                    <div className="w-14 h-14 bg-[#4A9A3E]/10 rounded-xl flex items-center justify-center mb-5 bg-[#4A9A3E]/20 transition-colors">
                      <svg className="w-7 h-7 text-[#4A9A3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-[#4A9A3E] transition-colors">Conoce TIYUY</h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                      Toda la información sobre cómo usar nuestro portal ¡y mucho más!
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[#4A9A3E] font-semibold text-sm ">
                    <span>Conocer más</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROPIEDADES */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#4A9A3E]/10 text-[#4A9A3E] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span>⭐</span>
                <span>PROPIEDADES DESTACADAS</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                Encuentra el hogar de tus
                <span className="text-[#4A9A3E]"> sueños</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Descubre las mejores propiedades en todo el Perú, seleccionadas cuidadosamente para ofrecerte calidad y confianza
              </p>
            </div>
            
            <FeaturedProperties />
          </div>
        </div>
      </section>

      {/* PROYECTOS INMOBILIARIOS */}
      <section className="py-20 bg-gradient-to-br from-[#4A9A3E]/5 to-white">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#4A9A3E]/10 text-[#4A9A3E] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span>🏗️</span>
                <span>PROYECTOS INMOBILIARIOS</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                Proyectos
                <span className="text-[#4A9A3E]"> cerca de ti</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Descubre los mejores proyectos de vivienda e inversión de las principales inmobiliarias del Perú
              </p>
            </div>
            
            <FeaturedProjects />
          </div>
        </div>
      </section>

      {/* BÚSQUEDAS */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Búsquedas populares en Perú
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
              <Link href="/rent/departamentos/lima" className="text-[#4A9A3E] hover:underline text-base font-medium">
                Departamentos en Lima
              </Link>
              <Link href="/rent/casas/arequipa" className="text-[#4A9A3E] hover:underline text-base font-medium">
                Casas en Arequipa
              </Link>
              <Link href="/rent/departamentos/cusco" className="text-[#4A9A3E] hover:underline text-base font-medium">
                Departamentos en Cusco
              </Link>
              <Link href="/sale/casas/trujillo" className="text-[#4A9A3E] hover:underline text-base font-medium">
                Casas en Trujillo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
