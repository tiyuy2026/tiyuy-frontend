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
  DollarSign
} from 'lucide-react';

export default function AboutTiyuyContent() {
  const [activeSection, setActiveSection] = useState<string>('hero');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      <section 
        id="hero" 
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop')` 
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              TIYUY - Transformando el
              <span className="block text-brand mt-2">
                mercado inmobiliario peruano
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
              El equipo que nació de la frustración con las plataformas tradicionales
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => scrollToSection('compromiso')}
                className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                Únete al equipo TIYUY
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link 
                href="/"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 text-center"
              >
                Explora propiedades
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="problema" className="py-20 bg-background border-t border-gray-200/20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6 tracking-tight">
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
                    <div className="flex-shrink-0 w-6 h-6 bg-red-500/10 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-500 text-sm font-bold">✕</span>
                    </div>
                    <p className="text-lg text-foreground/80">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-brand-light border border-brand/10 rounded-2xl p-4">
                <div 
                  className="aspect-video bg-cover bg-center rounded-xl flex items-end p-6 relative overflow-hidden border border-gray-200 shadow-sm"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop')` 
                  }}
                >
                  <p className="text-foreground font-semibold relative z-10 text-sm bg-background border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                    Frustración buscando y publicando propiedades de forma tradicional
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPÍTULO 2: HISTORIA DEL EQUIPO TIYUY - CUADRÍCULA 2x2 LIMPIA */}
      <section id="historia" className="py-20 bg-background border-t border-gray-200/20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">
              El equipo que decidió cambiarlo todo
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenedor de la Imagen sin degradados negros */}
            <div className="bg-brand-light border border-brand/10 rounded-2xl p-4">
              <div 
                className="aspect-video bg-cover bg-center rounded-xl flex items-end p-4 relative overflow-hidden border border-gray-200 shadow-sm"
                style={{ 
                  backgroundImage: `url('https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1600&auto=format&fit=crop')` 
                }}
              >
                <p className="text-foreground font-semibold relative z-10 text-xs md:text-sm bg-background border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                  Equipo TIYUY trabajando en Lima
                </p>
              </div>
            </div>
            
            {/* Textos y Grid 2x2 */}
            <div>
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                En TIYUY entendimos que el problema no era técnico, era humano. 
                Creamos una plataforma donde <span className="font-bold text-brand">CUALQUIER PERSONA</span> puede publicar su propiedad en 5 minutos.
              </p>
              
              <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
                Nuestro equipo de desarrolladores peruanos diseñó 100 tablas especializadas para:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, title: 'Roommates seguros', desc: 'Verificación completa' },
                  { icon: FileText, title: 'Lotes transparentes', desc: 'Información clara' },
                  { icon: Heart, title: 'Dueños pequeños sin barreras', desc: 'Acceso universal' },
                  { icon: Heart, title: 'Dueños pequeños sin barreras', desc: 'Acceso universal' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 bg-background p-4 border border-gray-200/20 rounded-xl shadow-sm">
                    <div className="flex-shrink-0 w-12 h-12 bg-brand-light rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm sm:text-base">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-foreground/60">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ayudamos" className="py-20 bg-background border-t border-gray-200/20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">
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
                <div className="bg-background rounded-2xl border border-gray-200/20 hover:border-brand transition-all duration-300 overflow-hidden flex flex-col w-full shadow-sm hover:shadow-md">
                  <div className="h-1.5 bg-brand"></div>
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                      <segment.icon className="w-7 h-7 text-brand" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-3">{segment.title}</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed flex-grow">{segment.description}</p>
                    
                    <Link 
                      href={segment.link}
                      className="mt-6 pt-4 border-t border-gray-200/20 text-sm font-bold text-brand hover:text-brand-hover transition-colors inline-flex items-center gap-1"
                    >
                      Conocer más <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUESTRA PROPUESTA ÚNICA */}
      <section id="propuesta" className="py-20 bg-background border-t border-gray-200/20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground tracking-tight">
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
              <div key={index} className="text-center bg-background p-6 rounded-xl border border-gray-200/20 shadow-sm">
                <div className="w-14 h-14 bg-brand-light rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPROMISO TIYUY - IMAGEN URBANÍSTICA DE FONDO (> 1600px) */}
      <section 
        id="compromiso" 
        className="relative py-20 bg-cover bg-center bg-no-repeat border-t border-gray-200/20"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1920&auto=format&fit=crop')` 
        }}
      >
        {/* Capa de fondo blanco puro sólido garantizado para no ensuciar el diseño */}
        <div className="absolute inset-0 bg-[#ffffff] z-0"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-4xl font-bold text-foreground mb-8 tracking-tight">
            Nuestro compromiso con Perú
          </h2>
          
          <div className="bg-background border border-gray-200/20 rounded-2xl p-8 mb-8 shadow-sm">
            <p className="text-xl text-foreground leading-relaxed mb-6 font-light">
              TIYUY no es otra app. Es la plataforma que el mercado peruano merece:
              Fácil de usar, transparente, justa. Hecha por peruanos para peruanos.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {['Confiable', 'Humano', 'Accesible', 'Seguro', 'Transparente'].map((value, index) => (
                <span key={index} className="bg-background border border-gray-200/20 text-foreground px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                  {value}
                </span>
              ))}
            </div>
          </div>
          
          <Link 
            href="/contact"
            className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-md transition-all duration-300 transform hover:scale-[1.02] inline-flex items-center gap-2"
          >
            Forma parte de TIYUY
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}