'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react'; // <-- Importamos Iconify para limpiar los SVGs viejos
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
  const router = useRouter();
  const pathname = usePathname();

  // Slider automático del Hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Control e hidratación segura de rutas e historial (Previene errores de servidor en Next.js)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer;
      const currentPath = window.location.pathname;
      
      if (currentPath.includes('/rent/') || referrer.includes('/rent/')) {
        setActiveTab('rent');
      } else if (currentPath.includes('/sale/') || referrer.includes('/sale/')) {
        setActiveTab('sale');
      } else if (currentPath.includes('/projects') || referrer.includes('/projects')) {
        setActiveTab('projects');
      }

      const savedTab = localStorage.getItem('selectedTab');
      if (savedTab && ['rent', 'sale', 'projects'].includes(savedTab)) {
        setActiveTab(savedTab as 'rent' | 'sale' | 'projects');
      }
    }
  }, [pathname]);

  const getPropertyTypes = (tab = activeTab) => {
    switch (tab) {
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

  const handleTabClick = (tab: 'rent' | 'sale' | 'projects') => {
    setActiveTab(tab);
    
    // Auto-ajuste para evitar tipos de propiedad huérfanos entre pestañas
    const availableTypes = getPropertyTypes(tab);
    if (!availableTypes.some(t => t.value === selectedPropertyType)) {
      setSelectedPropertyType(availableTypes[0].value);
    }

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
    
    const params = new URLSearchParams();
    
    if ((selectedPropertyType === 'departamentos' || selectedPropertyType === 'casas') && selectedBedrooms) {
      params.append('bedrooms', selectedBedrooms);
    }
    
    if (selectedPropertyType === 'habitaciones' && selectedBathrooms) {
      params.append('bathrooms', selectedBathrooms);
    }
    
    if (['oficinas', 'terrenos', 'lotes', 'locales'].includes(selectedPropertyType) && selectedMinArea) {
      params.append('minArea', selectedMinArea);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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

                <div className="bg-background rounded-2xl shadow-2xl overflow-visible border border-gray-200/50">
                  <div className="border-b border-gray-200 rounded-t-2xl">
                    <div className="flex rounded-t-2xl">
                      <button
                        onClick={() => handleTabClick('rent')}
                        className={`flex-1 py-4 text-base font-semibold transition-colors rounded-tl-2xl ${
                          activeTab === 'rent'
                            ? 'text-brand bg-background border-b-2 border-brand'
                            : 'text-foreground/70 hover:text-brand'
                        }`}
                      >
                        Alquilar
                      </button>
                      <button
                        onClick={() => handleTabClick('sale')}
                        className={`flex-1 py-4 text-base font-semibold transition-colors ${
                          activeTab === 'sale'
                            ? 'text-brand bg-background border-b-2 border-brand'
                            : 'text-foreground/70 hover:text-brand'
                        }`}
                      >
                        Comprar
                      </button>
                      <button
                        onClick={() => handleTabClick('projects')}
                        className={`flex-1 py-4 text-base font-semibold transition-colors rounded-tr-2xl ${
                          activeTab === 'projects'
                            ? 'text-brand bg-background border-b-2 border-brand'
                            : 'text-foreground/70 hover:text-brand'
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
                        className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-foreground/80 bg-background w-full lg:w-[180px]"
                      >
                        {getPropertyTypes().map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>

                      {(selectedPropertyType === 'departamentos' || selectedPropertyType === 'casas') ? (
                        <select 
                          value={selectedBedrooms}
                          onChange={(e) => setSelectedBedrooms(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-foreground/80 bg-background w-full lg:w-[140px]"
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
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-foreground/80 bg-background w-full lg:w-[140px]"
                        >
                          <option value="">Baños</option>
                          <option value="propio">Propio</option>
                          <option value="compartido">Compartido</option>
                        </select>
                      ) : ['oficinas', 'terrenos', 'locales', 'lotes'].includes(selectedPropertyType) ? (
                        <input
                          type="number"
                          placeholder="Área mínima (m²)"
                          value={selectedMinArea}
                          onChange={(e) => setSelectedMinArea(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-foreground/80 bg-background w-full lg:w-[140px]"
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
                        className="bg-brand text-white px-10 py-3.5 rounded-xl font-bold text-base hover:bg-brand-hover transition-colors whitespace-nowrap w-full lg:w-[180px] shadow-md hover:shadow-lg cursor-pointer"
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

      {/* TABS DE NAVEGACIÓN RÁPIDA */}
      <section className="border-b border-gray-200 bg-background">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="flex gap-8">
              <Link
                href="/rent/departamentos/lima"
                className="py-4 text-base font-semibold text-foreground/70 hover:text-brand hover:border-b-4 hover:border-brand transition-all"
              >
                Alquilar
              </Link>
              <Link
                href="/sale/departamentos/lima"
                className="py-4 text-base font-semibold text-brand border-b-4 border-brand hover:text-brand"
              >
                Comprar
              </Link>
              <Link
                href="/my-properties/new"
                className="py-4 text-base font-medium text-foreground/70 hover:text-brand hover:border-b-4 hover:border-brand transition-all"
              >
                Publicar
              </Link>
              <Link
                href="/#projects"
                className="py-4 text-base font-medium text-foreground/70 hover:text-brand hover:border-b-4 hover:border-brand transition-all"
              >
                Proyectos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50/50 border-b border-gray-100">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              <Link href="/blog" className="block group h-full">
                <div className="flex flex-col h-full bg-background rounded-xl p-10 shadow-sm border-2 border-gray-200/60 hover:border-brand group-hover:scale-[1.02] transition-all duration-300">
                  <div className="flex-grow">
                    <div className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-light-hover transition-colors">
                      <Icon icon="material-symbols:article-outline" className="w-7 h-7 text-brand" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-brand transition-colors">Nuestro blog</h3>
                    <p className="text-foreground/70 text-base leading-relaxed mb-4">
                      Consejos, novedades y noticias del ámbito de la construcción.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-brand font-semibold text-sm">
                    <span>Ver blog completo</span>
                    <Icon icon="material-symbols:arrow-forward-ios-rounded" className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Card Guía */}
              <Link href="/rental-guide" className="block group h-full">
                <div className="flex flex-col h-full bg-background rounded-xl p-10 shadow-sm border-2 border-gray-200/60 hover:border-brand group-hover:scale-[1.02] transition-all duration-300">
                  <div className="flex-grow">
                    <div className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-light-hover transition-colors">
                      <Icon icon="material-symbols:assignment-outline" className="w-7 h-7 text-brand" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-brand transition-colors">Guía para alquilar</h3>
                    <p className="text-foreground/70 text-base leading-relaxed mb-4">
                      Lo que necesitas saber a la hora de alquilar en un solo lugar.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-brand font-semibold text-sm">
                    <span>Ver guía completa</span>
                    <Icon icon="material-symbols:arrow-forward-ios-rounded" className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Card Proyectos */}
              <Link href="/projects" className="block group h-full">
                <div className="flex flex-col h-full bg-background rounded-xl p-10 shadow-sm border-2 border-gray-200/60 hover:border-brand group-hover:scale-[1.02] transition-all duration-300">
                  <div className="flex-grow">
                    <div className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-light-hover transition-colors">
                      <Icon icon="material-symbols:apartment" className="w-7 h-7 text-brand" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-brand transition-colors">Proyectos Inmobiliarios</h3>
                    <p className="text-foreground/70 text-base leading-relaxed mb-4">
                      Descubre los mejores proyectos de vivienda y inversión de las principales inmobiliarias.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-brand font-semibold text-sm">
                    <span>Ver proyectos</span>
                    <Icon icon="material-symbols:arrow-forward-ios-rounded" className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Card Conoce TIYUY */}
              <Link href="/about-tiyuy" className="block group h-full">
                <div className="flex flex-col h-full bg-background rounded-xl p-10 shadow-sm border-2 border-gray-200/60 hover:border-brand group-hover:scale-[1.02] transition-all duration-300">
                  <div className="flex-grow">
                    <div className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-light-hover transition-colors">
                      <Icon icon="material-symbols:info-outline" className="w-7 h-7 text-brand" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-brand transition-colors">Conoce TIYUY</h3>
                    <p className="text-foreground/70 text-base leading-relaxed mb-4">
                      Toda la información sobre cómo usar nuestro portal ¡y mucho más!
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-brand font-semibold text-sm">
                    <span>Conocer más</span>
                    <Icon icon="material-symbols:arrow-forward-ios-rounded" className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROPIEDADES DESTACADAS */}
      <section className="py-20 bg-background">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-brand-light text-brand px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-brand/10">
                <span>⭐</span>
                <span>PROPIEDADES DESTACADAS</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-foreground mb-4">
                Encuentra el hogar de tus
                <span className="text-brand"> sueños</span>
              </h2>
              <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
                Descubre las mejores propiedades en todo el Perú, seleccionadas cuidadosamente para ofrecerte calidad y confianza.
              </p>
            </div>
            
            <FeaturedProperties />
          </div>
        </div>
      </section>

      {/* PROYECTOS INMOBILIARIOS */}
      <section className="py-20 bg-background border-t border-gray-100">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-brand-light text-brand px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-brand/10">
                <span>🏗️</span>
                <span>PROYECTOS INMOBILIARIOS</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-foreground mb-4">
                Proyectos
                <span className="text-brand"> cerca de ti</span>
              </h2>
              <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
                Descubre los mejores proyectos de vivienda e inversión de las principales inmobiliarias del Perú.
              </p>
            </div>
            
            <FeaturedProjects />
          </div>
        </div>
      </section>

      <section className="py-12 bg-background border-t border-gray-200/60">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Búsquedas populares en Perú
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
              <Link href="/rent/departamentos/lima" className="text-brand hover:underline text-base font-medium">
                Departamentos en Lima
              </Link>
              <Link href="/rent/casas/arequipa" className="text-brand hover:underline text-base font-medium">
                Casas en Arequipa
              </Link>
              <Link href="/rent/departamentos/cusco" className="text-brand hover:underline text-base font-medium">
                Departamentos en Cusco
              </Link>
              <Link href="/sale/casas/trujillo" className="text-brand hover:underline text-base font-medium">
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