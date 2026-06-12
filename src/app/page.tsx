'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Footer } from '@/presentation/components/layout/Footer/Footer';
import { FeaturedProperties } from '@/presentation/components/property/FeaturedProperties/FeaturedProperties';
import { FeaturedProjects } from '@/presentation/components/project/FeaturedProjects/FeaturedProjects';
import { FilteredProperties } from '@/presentation/components/property/FilteredProperties/FilteredProperties';
import { LocationSearch } from '@/presentation/components/forms/LocationSearch/LocationSearch';
import { FeaturedCampaigns } from '@/presentation/components/marketing/FeaturedCampaigns';
import { usePublicBanners } from '@/presentation/hooks/usePublicBanners';

// Fallback images si no hay banners configurados en admin
const FALLBACK_HERO_IMAGES = [
  '/assets/images/hero/hero-1.jpg',
  '/assets/images/hero/hero-2.jpg',
  '/assets/images/hero/hero-3.jpg',
  '/assets/images/hero/hero-4.jpg',
];

/**
 * Intercala imágenes de banners entre las imágenes estáticas del carrusel.
 * Ejemplo: [estática1, banner1, estática2, banner2, estática3, estática4]
 */
function intercalateImages(staticImages: string[], bannerImages: string[]): string[] {
  const result: string[] = [];
  const maxBannersPerSlot = Math.max(1, Math.floor(staticImages.length / bannerImages.length));
  let bannerIndex = 0;
  let bannerCountInSlot = 0;

  for (let i = 0; i < staticImages.length; i++) {
    result.push(staticImages[i]);
    // Insertar un banner después de cada imagen estática (si hay banners disponibles)
    if (bannerIndex < bannerImages.length) {
      bannerCountInSlot++;
      if (bannerCountInSlot >= maxBannersPerSlot || i === staticImages.length - 1) {
        result.push(bannerImages[bannerIndex]);
        bannerIndex++;
        bannerCountInSlot = 0;
      }
    }
  }

  // Si sobran banners, agregarlos al final
  while (bannerIndex < bannerImages.length) {
    result.push(bannerImages[bannerIndex]);
    bannerIndex++;
  }

  return result;
}

