'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [activeTab, setActiveTab] = useState('principal');

  const cities = ['principal', 'lima', 'arequipa', 'trujillo', 'callao'];
  
  const cityContent = {
    principal: {
      venta: [
        { city: 'Lima', links: [
          { href: '/venta/casas/lima', text: 'Casas en venta en Lima' },
          { href: '/venta/departamentos/lima', text: 'Departamentos en venta en Lima' }
        ]},
        { city: 'Arequipa', links: [
          { href: '/venta/casas/arequipa', text: 'Casas en venta en Arequipa' },
          { href: '/venta/departamentos/arequipa', text: 'Departamentos en venta en Arequipa' }
        ]},
        { city: 'Trujillo', links: [
          { href: '/venta/casas/trujillo', text: 'Casas en venta en Trujillo' },
          { href: '/venta/departamentos/trujillo', text: 'Departamentos en venta en Trujillo' }
        ]},
        { city: 'Callao', links: [
          { href: '/venta/casas/callao', text: 'Casas en venta en Callao' },
          { href: '/venta/departamentos/callao', text: 'Departamentos en venta en Callao' }
        ]}
      ],
      alquiler: [
        { city: 'Lima', links: [
          { href: '/alquiler/casas/lima', text: 'Casas en alquiler en Lima' },
          { href: '/alquiler/departamentos/lima', text: 'Departamentos en alquiler en Lima' }
        ]},
        { city: 'Arequipa', links: [
          { href: '/alquiler/casas/arequipa', text: 'Casas en alquiler en Arequipa' },
          { href: '/alquiler/departamentos/arequipa', text: 'Departamentos en alquiler en Arequipa' }
        ]},
        { city: 'Trujillo', links: [
          { href: '/alquiler/casas/trujillo', text: 'Casas en alquiler en Trujillo' },
          { href: '/alquiler/departamentos/trujillo', text: 'Departamentos en alquiler en Trujillo' }
        ]},
        { city: 'Callao', links: [
          { href: '/alquiler/casas/callao', text: 'Casas en alquiler en Callao' },
          { href: '/alquiler/departamentos/callao', text: 'Departamentos en alquiler en Callao' }
        ]}
      ]
    },
    lima: {
      venta: [
        { city: 'Lima', links: [
          { href: '/venta/casas/lima', text: 'Casas en venta en Lima' },
          { href: '/venta/departamentos/lima', text: 'Departamentos en venta en Lima' },
          { href: '/venta/terrenos/lima', text: 'Terrenos en venta en Lima' },
          { href: '/venta/oficinas/lima', text: 'Oficinas en venta en Lima' }
        ]}
      ],
      alquiler: [
        { city: 'Lima', links: [
          { href: '/alquiler/casas/lima', text: 'Casas en alquiler en Lima' },
          { href: '/alquiler/departamentos/lima', text: 'Departamentos en alquiler en Lima' },
          { href: '/alquiler/habitaciones/lima', text: 'Habitaciones en alquiler en Lima' },
          { href: '/alquiler/locales/lima', text: 'Locales en alquiler en Lima' }
        ]}
      ]
    },
    arequipa: {
      venta: [
        { city: 'Arequipa', links: [
          { href: '/venta/casas/arequipa', text: 'Casas en venta en Arequipa' },
          { href: '/venta/departamentos/arequipa', text: 'Departamentos en venta en Arequipa' },
          { href: '/venta/terrenos/arequipa', text: 'Terrenos en venta en Arequipa' }
        ]}
      ],
      alquiler: [
        { city: 'Arequipa', links: [
          { href: '/alquiler/casas/arequipa', text: 'Casas en alquiler en Arequipa' },
          { href: '/alquiler/departamentos/arequipa', text: 'Departamentos en alquiler en Arequipa' },
          { href: '/alquiler/habitaciones/arequipa', text: 'Habitaciones en alquiler en Arequipa' }
        ]}
      ]
    },
    trujillo: {
      venta: [
        { city: 'Trujillo', links: [
          { href: '/venta/casas/trujillo', text: 'Casas en venta en Trujillo' },
          { href: '/venta/departamentos/trujillo', text: 'Departamentos en venta en Trujillo' },
          { href: '/venta/terrenos/trujillo', text: 'Terrenos en venta en Trujillo' }
        ]}
      ],
      alquiler: [
        { city: 'Trujillo', links: [
          { href: '/alquiler/casas/trujillo', text: 'Casas en alquiler en Trujillo' },
          { href: '/alquiler/departamentos/trujillo', text: 'Departamentos en alquiler en Trujillo' },
          { href: '/alquiler/habitaciones/trujillo', text: 'Habitaciones en alquiler en Trujillo' }
        ]}
      ]
    },
    callao: {
      venta: [
        { city: 'Callao', links: [
          { href: '/venta/casas/callao', text: 'Casas en venta en Callao' },
          { href: '/venta/departamentos/callao', text: 'Departamentos en venta en Callao' },
          { href: '/venta/terrenos/callao', text: 'Terrenos en venta en Callao' }
        ]}
      ],
      alquiler: [
        { city: 'Callao', links: [
          { href: '/alquiler/casas/callao', text: 'Casas en alquiler en Callao' },
          { href: '/alquiler/departamentos/callao', text: 'Departamentos en alquiler en Callao' },
          { href: '/alquiler/habitaciones/callao', text: 'Habitaciones en alquiler en Callao' }
        ]}
      ]
    }
  };

  const currentContent = cityContent[activeTab as keyof typeof cityContent];
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* DESTACADOS - CIUDADES PRINCIPALES */}
      <section className="py-12 border-b border-gray-200">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Destacados</h2>
            
            {/* TABS DE CIUDADES */}
            <div className="flex gap-6 mb-8 border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('principal')}
                className={`pb-3 text-base font-medium transition-colors ${
                  activeTab === 'principal' 
                    ? 'text-gray-900 border-b-2 border-teal-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Ciudades Principales
              </button>
              <button 
                onClick={() => setActiveTab('lima')}
                className={`pb-3 text-base font-medium transition-colors ${
                  activeTab === 'lima' 
                    ? 'text-gray-900 border-b-2 border-teal-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lima
              </button>
              <button 
                onClick={() => setActiveTab('arequipa')}
                className={`pb-3 text-base font-medium transition-colors ${
                  activeTab === 'arequipa' 
                    ? 'text-gray-900 border-b-2 border-teal-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Arequipa
              </button>
              <button 
                onClick={() => setActiveTab('trujillo')}
                className={`pb-3 text-base font-medium transition-colors ${
                  activeTab === 'trujillo' 
                    ? 'text-gray-900 border-b-2 border-teal-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Trujillo
              </button>
              <button 
                onClick={() => setActiveTab('callao')}
                className={`pb-3 text-base font-medium transition-colors ${
                  activeTab === 'callao' 
                    ? 'text-gray-900 border-b-2 border-teal-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Callao
              </button>
            </div>

            {/* GRID DE LINKS POR CIUDAD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* VENTA */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Venta</h3>
                <div className="grid grid-cols-2 gap-6">
                  {currentContent.venta.map((cityData, index) => (
                    <div key={index}>
                      <h4 className="font-bold text-gray-900 text-sm mb-2">{cityData.city}</h4>
                      <ul className="space-y-1 text-sm">
                        {cityData.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            <Link href={link.href} className="text-gray-600 hover:text-teal-600 transition-colors">
                              {link.text}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* ALQUILER */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Alquiler</h3>
                <div className="grid grid-cols-2 gap-6">
                  {currentContent.alquiler.map((cityData, index) => (
                    <div key={index}>
                      <h4 className="font-bold text-gray-900 text-sm mb-2">{cityData.city}</h4>
                      <ul className="space-y-1 text-sm">
                        {cityData.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            <Link href={link.href} className="text-gray-600 hover:text-teal-600 transition-colors">
                              {link.text}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BÚSQUEDAS POPULARES */}
      <section className="py-12 bg-gray-50">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Busca entre más de 57,000 avisos de inmuebles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* BÚSQUEDAS POPULARES */}
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-4">Búsquedas populares</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/alquiler/departamentos/miraflores" className="text-gray-600 hover:text-teal-600">Departamentos en alquiler en Miraflores</Link></li>
                  <li><Link href="/alquiler/departamentos/sanmiguel" className="text-gray-600 hover:text-teal-600">Departamentos en alquiler en San Miguel</Link></li>
                  <li><Link href="/alquiler/departamentos/losolivos" className="text-gray-600 hover:text-teal-600">Departamentos en alquiler en Los Olivos</Link></li>
                  <li><Link href="/alquiler/departamentos/magdalena" className="text-gray-600 hover:text-teal-600">Departamentos en alquiler en Magdalena</Link></li>
                  <li><Link href="/#busquedas" className="text-teal-600 hover:text-teal-700 font-medium">Ver más</Link></li>
                </ul>
              </div>

              {/* TAMBIÉN SE BUSCA */}
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-4">También se busca</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/alquiler/departamentos/limacercado" className="text-gray-600 hover:text-teal-600">Departamentos en alquiler en Lima Cercado</Link></li>
                  <li><Link href="/alquiler/locales/lima" className="text-gray-600 hover:text-teal-600">Locales Comerciales en alquiler en Lima</Link></li>
                  <li><Link href="/alquiler/habitaciones/lima" className="text-gray-600 hover:text-teal-600">Habitaciones en alquiler en Lima</Link></li>
                  <li><Link href="/alquiler/habitaciones/santiagosurco" className="text-gray-600 hover:text-teal-600">Habitaciones en alquiler en Santiago de Surco</Link></li>
                  <li><Link href="/#busquedas" className="text-teal-600 hover:text-teal-700 font-medium">Ver más</Link></li>
                </ul>
              </div>

              {/* CONSULTAS FRECUENTES */}
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-4">Consultas frecuentes</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/alquiler/departamentos/comas" className="text-gray-600 hover:text-teal-600">Departamentos en alquiler en Comas</Link></li>
                  <li><Link href="/alquiler/departamentos/santaanita" className="text-gray-600 hover:text-teal-600">Departamentos en alquiler en Santa Anita</Link></li>
                  <li><Link href="/alquiler/habitaciones/sanisidro" className="text-gray-600 hover:text-teal-600">Habitaciones en alquiler en San Isidro</Link></li>
                  <li><Link href="/alquiler/departamentos/atevitarte" className="text-gray-600 hover:text-teal-600">Departamentos en alquiler en Ate Vitarte</Link></li>
                  <li><Link href="/#busquedas" className="text-teal-600 hover:text-teal-700 font-medium">Ver más</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER PRINCIPAL CON BANDERA */}
      <section className="bg-gray-900 text-white py-12">
        <div className="w-full px-8 xl:px-16">
          <div className="max-w-[1920px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* LOGO Y DESCRIPCIÓN */}
              <div>
                <img src="/assets/images/logo.png" alt="TIYUY" className="h-16 mb-4 brightness-0 invert" />
                <p className="text-gray-400 text-sm mb-4">
                  🇵🇪 El portal inmobiliario 100% peruano
                </p>
                <p className="text-gray-400 text-sm">
                  Conectando a peruanos con su hogar ideal desde 2026
                </p>
              </div>

              {/* MÁS TIYUY */}
              <div>
                <h3 className="font-bold text-base mb-4">Más TIYUY</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/alquiler/departamentos/lima" className="hover:text-white">Inmuebles en Perú</Link></li>
                  <li><Link href="/dashboard/mis-propiedades/nueva" className="hover:text-white">Publicar tu Inmueble</Link></li>
                  <li><Link href="/#ayuda" className="hover:text-white">Ayuda</Link></li>
                  <li><Link href="/#blog" className="hover:text-white">Blog</Link></li>
                  <li><Link href="/#trabaja" className="hover:text-white">Trabaja con nosotros</Link></li>
                </ul>
              </div>

              {/* ANUNCIANTES */}
              <div>
                <h3 className="font-bold text-base mb-4">Anunciantes</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/#inmobiliarias" className="hover:text-white">Inmobiliarias</Link></li>
                  <li><Link href="/#corredores" className="hover:text-white">Corredores</Link></li>
                  <li><Link href="/#constructoras" className="hover:text-white">Constructoras</Link></li>
                </ul>
              </div>

              {/* SÍGUENOS */}
              <div>
                <h3 className="font-bold text-base mb-4">Síguenos</h3>
                <div className="flex gap-4 mb-6">
                  <a href="https://facebook.com" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
                <h4 className="font-bold text-sm mb-3">Apps</h4>
                <p className="text-gray-400 text-xs mb-2">Próximamente en:</p>
                <div className="flex gap-2">
                  <div className="bg-gray-800 px-3 py-2 rounded-lg text-xs">📱 iOS</div>
                  <div className="bg-gray-800 px-3 py-2 rounded-lg text-xs">🤖 Android</div>
                </div>
              </div>
            </div>

            {/* COPYRIGHT CON BANDERA */}
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🇵🇪</span>
                <div>
                  <p className="text-gray-400 text-sm">
                    © 2026 TIYUY - DE PERUANO A OTRO PERUANO
                  </p>
                  <p className="text-gray-500 text-xs">
                    Orgullosamente peruano • Conectando familias desde Lima
                  </p>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-gray-400">
                <Link href="/#terminos" className="hover:text-white">Términos y condiciones</Link>
                <span>•</span>
                <Link href="/#privacidad" className="hover:text-white">Política de privacidad</Link>
                <span>•</span>
                <Link href="/#libro-reclamaciones" className="hover:text-white flex items-center gap-1">
                  📖 Libro de Reclamaciones
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
