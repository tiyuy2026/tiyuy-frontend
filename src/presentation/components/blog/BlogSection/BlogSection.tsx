'use client';

import { useState, useEffect } from 'react';

export function BlogSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full bg-white selection:bg-[#4ade80]/10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        .blog-section * { font-family: 'Plus Jakarta Sans', sans-serif; }

        .brand-green { color: #4ade80; }
        .bg-brand-green { background-color: #4ade80; }

        .stat-item {
          position: relative;
          padding-bottom: 2rem;
        }
        .stat-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 24px;
          height: 2px;
          background: #4ade80;
          transition: width 0.4s ease;
        }
        .stat-item:hover::after {
          width: 100%;
        }

        .vision-block {
          transition: all 0.3s ease;
        }
        .vision-block:hover .vision-border {
          border-color: #4ade80;
        }
        .vision-block:hover .vision-label {
          letter-spacing: 0.25em;
        }

        .badge-dot {
          animation: pulse-dot 2.5s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeSlideUp 0.6s ease forwards; }
        .anim-2 { animation: fadeSlideUp 0.6s ease 0.15s forwards; opacity: 0; }
        .anim-3 { animation: fadeSlideUp 0.6s ease 0.3s forwards; opacity: 0; }
        .anim-4 { animation: fadeSlideUp 0.6s ease 0.45s forwards; opacity: 0; }

        .heading-xl {
          font-size: clamp(3rem, 8vw, 6rem);
          line-height: 0.92;
          letter-spacing: -0.03em;
          font-weight: 800;
        }

        .divider-line {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent);
        }

        .stat-value {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #0f172a;
          transition: color 0.3s ease;
        }
        .stat-item:hover .stat-value {
          color: #4ade80;
        }
      `}</style>

      <div className="blog-section max-w-7xl mx-auto px-6 lg:px-12 py-20 md:py-28">

        {/* ── CABECERA ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-14 pb-16 border-b border-gray-100 anim-1">

          {/* Left */}
          <div className="flex-1 max-w-3xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#4ade80]/6 border border-[#4ade80]/20 mb-10">
              <span className="badge-dot w-1.5 h-1.5 rounded-full bg-[#4ade80] shrink-0" />
              <span className="text-[#22c55e] text-[10px] font-bold uppercase tracking-[0.22em]">
                Plataforma Digital TIYUY
              </span>
            </div>

            {/* Heading */}
            <h1 className="heading-xl text-slate-900 mb-8">
              Conectando<br />
              <span className="text-[#4ade80]">Personas</span>{' '}
              <span className="text-slate-200">&</span>
              <br />
              Espacios.
            </h1>

            <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-light">
              La fuerza que{' '}
              <span className="text-slate-700 font-semibold">simplifica</span>{' '}
              el Real Estate. Experiencia{' '}
              <span className="text-slate-700 font-semibold">moderna, transparente y accesible</span>.
            </p>
          </div>

          {/* Right: Visión / Comunidad */}
          <div className="lg:w-[300px] space-y-10 anim-2">
            {[
              {
                label: 'Visión',
                text: 'Navegación intuitiva y datos verificados para que buscar inmuebles sea un proceso impecable.',
              },
              {
                label: 'Comunidad',
                text: 'Un ecosistema seguro donde propietarios y agentes interactúan con total transparencia.',
              },
            ].map((item) => (
              <div key={item.label} className="vision-block group">
                <p className="vision-label text-[10px] font-black uppercase tracking-[0.22em] text-[#4ade80] mb-3 transition-all duration-300">
                  {item.label}
                </p>
                <p className="vision-border text-slate-500 text-sm leading-relaxed pl-4 border-l-2 border-gray-100 transition-colors duration-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 anim-3">
          {[
            { label: 'Usuarios Activos', value: '10K+' },
            { label: 'Propiedades',      value: '500+' },
            { label: 'Soporte',          value: '24/7' },
            { label: 'Satisfacción',     value: '99%'  },
          ].map((stat, i) => (
            <div key={i} className="stat-item cursor-default">
              <div className="stat-value mb-2">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}