export default function HomePage() {
  // Cargar banners públicos con displayMode INTEGRATED para mezclar con imágenes estáticas
  const { data: sliderBanners = [] } = usePublicBanners('SLIDER');
  const { data: mainBanners = [] } = usePublicBanners('HOME_MAIN');
  const { data: homeBanners = [] } = usePublicBanners('HOME_BANNER');
  
  // Unir todos los banners encontrados
  const allBanners = [...sliderBanners, ...mainBanners, ...homeBanners];
  
  // Separar banners INTEGRATED (se mezclan con el carrusel) de SOLO_BANNER (no se muestran en carrusel)
  const integratedBanners = allBanners.filter(b => b.displayMode === 'INTEGRATED' || !b.displayMode);
  
  // Mezclar banners integrados con imágenes estáticas: intercalar
  const heroImages = integratedBanners.length > 0
    ? intercalateImages(FALLBACK_HERO_IMAGES, integratedBanners.map(b => b.imageUrl))
    : FALLBACK_HERO_IMAGES;

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
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

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
          { value: 'departamentos', label: 'Residencial' },
          { value: 'locales', label: 'Comercial' },
          { value: 'mixto', label: 'Mixto' },
          { value: 'industrial', label: 'Industrial' },
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
    
    if (activeTab !== 'projects') {
      if ((selectedPropertyType === 'departamentos' || selectedPropertyType === 'casas') && selectedBedrooms) {
        params.append('bedrooms', selectedBedrooms);
      }
      
      if (selectedPropertyType === 'habitaciones' && selectedBathrooms) {
        params.append('bathrooms', selectedBathrooms);
      }
      
      if (['oficinas', 'terrenos', 'lotes', 'locales'].includes(selectedPropertyType) && selectedMinArea) {
        params.append('minArea', selectedMinArea);
      }
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    // Guardar búsqueda para recomendaciones
    if (activeTab !== 'projects') {
      localStorage.setItem('lastSearch', JSON.stringify({
        transactionType: activeTab === 'rent' ? 'rent' : 'sale',
        type: selectedPropertyType,
        district: selectedLocation || '',
        bedrooms: selectedBedrooms || '',
        bathrooms: selectedBathrooms || '',
        minArea: selectedMinArea || '',
      }));
    }
    
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[540px] overflow-hidden">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full px-8 xl:px-16">
            <div className="max-w-[1920px] mx-auto flex justify-center items-center">
              <div className="max-w-[800px] w-full text-center">
                <h1 className="text-5xl xl:text-6xl font-bold text-white mb-8 drop-shadow-lg">
                  Encuentra tu hogar
                </h1>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200/80">
                  <div className="border-b border-gray-200 rounded-t-2xl bg-white overflow-hidden">
                    <div className="flex">
                      <button
                        onClick={() => handleTabClick('rent')}
                        className={`flex-1 py-4 text-base font-semibold transition-colors bg-white ${
                          activeTab === 'rent'
                            ? 'text-brand border-b-2 border-brand'
                            : 'text-gray-500 hover:text-brand hover:bg-gray-50/50'
                        }`}
                      >
                        Alquilar
                      </button>
                      <button
                        onClick={() => handleTabClick('sale')}
                        className={`flex-1 py-4 text-base font-semibold transition-colors bg-white ${
                          activeTab === 'sale'
                            ? 'text-brand border-b-2 border-brand'
                            : 'text-gray-500 hover:text-brand hover:bg-gray-50/50'
                        }`}
                      >
                        Comprar
                      </button>
                      <button
                        onClick={() => handleTabClick('projects')}
                        className={`flex-1 py-4 text-base font-semibold transition-colors bg-white ${
                          activeTab === 'projects'
                            ? 'text-brand border-b-2 border-brand'
                            : 'text-gray-500 hover:text-brand hover:bg-gray-50/50'
                        }`}
                      >
                        Proyectos
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-b-2xl">
                    <div className="flex flex-col lg:flex-row gap-3 relative">
                      <select 
                        value={selectedPropertyType}
                        onChange={(e) => setSelectedPropertyType(e.target.value)}
                        className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-gray-700 bg-white w-full lg:w-[180px]"
                      >
                        {getPropertyTypes().map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>

                      {activeTab !== 'projects' && (selectedPropertyType === 'departamentos' || selectedPropertyType === 'casas') ? (
                        <select 
                          value={selectedBedrooms}
                          onChange={(e) => setSelectedBedrooms(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-gray-700 bg-white w-full lg:w-[140px]"
                        >
                          <option value="">Habitaciones</option>
                          <option value="1">1 habitación</option>
                          <option value="2">2 habitaciones</option>
                          <option value="3">3 habitaciones</option>
                          <option value="4">4 habitaciones</option>
                          <option value="5">5+ habitaciones</option>
                        </select>
                      ) : activeTab !== 'projects' && selectedPropertyType === 'habitaciones' ? (
                        <select 
                          value={selectedBathrooms}
                          onChange={(e) => setSelectedBathrooms(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-gray-700 bg-white w-full lg:w-[140px]"
                        >
                          <option value="">Baños</option>
                          <option value="propio">Propio</option>
                          <option value="compartido">Compartido</option>
                        </select>
                      ) : activeTab !== 'projects' && ['oficinas', 'terrenos', 'locales', 'lotes'].includes(selectedPropertyType) ? (
                        <input
                          type="number"
                          placeholder="Área mínima (m²)"
                          value={selectedMinArea}
                          onChange={(e) => setSelectedMinArea(e.target.value)}
                          className="px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-gray-700 bg-white w-full lg:w-[140px]"
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
                href="/projects/departamentos/lima"
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
                <div className="flex flex-col h-full bg-white rounded-xl p-10 shadow-sm border border-gray-200 hover:border-brand/30 group-hover:scale-[1.02] transition-all duration-300">
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
                <div className="flex flex-col h-full bg-white rounded-xl p-10 shadow-sm border border-gray-200 hover:border-brand/30 group-hover:scale-[1.02] transition-all duration-300">
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
                <div className="flex flex-col h-full bg-white rounded-xl p-10 shadow-sm border border-gray-200 hover:border-brand/30 group-hover:scale-[1.02] transition-all duration-300">
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
                <div className="flex flex-col h-full bg-white rounded-xl p-10 shadow-sm border border-gray-200 hover:border-brand/30 group-hover:scale-[1.02] transition-all duration-300">
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

      {/* PROPIEDADES DESTACADAS / RECOMENDACIONES */}
      <section className="py-10 bg-background border-b border-gray-100">
        <div className="w-full max-w-[1920px] mx-auto">
          <FeaturedProperties />
        </div>
      </section>

      {/* DEPARTAMENTOS EN ALQUILER */}
      <section className="py-10 bg-background border-b border-gray-100">
        <div className="w-full max-w-[1920px] mx-auto">
          <FilteredProperties 
            title="Departamentos para alquilar" 
            viewAllLink="/rent/departamentos/lima" 
            filter={{ type: 'APARTMENT', transactionType: 'RENT' }} 
          />
        </div>
      </section>

      {/* CASAS EN VENTA */}
      <section className="py-10 bg-background border-b border-gray-100">
        <div className="w-full max-w-[1920px] mx-auto">
          <FilteredProperties 
            title="Casas disponibles para compra" 
            viewAllLink="/sale/casas/lima" 
            filter={{ type: 'HOUSE', transactionType: 'SALE' }} 
          />
        </div>
      </section>

      {/* PROYECTOS INMOBILIARIOS */}
      <section className="py-10 bg-background border-b border-gray-100">
        <div className="w-full max-w-[1920px] mx-auto">
          <FeaturedProjects />
        </div>
      </section>

      {/* OFICINAS Y LOCALES */}
      <section className="py-10 bg-background border-b border-gray-100">
        <div className="w-full max-w-[1920px] mx-auto">
          <FilteredProperties 
            title="Espacios para tu negocio" 
            viewAllLink="/sale/oficinas/lima" 
            filter={{ type: 'COMMERCIAL' }} 
          />
        </div>
      </section>

      {/* TERRENOS */}
      <section className="py-10 bg-background">
        <div className="w-full max-w-[1920px] mx-auto">
          <FilteredProperties 
            title="Terrenos y lotes de inversión" 
            viewAllLink="/sale/terrenos/lima" 
            filter={{ type: 'LAND' }} 
          />
        </div>
      </section>

      {/* CAMPAÑAS DE MARKETING DESTACADAS */}
      <FeaturedCampaigns />

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
