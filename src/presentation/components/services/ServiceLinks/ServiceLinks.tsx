'use client';

import { 
  Building2, 
  Landmark, 
  BarChart3, 
  Home, 
  Ruler, 
  Construction, 
  ExternalLink 
} from 'lucide-react';

interface ServiceLink {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  externalUrl: string;
  category: 'legal' | 'valuation' | 'mortgage' | 'market' | 'advice';
  badgeLabel: string;
}

const serviceLinks: ServiceLink[] = [
  {
    id: '1',
    title: 'SUNARP - Registros Públicos',
    description: 'Verificación de registros de propiedades y trámites legales',
    icon: <Building2 className="w-6 h-6 text-white" />,
    externalUrl: 'https://www.sunarp.gob.pe/',
    category: 'legal',
    badgeLabel: 'Legal'
  },
  {
    id: '2',
    title: 'Superintendencia de Banca',
    description: 'Información sobre tasas hipotecarias y créditos financieros',
    icon: <Landmark className="w-6 h-6 text-white" />,
    externalUrl: 'https://www.sbs.gob.pe/',
    category: 'mortgage',
    badgeLabel: 'Financiamiento'
  },
  {
    id: '3',
    title: 'CAVALI - ICB',
    description: 'Tasas de interés y mercado de valores inmobiliarios',
    icon: <BarChart3 className="w-6 h-6 text-white" />,
    externalUrl: 'https://www.cavali.com.pe/',
    category: 'market',
    badgeLabel: 'Mercado'
  },
  {
    id: '4',
    title: 'Ministerio de Vivienda',
    description: 'Programas de subsidios y financiamiento habitacional',
    icon: <Home className="w-6 h-6 text-white" />,
    externalUrl: 'https://www.minvivienda.gob.pe/',
    category: 'mortgage',
    badgeLabel: 'Financiamiento'
  },
  {
    id: '5',
    title: 'Tasadores Peruanos',
    description: 'Servicio profesional de tasación de propiedades',
    icon: <Ruler className="w-6 h-6 text-white" />,
    externalUrl: 'https://www.tasadoresperuanos.org/',
    category: 'valuation',
    badgeLabel: 'Tasación'
  },
  {
    id: '6',
    title: 'Colegio de Arquitectos',
    description: 'Validación de planos y permisos de construcción',
    icon: <Construction className="w-6 h-6 text-white" />,
    externalUrl: 'https://www.cap.org.pe/',
    category: 'legal',
    badgeLabel: 'Legal'
  }
];

export function ServiceLinks() {
  return (
    <div className="w-full py-16 bg-[var(--bg-primary)] antialiased text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="text-center mb-12 border-b-2 border-gray-200 dark:border-gray-800 pb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)] mb-3">
            Recursos y Utilidades
          </p>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Plataformas Oficiales
          </h2>
          <p className="mt-3 text-lg text-[var(--text-secondary)] max-w-3xl mx-auto font-medium">
            Conectamos con las instituciones más importantes del sector inmobiliario peruano 
            para brindarte información verificada y actualizada.
          </p>
        </header>

        {/* Grid de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceLinks.map((service) => (
            <a
              key={service.id}
              href={service.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  {/* Icono y Título */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-[var(--brand-primary)]/10">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 group-hover:text-[var(--brand-primary)] transition-colors tracking-tight">
                        {service.title}
                      </h3>
                      <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 rounded-md">
                        {service.badgeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                {/* Indicador de enlace externo */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/60 pt-4">
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">Plataforma Externa</span>
                  <div className="flex items-center gap-1 text-[var(--brand-primary)]">
                    <span className="text-xs font-bold underline underline-offset-4">Visitar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer info box */}
        <footer className="mt-12 text-center max-w-3xl mx-auto">
          <div className="bg-[var(--brand-primary)]/[0.02] dark:bg-[var(--brand-primary)]/[0.05] border-2 border-[var(--brand-primary)]/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[var(--brand-primary)] mb-2">
              Información Oficial Regulada
            </h3>
            <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed">
              Todos los enlaces externos dirigen de manera directa a entidades oficiales adscritas al Estado peruano. 
              Facilitamos el acceso centralizado a estas redes para agilizar la gestión de tus proyectos de forma segura.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}