'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  Building, 
  ShieldCheck,
  Sparkles,
  Heart,
  CheckCircle,
  ArrowRight,
  FileText,
  DollarSign,
  Zap,
  Eye,
  Shield,
  Users2,
  Lightbulb,
  HeartHandshake
} from 'lucide-react';

export default function AboutTiyuyContent() {
  const [activeSection, setActiveSection] = useState<string>('hero');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">

      {/* HERO SECTION */}
      <section 
        id="hero" 
        onMouseEnter={() => setActiveSection('hero')}
        className="relative min-h-[75vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop')` 
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        
        <div className="relative max-w-8xl mx-auto px-8 xl:px-16 text-center z-10 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              TIYUY - Transformando el
              <span className={`block mt-1 transition-colors duration-500 ${activeSection === 'hero' ? 'text-[var(--brand-primary)]' : 'text-white'}`}>
                mercado inmobiliario peruano
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed font-light max-w-2xl mx-auto">
              El equipo que nació de la frustración con las plataformas tradicionales
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => scrollToSection('compromiso')}
                className="w-full sm:w-auto bg-[var(--brand-primary)] text-[var(--bg-primary)] px-6 py-3.5 rounded-xl text-base font-semibold shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 hover:opacity-95"
              >
                Únete al equipo TIYUY
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link 
                href="/"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md px-6 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 text-center"
              >
                Explora propiedades
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MISIÓN, VISIÓN Y VALORES */}
      <section 
        id="mision-vision-valores" 
        onMouseEnter={() => setActiveSection('mision-vision-valores')}
        className="relative py-24 overflow-hidden bg-[var(--bg-secondary)]"
      >
        <div className="relative max-w-9xl mx-auto px-8 xl:px-16">
          {/* Título de sección */}
          <div className="text-center mb-16">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 transition-all duration-300 ${
              activeSection === 'mision-vision-valores' 
                ? 'bg-[var(--brand-primary)] text-[var(--bg-primary)] shadow-sm' 
                : 'bg-[var(--bg-card)] text-[var(--brand-primary)] border border-[var(--border-light)]'
            }`}>
              Nuestro ADN
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
              Lo que nos <span className="text-[var(--brand-primary)]">impulsa</span> cada día
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-medium">
              Los pilares que guían nuestra misión de transformar el mercado inmobiliario peruano
            </p>
          </div>

          {/* Misión y Visión - Grid 2 columnas */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Misión */}
            <div className={`group relative bg-[var(--bg-card)] rounded-3xl p-8 lg:p-10 border transition-all duration-500 overflow-hidden ${
              activeSection === 'mision-vision-valores' ? 'border-[var(--brand-primary)] shadow-md' : 'border-[var(--border-light)] shadow-xs'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--brand-primary)]"></div>
              
              <div className="relative">
                <div className="w-16 h-16 bg-[var(--brand-primary)] text-[var(--bg-primary)] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Zap className="w-8 h-8" />
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-4">Nuestra Misión</h3>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6 font-medium">
                  Democratizar el acceso al mercado inmobiliario en Perú, brindando una plataforma 
                  <span className="font-semibold text-[var(--brand-primary)]"> intuitiva, transparente y accesible</span> donde cualquier persona 
                  pueda publicar, buscar y gestionar propiedades sin barreras técnicas ni costos prohibitivos.
                </p>

                <div className="flex flex-wrap gap-2">
                  {['Accesible', 'Transparente', 'Inclusivo'].map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--brand-primary)] rounded-full text-xs font-bold border border-[var(--border-light)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Visión */}
            <div className={`group relative bg-[var(--bg-card)] rounded-3xl p-8 lg:p-10 border transition-all duration-500 overflow-hidden ${
              activeSection === 'mision-vision-valores' ? 'border-[var(--brand-primary)] shadow-md' : 'border-[var(--border-light)] shadow-xs'
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--brand-primary)]"></div>
              
              <div className="relative">
                <div className="w-16 h-16 bg-[var(--brand-primary)] text-[var(--bg-primary)] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <Eye className="w-8 h-8" />
                </div>

                <h3 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-4">Nuestra Visión</h3>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6 font-medium">
                  Ser la plataforma líder de bienes raíces en Latinoamérica, reconocida por 
                  <span className="font-semibold text-[var(--brand-primary)]"> revolucionar la forma en que las personas encuentran su hogar ideal </span> 
                  y por empoderar a propietarios y agentes con herramientas tecnológicas de vanguardia.
                </p>

                <div className="flex flex-wrap gap-2">
                  {['Líder', 'Innovador', 'Latam'].map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--brand-primary)] rounded-full text-xs font-bold border border-[var(--border-light)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Valores - Grid 4 columnas */}
          <div className="mt-16">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Nuestros Valores</h3>
              <p className="text-[var(--text-secondary)] max-w-xl mx-auto font-medium">
                Los principios que nos definen y guían cada decisión que tomamos
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Shield, title: 'Confianza', desc: 'Construimos relaciones transparentes y seguras con cada usuario' },
                { icon: Users2, title: 'Inclusión', desc: 'Hacemos el mercado inmobiliario accesible para todos los peruanos' },
                { icon: Lightbulb, title: 'Innovación', desc: 'Creamos soluciones tecnológicas que transforman la experiencia inmobiliaria' },
                { icon: HeartHandshake, title: 'Compromiso', desc: 'Nos apasiona ayudar a cada persona a encontrar su hogar ideal' }
              ].map((value, index) => (
                <div 
                  key={index} 
                  className={`group/card relative bg-[var(--bg-card)] rounded-2xl p-6 border transition-all duration-500 hover:-translate-y-1 overflow-hidden ${
                    activeSection === 'mision-vision-valores' ? 'border-[var(--brand-primary)]/40 shadow-md' : 'border-[var(--border-light)] shadow-xs'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 shadow-xs ${
                      activeSection === 'mision-vision-valores' 
                        ? 'bg-[var(--brand-primary)] text-[var(--bg-primary)]' 
                        : 'bg-[var(--bg-secondary)] text-[var(--brand-primary)] border border-[var(--border-light)]'
                    }`}>
                      <value.icon className="w-7 h-7" />
                    </div>

                    <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover/card:text-[var(--brand-primary)] transition-colors duration-300">
                      {value.title}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                      {value.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN PROBLEMA */}
      <section 
        id="problema" 
        onMouseEnter={() => setActiveSection('problema')}
        className="py-20 bg-[var(--bg-primary)] border-t border-[var(--border-light)]"
      >
        <div className="max-w-9xl mx-auto px-8 xl:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">
                Por qué el mercado inmobiliario está roto
              </h2>
              
              <div className="space-y-4">
                {[
                  'Plataformas cobran montos altos solo por publicar un cuarto',
                  'Falta de confianza entre dueños y roomies',
                  'Proceso complicado - solo expertos pueden publicar',
                  'Gigantes impersonales ignoran al dueño pequeño'
                ].map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1 transition-all duration-300 ${activeSection === 'problema' ? 'bg-red-500 text-white scale-110' : 'bg-red-500/10 text-red-500'}`}>
                      <span className="text-sm font-bold">✕</span>
                    </div>
                    <p className="text-lg text-[var(--text-secondary)] font-medium">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className={`rounded-2xl p-4 transition-colors duration-500 border ${activeSection === 'problema' ? 'bg-[var(--bg-secondary)] border-[var(--brand-primary)]' : 'bg-[var(--bg-card)] border-[var(--border-light)]'}`}>
                <div 
                  className="aspect-video bg-cover bg-center rounded-xl flex items-end p-6 relative overflow-hidden border border-[var(--border-light)] shadow-xs"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop')` 
                  }}
                >
                  <p className="text-[var(--text-primary)] font-bold relative z-10 text-sm bg-[var(--bg-card)] border border-[var(--border-light)] px-3 py-1.5 rounded-lg shadow-xs">
                    Frustración buscando y publicando propiedades de forma tradicional
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HISTORIA DEL EQUIPO TIYUY */}
      <section 
        id="historia" 
        onMouseEnter={() => setActiveSection('historia')}
        className="py-20 bg-[var(--bg-primary)] border-t border-[var(--border-light)]"
      >
        <div className="max-w-9xl mx-auto px-8 xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              El equipo que decidió cambiarlo todo
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`rounded-2xl p-4 transition-colors duration-500 border ${activeSection === 'historia' ? 'bg-[var(--bg-secondary)] border-[var(--brand-primary)]' : 'bg-[var(--bg-card)] border-[var(--border-light)]'}`}>
              <div 
                className="aspect-video bg-cover bg-center rounded-xl flex items-end p-4 relative overflow-hidden border border-[var(--border-light)] shadow-xs"
                style={{ 
                  backgroundImage: `url('https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1600&auto=format&fit=crop')` 
                }}
              >
                <p className="text-[var(--text-primary)] font-bold relative z-10 text-xs md:text-sm bg-[var(--bg-card)] border border-[var(--border-light)] px-3 py-1.5 rounded-lg shadow-xs">
                  Equipo TIYUY trabajando en Lima
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-lg text-[var(--text-primary)] mb-6 leading-relaxed font-semibold">
                En TIYUY entendimos que el problema no era técnico, era humano. 
                Creamos una plataforma donde <span className="font-black text-[var(--brand-primary)]">CUALQUIER PERSONA</span> puede publicar su propiedad en 5 minutos.
              </p>
              
              <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed font-medium">
                Nuestro equipo de desarrolladores peruanos diseñó 100 tablas especializadas para:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, title: 'Roommates seguros', desc: 'Verificación completa' },
                  { icon: FileText, title: 'Lotes transparentes', desc: 'Información clara' },
                  { icon: Heart, title: 'Dueños pequeños sin barreras', desc: 'Acceso universal' },
                  { icon: Heart, title: 'Soporte Directo', desc: 'Trato preferencial horizontal' }
                ].map((item, index) => (
                  <div key={index} className={`flex items-center space-x-4 bg-[var(--bg-card)] p-4 border rounded-xl shadow-xs transition-all duration-300 ${activeSection === 'historia' ? 'border-[var(--brand-primary)] shadow-sm' : 'border-[var(--border-light)]'}`}>
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300 border ${activeSection === 'historia' ? 'bg-[var(--brand-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-[var(--bg-secondary)] text-[var(--brand-primary)] border-[var(--border-light)]'}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)] text-sm sm:text-base">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* A QUIÉN AYUDAMOS */}
      <section 
        id="ayudamos" 
        onMouseEnter={() => setActiveSection('ayudamos')}
        className="py-20 bg-[var(--bg-primary)] border-t border-[var(--border-light)]"
      >
        <div className="max-w-9xl mx-auto px-8 xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              A quién ayudamos
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {[
              {
                icon: Home,
                title: 'Dueños pequeños',
                description: 'Un usuario común solo puede publicar una propiedad completamente gratis.',
                link: '/my-properties/new'
              },
              {
                icon: Users,
                title: 'Familias buscando hogar',
                description: 'Propiedades estrictamente verificadas y roomies con validación de identidad real.',
                link: '/rent/departamentos/lima'
              },
              {
                icon: Building,
                title: 'Agentes independientes',
                description: 'Olvídate de comisiones abusivas. Publica un inventario ilimitado mediante herramientas estratégicas.',
                link: '/plans'
              }
            ].map((segment, index) => (
              <div key={index} className="group flex">
                <div className={`bg-[var(--bg-card)] rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col w-full shadow-xs hover:shadow-md ${activeSection === 'ayudamos' ? 'border-[var(--brand-primary)]' : 'border-[var(--border-light)]'}`}>
                  <div className="h-1.5 bg-[var(--brand-primary)]"></div>
                  <div className="p-8 flex flex-col flex-grow">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 border ${activeSection === 'ayudamos' ? 'bg-[var(--brand-primary)] text-[var(--bg-primary)] border-transparent scale-105' : 'bg-[var(--bg-secondary)] text-[var(--brand-primary)] border-[var(--border-light)]'}`}>
                      <segment.icon className="w-7 h-7" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{segment.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-grow font-medium">{segment.description}</p>
                    
                    <Link 
                      href={segment.link}
                      className="mt-6 pt-4 border-t border-[var(--border-light)] text-sm font-bold text-[var(--brand-primary)] hover:underline underline-offset-4 inline-flex items-center gap-1.5"
                    >
                      <span>Conocer más</span> <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUESTRA PROPUESTA ÚNICA */}
      <section 
        id="propuesta" 
        onMouseEnter={() => setActiveSection('propuesta')}
        className="py-20 bg-[var(--bg-primary)] border-t border-[var(--border-light)]"
      >
        <div className="max-w-9xl mx-auto px-8 xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Lo que nos hace diferentes
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Publicación en 5 minutos',
                description: 'Cualquier persona puede publicar sin experiencia técnica'
              },
              {
                icon: DollarSign,
                title: 'Primeros 2 gratis',
                description: 'Publica tus primeras 2 propiedades sin costo alguno'
              },
              {
                icon: CheckCircle,
                title: 'Verificación completa',
                description: 'Roomies verificados y propiedades validadas'
              }
            ].map((feature, index) => (
              <div key={index} className={`text-center bg-[var(--bg-card)] p-6 rounded-xl border shadow-xs transition-all duration-300 ${activeSection === 'propuesta' ? 'border-[var(--brand-primary)]' : 'border-[var(--border-light)]'}`}>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300 border ${activeSection === 'propuesta' ? 'bg-[var(--brand-primary)] text-[var(--bg-primary)] border-transparent' : 'bg-[var(--bg-secondary)] text-[var(--brand-primary)] border-[var(--border-light)]'}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPROMISO TIYUY */}
      <section 
        id="compromiso" 
        onMouseEnter={() => setActiveSection('compromiso')}
        className="relative py-20 bg-cover bg-center bg-no-repeat border-t border-[var(--border-light)]"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop')` 
        }}
      >
        <div className="absolute inset-0 bg-[var(--bg-primary)] z-0 opacity-95"></div>

        <div className="relative max-w-4xl mx-auto px-8 xl:px-16 text-center z-10">
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-8 tracking-tight">
            Nuestro compromiso con Perú
          </h2>
          
          <div className={`bg-[var(--bg-card)] border rounded-2xl p-8 mb-8 shadow-sm transition-all duration-500 ${activeSection === 'compromiso' ? 'border-[var(--brand-primary)] shadow-md scale-[1.01]' : 'border-[var(--border-light)]'}`}>
            <p className="text-xl text-[var(--text-primary)] leading-relaxed mb-6 font-light">
              TIYUY no es otra app. Es la plataforma que el mercado peruano merece:
              Fácil de usar, transparente, justa. Hecha por peruanos para peruanos.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {['Confiable', 'Humano', 'Accesible', 'Seguro', 'Transparente'].map((value, index) => (
                <span key={index} className={`border px-4 py-1.5 rounded-full text-xs font-bold shadow-xs transition-all duration-300 ${
                  activeSection === 'compromiso' 
                    ? 'bg-[var(--bg-secondary)] border-[var(--brand-primary)] text-[var(--brand-primary)]' 
                    : 'bg-[var(--bg-primary)] border-[var(--border-light)] text-[var(--text-secondary)]'
                }`}>
                  {value}
                </span>
              ))}
            </div>
          </div>
          
          <Link 
            href="/contact"
            className="bg-[var(--brand-primary)] text-[var(--bg-primary)] px-8 py-4 rounded-xl text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-[1.02] inline-flex items-center gap-2 hover:opacity-95"
          >
            Forma parte de TIYUY
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}