'use client';

import {
  Briefcase, Heart, Lightbulb, Users, Target, Award,
  ChevronDown, ChevronUp, ArrowRight, Sparkles, Globe,
  Coffee, Zap, Shield
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const TEAMS = [
  { icon: <Globe className="w-5 h-5" />, name: 'Producto & Diseño', desc: 'Creamos experiencias que transforman la forma de comprar, vender y alquilar inmuebles.' },
  { icon: <Zap className="w-5 h-5" />, name: 'Ingeniería', desc: 'Construimos una plataforma robusta, escalable y segura para millones de usuarios.' },
  { icon: <Target className="w-5 h-5" />, name: 'Marketing & Crecimiento', desc: 'Conectamos personas con las propiedades de sus sueños a través de estrategias digitales.' },
  { icon: <Users className="w-5 h-5" />, name: 'Atención al cliente', desc: 'Acompañamos a cada usuario con empatía, claridad y soluciones reales.' },
  { icon: <Briefcase className="w-5 h-5" />, name: 'Negocios & Alianzas', desc: 'Desarrollamos relaciones con inmobiliarias, agentes y desarrolladores del sector.' },
  { icon: <Shield className="w-5 h-5" />, name: 'Operaciones & Finanzas', desc: 'Aseguramos que la empresa funcione de manera eficiente y sostenible.' },
];

const BENEFITS = [
  'Trabajo remoto o híbrido según el rol',
  'Horario flexible con foco en resultados',
  'Seguro de salud complementario',
  'Días de vacaciones adicionales',
  'Presupuesto anual para aprendizaje',
  'Participación en el crecimiento de la empresa',
];

const STEPS = [
  { n: '01', title: 'Postulación', desc: 'Cuéntanos quién eres y por qué te interesa Tiyuy a través de nuestro formulario.' },
  { n: '02', title: 'Entrevista inicial', desc: 'Conversamos sobre tu experiencia, motivaciones y ajuste con nuestra cultura.' },
  { n: '03', title: 'Desafío técnico', desc: 'Según el rol, compartimos un ejercicio práctico para conocer tu forma de trabajar.' },
  { n: '04', title: 'Entrevista final', desc: 'Te reunirás con el equipo y líderes del área para alinear expectativas.' },
  { n: '05', title: 'Propuesta', desc: 'Si hay match, te haremos una oferta y te daremos la bienvenida a Tiyuy.' },
];

export default function TrabajaConNosotrosPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide uppercase mb-5">
              <Briefcase className="w-3.5 h-3.5" /> Carrera
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">Trabaja con nosotros</h1>
            <p className="text-lg sm:text-xl text-gray-300 mt-5 leading-relaxed">Construye el futuro del mercado inmobiliario desde el primer día.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        {/* Misión */}
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8 max-w-3xl mx-auto text-center">
          <Sparkles className="w-8 h-8 text-teal-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra misión</h2>
          <p className="text-gray-600 leading-relaxed">
            En Tiyuy creemos que encontrar un hogar no debería ser complicado. Construimos tecnología que hace
            que comprar, vender y alquilar sea más humano, transparente y eficiente. Y lo hacemos con un equipo
            diverso, creativo y comprometido con generar impacto real.
          </p>
        </div>

        {/* Equipos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Equipos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEAMS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-3">{t.icon}</div>
                <h3 className="font-semibold text-gray-900">{t.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cultura */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-8 sm:p-10 text-white">
          <h2 className="text-2xl font-bold mb-4">Nuestra cultura</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Heart className="w-6 h-6" />, title: 'Empatía primero', desc: 'Diseñamos pensando en las personas, no solo en los procesos.' },
              { icon: <Lightbulb className="w-6 h-6" />, title: 'Curiosidad constante', desc: 'Cuestionamos, aprendemos y mejoramos todos los días.' },
              { icon: <Coffee className="w-6 h-6" />, title: 'Colaboración real', desc: 'El mejor trabajo surge cuando compartimos ideas y nos apoyamos.' },
            ].map((c, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-3">{c.icon}</div>
                <h3 className="font-semibold mb-1">{c.title}</h3>
                <p className="text-sm text-white/80">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Beneficios */}
        <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Beneficios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <Award className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proceso */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Proceso de selección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 font-bold text-sm flex items-center justify-center mx-auto mb-3">{s.n}</div>
                <h3 className="font-semibold text-gray-900 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vacantes */}
        <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">¿No hay vacantes abiertas?</h2>
          <p className="text-gray-300 text-sm max-w-lg mx-auto mb-6">
            Siempre estamos abiertos a conocer talento. Si crees que encajas en Tiyuy, envíanos tu CV y te
            tendremos en cuenta para futuras oportunidades.
          </p>
          <a href="mailto:tiyuy@saberoconsulting.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all">
            Enviar CV <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}