'use client';

import { useState, useEffect } from 'react';

export function BlogSection({ selectedRole = { color: 'text-brand' } }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: 'Usuarios Activos', value: 10000, suffix: '+' },
    { label: 'Propiedades', value: 500, suffix: '+' },
    { label: 'Soporte Continuo', value: 24, suffix: '/7' },
    { label: 'Satisfacción', value: 99, suffix: '%' },
  ];

  return (
    <div className="w-full max-w-8xl bg-white antialiased text-gray-900 selection:bg-brand/10 overflow-hidden">
      <section className="relative bg-gradient-to-b from-brand-light/20 to-white border-b border-gray-100 py-24 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-r from-brand/5 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative max-w-4xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand uppercase tracking-wider animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Proptech Revolution
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-none max-w-3xl mx-auto balance">
            Conectando Personas y <span className="text-brand relative inline-block">Espacios<span className="absolute bottom-1 left-0 w-full h-[6px] bg-brand/20 -skew-x-12" /></span>
          </h1>
          
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
            La forma más transparente, ágil y moderna de entender el sector inmobiliario hoy en día.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-20">
        
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-24">

          <article className="lg:col-span-4 group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand rounded-l-2xl transition-all duration-300 group-hover:w-2" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg">01</div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-brand transition-colors">
                Nuestra Visión
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Ofrecer una navegación intuitiva y datos 100% verificados para que buscar tu próximo inmueble sea un proceso impecable y libre de estrés.
              </p>
            </div>
          </article>

          <article className="lg:col-span-4 relative bg-gray-900 text-white rounded-2xl p-8 flex flex-col justify-center overflow-hidden group shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <p className="relative z-10 text-xl text-gray-200 leading-relaxed font-light">
              Somos la fuerza que <strong className="text-white font-bold underline decoration-brand decoration-2 underline-offset-4">simplifica</strong> el Real Estate. Una experiencia diseñada para ser <span className="text-brand font-bold">moderna, clara y accesible</span> para todos.
            </p>
          </article>

          <article className="lg:col-span-4 group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-1 h-full bg-brand rounded-r-2xl transition-all duration-300 group-hover:w-2" />
            <div className="space-y-4 lg:text-right">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-lg lg:ml-auto">02</div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-brand transition-colors">
                Comunidad Segura
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Construimos un ecosistema confiable donde tanto propietarios como agentes interactúan bajo reglas claras y total transparencia.
              </p>
            </div>
          </article>

        </main>
        <div className="flex justify-center items-center gap-4 my-16 opacity-40">
          <div className="h-[1px] w-12 bg-gray-300" />
          <div className="w-1.5 h-1.5 bg-brand rounded-full" />
          <div className="h-[1px] w-12 bg-gray-300" />
        </div>

        <section aria-label="Nuestras estadísticas" className="bg-brand-light/30 rounded-3xl p-10 md:p-12 border border-brand/5 backdrop-blur-sm relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y-0 md:divide-x divide-brand/10">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className={`space-y-2 text-center md:px-4 transition-all duration-700 transform ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="text-4xl sm:text-5xl font-black text-brand tracking-tight flex items-center justify-center">
                  <span className="tabular-nums scale-100 transition-transform duration-500">
                    {mounted ? stat.value.toLocaleString('es-ES') : '0'}
                  </span>
                  <span className="text-gray-900 font-extrabold ml-0.5">{stat.suffix}</span>
                </div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-widest max-w-[150px] mx-auto leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}