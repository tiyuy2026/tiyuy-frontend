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
    <div className="min-h-screen bg-[var(--bg-secondary)] antialiased text-[var(--text-primary)] selection:bg-[var(--brand-primary)]/10">
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-16 py-20 sm:py-28 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-[var(--brand-primary)]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
          
          <div className="max-w-3xl relative z-10 flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
              <Briefcase className="w-3.5 h-3.5" /> Carrera
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-[var(--text-primary)] text-balance">
              Trabaja con <span className="text-[var(--brand-primary)] relative inline-block">nosotros<span className="absolute bottom-1 left-0 w-full h-[6px] bg-[var(--brand-primary)]/20 -skew-x-12" /></span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] mt-6 leading-relaxed font-medium">
              Construye el futuro del mercado inmobiliario desde el primer día.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-16 py-12 sm:py-16 space-y-12 sm:space-y-16">
        {/* Misión */}
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 sm:p-12 max-w-3xl mx-auto text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--brand-primary)]/5 blur-3xl rounded-full" />
          <Sparkles className="w-10 h-10 text-[var(--brand-primary)] mx-auto mb-6 relative z-10" />
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-6 relative z-10">Nuestra misión</h2>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-medium relative z-10">
            En Tiyuy creemos que encontrar un hogar no debería ser complicado. Construimos tecnología que hace
            que comprar, vender y alquilar sea más humano, transparente y eficiente. Y lo hacemos con un equipo
            diverso, creativo y comprometido con generar impacto real.
          </p>
        </div>

        {/* Equipos */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] text-center mb-8">Equipos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAMS.map((t, i) => (
              <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[var(--brand-primary)]/30 transition-all duration-300 p-6 group">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--brand-primary)] mb-4 border border-[var(--border-light)] group-hover:bg-[var(--brand-primary)]/10 transition-colors">{t.icon}</div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand-primary)] transition-colors">{t.name}</h3>
                <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cultura */}
        <div className="bg-[var(--brand-primary)] rounded-3xl p-8 sm:p-12 text-[var(--bg-primary)] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-3xl rounded-full pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-black mb-8 relative z-10 text-white">Nuestra cultura</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            {[
              { icon: <Heart className="w-6 h-6" />, title: 'Empatía primero', desc: 'Diseñamos pensando en las personas, no solo en los procesos.' },
              { icon: <Lightbulb className="w-6 h-6" />, title: 'Curiosidad constante', desc: 'Cuestionamos, aprendemos y mejoramos todos los días.' },
              { icon: <Coffee className="w-6 h-6" />, title: 'Colaboración real', desc: 'El mejor trabajo surge cuando compartimos ideas y nos apoyamos.' },
            ].map((c, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 text-white">{c.icon}</div>
                <h3 className="font-bold mb-2 text-white">{c.title}</h3>
                <p className="text-sm text-white/90 font-medium leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Beneficios */}
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-light)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-8">Beneficios</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/30 transition-colors">
                <Award className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0" />
                <span className="text-sm text-[var(--text-secondary)] font-bold">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Proceso */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] text-center mb-8">Proceso de selección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 text-center hover:border-[var(--brand-primary)]/30 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-black text-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">{s.n}</div>
                <h3 className="font-bold text-[var(--text-primary)] text-sm mb-2">{s.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vacantes */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-8 sm:p-12 text-center border border-[var(--border-light)] shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden mt-12">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[var(--brand-primary)]/5 blur-3xl rounded-full" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-4">¿No hay vacantes abiertas?</h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base font-medium max-w-lg mx-auto mb-8 leading-relaxed">
              Siempre estamos abiertos a conocer talento. Si crees que encajas en Tiyuy, envíanos tu CV y te
              tendremos en cuenta para futuras oportunidades.
            </p>
            <a href="mailto:tiyuy@saberoconsulting.com"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--brand-primary)] text-[var(--bg-primary)] font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm">
              Enviar CV <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}