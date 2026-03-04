'use client';

import Link from 'next/link';

export function CompleteServices() {
  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        {/* Header Elegante */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
            Servicios Inmobiliarios
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Todo lo que necesitas para tus trámites y transacciones en Perú
          </p>
        </div>

        {/* SUNAT - Tributación Completa */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all duration-500 border border-gray-100">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🏠</span>
              </div>
              <div>
                <h3 className="text-3xl font-light text-gray-900">SUNAT</h3>
                <p className="text-gray-600 font-light">Superintendencia Nacional de Aduanas y de Administración Tributaria</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Predial Urbano</h4>
                  <p className="text-gray-600 text-sm">Impuesto para propiedades urbanas</p>
                </div>
                <Link 
                  href="https://www.sunat.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Consultar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Alquileres</h4>
                  <p className="text-gray-600 text-sm">Obligaciones tributarias</p>
                </div>
                <Link 
                  href="https://www.sunat.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Declarar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Autovalúo</h4>
                  <p className="text-gray-600 text-sm">Determinación del valor de predios</p>
                </div>
                <Link 
                  href="https://www.sunat.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Realizar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Transferencia de Predio</h4>
                  <p className="text-gray-600 text-sm">Requisitos para transferencia</p>
                </div>
                <Link 
                  href="https://www.sunat.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Ver requisitos
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Declaración Jurada</h4>
                  <p className="text-gray-600 text-sm">Rentas anuales de propiedades</p>
                </div>
                <Link 
                  href="https://www.sunat.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Presentar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">ITF</h4>
                  <p className="text-gray-600 text-sm">Impuesto a transacciones financieras</p>
                </div>
                <Link 
                  href="https://www.sunat.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Calcular
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Consultas y Trámites</h4>
                  <p className="text-gray-600 text-sm">Atención y asistencia virtual</p>
                </div>
                <Link 
                  href="https://www.sunat.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Acceder a SUNAT Virtual
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SUNARP - Registros Públicos Completo */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all duration-500 border border-gray-100">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🏛️</span>
              </div>
              <div>
                <h3 className="text-3xl font-light text-gray-900">SUNARP</h3>
                <p className="text-gray-600 font-light">Superintendencia Nacional de los Registros Públicos</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Búsqueda de Partidas</h4>
                  <p className="text-gray-600 text-sm">Consultar registros de propiedades</p>
                </div>
                <Link 
                  href="https://www.sunarp.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Buscar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Certificados de Propiedad</h4>
                  <p className="text-gray-600 text-sm">Obtener certificados registrales</p>
                </div>
                <Link 
                  href="https://www.sunarp.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Solicitar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Trámites en Línea</h4>
                  <p className="text-gray-600 text-sm">Servicios virtuales SUNARP</p>
                </div>
                <Link 
                  href="https://www.sunarp.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Acceso virtual
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Guía de Crédito Hipotecario */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all duration-500 border border-gray-100">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🏦</span>
              </div>
              <div>
                <h3 className="text-3xl font-light text-gray-900">Guía de Crédito Hipotecario</h3>
                <p className="text-gray-600 font-light">Información para obtener tu crédito hipotecario</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Requisitos</h4>
                  <p className="text-gray-600 text-sm">Documentos necesarios</p>
                </div>
                <Link 
                  href="https://www.sbs.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Ver requisitos
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Tasas de Interés</h4>
                  <p className="text-gray-600 text-sm">Comparar tasas hipotecarias</p>
                </div>
                <Link 
                  href="https://www.sbs.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Consultar tasas
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Simulador</h4>
                  <p className="text-gray-600 text-sm">Calcular cuota hipotecaria</p>
                </div>
                <Link 
                  href="https://www.sbs.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Simular crédito
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Otras Instituciones - Grid Completo */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all duration-500 border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-light text-gray-900">Otras Instituciones</h3>
              <p className="text-gray-600 font-light">Servicios complementarios para el sector inmobiliario</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">CAVALI - ICB</h4>
                  <p className="text-gray-600 text-sm">Tasas de interés y mercado de valores</p>
                </div>
                <Link 
                  href="https://www.cavali.com.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Consultar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Ministerio de Vivienda</h4>
                  <p className="text-gray-600 text-sm">Programas de subsidios y financiamiento</p>
                </div>
                <Link 
                  href="https://www.minvivienda.gob.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Ver programas
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Tasadores Peruanos</h4>
                  <p className="text-gray-600 text-sm">Servicio profesional de tasación</p>
                </div>
                <Link 
                  href="https://www.tasadoresperuanos.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Tasar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Colegio de Arquitectos</h4>
                  <p className="text-gray-600 text-sm">Validación de planos y permisos</p>
                </div>
                <Link 
                  href="https://www.cap.org.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  Consultar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5v11m0 0h-14" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

       {/* Formulario de Contacto Legal - ESTILO URBANIA/MODERNO */}
        <div className="mb-16">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden w-full">
            
            {/* Encabezado con degradado sutil */}
            <div className="bg-gradient-to-b from-[#f0f9f8] to-white p-12 text-center">
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
                ¿Necesitas Asesoría Legal?
              </h3>
              <p className="text-gray-500 text-lg font-light max-w-2xl mx-auto">
                Contáctanos para orientación profesional en trámites inmobiliarios. Nuestro equipo legal se pondrá en contacto contigo.
              </p>
            </div>

            <div className="px-8 pb-12 md:px-16">
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Nombre Completo */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">
                      Nombre Completo
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="Tu nombre completo"
                        className="w-full pl-6 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00a896] focus:ring-4 focus:ring-[#00a896]/5 transition-all duration-300 outline-none text-gray-700 shadow-sm"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 text-xl group-focus-within:text-[#00a896] transition-colors">👤</span>
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">
                      Correo Electrónico
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full pl-6 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00a896] focus:ring-4 focus:ring-[#00a896]/5 transition-all duration-300 outline-none text-gray-700 shadow-sm"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 text-xl group-focus-within:text-[#00a896] transition-colors">✉️</span>
                    </div>
                  </div>
                </div>

                {/* Tipo de Trámite */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">
                    Tipo de Trámite
                  </label>
                  <div className="relative">
                    <select className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00a896] appearance-none cursor-pointer outline-none text-gray-600 shadow-sm transition-all duration-300">
                      <option value="">Selecciona una opción</option>
                      <option value="compra">Compra de propiedad</option>
                      <option value="venta">Venta de propiedad</option>
                      <option value="registro">Registro de propiedad</option>
                      <option value="hipoteca">Crédito hipotecario</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Mensaje */}
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">
                    Tu Mensaje o Consulta
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe detalladamente tu caso..."
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#00a896] outline-none transition-all duration-300 resize-none text-gray-700 shadow-sm"
                  ></textarea>
                </div>

                {/* BOTÓN VERDE URBANIA */}
                <div className="pt-4 flex justify-center">
                  <button
                    type="submit"
                    className="w-full md:w-2/3 bg-[#00a896] hover:bg-[#008b7d] text-white font-bold py-5 rounded-2xl shadow-xl shadow-[#00a896]/30 transform transition-all duration-300 active:scale-[0.97] hover:-translate-y-1 text-lg tracking-wide flex items-center justify-center gap-3"
                  >
                    Enviar mi Consulta
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Informativo */}
        <div className="text-center mt-24">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 max-w-4xl mx-auto border border-blue-100">
            <h3 className="text-xl font-light text-gray-900 mb-4">
              📋 Información Oficial Verificada
            </h3>
            <p className="text-gray-600 leading-relaxed font-light">
              Todos los enlaces dirigen a instituciones oficiales del Estado peruano y entidades reguladas. 
              TIYUY facilita el acceso a esta información para tu comodidad y seguridad, 
              pero los trámites deben realizarse directamente en las plataformas oficiales.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
