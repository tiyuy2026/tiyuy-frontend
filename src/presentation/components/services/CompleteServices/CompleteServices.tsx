'use client';

import Link from 'next/link';

export function CompleteServices() {
  const sections = [
    {
      icon: '🏠',
      title: 'SUNAT',
      subtitle: 'Superintendencia Nacional de Aduanas y de Administración Tributaria',
      accent: 'from-blue-500 to-cyan-400',
      hoverBg: 'rgba(37,99,235,1)',
      hoverShadow: 'rgba(37,99,235,0.3)',
      url: 'https://www.sunat.gob.pe/',
      items: [
        { title: 'Predial Urbano', desc: 'Impuesto para propiedades urbanas', cta: 'Consultar' },
        { title: 'Alquileres', desc: 'Obligaciones tributarias', cta: 'Declarar' },
        { title: 'Autovalúo', desc: 'Determinación del valor de predios', cta: 'Realizar' },
        { title: 'Transferencia de Predio', desc: 'Requisitos para transferencia', cta: 'Ver requisitos' },
        { title: 'Declaración Jurada', desc: 'Rentas anuales de propiedades', cta: 'Presentar' },
        { title: 'ITF', desc: 'Impuesto a transacciones financieras', cta: 'Calcular' },
        { title: 'Consultas y Trámites', desc: 'Atención y asistencia virtual', cta: 'Acceder a SUNAT Virtual' },
      ],
    },
    {
      icon: '🏛️',
      title: 'SUNARP',
      subtitle: 'Superintendencia Nacional de los Registros Públicos',
      accent: 'from-violet-500 to-purple-400',
      hoverBg: 'rgba(124,58,237,1)',
      hoverShadow: 'rgba(124,58,237,0.3)',
      url: 'https://www.sunarp.gob.pe/',
      items: [
        { title: 'Búsqueda de Partidas', desc: 'Consultar registros de propiedades', cta: 'Buscar' },
        { title: 'Certificados de Propiedad', desc: 'Obtener certificados registrales', cta: 'Solicitar' },
        { title: 'Trámites en Línea', desc: 'Servicios virtuales SUNARP', cta: 'Acceso virtual' },
      ],
    },
    {
      icon: '🏦',
      title: 'Guía de Crédito Hipotecario',
      subtitle: 'Información para obtener tu crédito hipotecario',
      accent: 'from-emerald-500 to-green-400',
      hoverBg: 'rgba(16,185,129,1)',
      hoverShadow: 'rgba(16,185,129,0.3)',
      url: 'https://www.sbs.gob.pe/',
      items: [
        { title: 'Requisitos', desc: 'Documentos necesarios', cta: 'Ver requisitos' },
        { title: 'Tasas de Interés', desc: 'Comparar tasas hipotecarias', cta: 'Consultar tasas' },
        { title: 'Simulador', desc: 'Calcular cuota hipotecaria', cta: 'Simular crédito' },
      ],
    },
  ];

  const otrasInstituciones = [
    { title: 'CAVALI - ICB', desc: 'Tasas de interés y mercado de valores', cta: 'Consultar', url: 'https://www.cavali.com.pe/' },
    { title: 'Ministerio de Vivienda', desc: 'Programas de subsidios y financiamiento', cta: 'Ver programas', url: 'https://www.minvivienda.gob.pe/' },
    { title: 'Tasadores Peruanos', desc: 'Servicio profesional de tasación', cta: 'Tasar', url: 'https://www.tasadoresperuanos.org/' },
    { title: 'Colegio de Arquitectos', desc: 'Validación de planos y permisos', cta: 'Consultar', url: 'https://www.cap.org.pe/' },
  ];

  return (
    <div className="w-full bg-slate-50 py-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .cs-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }

        .gradient-text {
          background: linear-gradient(135deg, #2563eb 0%, #0ea89e 50%, #4ade80 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-card {
          border: 1px solid #f1f5f9;
          transition: all 0.35s ease;
        }
        .section-card:hover {
          border-color: rgba(37,99,235,0.15);
          box-shadow: 0 24px 48px rgba(37,99,235,0.07);
          transform: translateY(-2px);
        }

        /* ── TARJETA CON HOVER DE COLOR ── */
        .item-card {
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
          min-height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
        }
        .item-card:hover {
          transform: translateY(-4px) scale(1.02);
          border-color: transparent;
        }
        .item-card:hover .item-title { color: white; }
        .item-card:hover .item-desc  { color: rgba(255,255,255,0.75); }
        .item-card:hover .cta-link-text {
          background: white;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .item-card:hover .cta-arrow { stroke: white; }

        .cta-link {
          background: linear-gradient(135deg, #2563eb, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.02em;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: opacity 0.2s;
        }
        .cta-link-text {
          background: linear-gradient(135deg, #2563eb, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.02em;
          transition: all 0.3s ease;
        }

        .icon-box { transition: all 0.3s ease; }
        .section-card:hover .icon-box { transform: scale(1.05); }

        .submit-btn {
          background: linear-gradient(135deg, #2563eb 0%, #0ea89e 60%, #4ade80 100%);
          transition: all 0.3s ease;
        }
        .submit-btn:hover {
          opacity: 0.88;
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(37,99,235,0.25);
        }
        .submit-btn:active { transform: scale(0.98); }

        .form-input {
          background: #f8fafc;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .form-input:focus {
          background: white;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.06);
          outline: none;
        }

        .footer-banner {
          background: linear-gradient(135deg, rgba(37,99,235,0.04), rgba(74,222,128,0.04));
          border: 1px solid rgba(37,99,235,0.1);
        }

        .otras-card {
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
        }
        .otras-card:hover {
          background: linear-gradient(135deg, #2563eb, #0ea89e 60%, #4ade80);
          border-color: transparent;
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 32px rgba(37,99,235,0.25);
        }
        .otras-card:hover .otras-title { color: white; }
        .otras-card:hover .otras-desc  { color: rgba(255,255,255,0.75); }
        .otras-card:hover .cta-link-text {
          background: white;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .otras-card:hover .cta-arrow { stroke: white; }
      `}</style>

      {/* ── SIN max-w / px limitante: ocupa todo el ancho ── */}
      <div className="cs-wrap w-full px-4 sm:px-8 lg:px-16 xl:px-24">

        {/* ── HEADER ── */}
        <div className="text-center mb-20">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] gradient-text mb-4">
            Instituciones & Recursos
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-5">
            Servicios{' '}
            <span className="gradient-text">Inmobiliarios</span>
          </h2>
          <p className="text-lg text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
            Todo lo que necesitas para tus trámites y transacciones en Perú
          </p>
          <div className="w-16 h-1 rounded-full mx-auto mt-6"
            style={{ background: 'linear-gradient(90deg, #2563eb, #4ade80)' }} />
        </div>

        {/* ── SECCIONES PRINCIPALES ── */}
        {sections.map((sec) => (
          <div key={sec.title} className="section-card bg-white rounded-2xl p-6 sm:p-8 md:p-10 mb-8">

            {/* Header sección */}
            <div className="flex items-center gap-5 mb-8">
              <div className={`icon-box w-16 h-16 rounded-2xl bg-gradient-to-br ${sec.accent} flex items-center justify-center shadow-lg shrink-0`}>
                <span className="text-2xl">{sec.icon}</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{sec.title}</h3>
                <p className="text-slate-400 text-sm font-light mt-0.5">{sec.subtitle}</p>
              </div>
            </div>

            {/* Items grid: 1 col mobile → 2 tablet → 3 desktop → 4 xl */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sec.items.map((item) => (
                <div
                  key={item.title}
                  className="item-card rounded-xl bg-white"
                  style={{
                    ['--hover-bg' as string]: sec.hoverBg,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = `linear-gradient(135deg, ${sec.hoverBg.replace('1)', '0.9)')}, ${sec.hoverBg})`;
                    el.style.boxShadow = `0 16px 40px ${sec.hoverShadow}`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = 'white';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <h4 className="item-title text-base font-bold text-slate-800 mb-1 transition-colors duration-300">{item.title}</h4>
                    <p className="item-desc text-slate-400 text-xs font-light leading-relaxed transition-colors duration-300">{item.desc}</p>
                  </div>
                  <Link
                    href={sec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-5"
                  >
                    <span className="cta-link-text">{item.cta}</span>
                    <svg className="cta-arrow w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <defs>
                        <linearGradient id="ag1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#4ade80" />
                        </linearGradient>
                      </defs>
                      <path strokeLinecap="round" strokeLinejoin="round" stroke="url(#ag1)" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ── OTRAS INSTITUCIONES ── */}
        <div className="section-card bg-white rounded-2xl p-6 sm:p-8 md:p-10 mb-8">
          <div className="mb-8">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] gradient-text mb-2">Complementarios</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">Otras Instituciones</h3>
            <p className="text-slate-400 text-sm font-light mt-1">Servicios complementarios para el sector inmobiliario</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otrasInstituciones.map((inst) => (
              <div key={inst.title} className="otras-card rounded-xl bg-white">
                <div>
                  <h4 className="otras-title text-base font-bold text-slate-800 mb-1 transition-colors duration-300">{inst.title}</h4>
                  <p className="otras-desc text-slate-400 text-xs font-light leading-relaxed transition-colors duration-300">{inst.desc}</p>
                </div>
                <Link href={inst.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4">
                  <span className="cta-link-text">{inst.cta}</span>
                  <svg className="cta-arrow w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" stroke="url(#ag1)" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── FORMULARIO ── */}
        <div className="section-card bg-white rounded-2xl overflow-hidden mb-8">
          <div className="px-6 sm:px-10 md:px-14 pt-12 pb-8 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(74,222,128,0.04))' }}>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] gradient-text mb-3">Asesoría</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              ¿Necesitas Asesoría Legal?
            </h3>
            <p className="text-slate-400 text-base font-light max-w-xl mx-auto leading-relaxed">
              Contáctanos para orientación profesional en trámites inmobiliarios. Nuestro equipo legal se pondrá en contacto contigo.
            </p>
          </div>

          <div className="px-6 sm:px-10 md:px-14 pb-12 pt-6 max-w-3xl mx-auto">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5 ml-1">Nombre Completo</label>
                  <div className="relative">
                    <input type="text" placeholder="Tu nombre completo"
                      className="form-input w-full pl-5 pr-12 py-4 rounded-xl text-slate-700 text-sm" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">👤</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5 ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <input type="email" placeholder="tu@email.com"
                      className="form-input w-full pl-5 pr-12 py-4 rounded-xl text-slate-700 text-sm" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">✉️</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5 ml-1">Tipo de Trámite</label>
                <div className="relative">
                  <select className="form-input w-full px-5 py-4 rounded-xl text-slate-600 text-sm appearance-none cursor-pointer">
                    <option value="">Selecciona una opción</option>
                    <option value="compra">Compra de propiedad</option>
                    <option value="venta">Venta de propiedad</option>
                    <option value="registro">Registro de propiedad</option>
                    <option value="hipoteca">Crédito hipotecario</option>
                  </select>
                  <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5 ml-1">Tu Mensaje o Consulta</label>
                <textarea rows={4} placeholder="Describe detalladamente tu caso..."
                  className="form-input w-full px-5 py-4 rounded-xl text-slate-700 text-sm resize-none" />
              </div>

              <div className="flex justify-center pt-2">
                <button type="submit"
                  className="submit-btn w-full sm:w-2/3 text-white font-bold py-4 rounded-xl text-base tracking-wide flex items-center justify-center gap-3">
                  Enviar mi Consulta
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── FOOTER BANNER ── */}
        <div className="footer-banner rounded-2xl p-8 text-center max-w-4xl mx-auto">
          <p className="text-2xl mb-3">📋</p>
          <h3 className="text-lg font-black text-slate-800 mb-3">Información Oficial Verificada</h3>
          <p className="text-slate-500 leading-relaxed font-light text-sm">
            Todos los enlaces dirigen a instituciones oficiales del Estado peruano y entidades reguladas.
            TIYUY facilita el acceso a esta información para tu comodidad y seguridad,
            pero los trámites deben realizarse directamente en las plataformas oficiales.
          </p>
        </div>

      </div>
    </div>
  );
}
