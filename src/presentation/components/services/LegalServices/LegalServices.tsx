'use client';

import Link from 'next/link';

export function LegalServices() {
  return (
    <div className="w-full py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Servicios Legales y Registrales
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Acceso a plataformas oficiales para trámites inmobiliarios
          </p>
        </div>

        {/* Sección 1: SUNARP */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-2xl">📋</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  SUNARP - Registros Públicos
                </h3>
                <p className="text-gray-600">
                  Superintendencia Nacional de los Registros Públicos
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Búsqueda de Partidas</h4>
                <p className="text-gray-600 text-sm mb-3">Consultar registros de propiedades</p>
                <Link 
                  href="https://www.sunarp.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <span>Buscar en SUNARP</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
                  </svg>
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Certificados de Propiedad</h4>
                <p className="text-gray-600 text-sm mb-3">Obtener certificados registrales</p>
                <Link 
                  href="https://www.sunarp.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <span>Solicitar certificado</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
                  </svg>
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Trámites en Línea</h4>
                <p className="text-gray-600 text-sm mb-3">Servicios virtuales SUNARP</p>
                <Link 
                  href="https://www.sunarp.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <span>Acceso virtual</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 2: Guía Crédito Hipotecario */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Guía de Crédito Hipotecario
                </h3>
                <p className="text-gray-600">
                  Información para obtener tu crédito hipotecario
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Requisitos</h4>
                <p className="text-gray-600 text-sm mb-3">Documentos necesarios</p>
                <Link 
                  href="https://www.sbs.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <span>Ver requisitos</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
                  </svg>
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Tasas de Interés</h4>
                <p className="text-gray-600 text-sm mb-3">Comparar tasas hipotecarias</p>
                <Link 
                  href="https://www.sbs.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <span>Consultar tasas</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
                  </svg>
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Simulador</h4>
                <p className="text-gray-600 text-sm mb-3">Calcular cuota hipotecaria</p>
                <Link 
                  href="https://www.sbs.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <span>Simular crédito</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3: Formulario de Contacto Estilo Urbania */}
<section className="mb-16">
  <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
    {/* Banner Superior Sutil (Opcional, similar a la imagen) */}
    <div className="bg-gradient-to-r from-teal-50 to-white p-12 text-center border-b border-gray-50">
      <h3 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
        ¿Necesitas Asesoría Legal?
      </h3>
      <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
        Contáctanos para orientación profesional en trámites inmobiliarios
      </p>
    </div>
    
    <div className="p-8 md:p-12">
      <form className="max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Nombre Completo */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
            <input
              type="text"
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#00a896] focus:ring-4 focus:ring-[#00a896]/10 transition-all duration-300"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Correo Electrónico */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
            <input
              type="email"
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#00a896] focus:ring-4 focus:ring-[#00a896]/10 transition-all duration-300"
              placeholder="tu@email.com"
            />
          </div>
        </div>
        
        {/* Tipo de Trámite */}
        <div className="relative">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Tipo de Trámite</label>
          <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 focus:outline-none focus:bg-white focus:border-[#00a896] focus:ring-4 focus:ring-[#00a896]/10 transition-all duration-300 appearance-none cursor-pointer">
            <option value="">Selecciona una opción</option>
            <option value="compra">Compra de propiedad</option>
            <option value="venta">Venta de propiedad</option>
            <option value="registro">Registro de propiedad</option>
            <option value="hipoteca">Crédito hipotecario</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        
        {/* Mensaje */}
        <div className="relative">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Mensaje</label>
          <textarea
            rows={4}
            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#00a896] focus:ring-4 focus:ring-[#00a896]/10 transition-all duration-300 resize-none"
            placeholder="Describe tu caso o consulta..."
          ></textarea>
        </div>
        
        {/* Botón Llamativo */}
        <div className="text-center pt-6">
          <button
            type="submit"
            className="w-full md:w-auto bg-[#00a896] text-white px-16 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-[#00a896]/30 hover:bg-[#008b7d] hover:-translate-y-1 transition-all duration-300 active:scale-95"
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
