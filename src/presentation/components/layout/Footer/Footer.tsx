'use client';

import Link from 'next/link';
import Image from 'next/image';
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
      { label: 'Centro de Soporte', href: '/soporte' },
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

const SOCIAL_LINKS = [
  {
    href: 'https://www.instagram.com/tiyuyperu/',
    icon: 'fa6-brands:instagram',
    label: 'Instagram',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7]',
  },
  {
    href: 'https://www.facebook.com/tiyuyperu',
    icon: 'fa6-brands:facebook',
    label: 'Facebook',
    hoverBg: 'hover:bg-[#1877F2]',
  },
  {
    href: 'https://twitter.com/tiyuyperu',
    icon: 'fa6-brands:x-twitter',
    label: 'X (Twitter)',
    hoverBg: 'hover:bg-[#000000]',
  },
  {
    href: 'https://www.tiktok.com/@tiyuyperu_oficial',
    icon: 'fa6-brands:tiktok',
    label: 'TikTok',
    hoverBg: 'hover:bg-[#000000]',
  },
  {
    href: 'https://www.youtube.com/@tiyuyperu',
    icon: 'fa6-brands:youtube',
    label: 'YouTube',
    hoverBg: 'hover:bg-[#FF0000]',
  },
  {
    href: 'https://www.linkedin.com/in/tiyuy-peru-4858863b5/',
    icon: 'fa6-brands:linkedin',
    label: 'LinkedIn',
    hoverBg: 'hover:bg-[#0077B5]',
  },
];

export function Footer() {
  return (
    <>
      <footer className="w-full mt-12 bg-[#1a1a1a] text-gray-300 font-sans">
      <div className="w-full px-8 xl:px-16 max-w-[1920px] mx-auto py-12 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-white font-semibold text-[15px] mb-5">Explorar propiedades</h3>
            {INSPIRATION_SECTIONS.map((section, i) => (
              <div key={i} className="mb-5">
                <p className="text-gray-400 text-[13px] font-semibold uppercase tracking-wider mb-3">
                  {section.title}
                </p>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {FOOTER_COLUMNS.map((column, i) => (
            <div key={i}>
              <h3 className="text-white font-semibold text-[15px] mb-5">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-gray-400 hover:text-white transition-colors duration-200"
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

      <div className="w-full px-8 xl:px-16 max-w-[1920px] mx-auto py-8 border-b border-white/10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <p className="text-white font-semibold text-[14px] mb-4">Aceptamos</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#009ee3] text-white text-[12px] font-bold px-3 py-2 rounded-lg">
                <Icon icon="simple-icons:mercadopago" width="18" height="18" />
                <span>Mercado Pago</span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#6b21a8] text-white text-[12px] font-bold px-3 py-2 rounded-lg">
                <Icon icon="mdi:cellphone" width="18" height="18" />
                <span>Yape</span>
              </div>

              <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-center h-9">
                <Icon icon="logos:visa" width="38" height="24" />
              </div>

              <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-center h-9">
                <Icon icon="logos:mastercard" width="36" height="24" />
              </div>

              <div className="bg-white rounded-lg px-3 py-2 flex items-center justify-center h-9">
                <Icon icon="logos:amex" width="36" height="24" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-white font-semibold text-[14px] mb-4">Conectar con TIYUY</p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`size-9 rounded-full flex items-center justify-center text-gray-400 bg-white/10 hover:text-white transition-all duration-200 ${social.hoverBg}`}
                >
                  <Icon icon={social.icon} width="17" height="17" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-8 xl:px-16 max-w-[1920px] mx-auto py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-gray-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} Tiyuy, Inc.</span>
            <span className="text-gray-600">·</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
            <span className="text-gray-600">·</span>
            <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
            <span className="text-gray-600">·</span>
            <Link href="/#mapa" className="hover:text-white transition-colors">Mapa del sitio</Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none">
              <Icon icon="material-symbols:language" width="15" height="15" />
              <span>Español (PE)</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none">
              <span>S/</span>
              <span>PEN</span>
            </button>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
}
