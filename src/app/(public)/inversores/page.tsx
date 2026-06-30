'use client';

import { TrendingUp, Target, Shield, Eye, BarChart3, ArrowRight, Mail, ChevronDown, ChevronUp, Building2, Lightbulb, Zap, Globe } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const HIGHLIGHTS = [
  { icon: <TrendingUp className="w-5 h-5" />, label: 'Mercado total', value: 'S/ 15,000M+', desc: 'Mercado inmobiliario en Perú' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Crecimiento digital', value: '+35% anual', desc: 'Penetración digital del sector' },
  { icon: <Target className="w-5 h-5" />, label: 'Déficit habitacional', value: '1.9M', desc: 'Viviendas requeridas en Perú' },
  { icon: <Globe className="w-5 h-5" />, label: 'Cobertura', value: 'Nacional', desc: 'Operamos en todo el Perú' },
];

export default function InversoresPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide uppercase mb-5">
              <TrendingUp className="w-3.5 h-3.5" /> Inversores
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">Relación con inversores</h1>
            <p className="text-lg sm:text-xl text-gray-300 mt-5 leading-relaxed">Conoce la visión, el mercado y las oportunidades detrás de Tiyuy.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">{h.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{h.value}</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{h.label}</p>
              <p className="text-xs text-gray-400">{h.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Visión del negocio</h2>
          <p className="text-gray-600 leading-relaxed">
            Tiyuy nace para resolver un problema enorme: el mercado inmobiliario en Perú sigue siendo
            offline, fragmentado y con poca transparencia. Mientras millones de personas buscan vivienda
            cada año, la tecnología disponible para conectar oferta y demanda sigue siendo limitada.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Construimos una plataforma que no solo publica propiedades, sino que organiza, da visibilidad
            y genera confianza en todo el proceso. Desde la búsqueda hasta el contacto, pasando por
            análisis de mercado, tendencias y herramientas profesionales para agentes e inmobiliarias.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oportunidad de mercado</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: 'Digitalización del sector', desc: 'Menos del 10% de las transacciones inmobiliarias en Perú se inician online. Hay un espacio enorme para crecer.' },
              { title: 'Demanda insatisfecha', desc: 'Más de 1.9 millones de familias necesitan vivienda. La oferta formal no alcanza y la intermediación es limitada.' },
              { title: 'Fragmentación de actores', desc: 'Miles de agentes, inmobiliarias y desarrolladores operan sin herramientas digitales integradas. Tiyuy los unifica.' },
              { title: 'Confianza como diferencial', desc: 'En un mercado con desconfianza, Tiyuy apuesta por perfiles verificados, reseñas y métricas transparentes.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-teal-700 rounded-3xl p-8 text-center text-white">
          <Building2 className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">Contacto institucional</h2>
          <p className="text-indigo-100 text-sm max-w-lg mx-auto mb-6">
            Si eres inversor, fondo o institución interesada en conocer más sobre Tiyuy, escríbenos.
          </p>
          <a href="mailto:tiyuy@saberoconsulting.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all">
            tiyuy@saberoconsulting.com <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}