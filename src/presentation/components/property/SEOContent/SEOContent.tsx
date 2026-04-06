'use client';

interface SEOContentProps {
  propertyType: string;
  propertyTypeLabel: string;
  district: string;
  transactionType: 'rent' | 'sale';
  properties: any[];
}

export function SEOContent({ propertyType, propertyTypeLabel, district, transactionType, properties }: SEOContentProps) {
  console.log('SEOContent renderizado:', { propertyType, propertyTypeLabel, district, transactionType, propertiesCount: properties.length });
  
  const isRent = transactionType === 'rent';
  const isSale = transactionType === 'sale';

  // Títulos dinámicos según tipo
  const mainTitle = isRent 
    ? `¿Por qué alquilar ${propertyTypeLabel.toLowerCase()} en ${district}?`
    : `¿Por qué comprar ${propertyTypeLabel.toLowerCase()} en ${district}?`;

  // Contenido dinámico según tipo
  const firstSection = isRent ? {
    title: ' Ubicación privilegiada',
    content: `${district} es uno de los distritos más estratégicos de Lima, con excelente conectividad, acceso a servicios básicos, centros comerciales, restaurantes y una amplia oferta educativa y de salud. Ideal para familias y profesionales que buscan calidad de vida.`
  } : {
    title: ' Ubicación privilegiada',
    content: `${district} es uno de los distritos más estratégicos de Lima, con excelente conectividad, acceso a servicios básicos, centros comerciales, restaurantes y una amplia oferta educativa y de salud. Ideal para familias y profesionales.`
  };

  const secondSection = isRent ? {
    title: ' Precios competitivos',
    content: `Encontrarás ${propertyTypeLabel.toLowerCase()} en alquiler con las mejores tarifas del mercado. Opciones para todos los presupuestos con excelente relación calidad-precio y flexibilidad de contratos adaptados a tus necesidades.`
  } : {
    title: ' Plusvalía garantizada',
    content: `Las propiedades en ${district} han mostrado un crecimiento constante en su valor, convirtiéndose en una excelente inversión a largo plazo. La demanda creciente asegura que tu propiedad se revalorice con el tiempo.`
  };

  // Preguntas frecuentes dinámicas
  const faqQuestions = isRent ? [
    {
      question: `¿Cuál es el precio promedio de alquiler de ${propertyTypeLabel.toLowerCase()} en ${district}?`,
      answer: properties.length > 0 
        ? `Los precios varían según la ubicación exacta, características y estado de la propiedad. En TIYUY encontrarás opciones desde S/.${Math.min(...properties.map((p) => p.price))} hasta S/.${Math.max(...properties.map((p) => p.price))}.`
        : `Los precios varían según la ubicación exacta, características y estado de la propiedad. Contáctanos para conocer las opciones disponibles en ${district}.`
    },
    {
      question: `¿Es seguro alquilar propiedades en ${district}?`,
      answer: `Sí, ${district} es considerado uno de los distritos más seguros de Lima. Además, todas nuestras propiedades cuentan con la documentación legal en regla y contratos de alquiler transparentes.`
    },
    {
      question: '¿Qué servicios hay cerca de las propiedades?',
      answer: 'La mayoría de nuestras propiedades están cerca de supermercados, colegios, hospitales, bancos y centros comerciales. Cada anuncio incluye información específica sobre los servicios cercanos.'
    },
    {
      question: '¿Cómo puedo alquilar una propiedad?',
      answer: 'Puedes contactar directamente al propietario a través de nuestro formulario de contacto o WhatsApp. Te responderán rápidamente para coordinar una visita y los trámites de alquiler.'
    }
  ] : [
    {
      question: `¿Cuál es el precio promedio de ${propertyTypeLabel.toLowerCase()} en ${district}?`,
      answer: properties.length > 0 
        ? `Los precios varían según la ubicación exacta, características y estado de la propiedad. En TIYUY encontrarás opciones desde S/.${Math.min(...properties.map((p) => p.price))} hasta S/.${Math.max(...properties.map((p) => p.price))}.`
        : `Los precios varían según la ubicación exacta, características y estado de la propiedad. Contáctanos para conocer las opciones disponibles en ${district}.`
    },
    {
      question: `¿Es seguro comprar propiedades en ${district}?`,
      answer: `Sí, ${district} es considerado uno de los distritos más seguros de Lima. Además, todas nuestras propiedades cuentan con la documentación legal en regla y títulos de propiedad verificados.`
    },
    {
      question: '¿Qué servicios hay cerca de las propiedades?',
      answer: 'La mayoría de nuestras propiedades están cerca de supermercados, colegios, hospitales, bancos y centros comerciales. Cada anuncio incluye información específica sobre los servicios cercanos.'
    },
    {
      question: '¿Cómo puedo comprar una propiedad?',
      answer: 'Puedes contactar directamente al propietario a través de nuestro formulario de contacto o WhatsApp. Te responderán rápidamente para coordinar una visita y los trámites de compra.'
    }
  ];

  return (
    <>
      {/* ── SEO CONTENT ── */}
      <section className="px-8 py-16">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {mainTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">{firstSection.title}</h3>
              <p className="text-gray-700 leading-relaxed">
                {firstSection.content}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">{secondSection.title}</h3>
              <p className="text-gray-700 leading-relaxed">
                {secondSection.content}
              </p>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3"></div>
              <h4 className="font-semibold text-gray-900 mb-2">Seguridad</h4>
              <p className="text-sm text-gray-600">Zonas seguras con vigilancia y acceso controlado</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3"></div>
              <h4 className="font-semibold text-gray-900 mb-2">Transporte</h4>
              <p className="text-sm text-gray-600">Excelente conexión con transporte público</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-3xl mb-3"></div>
              <h4 className="font-semibold text-gray-900 mb-2">Comercio</h4>
              <p className="text-sm text-gray-600">Centros comerciales y tiendas cercanas</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4"> Por qué elegir TIYUY</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <strong className="text-gray-900">Propiedades verificadas</strong>
                  <p className="text-sm text-gray-600">Todas nuestras propiedades son revisadas y validadas</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <strong className="text-gray-900">Fotos reales y actualizadas</strong>
                  <p className="text-sm text-gray-600">Imágenes recientes que muestran el estado actual</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <strong className="text-gray-900">Asesoría personalizada</strong>
                  <p className="text-sm text-gray-600">Expertos que te guiarán en todo el proceso</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <strong className="text-gray-900">Precios competitivos</strong>
                  <p className="text-sm text-gray-600">Las mejores ofertas del mercado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Preguntas frecuentes</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {faqQuestions.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-700">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
