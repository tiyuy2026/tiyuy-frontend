'use client';

import { useState, useEffect } from 'react';

interface SelectedRole {
  color?: string;
}

interface HeroSectionProps {
  selectedRole?: SelectedRole;
}

export function HeroSection({ selectedRole = { color: 'text-[var(--brand-primary)]' } }: HeroSectionProps) {
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
    <div className="w-full bg-[var(--bg-primary)] antialiased text-[var(--text-primary)] selection:bg-[var(--brand-primary)]/10 overflow-hidden flex flex-col items-center justify-center">
      
      <section className="relative w-full max-w-8xl bg-gradient-to-b from-[var(--brand-primary)]/5 via-transparent to-transparent border-b border-[var(--border-light)] pt-24 pb-20 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-r from-[var(--brand-primary)]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center space-y-8">
          <div className="space-y-4 w-full flex flex-col items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] uppercase tracking-wider mx-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
              Proptech Revolution
            </span>
            
            <h1 className="text-4xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tight leading-none max-w-3xl mx-auto text-balance text-center">
              Conectando Personas y <span className="text-[var(--brand-primary)] relative inline-block">Espacios<span className="absolute bottom-1 left-0 w-full h-[6px] bg-[var(--brand-primary)]/20 -skew-x-12" /></span>
            </h1>
          </div>
          
          <p className="text-[var(--text-secondary)] text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed text-center">
            La forma más transparente, ágil y moderna de entender el sector inmobiliario hoy en día.
          </p>

          <div className="pt-10 w-full max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 divide-y-0 md:divide-x divide-[var(--border-light)] border-t border-[var(--border-light)]/60 pt-10 items-center justify-center">
              {stats.map((stat, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col items-center justify-center text-center w-full px-2 transition-all duration-700 transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="text-3xl sm:text-4xl font-black text-[var(--brand-primary)] tracking-tight flex items-baseline justify-center w-full text-center">
                    <span className="tabular-nums">
                      {mounted ? stat.value.toLocaleString('es-ES') : '0'}
                    </span>
                    <span className="text-[var(--text-primary)] font-black text-xl sm:text-2xl ml-0.5 relative -top-[2px]">
                      {stat.suffix}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] sm:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest max-w-[140px] text-center leading-tight opacity-90 mx-auto">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}