'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 w-full mt-12">
      {/* DESTACADOS - INSPIRACIÓN */}
      <section className="py-10 border-b border-gray-200">
        <div className="w-full px-6 xl:px-10 max-w-[1920px] mx-auto">
          <h2 className="text-[22px] font-semibold text-[#222222] mb-8 tracking-tight">
            Inspiración para tu próxima búsqueda
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
            <div className="flex flex-col">
              <h3 className="text-[14px] font-semibold text-[#222222] mb-4">En Venta</h3>
              <ul className="space-y-3">
                <li><Link href="/sale/casas/peru" className="text-[14px] text-[#6A6A6A] hover:underline hover:text-[#222222] transition-colors">Casas</Link></li>
                <li><Link href="/sale/departamentos/peru" className="text-[14px] text-[#6A6A6A] hover:underline hover:text-[#222222] transition-colors">Departamentos</Link></li>
                <li><Link href="/sale/terrenos/peru" className="text-[14px] text-[#6A6A6A] hover:underline hover:text-[#222222] transition-colors">Terrenos</Link></li>
                <li><Link href="/sale/oficinas/peru" className="text-[14px] text-[#6A6A6A] hover:underline hover:text-[#222222] transition-colors">Oficinas</Link></li>
                <li><Link href="/sale/locales/peru" className="text-[14px] text-[#6A6A6A] hover:underline hover:text-[#222222] transition-colors">Locales Comerciales</Link></li>
              </ul>
            </div>
            
            <div className="flex flex-col">
              <h3 className="text-[14px] font-semibold text-[#222222] mb-4">En Alquiler</h3>
              <ul className="space-y-3">
                <li><Link href="/rent/casas/peru" className="text-[14px] text-[#6A6A6A] hover:underline hover:text-[#222222] transition-colors">Casas</Link></li>
                <li><Link href="/rent/departamentos/peru" className="text-[14px] text-[#6A6A6A] hover:underline hover:text-[#222222] transition-colors">Departamentos</Link></li>
                <li><Link href="/rent/habitaciones/peru" className="text-[14px] text-[#6A6A6A] hover:underline hover:text-[#222222] transition-colors">Habitaciones</Link></li>
                <li><Link href="/rent/locales/peru" className="text-[14px] text-[#6A6A6A] hover:underline hover:text-[#222222] transition-colors">Locales Comerciales</Link></li>
                <li><Link href="/rent/oficinas/peru" className="text-[14px] text-[#6A6A6A] hover:underline hover:text-[#222222] transition-colors">Oficinas</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER PRINCIPAL - ENLACES */}
      <section className="py-12 border-b border-gray-200">
        <div className="w-full px-6 xl:px-10 max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ASISTENCIA */}
            <div>
              <h3 className="font-semibold text-[14px] text-[#222222] mb-3">Asistencia</h3>
              <ul className="space-y-3 text-[14px] text-[#222222]">
                <li><Link href="/#ayuda" className="hover:underline">Centro de ayuda</Link></li>
                <li><Link href="/#seguridad" className="hover:underline">Opciones de seguridad</Link></li>
                <li><Link href="/#antidiscriminacion" className="hover:underline">Nuestra política antidiscriminación</Link></li>
                <li><Link href="/#discapacidad" className="hover:underline">Apoyo a personas con discapacidad</Link></li>
                <li><Link href="/#cancelacion" className="hover:underline">Opciones de cancelación</Link></li>
                <li><Link href="/#reclamaciones" className="hover:underline">Libro de Reclamaciones</Link></li>
              </ul>
            </div>

            {/* MÁS TIYUY */}
            <div>
              <h3 className="font-semibold text-[14px] text-[#222222] mb-3">Descubre TIYUY</h3>
              <ul className="space-y-3 text-[14px] text-[#222222]">
                <li><Link href="/my-properties/new" className="hover:underline">Publicar tu inmueble</Link></li>
                <li><Link href="/#inmobiliarias" className="hover:underline">TIYUY para Inmobiliarias</Link></li>
                <li><Link href="/#corredores" className="hover:underline">TIYUY para Corredores</Link></li>
                <li><Link href="/#constructoras" className="hover:underline">TIYUY para Constructoras</Link></li>
                <li><Link href="/#blog" className="hover:underline">Blog inmobiliario</Link></li>
              </ul>
            </div>

            {/* ACERCA DE */}
            <div>
              <h3 className="font-semibold text-[14px] text-[#222222] mb-3">Acerca de nosotros</h3>
              <ul className="space-y-3 text-[14px] text-[#222222]">
                <li><Link href="/#nosotros" className="hover:underline">Por qué elegir TIYUY</Link></li>
                <li><Link href="/#trabaja" className="hover:underline">Trabaja con nosotros</Link></li>
                <li><Link href="/#inversores" className="hover:underline">Inversores</Link></li>
                <li><Link href="/#prensa" className="hover:underline">Noticias y comunicados</Link></li>
                <li><Link href="/#impacto" className="hover:underline">Impacto comunitario</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM BAR - COPYRIGHT Y REDES SOCIALES */}
      <section className="py-6">
        <div className="w-full px-6 xl:px-10 max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[14px] text-[#222222]">
            <span>© 2026 Tiyuy, Inc.</span>
            <span className="hidden md:inline">·</span>
            <div className="flex items-center gap-3">
              <Link href="/#privacidad" className="hover:underline">Privacidad</Link>
              <span>·</span>
              <Link href="/#terminos" className="hover:underline">Términos</Link>
              <span>·</span>
              <Link href="/#mapa" className="hover:underline">Mapa del sitio</Link>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[#222222] font-semibold text-[14px]">
            <div className="flex items-center gap-2 cursor-pointer hover:underline">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 block" fill="currentColor">
                <path d="M8 .25a7.77 7.77 0 0 1 7.75 7.78 7.75 7.75 0 0 1-7.52 7.72h-.25A7.75 7.75 0 0 1 .25 8.24v-.25A7.75 7.75 0 0 1 8 .25zm1.95 8.5h-3.9c.15 2.9 1.17 5.34 1.88 5.5H8c.68 0 1.72-2.37 1.93-5.23zm4.26 0h-2.76c-.09 1.96-.53 3.78-1.18 5.08A6.26 6.26 0 0 0 14.17 9zm-9.67 0H1.8a6.26 6.26 0 0 0 2.76 5.08 16.79 16.79 0 0 1-1.18-5.08zm8.59-1.5h2.76a6.26 6.26 0 0 0-2.76-5.08 16.8 16.8 0 0 1 1.18 5.08zm-5.38 0h3.9a13.63 13.63 0 0 0-1.88-5.5H8a13.63 13.63 0 0 0-1.93 5.23zM2.87 2.17A6.26 6.26 0 0 0 1.8 7.25h2.76a16.8 16.8 0 0 1 1.18-5.08z" />
              </svg>
              Español (PE)
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:underline">
              <span>S/</span>
              <span>PEN</span>
            </div>
            <div className="flex gap-3 ml-4">
              <a href="#" className="hover:opacity-70">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="hover:opacity-70">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="hover:opacity-70">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
