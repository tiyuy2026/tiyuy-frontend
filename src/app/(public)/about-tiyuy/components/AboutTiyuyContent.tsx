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
  Users as UserGroup,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* HERO PRINCIPAL */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              TIYUY - Transformando el
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                mercado inmobiliario peruano
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              El equipo que nació de la frustración con las plataformas tradicionales
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => scrollToSection('compromiso')}
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Únete al equipo TIYUY
                <ArrowRight className="inline-block w-5 h-5 ml-2" />
              </button>
              <Link 
                href="/"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-300"
              >
                Explora propiedades
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* CAPÍTULO 1: EL PROBLEMA */}
      <section id="problema" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
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
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 text-sm font-bold">✕</span>
                    </div>
                    <p className="text-lg text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-2xl p-8">
                <div className="aspect-video bg-white rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Familia joven buscando alquiler frustrada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPÍTULO 2: HISTORIA DEL EQUIPO TIYUY */}
      <section id="historia" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              El equipo que decidió cambiarlo todo
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="aspect-video bg-gradient-to-r from-blue-100 to-teal-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-16 h-16 bg-gray-300 rounded-full"></div>
                    ))}
                  </div>
                  <p className="text-gray-600">Equipo TIYUY trabajando</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                En TIYUY entendimos que el problema no era técnico, era humano. 
                Creamos una plataforma donde <span className="font-bold text-blue-600">CUALQUIER PERSONA</span> puede publicar su propiedad en 5 minutos.
              </p>
              
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Nuestro equipo de desarrolladores peruanos diseñó 100 tablas especializadas para:
              </p>
              
              <div className="space-y-4">
                {[
                  {icon: ShieldCheck, title: 'Roommates seguros', desc: 'Verificación completa' },
                  {icon: FileText, title: 'Lotes transparentes', desc: 'Información clara' },
                  {icon: Heart, title: 'Dueños pequeños sin barreras', desc: 'Acceso universal' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPÍTULO 3: A QUIÉN AYUDAMOS */}
      <section id="ayudamos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              A quién ayudamos
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Home,
                title: 'Dueños pequeños',
                description: 'Un usuario común solo puede publicar una propiedad gratis',
                color: 'from-blue-500 to-blue-600',
                link: '/my-properties/new'
              },
              {
                icon: Users,
                title: 'Familias buscando hogar',
                description: 'Propiedades verificadas, roomies con identidad',
                color: 'from-teal-500 to-teal-600',
                link: '/rent/departamentos/lima'
              },
              {
                icon: Building,
                title: 'Agentes independientes',
                description: 'Sin comisiones abusivas, publica ilimitado',
                color: 'from-purple-500 to-purple-600',
                link: '/plans'
              }
            ].map((segment, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${segment.color}`}></div>
                  <div className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${segment.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <segment.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{segment.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{segment.description}</p>
                    
                    <Link 
                      href={segment.link}
                      className={`mt-6 text-sm font-semibold bg-gradient-to-r ${segment.color} text-transparent bg-clip-text hover:opacity-80 transition-opacity inline-block`}
                    >
                      Conocer más →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUESTRA PROPUESTA ÚNICA */}
      <section id="propuesta" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
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
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPROMISO TIYUY */}
      <section id="compromiso" className="py-20 bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Nuestro compromiso con Perú
          </h2>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <p className="text-xl text-white leading-relaxed mb-6">
              TIYUY no es otra app. Es la plataforma que el mercado peruano merece:
              Fácil de usar, transparente, justa. Hecha por peruanos para peruanos.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {['Confiable', 'Humano', 'Accesible', 'Seguro', 'Transparente'].map((value, index) => (
                <span key={index} className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {value}
                </span>
              ))}
            </div>
          </div>
          
          <Link 
            href="/"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center"
          >
            Forma parte de TIYUY
            <ArrowRight className="inline-block w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      </div>
  );
}
