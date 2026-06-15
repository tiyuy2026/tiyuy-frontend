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

const links = [
  { href: "/rent/departamentos/lima", label: "Alquilar" },
  { href: "/sale/departamentos/lima", label: "Comprar" },
  { href: "/my-properties/new", label: "Publicar" },
  { href: "/projects/departamentos/lima", label: "Proyectos" },
];
const quickLinks = [
  {
    href: "/blog",
    icon: "material-symbols:article-outline",
    title: "Nuestro blog",
    description: "Consejos, novedades y noticias del ámbito de la construcción.",
    actionText: "Ver blog completo",
  },
  {
    href: "/rental-guide",
    icon: "material-symbols:assignment-outline",
    title: "Guía para alquilar",
    description: "Lo que necesitas saber a la hora de alquilar en un solo lugar.",
    actionText: "Ver guía completa",
  },
  {
    href: "/projects",
    icon: "material-symbols:apartment",
    title: "Proyectos Inmobiliarios",
    description: "Descubre los mejores proyectos de vivienda y inversión de las principales inmobiliarias.",
    actionText: "Ver proyectos",
  },
  {
    href: "/about-tiyuy",
    icon: "material-symbols:info-outline",
    title: "Conoce TIYUY",
    description: "Toda la información sobre cómo usar nuestro portal ¡y mucho más!",
    actionText: "Conocer más",
  },
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
                      <div className="flex-1">
                        <select 
                          value={selectedPropertyType}
                          onChange={(e) => setSelectedPropertyType(e.target.value)}
                          className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-gray-700 bg-white"
                        >
                          {getPropertyTypes().map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {activeTab !== 'projects' && (selectedPropertyType === 'departamentos' || selectedPropertyType === 'casas') ? (
                        <div className="flex-1">
                          <select 
                            value={selectedBedrooms}
                            onChange={(e) => setSelectedBedrooms(e.target.value)}
                            className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-gray-700 bg-white"
                          >
                            <option value="">Habitaciones</option>
                            <option value="1">1 habitación</option>
                            <option value="2">2 habitaciones</option>
                            <option value="3">3 habitaciones</option>
                            <option value="4">4 habitaciones</option>
                            <option value="5">5+ habitaciones</option>
                          </select>
                        </div>
                      ) : activeTab !== 'projects' && selectedPropertyType === 'habitaciones' ? (
                        <div className="flex-1">
                          <select 
                            value={selectedBathrooms}
                            onChange={(e) => setSelectedBathrooms(e.target.value)}
                            className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-gray-700 bg-white"
                          >
                            <option value="">Baños</option>
                            <option value="propio">Propio</option>
                            <option value="compartido">Compartido</option>
                          </select>
                        </div>
                      ) : activeTab !== 'projects' && ['oficinas', 'terrenos', 'locales', 'lotes'].includes(selectedPropertyType) ? (
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Área mínima (m²)"
                            value={selectedMinArea}
                            onChange={(e) => setSelectedMinArea(e.target.value)}
                            className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none text-base text-gray-700 bg-white"
                          />
                        </div>
                      ) : null}

                      <div className="flex-[2]">
                        <LocationSearch
                          onLocationSelect={handleLocationSelect}
                          placeholder="Ingresa ubicaciones o características (ej: piscina)"
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

      <section className="bg-[var(--bg-primary)] border-b border-[var(--border-light)]">
        <div className="w-full px-4 sm:px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
              {links.map(({ href, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`py-4 text-sm sm:text-base font-semibold border-b-4 transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "text-[var(--brand-primary)] border-[var(--brand-primary)]"
                        : "text-[var(--text-secondary)] border-transparent hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[var(--bg-primary)] border-b border-[var(--border-light)]">
        <div className="w-full px-4 sm:px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {quickLinks.map(({ href, icon, title, description, actionText }) => (
                <Link key={href} href={href} className="block group h-full">
                  <div className="flex flex-col h-full bg-white rounded-xl p-6 sm:p-10 shadow-sm border border-gray-200 hover:border-brand/30 group-hover:scale-[1.02] transition-all duration-300">
                    <div className="flex-grow">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-light rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-light-hover transition-colors">
                        <Icon icon={icon} className="w-6 h-6 sm:w-7 sm:h-7 text-brand" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 group-hover:text-brand transition-colors">
                        {title}
                      </h3>
                      <p className="text-foreground/70 text-sm sm:text-base leading-relaxed mb-4">
                        {description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-brand font-semibold text-xs sm:text-sm pt-2">
                      <span>{actionText}</span>
                      <Icon icon="material-symbols:arrow-forward-ios-rounded" className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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
