'use client';

import { useState } from 'react';
import { Shield, 
  ChevronDown, Check, MapPin, DollarSign, TrendingUp, ShieldCheck, Camera, Users, Tag } from 'lucide-react';

interface SEOContentProps {
  propertyType: string;
  propertyTypeLabel: string;
  district: string;
  transactionType: 'rent' | 'sale';
  properties: any[];
}

export function SEOContent({ propertyType, propertyTypeLabel, district, transactionType, properties }: SEOContentProps) {
  console.log('SEOContent renderizado:', { propertyType, propertyTypeLabel, district, transactionType, propertiesCount: properties.length });
  
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const isRent = transactionType === 'rent';

  const mainTitle = isRent 
    ? `¿Por qué alquilar ${propertyTypeLabel.toLowerCase()} en ${district}?`
    : `¿Por qué comprar ${propertyTypeLabel.toLowerCase()} en ${district}?`;

  const firstSection = {
    title: 'Ubicación privilegiada',
    content: `${district} es uno de los distritos más estratégicos de Lima, con excelente conectividad, acceso a servicios básicos, centros comerciales, restaurantes y una amplia oferta educativa y de salud. Ideal para familias y profesionales${isRent ? ' que buscan calidad de vida.' : '.'}`
  };

  const secondSection = isRent ? {
    title: 'Precios competitivos',
    content: `Encontrarás ${propertyTypeLabel.toLowerCase()} en alquiler con las mejores tarifas del mercado. Opciones para todos los presupuestos con excelente relación calidad-precio y flexibilidad de contratos adaptados a tus necesidades.`
  } : {
    title: 'Plusvalía garantizada',
    content: `Las propiedades en ${district} han mostrado un crecimiento constante en su valor, convirtiéndose en una excelente inversión a largo plazo. La demanda creciente asegura que tu propiedad se revalorice con el tiempo.`
  };

  const validPrices = properties?.filter(p => p && typeof p.price === 'number' && p.price > 0).map(p => p.price) || [];
  const hasPrices = validPrices.length > 0;
  const minPrice = hasPrices ? Math.min(...validPrices) : 0;
  const maxPrice = hasPrices ? Math.max(...validPrices) : 0;

  const faqQuestions = isRent ? [
    {
      question: `¿Cuál es el precio promedio de alquiler de ${propertyTypeLabel.toLowerCase()} en ${district}?`,
      answer: hasPrices 
        ? `Los precios varían según la ubicación exacta, características y estado de la propiedad. En TIYUY encontrarás opciones desde S/. ${minPrice.toLocaleString('es-PE')} hasta S/. ${maxPrice.toLocaleString('es-PE')}.`
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
      answer: hasPrices 
        ? `Los precios varían según la ubicación exacta, características y estado de la propiedad. En TIYUY encontrarás opciones desde S/. ${minPrice.toLocaleString('es-PE')} hasta S/. ${maxPrice.toLocaleString('es-PE')}.`
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

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-8xl mx-auto space-y-4">
      
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-zinc-50 via-background to-muted/20 dark:from-zinc-900/40 dark:to-background border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-8">
            {mainTitle}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand" />
                {firstSection.title}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {firstSection.content}
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                {isRent ? <DollarSign className="w-5 h-5 text-brand" /> : <TrendingUp className="w-5 h-5 text-brand" />}
                {secondSection.title}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {secondSection.content}
              </p>
            </div>
          </div>

          {/* Mini Cards de Características de la zona */}
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            <div className="bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-brand/30 transition-all shadow-sm">
              <div className="p-2 bg-brand/10 w-fit rounded-lg text-brand mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground mb-1">Seguridad</h4>
              <p className="text-xs text-foreground/60">Zonas seguras con patrullaje constante y accesos controlados.</p>
            </div>
            
            <div className="bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-brand/30 transition-all shadow-sm">
              <div className="p-2 bg-brand/10 w-fit rounded-lg text-brand mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground mb-1">Transporte</h4>
              <p className="text-xs text-foreground/60">Excelente conectividad y acceso inmediato a vías principales de Lima.</p>
            </div>
            
            <div className="bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-brand/30 transition-all shadow-sm">
              <div className="p-2 bg-brand/10 w-fit rounded-lg text-brand mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-foreground mb-1">Comercio</h4>
              <p className="text-xs text-foreground/60">Cercanía a los principales centros comerciales, bancos y tiendas locales.</p>
            </div>
          </div>

          <div className="mt-10 p-6 bg-muted/30 border border-zinc-100 dark:border-zinc-900 rounded-xl">
            <h3 className="text-lg font-bold text-foreground mb-6">Por qué buscar en TIYUY</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-sm font-bold text-foreground">Propiedades verificadas</strong>
                  <p className="text-xs text-foreground/60 mt-0.5">Filtros estrictos y control de documentación legal de los listados.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-sm font-bold text-foreground">Fotos reales y actualizadas</strong>
                  <p className="text-xs text-foreground/60 mt-0.5">Imágenes recientes que reflejan el estado real exacto del inmueble.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-sm font-bold text-foreground">Trato directo y transparente</strong>
                  <p className="text-xs text-foreground/60 mt-0.5">Contacto ágil con propietarios y asesores especializados del sector.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-sm font-bold text-foreground">Precios competitivos</strong>
                  <p className="text-xs text-foreground/60 mt-0.5">Acceso a las mejores oportunidades comerciales vigentes en el mercado.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECCIÓN PREGUNTAS FRECUENTES (INTERACTIVA) ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">Preguntas frecuentes</h2>
          <p className="text-xs text-foreground/50 text-center mb-8">Todo lo que necesitas saber sobre los inmuebles en {district}</p>
          
          <div className="space-y-3">
            {faqQuestions.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className="bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-foreground hover:bg-muted/30 transition-colors gap-4"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-foreground/40 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand' : ''}`} />
                  </button>
                  
                  <div 
                    className={`transition-all duration-200 ease-in-out ${
                      isOpen ? 'max-h-[500px] border-t border-zinc-100 dark:border-zinc-900/60 p-5' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <p className="text-sm text-foreground/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}