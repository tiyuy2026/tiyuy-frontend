'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Footer } from '@/presentation/components/layout/Footer/Footer';
import { FeaturedProperties } from '@/presentation/components/property/FeaturedProperties/FeaturedProperties';
import { FeaturedProjects } from '@/presentation/components/projects/FeaturedProjects/FeaturedProjects';

const HERO_IMAGES = [
  '/assets/images/hero/hero-1.jpg',
  '/assets/images/hero/hero-2.jpg',
  '/assets/images/hero/hero-3.jpg',
  '/assets/images/hero/hero-4.jpg',
];

export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'alquiler' | 'venta' | 'proyectos'>('venta');
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
    
    if (currentPath.includes('/alquiler/') || referrer.includes('/alquiler/')) {
      setActiveTab('alquiler');
    } else if (currentPath.includes('/venta/') || referrer.includes('/venta/')) {
      setActiveTab('venta');
    } else if (currentPath.includes('/proyectos') || referrer.includes('/proyectos')) {
      setActiveTab('proyectos');
    }
    
    // También detectar desde localStorage si hay un estado guardado
    const savedTab = localStorage.getItem('selectedTab');
    if (savedTab && ['alquiler', 'venta', 'proyectos'].includes(savedTab)) {
      setActiveTab(savedTab as 'alquiler' | 'venta' | 'proyectos');
    }
  }, [pathname]);

  const handleTabClick = (tab: 'alquiler' | 'venta' | 'proyectos') => {
    setActiveTab(tab);
    localStorage.setItem('selectedTab', tab);
    sessionStorage.setItem('lastActiveTab', tab);
    
    // Navegar a la página correspondiente
    if (tab === 'alquiler') {
      window.location.href = '/alquiler/departamentos/lima';
    } else if (tab === 'venta') {
      window.location.href = '/venta/departamentos/lima';
    } else {
      window.location.href = '/proyectos';
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
            <div className="max-w-[1920px] mx-auto flex justify-center">
              <div className="max-w-[800px] w-full text-center">
                <h1 className="text-5xl xl:text-6xl font-bold text-white mb-8 drop-shadow-lg">
                  Encuentra tu hogar
                </h1>

                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                  <div className="flex border-b border-gray-200">
                    <button className="flex-1 py-4 text-base font-semibold text-gray-900 bg-white border-b-2 border-gray-900">
                      Alquilar
                    </button>
                    <button className="flex-1 py-4 text-base font-medium text-gray-600 hover:text-gray-900">
                      Comprar
                    </button>
                    <button className="flex-1 py-4 text-base font-medium text-gray-600 hover:text-gray-900">
                      Proyectos
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex gap-3">
                      <select className="px-5 py-3.5 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none text-base w-[210px]">
                        <option>Departamento</option>
                        <option>Casa</option>
                        <option>Terreno</option>
                        <option>Oficina</option>
                        <option>Local Comercial</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Ingresa ubicaciones o características (ej: piscina)"
                        className="flex-1 px-5 py-3.5 border border-gray-300 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none text-base"
                      />

                      <Link
                        href="/venta/departamentos/lima"
                        className="bg-teal-600 text-white px-10 py-3.5 rounded-lg font-bold text-base hover:bg-teal-700 transition-colors whitespace-nowrap"
                      >
                        Buscar
                      </Link>
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
                href="/alquiler/departamentos/lima" 
                className="py-4 text-base font-semibold text-gray-600 hover:text-orange-600 hover:border-b-4 hover:border-orange-600"
              >
                Alquilar
              </Link>
              <Link 
                href="/venta/departamentos/lima" 
                className="py-4 text-base font-semibold text-green-600 border-b-4 border-green-600 hover:text-green-700"
              >
                Comprar
              </Link>
              <Link 
                href="/dashboard/mis-propiedades/nueva" 
                className="py-4 text-base font-medium text-gray-600 hover:text-green-600 hover:border-b-4 hover:border-green-600"
              >
                Publicar
              </Link>
              <Link 
                href="/#proyectos" 
                className="py-4 text-base font-medium text-gray-600 hover:text-green-600 hover:border-b-4 hover:border-green-600"
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
              <Link href="/blog" className="block">
                <div className="bg-white rounded-xl p-10 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Nuestro blog</h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Consejos, novedades y noticias del ámbito de la construcción.
                  </p>
                </div>
              </Link>

              <div className="bg-white rounded-xl p-10 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Guía para alquilar</h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Lo que necesitas saber a la hora de alquilar en un solo lugar.
                </p>
              </div>

              <div className="bg-white rounded-xl p-10 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Proyectos Inmobiliarios</h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Descubre los mejores proyectos de vivienda y inversión de las principales inmobiliarias.
                </p>
              </div>

              <div className="bg-white rounded-xl p-10 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Conoce TIYUY</h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Toda la información sobre cómo usar nuestro portal ¡y mucho más!
                </p>
              </div>
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
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span>⭐</span>
                <span>PROPIEDADES DESTACADAS</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                Encuentra el hogar de tus
                <span className="text-blue-600"> sueños</span>
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
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span>🏗️</span>
                <span>PROYECTOS INMOBILIARIOS</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                Proyectos
                <span className="text-purple-600"> cerca de ti</span>
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
              <Link href="/alquiler/departamentos/lima" className="text-blue-600 hover:underline text-base">
                Departamentos en Lima
              </Link>
              <Link href="/alquiler/casas/arequipa" className="text-blue-600 hover:underline text-base">
                Casas en Arequipa
              </Link>
              <Link href="/alquiler/departamentos/cusco" className="text-blue-600 hover:underline text-base">
                Departamentos en Cusco
              </Link>
              <Link href="/venta/casas/trujillo" className="text-blue-600 hover:underline text-base">
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
