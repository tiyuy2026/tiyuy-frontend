'use client';

import { Newspaper, ArrowRight, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const NEWS = [
  {
    date: 'Junio 2026',
    title: 'Lanzamiento de Tiyuy Analytics',
    desc: 'Presentamos nuestro módulo de inteligencia de mercado con datos agregados de precio por m², tendencias por distrito y radar de actividad.',
    tag: 'Producto',
  },
  {
    date: 'Mayo 2026',
    title: 'Alianza con principales inmobiliarias de Lima',
    desc: 'Más de 15 inmobiliarias se suman a Tiyuy para publicar y gestionar su portafolio de propiedades en nuestra plataforma.',
    tag: 'Alianzas',
  },
  {
    date: 'Abril 2026',
    title: 'Nuevo sistema de perfiles para agentes',
    desc: 'Los agentes inmobiliarios ahora cuentan con perfiles profesionales verificados, reseñas y métricas de desempeño.',
    tag: 'Producto',
  },
  {
    date: 'Marzo 2026',
    title: 'Integración con Mercado Pago',
    desc: 'Los usuarios pueden pagar sus planes y suscripciones de forma segura a través de Mercado Pago, Yape y Plin.',
    tag: 'Tecnología',
  },
];

export default function NoticiasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide uppercase mb-5">
              <Newspaper className="w-3.5 h-3.5" /> Sala de prensa
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">Noticias y comunicados</h1>
            <p className="text-lg sm:text-xl text-gray-300 mt-5 leading-relaxed">Entérate de los últimos anuncios, lanzamientos y novedades de Tiyuy.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
        {NEWS.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.date}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{item.tag}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-br from-blue-600 to-teal-700 rounded-3xl p-8 text-center text-white mt-8">
          <h2 className="text-xl font-bold mb-3">Contacto para medios</h2>
          <p className="text-blue-100 text-sm max-w-lg mx-auto mb-4">
            Si eres periodista o medio de comunicación y deseas más información sobre Tiyuy, escríbenos.
          </p>
          <a href="mailto:tiyuy@saberoconsulting.com"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all">
            tiyuy@saberoconsulting.com <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}