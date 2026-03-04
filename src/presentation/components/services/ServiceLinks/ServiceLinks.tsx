'use client';

import Link from 'next/link';

interface ServiceLink {
  id: string;
  title: string;
  description: string;
  icon: string;
  externalUrl: string;
  category: 'legal' | 'valuation' | 'mortgage' | 'market' | 'advice';
  color: string;
}

const serviceLinks: ServiceLink[] = [
  {
    id: '1',
    title: 'SUNARP - Registros Públicos',
    description: 'Verificación de registros de propiedades y trámites legales',
    icon: '🏛️',
    externalUrl: 'https://www.sunarp.gob.pe/',
    category: 'legal',
    color: 'bg-blue-600'
  },
  {
    id: '2',
    title: 'Superintendencia de Banca',
    description: 'Información sobre tasas hipotecarias y créditos',
    icon: '🏦',
    externalUrl: 'https://www.sbs.gob.pe/',
    category: 'mortgage',
    color: 'bg-green-600'
  },
  {
    id: '3',
    title: 'CAVALI - ICB',
    description: 'Tasas de interés y mercado de valores inmobiliarios',
    icon: '📊',
    externalUrl: 'https://www.cavali.com.pe/',
    category: 'market',
    color: 'bg-purple-600'
  },
  {
    id: '4',
    title: 'Ministerio de Vivienda',
    description: 'Programas de subsidios y financiamiento habitacional',
    icon: '🏠',
    externalUrl: 'https://www.minvivienda.gob.pe/',
    category: 'mortgage',
    color: 'bg-orange-600'
  },
  {
    id: '5',
    title: 'Tasadores Peruanos',
    description: 'Servicio profesional de tasación de propiedades',
    icon: '📐',
    externalUrl: 'https://www.tasadoresperuanos.org/',
    category: 'valuation',
    color: 'bg-teal-600'
  },
  {
    id: '6',
    title: 'Colegio de Arquitectos',
    description: 'Validación de planos y permisos de construcción',
    icon: '🏗️',
    externalUrl: 'https://www.cap.org.pe/',
    category: 'legal',
    color: 'bg-red-600'
  }
];

export function ServiceLinks() {
  return (
    <div className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🛠️ Servicios y Plataformas Oficiales
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conectamos con las instituciones más importantes del sector inmobiliario peruano 
            para brindarte información verificada y actualizada
          </p>
        </div>

        {/* Grid de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceLinks.map((service) => (
            <a
              key={service.id}
              href={service.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                {/* Icono y Título */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xl">{service.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded-full ${service.color}`}>
                      {service.category === 'legal' ? 'Legal' :
                       service.category === 'valuation' ? 'Tasación' :
                       service.category === 'mortgage' ? 'Financiamiento' :
                       service.category === 'market' ? 'Mercado' : 'Asesoría'}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Indicador de enlace externo */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Enlace externo</span>
                  <div className="flex items-center gap-1 text-blue-600">
                    <span className="text-sm font-medium">Visitar</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              📚 Información Verificada
            </h3>
            <p className="text-blue-700 text-sm">
              Todos los enlaces dirigen a instituciones oficiales y reguladas por el Estado peruano. 
              TIYUY facilita el acceso a estas plataformas para tu comodidad y seguridad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
