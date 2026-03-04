'use client';

import Link from 'next/link';

export function SunatInfo() {
  return (
    <div className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Información Tributaria SUNAT
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Guía y herramientas para trámites inmobiliarios
          </p>
        </div>

        {/* Grid de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">🏠</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Predial Urbano
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Información sobre el impuesto predial para propiedades urbanas
            </p>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Consultar en SUNAT</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
              </svg>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">📋</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Autovalúo
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Proceso de determinación del valor de predios
            </p>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Realizar trámite</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
              </svg>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">📑</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Transferencia de Predio
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Requisitos y proceso para transferencia de inmuebles
            </p>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Ver requisitos</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
              </svg>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">🧾</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Declaración Jurada
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Declaración anual de rentas para propiedades
            </p>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Presentar declaración</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
              </svg>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">💰</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Alquileres
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Obligaciones tributarias para propiedades en alquiler
            </p>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Consultar tasas</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
              </svg>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-teal-600 text-xl">🏢</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                ITF
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Impuesto a las transacciones financieras
            </p>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Calcular ITF</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
              </svg>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 text-xl">📞</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Consultas y Trámites
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Atención y asistencia virtual SUNAT
            </p>
            <Link 
              href="https://www.sunat.gob.pe/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Acceder a SUNAT Virtual</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0v4m0 0v4m0 0v4" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Footer informativo */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              📋 Información Oficial
            </h3>
            <p className="text-blue-700 text-sm">
              Todos los enlaces dirigen a la plataforma oficial de SUNAT. 
              TIYUY facilita el acceso a esta información para tu comodidad, 
              pero los trámites deben realizarse directamente en sunat.gob.pe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
