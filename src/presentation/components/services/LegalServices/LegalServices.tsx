'use client';

import Link from 'next/link';
import { FileText, PiggyBank, ExternalLink, Scale, ChevronDown } from 'lucide-react';

export function LegalServices() {
  return (
    <div className="w-full py-16 bg-[var(--bg-primary)] antialiased text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="text-center mb-16 border-b-2 border-gray-200 dark:border-gray-800 pb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)] mb-3">
            Garantía & Soporte Legal
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Servicios Legales y Registrales
          </h1>
          <p className="mt-3 text-lg text-[var(--text-secondary)] max-w-3xl mx-auto font-medium">
            Acceso a plataformas oficiales para trámites inmobiliarios y validaciones en el Perú.
          </p>
        </header>

        {/* Sección 1: SUNARP */}
        <section className="mb-12">
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-8 border-b-2 border-gray-200 dark:border-gray-800 pb-6">
              <div className="w-14 h-14 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  SUNARP - Registros Públicos
                </h2>
                <p className="text-[var(--text-secondary)] text-sm font-medium mt-0.5">
                  Superintendencia Nacional de los Registros Públicos
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 transition-colors shadow-md">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Búsqueda de Partidas</h3>
                  <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-4">Consultar registros de propiedades</p>
                </div>
                <Link 
                  href="https://www.sunarp.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
                >
                  <span>Buscar en SUNARP</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 transition-colors shadow-md">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Certificados de Propiedad</h3>
                  <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-4">Obtener certificados registrales públicos</p>
                </div>
                <Link 
                  href="https://www.sunarp.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
                >
                  <span>Solicitar certificado</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 transition-colors shadow-md">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Trámites en Línea</h3>
                  <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-4">Plataforma de servicios virtuales SUNARP</p>
                </div>
                <Link 
                  href="https://www.sunarp.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
                >
                  <span>Acceso virtual</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 2: Guía Crédito Hipotecario */}
        <section className="mb-12">
          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-8 border-b-2 border-gray-200 dark:border-gray-800 pb-6">
              <div className="w-14 h-14 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
                <PiggyBank className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  Guía de Crédito Hipotecario
                </h2>
                <p className="text-[var(--text-secondary)] text-sm font-medium mt-0.5">
                  Información para obtener tu crédito hipotecario calificado
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 transition-colors shadow-md">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Requisitos</h3>
                  <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-4">Documentos y condiciones necesarias</p>
                </div>
                <Link 
                  href="https://www.sbs.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
                >
                  <span>Ver requisitos</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 transition-colors shadow-md">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Tasas de Interés</h3>
                  <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-4">Comparativa de tasas SBS vigentes</p>
                </div>
                <Link 
                  href="https://www.sbs.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
                >
                  <span>Consultar tasas</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:border-[var(--brand-primary)]/40 dark:hover:border-[var(--brand-primary)]/40 transition-colors shadow-md">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Simulador</h3>
                  <p className="text-[var(--text-secondary)] text-xs font-medium leading-relaxed mb-4">Calcular cuota y proyección del crédito</p>
                </div>
                <Link 
                  href="https://www.sbs.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 underline underline-offset-4 cursor-pointer"
                >
                  <span>Simular crédito</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3: Formulario de Contacto */}
        <section className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--brand-primary)]/[0.03] to-transparent p-8 sm:p-12 text-center border-b-2 border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-[var(--brand-primary)]/10 border-2 border-[var(--brand-primary)]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Scale className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-3 tracking-tight">
                ¿Necesitas Asesoría Legal?
              </h3>
              <p className="text-base text-[var(--text-secondary)] max-w-2xl mx-auto font-medium">
                Contáctanos para recibir orientación profesional especializada en transacciones y normativas inmobiliarias.
              </p>
            </div>
            
            <div className="p-6 sm:p-12">
              <form className="max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                    <input
                      type="text"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent rounded-2xl text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-[var(--brand-primary)] transition-all duration-300 font-medium text-sm"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
                    <input
                      type="email"
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent rounded-2xl text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-[var(--brand-primary)] transition-all duration-300 font-medium text-sm"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 ml-1">Tipo de Trámite</label>
                  <div className="relative">
                    <select className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent rounded-2xl text-[var(--text-primary)] focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-[var(--brand-primary)] transition-all duration-300 appearance-none cursor-pointer font-medium text-sm">
                      <option value="">Selecciona una opción</option>
                      <option value="compra">Compra de propiedad</option>
                      <option value="venta">Venta de propiedad</option>
                      <option value="registro">Registro de propiedad</option>
                      <option value="hipoteca">Crédito hipotecario</option>
                      <option value="otro">Otro</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 ml-1">Mensaje</label>
                  <textarea
                    rows={4}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent rounded-2xl text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-[var(--brand-primary)] transition-all duration-300 resize-none font-medium text-sm"
                    placeholder="Describe tu caso o consulta con el mayor detalle posible..."
                  ></textarea>
                </div>
                
                <div className="text-center pt-4">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-[var(--brand-primary)] text-white px-16 py-4.5 rounded-2xl font-bold text-base shadow-lg shadow-[var(--brand-primary)]/20 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
                  >
                    Enviar Consulta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}