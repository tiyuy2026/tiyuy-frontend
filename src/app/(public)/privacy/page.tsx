'use client';

import Link from 'next/link';
import { useState } from 'react';

const SECTIONS = [
  { id: 'intro', title: 'Introducción' },
  { id: 'data-collect', title: 'Datos que recopilamos' },
  { id: 'data-use', title: 'Uso de la información' },
  { id: 'data-share', title: 'Compartir datos' },
  { id: 'cookies', title: 'Cookies y tecnologías' },
  { id: 'security', title: 'Seguridad' },
  { id: 'rights', title: 'Tus derechos' },
  { id: 'retention', title: 'Retención de datos' },
  { id: 'minors', title: 'Menores de edad' },
  { id: 'changes', title: 'Cambios en la política' },
  { id: 'contact', title: 'Contacto' },
];

export default function PrivacyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/assets/images/logo.png" alt="Tiyuy" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Términos de Servicio
            </Link>
            <Link
              href="/"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">Política de Privacidad</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              Tu privacidad es nuestra prioridad
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              En Tiyuy nos comprometemos a proteger tus datos personales. Esta política explica de manera transparente cómo recopilamos, usamos y protegemos tu información.
            </p>
            <p className="text-sm text-gray-400 mt-4">Última actualización: 3 de junio de 2025</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-3">
                Contenido
              </p>
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Mobile Nav Toggle */}
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Nav Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setMobileMenuOpen(false)}>
              <div
                className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-bold text-gray-900">Contenido</p>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="space-y-1">
                  {SECTIONS.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-4xl">
            <div className="prose prose-lg max-w-none">

              {/* Introducción */}
              <section id="intro" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">1</span>
                  Introducción
                </h2>
                <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Tiyuy</strong> (&quot;nosotros&quot;, &quot;nuestra&quot; o &quot;la Plataforma&quot;) es una plataforma digital que conecta a compradores, vendedores, arrendadores y arrendatarios de bienes inmuebles en Latinoamérica. Esta Política de Privacidad describe cómo tratamos tus datos personales cuando utilizas nuestros servicios.
                  </p>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Cumplimos con las normativas de protección de datos aplicables, incluyendo la <strong>Ley N° 29733, Ley de Protección de Datos Personales del Perú</strong> y su reglamento, así como los principios del <strong>Reglamento General de Protección de Datos (RGPD)</strong> de la Unión Europea cuando corresponda.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política. Si no estás de acuerdo, te pedimos que no utilices la Plataforma.
                </p>
              </section>

              {/* Datos que recopilamos */}
              <section id="data-collect" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">2</span>
                  Datos que recopilamos
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Recopilamos únicamente los datos necesarios para brindarte nuestros servicios. Estos se clasifican en las siguientes categorías:
                </p>

                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Datos de identificación
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Nombre, apellido, correo electrónico, número de teléfono, documento de identidad (DNI/RUC), fotografía de perfil y datos de registro de cuenta.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Datos de propiedades
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Información de inmuebles publicados: dirección, características, fotografías, precios, descripción y datos de ubicación geográfica.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Datos de uso y navegación
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Direcciones IP, tipo de navegador, páginas visitadas, tiempo de permanencia, clics, búsquedas realizadas, interacciones con publicaciones y preferencias de navegación.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Datos de pago
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Información de transacciones, historial de pagos, suscripciones y datos de facturación. <strong>Nota:</strong> No almacenamos datos completos de tarjetas de crédito; estos son procesados por pasarelas de pago certificadas PCI-DSS.
                    </p>
                  </div>
                </div>
              </section>

              {/* Uso de la información */}
              <section id="data-use" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">3</span>
                  Uso de la información
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Utilizamos tus datos personales exclusivamente para las siguientes finalidades:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Prestar servicios', desc: 'Gestionar tu cuenta, publicar propiedades y facilitar conexiones entre usuarios' },
                    { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Mejorar la plataforma', desc: 'Analizar el uso para optimizar funcionalidades, rendimiento y experiencia de usuario' },
                    { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'Comunicaciones', desc: 'Enviar notificaciones, alertas de propiedades, actualizaciones y soporte' },
                    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Seguridad', desc: 'Prevenir fraudes, verificar identidades y proteger la integridad de la plataforma' },
                    { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'Análisis', desc: 'Generar estadísticas anonimizadas para informes de mercado y mejoras' },
                    { icon: 'M3 6l3 1m0 0l-3 1a5.002 5.002 0 006.801 0M6 12l3 1m0 0l-3 1a5.002 5.002 0 006.801 0M15 12l3 1m0 0l-3 1a5.002 5.002 0 006.801 0', title: 'Cumplimiento legal', desc: 'Cumplir con obligaciones legales, regulatorias y responder a autoridades' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-200 transition-colors">
                      <svg className="w-5 h-5 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Compartir datos */}
              <section id="data-share" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">4</span>
                  Compartir datos con terceros
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  <strong>No vendemos tus datos personales.</strong> Solo compartimos información en los siguientes casos:
                </p>

                <div className="space-y-3">
                  {[
                    { title: 'Proveedores de servicios', desc: 'Empresas que nos ayudan a operar la plataforma (hosting, análisis, pasarelas de pago, envío de emails), bajo estrictos acuerdos de confidencialidad.' },
                    { title: 'Entre usuarios', desc: 'Cuando publicas una propiedad, ciertos datos (nombre, foto de perfil, teléfono) son visibles para otros usuarios interesados en contactarte.' },
                    { title: 'Obligación legal', desc: 'Cuando lo requiera la ley, una autoridad competente o para proteger los derechos y seguridad de Tiyuy y sus usuarios.' },
                    { title: 'Transacciones comerciales', desc: 'En caso de fusión, adquisición o venta de activos, tus datos podrían ser transferidos como parte de la operación, manteniendo las garantías de privacidad.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 bg-white border border-gray-200 rounded-xl p-4">
                      <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Cookies */}
              <section id="cookies" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">5</span>
                  Cookies y tecnologías similares
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia. Puedes configurar tu navegador para rechazar cookies, aunque esto podría afectar algunas funcionalidades.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">Tipo</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">Finalidad</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { type: 'Esenciales', purpose: 'Funcionamiento básico de la plataforma (sesión, autenticación)', duration: 'Sesión' },
                        { type: 'Analíticas', purpose: 'Entender cómo usas la plataforma para mejorar el servicio', duration: 'Hasta 2 años' },
                        { type: 'Funcionales', purpose: 'Recordar preferencias (idioma, moneda, ubicación)', duration: 'Hasta 1 año' },
                        { type: 'Marketing', purpose: 'Mostrar anuncios relevantes y medir campañas', duration: 'Hasta 6 meses' },
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-100">{row.type}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">{row.purpose}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">{row.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Seguridad */}
              <section id="security" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">6</span>
                  Seguridad de tus datos
                </h2>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Medidas de seguridad implementadas</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          Cifrado SSL/TLS para todas las comunicaciones
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          Almacenamiento de contraseñas con hash seguro (bcrypt)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          Acceso restringido a datos personales (principio de mínimo privilegio)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          Monitoreo continuo y detección de actividades sospechosas
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          Copias de seguridad cifradas y protocolos de recuperación
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tus derechos */}
              <section id="rights" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">7</span>
                  Tus derechos
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Como titular de tus datos personales, tienes los siguientes derechos:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Acceso', desc: 'Solicitar una copia de los datos que tenemos sobre ti' },
                    { title: 'Rectificación', desc: 'Corregir datos inexactos o incompletos' },
                    { title: 'Supresión', desc: 'Solicitar la eliminación de tus datos personales' },
                    { title: 'Oposición', desc: 'Oponerte al tratamiento de tus datos para ciertos fines' },
                    { title: 'Portabilidad', desc: 'Recibir tus datos en formato estructurado y transferirlos' },
                    { title: 'Limitación', desc: 'Solicitar la restricción del tratamiento de tus datos' },
                  ].map((right, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{right.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{right.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500 mt-6">
                  Para ejercer cualquiera de estos derechos, contáctanos a <a href="mailto:privacidad@tiyuy.com" className="text-green-600 hover:underline">privacidad@tiyuy.com</a>. Responderemos tu solicitud en un plazo máximo de 15 días hábiles.
                </p>
              </section>

              {/* Retención */}
              <section id="retention" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">8</span>
                  Retención de datos
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Conservamos tus datos personales mientras tu cuenta esté activa y durante el tiempo necesario para cumplir con las finalidades descritas en esta política, incluyendo obligaciones legales y fiscales.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> Tras la eliminación de tu cuenta, algunos datos pueden conservarse de forma anonimizada para fines estadísticos o durante el plazo requerido por ley (mínimo 5 años para datos de transacciones).
                  </p>
                </div>
              </section>

              {/* Menores */}
              <section id="minors" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">9</span>
                  Menores de edad
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente datos personales de menores. Si descubrimos que un menor ha proporcionado datos personales, procederemos a eliminarlos de inmediato. Si eres padre o tutor y crees que tu hijo ha compartido información con nosotros, contáctanos.
                </p>
              </section>

              {/* Cambios */}
              <section id="changes" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">10</span>
                  Cambios en esta política
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestros servicios, tecnologías o requisitos legales. Te notificaremos sobre cambios significativos mediante un aviso en la plataforma o por correo electrónico. Te recomendamos revisar esta política regularmente.
                </p>
              </section>

              {/* Contacto */}
              <section id="contact" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold">11</span>
                  Contacto
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Si tienes preguntas, dudas o solicitudes sobre esta Política de Privacidad o el tratamiento de tus datos, puedes contactarnos:
                </p>

                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <p className="text-green-100 text-xs uppercase tracking-wider mb-1">Email</p>
                      <a href="mailto:privacidad@tiyuy.com" className="font-semibold hover:underline">privacidad@tiyuy.com</a>
                    </div>
                    <div>
                      <p className="text-green-100 text-xs uppercase tracking-wider mb-1">Dirección</p>
                      <p className="font-semibold">Lima, Perú</p>
                    </div>
                    <div>
                      <p className="text-green-100 text-xs uppercase tracking-wider mb-1">Horario de atención</p>
                      <p className="font-semibold">Lun - Vie, 9:00 - 18:00</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
