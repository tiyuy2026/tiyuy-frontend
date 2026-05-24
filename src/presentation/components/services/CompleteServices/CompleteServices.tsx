'use client';

import Link from 'next/link';

export function CompleteServices() {
  const sections = [
    {
      icon: '🏠',
      title: 'SUNAT',
      subtitle: 'Superintendencia Nacional de Aduanas y de Administración Tributaria',
      url: 'https://www.sunat.gob.pe/',
      items: [
        { title: 'Predial Urbano', desc: 'Impuesto para propiedades urbanas', cta: 'Consultar' },
        { title: 'Alquileres', desc: 'Obligaciones tributarias', cta: 'Declarar' },
        { title: 'Autovalúo', desc: 'Determinación del valor de predios', cta: 'Realizar' },
        { title: 'Transferencia de Predio', desc: 'Requisitos para transferencia', cta: 'Ver requisitos' },
        { title: 'Declaración Jurada', desc: 'Rentas anuales de propiedades', cta: 'Presentar' },
        { title: 'ITF', desc: 'Impuesto a transacciones financieras', cta: 'Calcular' },
        { title: 'Consultas y Trámites', desc: 'Atención y asistencia virtual', cta: 'Acceder a SUNAT Virtual' },
      ],
    },
    {
      icon: '🏛️',
      title: 'SUNARP',
      subtitle: 'Superintendencia Nacional de los Registros Públicos',
      url: 'https://www.sunarp.gob.pe/',
      items: [
        { title: 'Búsqueda de Partidas', desc: 'Consultar registros de propiedades', cta: 'Buscar' },
        { title: 'Certificados de Propiedad', desc: 'Obtener certificados registrales', cta: 'Solicitar' },
        { title: 'Trámites en Línea', desc: 'Servicios virtuales SUNARP', cta: 'Acceso virtual' },
      ],
    },
    {
      icon: '🏦',
      title: 'Guía de Crédito Hipotecario',
      subtitle: 'Información para obtener tu crédito hipotecario',
      url: 'https://www.sbs.gob.pe/',
      items: [
        { title: 'Requisitos', desc: 'Documentos necesarios', cta: 'Ver requisitos' },
        { title: 'Tasas de Interés', desc: 'Comparar tasas hipotecarias', cta: 'Consultar tasas' },
        { title: 'Simulador', desc: 'Calcular cuota hipotecaria', cta: 'Simular crédito' },
      ],
    },
  ];

  const otrasInstituciones = [
    { title: 'CAVALI - ICB', desc: 'Tasas de interés y mercado de valores', cta: 'Consultar', url: 'https://www.cavali.com.pe/' },
    { title: 'Ministerio de Vivienda', desc: 'Programas de subsidios y financiamiento', cta: 'Ver programas', url: 'https://www.minvivienda.gob.pe/' },
    { title: 'Tasadores Peruanos', desc: 'Servicio profesional de tasación', cta: 'Tasar', url: 'https://www.tasadoresperuanos.org/' },
    { title: 'Colegio de Arquitectos', desc: 'Validación de planos y permisos', cta: 'Consultar', url: 'https://www.cap.org.pe/' },
  ];

  return (
    <div className="w-full bg-white antialiased text-gray-900 selection:bg-brand/10 py-16">
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="text-center mb-16 border-b border-gray-200 pb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-3">
            Instituciones & Recursos
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Servicios Inmobiliarios
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Todo lo que necesitas para tus trámites y transacciones en el Perú de manera clara y accesible.
          </p>
        </header>

        <div className="space-y-12">
          {sections.map((sec) => (
            <section key={sec.title} className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-light border border-brand/10 flex items-center justify-center text-xl shrink-0">
                    {sec.icon}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                      {sec.title}
                    </h2>
                    <p className="text-gray-600 text-sm font-medium mt-0.5">
                      {sec.subtitle}
                    </p>
                  </div>
                </div>
                <Link
                  href={sec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline self-start sm:self-center"
                >
                  Ir al sitio oficial
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sec.items.map((item) => (
                  <div key={item.title} className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col justify-between hover:border-brand/40 transition-colors shadow-sm">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-xs font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <Link
                      href={sec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-5 text-xs font-bold text-brand hover:opacity-80 underline underline-offset-4"
                    >
                      <span>{item.cta}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-brand mb-1">
              Complementarios
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Otras Instituciones
            </h2>
            <p className="text-gray-600 text-sm font-medium mt-0.5">
              Entidades y enlaces de utilidad para el sector
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otrasInstituciones.map((inst) => (
              <div key={inst.title} className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col justify-between hover:border-brand/40 transition-colors shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {inst.title}
                  </h3>
                  <p className="text-gray-600 text-xs font-medium leading-relaxed">
                    {inst.desc}
                  </p>
                </div>
                <Link 
                  href={inst.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-brand hover:opacity-80 underline underline-offset-4"
                >
                  <span>{inst.cta}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </section>
        <footer className="mt-12 bg-brand-light rounded-2xl p-6 sm:p-8 text-center max-w-4xl mx-auto border border-brand/10">
          <h3 className="text-base font-bold text-brand mb-2">
            Información Oficial Verificada
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed font-medium">
            Todos los enlaces dirigen a instituciones oficiales del Estado peruano y entidades reguladas. Facilitamos el acceso a esta información para tu comodidad y seguridad, pero recuerda que todos los trámites deben gestionarse finalmente dentro de las plataformas oficiales correspondientes.
          </p>
        </footer>

      </div>
    </div>
  );
}