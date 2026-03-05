'use client';

import { useState, useEffect } from 'react';

export function BlogSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-white selection:bg-[#2563eb]/10 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        .blog-section * { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ── HERO ── */
        .hero-banner {
          background: linear-gradient(135deg, #2563eb 0%, #1d8fd8 40%, #0ea89e 75%, #4ade80 100%);
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          padding: 2.5rem 2rem 4rem;
          text-align: center;
        }
        .hero-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.07) 0%, transparent 65%);
        }
        .hero-banner::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 40px;
          background: white;
          clip-path: ellipse(52% 100% at 50% 100%);
        }

        /* ── HEADING ── */
        .heading-row {
          font-size: clamp(2.8rem, 6vw, 5.5rem);
          line-height: 1;
          letter-spacing: -0.03em;
          font-weight: 800;
        }

        /* ── STATS ── */
        .stat-item { position: relative; }
        .stat-item::after {
          content: '';
          position: absolute;
          bottom: -10px; left: 50%;
          transform: translateX(-50%);
          width: 20px; height: 2px;
          background: linear-gradient(90deg, #2563eb, #4ade80);
          transition: width 0.4s ease;
        }
        .stat-item:hover::after { width: 70%; }

        .stat-value {
          font-size: clamp(2.4rem, 4vw, 3.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #0f172a;
          transition: all 0.3s ease;
        }
        .stat-item:hover .stat-value {
          background: linear-gradient(135deg, #2563eb, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── VISION ── */
        .vision-block { transition: all 0.3s ease; }
        .vision-block:hover .vision-label { letter-spacing: 0.25em; }

        .vision-label-gradient {
          background: linear-gradient(135deg, #2563eb, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeSlideUp 0.5s ease forwards; }
        .anim-2 { animation: fadeSlideUp 0.5s ease 0.1s forwards; opacity: 0; }
        .anim-3 { animation: fadeSlideUp 0.5s ease 0.2s forwards; opacity: 0; }
        .anim-4 { animation: fadeSlideUp 0.5s ease 0.3s forwards; opacity: 0; }
      `}</style>

      {/* ══ HERO ══ */}
      <div className="hero-banner anim-1">
        <div className="relative z-10 flex flex-wrap items-baseline justify-center gap-x-5 px-4">
          <span className="heading-row text-white">Conectando</span>
          <span className="heading-row text-white/90">Personas</span>
          <span className="heading-row text-white/40">&</span>
          <span className="heading-row text-white">Espacios.</span>
        </div>
      </div>

      {/* ══ CONTENIDO: 3 columnas ══ */}
      <div className="blog-section flex-1 flex flex-col justify-evenly px-8 lg:px-16 py-6 max-w-7xl w-full mx-auto">

        {/* Fila principal: izq | centro | der */}
        <div className="flex items-start justify-between gap-8 anim-2">

          {/* IZQUIERDA: Visión */}
          <div className="vision-block flex-1 max-w-xs">
            <p className="vision-label vision-label-gradient text-[11px] font-black uppercase tracking-[0.22em] mb-3">
              Visión
            </p>
            <div className="w-8 h-0.5 mb-4 rounded-full"
              style={{ background: 'linear-gradient(90deg, #2563eb, #4ade80)' }} />
            <p className="text-slate-500 text-base leading-relaxed">
              Navegación intuitiva y datos verificados para que buscar inmuebles sea un proceso impecable.
            </p>
          </div>

          {/* CENTRO: Descripción */}
          <div className="flex-1 max-w-sm text-center anim-3">
            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed font-light">
              La fuerza que{' '}
              <span className="text-slate-800 font-semibold">simplifica</span>{' '}
              el Real Estate. Experiencia{' '}
              <span className="text-slate-800 font-semibold">moderna, transparente y accesible</span>.
            </p>
          </div>

          {/* DERECHA: Comunidad */}
          <div className="vision-block flex-1 max-w-xs text-right">
            <p className="vision-label vision-label-gradient text-[11px] font-black uppercase tracking-[0.22em] mb-3">
              Comunidad
            </p>
            <div className="w-8 h-0.5 mb-4 rounded-full ml-auto"
              style={{ background: 'linear-gradient(90deg, #2563eb, #4ade80)' }} />
            <p className="text-slate-500 text-base leading-relaxed">
              Un ecosistema seguro donde propietarios y agentes interactúan con total transparencia.
            </p>
          </div>

        </div>

        {/* Divisor */}
        <div className="w-full h-px anim-3"
          style={{ background: 'linear-gradient(90deg, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent)' }} />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 text-center anim-4">
          {[
            { label: 'Usuarios Activos', value: '10K+' },
            { label: 'Propiedades',      value: '500+' },
            { label: 'Soporte',          value: '24/7' },
            { label: 'Satisfacción',     value: '99%'  },
          ].map((stat, i) => (
            <div key={i} className="stat-item cursor-default pb-5">
              <div className="stat-value mb-2">{stat.value}</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
