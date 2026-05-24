'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

const INSPIRATION_SECTIONS = [
  {
    title: 'En Venta',
    links: [
      { label: 'Casas', href: '/sale/casas/peru' },
      { label: 'Departamentos', href: '/sale/departamentos/peru' },
      { label: 'Terrenos', href: '/sale/terrenos/peru' },
      { label: 'Oficinas', href: '/sale/oficinas/peru' },
      { label: 'Locales Comerciales', href: '/sale/locales/peru' },
    ],
  },
  {
    title: 'En Alquiler',
    links: [
      { label: 'Casas', href: '/rent/casas/peru' },
      { label: 'Departamentos', href: '/rent/departamentos/peru' },
      { label: 'Habitaciones', href: '/rent/habitaciones/peru' },
      { label: 'Locales Comerciales', href: '/rent/locales/peru' },
      { label: 'Oficinas', href: '/rent/oficinas/peru' },
    ],
  },
];

const FOOTER_COLUMNS = [
  {
    title: 'Asistencia',
    links: [
      { label: 'Centro de ayuda', href: '/#ayuda' },
      { label: 'Opciones de seguridad', href: '/#seguridad' },
      { label: 'Nuestra política antidiscriminación', href: '/#antidiscriminacion' },
      { label: 'Apoyo a personas con discapacidad', href: '/#discapacidad' },
      { label: 'Opciones de cancelación', href: '/#cancelacion' },
      { label: 'Libro de Reclamaciones', href: '/#reclamaciones' },
    ],
  },
  {
    title: 'Descubre TIYUY',
    links: [
      { label: 'Publicar tu inmueble', href: '/my-properties/new' },
      { label: 'TIYUY para Inmobiliarias', href: '/#inmobiliarias' },
      { label: 'TIYUY para Corredores', href: '/#corredores' },
      { label: 'TIYUY para Constructoras', href: '/#constructoras' },
      { label: 'Blog inmobiliario', href: '/blog' },
      { label: 'Servicios', href: '/servics' },
    ],
  },
  {
    title: 'Acerca de nosotros',
    links: [
      { label: 'Por qué elegir TIYUY', href: '/about-tiyuy' },
      { label: 'Trabaja con nosotros', href: '/#trabaja' },
      { label: 'Inversores', href: '/#inversores' },
      { label: 'Noticias y comunicados', href: '/#prensa' },
      { label: 'Impacto comunitario', href: '/#impacto' },
      { label: 'Contacto', href: '/contact' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full mt-12 bg-gray-50 border-t border-gray-200 text-foreground font-sans">
      
      {/* SECCIÓN 1: INSPIRACIÓN */}
      <section className="py-10 border-b border-gray-200">
        <div className="w-full px-6 xl:px-10 max-w-[1920px] mx-auto">
          <h2 className="text-[22px] font-semibold tracking-tight mb-8">
            Inspiración para tu próxima búsqueda
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
            {INSPIRATION_SECTIONS.map((section, index) => (
              <div key={index} className="flex flex-col">
                <h3 className="text-[14px] font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link 
                        href={link.href} 
                        className="text-[14px] text-gray-550 hover:underline hover:text-brand transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: ENLACES PRINCIPALES */}
      <section className="py-12 border-b border-gray-200">
        <div className="w-full px-6 xl:px-10 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FOOTER_COLUMNS.map((column, index) => (
              <div key={index}>
                <h3 className="font-semibold text-[14px] mb-4">{column.title}</h3>
                <ul className="space-y-3 text-[14px]">
                  {column.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link 
                        href={link.href} 
                        className="text-gray-600 hover:underline hover:text-brand transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="w-full px-6 xl:px-10 max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[14px]">
            <span className="text-gray-500">© {new Date().getFullYear()} Tiyuy, Inc.</span>
            <span className="hidden md:inline text-gray-300">·</span>
            <div className="flex items-center gap-3 text-gray-650">
              <Link href="/#privacidad" className="hover:underline hover:text-brand">Privacidad</Link>
              <span className="text-gray-300">·</span>
              <Link href="/#terminos" className="hover:underline hover:text-brand">Términos</Link>
              <span className="text-gray-300">·</span>
              <Link href="/#mapa" className="hover:underline hover:text-brand">Mapa del sitio</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-[14px] font-semibold">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 hover:text-brand transition-colors focus:outline-none">
                <Icon icon="material-symbols:language" width="16" height="16" />
                <span>Español (PE)</span>
              </button>
              
              <button className="flex items-center gap-1 hover:text-brand transition-colors focus:outline-none">
                <span>S/</span>
                <span>PEN</span>
              </button>
            </div>
            <div className="flex gap-4 sm:ml-4 border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-4">
              <a 
                href="https://www.instagram.com/tiyuyperu/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="size-9 rounded-full flex items-center justify-center text-gray-500 bg-transparent hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white transition-all duration-300 ease-in-out" 
                aria-label="Instagram"
              >
                <Icon icon="fa6-brands:instagram" width="18" height="18" />
              </a>

              <a 
                href="https://www.linkedin.com/in/tiyuy-peru-4858863b5/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="size-9 rounded-full flex items-center justify-center text-gray-500 bg-transparent hover:bg-[#0A66C2] hover:text-white transition-all duration-300 ease-in-out" 
                aria-label="LinkedIn"
              >
                <Icon icon="fa6-brands:linkedin" width="18" height="18" />
              </a>

              <a 
                href="https://www.tiktok.com/@tiyuyperu_oficial/video/7625094755235548434?m" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="size-9 rounded-full flex items-center justify-center text-gray-500 bg-transparent hover:bg-black hover:text-white transition-all duration-300 ease-in-out" 
                aria-label="TikTok"
              >
                <Icon icon="fa6-brands:tiktok" width="16" height="16" />
              </a>

            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}