'use client';

import { useState, useMemo } from 'react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  externalUrl: string;
  author: string;
  publishedAt: string;
  readTime: number;
  category: string;
  image: string;
  featured: boolean;
  source: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Créditos Mivivienda: Requisitos para acceder al bono este 2024',
    excerpt: 'Conoce los nuevos valores de los bonos para la compra de viviendas sostenibles y los requisitos del Fondo Mivivienda.',
    externalUrl: 'https://www.mivivienda.com.pe/PORTALWEB/usuario-busca-viviendas/nuevo-credito-mivivienda.aspx',
    author: 'Gestión Inmobiliaria',
    publishedAt: '2024-02-20',
    readTime: 7,
    category: 'Financiamiento',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    featured: true,
    source: 'Mivivienda.pe'
  },
  {
    id: '2',
    title: '¿Cómo inscribir una propiedad en SUNARP? Guía legal 2024',
    excerpt: 'Evita estafas inmobiliarias registrando tu propiedad. Te explicamos los pasos legales ante la Superintendencia Nacional.',
    externalUrl: 'https://www.gob.pe/709-inscribir-una-propiedad-en-sunarp',
    author: 'Legal TIYUY',
    publishedAt: '2024-02-18',
    readTime: 10,
    category: 'Legal',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    featured: false,
    source: 'Gob.pe'
  },
  {
    id: '3',
    title: 'Panorama del Sector Inmobiliario: Reporte del Banco Central (BCRP)',
    excerpt: 'Análisis profundo sobre el precio por metro cuadrado en distritos como Miraflores, San Isidro y la periferia de Lima.',
    externalUrl: 'https://www.bcrp.gob.pe/publicaciones/reporte-de-inflacion.html',
    author: 'Análisis Macroeconómico',
    publishedAt: '2024-02-15',
    readTime: 12,
    category: 'Mercado',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    featured: false,
    source: 'BCRP'
  },
  {
    id: '4',
    title: 'Inversión en Preventas: ¿Por qué comprar en planos en Lima?',
    excerpt: 'Estrategias de inversión en Real Estate para obtener una plusvalía de hasta el 20% antes de la entrega de llaves.',
    externalUrl: 'https://urbania.pe/blog/noticias/comprar-en-planos-ventajas-y-desventajas/',
    author: 'Equipo Inversión',
    publishedAt: '2024-02-12',
    readTime: 6,
    category: 'Inversión',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    featured: false,
    source: 'Urbania'
  }
];

const categories = ['Todos', 'Inversión', 'Mercado', 'Financiamiento', 'Legal'];

export function BlogPosts() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredPosts = useMemo(() =>
    selectedCategory === 'Todos'
      ? blogPosts
      : blogPosts.filter(post => post.category === selectedCategory),
    [selectedCategory]);

  return (
    <div className="w-full bg-white py-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .blog-posts * { font-family: 'Plus Jakarta Sans', sans-serif; }

        .gradient-text {
          background: linear-gradient(135deg, #2563eb 0%, #0ea89e 50%, #4ade80 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cat-active {
          background: linear-gradient(135deg, #2563eb, #0ea89e 60%, #4ade80);
          color: white;
          border: none;
        }

        .article-card {
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }
        .article-card:hover {
          border-color: rgba(37,99,235,0.25);
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(37,99,235,0.08);
        }

        .source-badge {
          background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(74,222,128,0.08));
          border: 1px solid rgba(37,99,235,0.15);
        }

        .icon-box {
          background: linear-gradient(135deg, rgba(37,99,235,0.08), rgba(74,222,128,0.1));
          border: 1px solid rgba(37,99,235,0.12);
          transition: all 0.3s ease;
        }
        .article-card:hover .icon-box {
          background: linear-gradient(135deg, #2563eb, #4ade80);
        }
        .article-card:hover .icon-box svg {
          color: white !important;
        }

        .read-link {
          background: linear-gradient(135deg, #2563eb, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          transition: opacity 0.2s;
        }
        .read-link:hover { opacity: 0.75; }

        .avatar-dot {
          background: linear-gradient(135deg, #2563eb, #4ade80);
        }

        .newsletter-card {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid rgba(37,99,235,0.2);
        }

        .newsletter-input {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          transition: all 0.3s ease;
        }
        .newsletter-input::placeholder { color: rgba(255,255,255,0.3); }
        .newsletter-input:focus {
          outline: none;
          border-color: rgba(74,222,128,0.4);
          background: rgba(255,255,255,0.09);
        }

        .newsletter-btn {
          background: linear-gradient(135deg, #2563eb, #0ea89e 60%, #4ade80);
          transition: opacity 0.3s ease;
        }
        .newsletter-btn:hover { opacity: 0.88; }

        .portal-item {
          border: 1px solid #f1f5f9;
          transition: all 0.3s ease;
        }
        .portal-item:hover {
          border-color: rgba(37,99,235,0.2);
          background: rgba(37,99,235,0.03);
        }
        .portal-item:hover .portal-name { color: #2563eb; }
        .portal-item:hover .portal-arrow {
          background: linear-gradient(135deg, #2563eb, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent);
        }
      `}</style>

      <div className="blog-posts max-w-7xl mx-auto px-6 lg:px-12">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-3 gradient-text">
              Sector Inmobiliario
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-none tracking-tight">
              Blog &{' '}
              <span className="gradient-text">Noticias</span>
            </h2>
            <p className="text-slate-400 mt-3 text-base font-light">
              Información actualizada del sector inmobiliario peruano.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? 'cat-active shadow-lg'
                    : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-slate-300 hover:text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Feed */}
          <div className="lg:col-span-8 space-y-6">
            {filteredPosts.map((post) => (
              <article key={post.id} className="article-card bg-white rounded-2xl p-7">
                <div className="flex items-start gap-5">

                  {/* Ícono */}
                  <div className="icon-box w-14 h-14 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="source-badge text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg text-blue-600">
                        {post.source}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {post.readTime} min lectura
                      </span>
                    </div>

                    {/* Título */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                      <a href={post.externalUrl} target="_blank" rel="noopener noreferrer"
                        className="hover:opacity-70 transition-opacity">
                        {post.title}
                      </a>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-400 text-sm leading-relaxed mb-5 font-light">
                      {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="avatar-dot w-6 h-6 rounded-full" />
                        <span className="text-xs font-bold text-slate-600">{post.author}</span>
                      </div>
                      <a href={post.externalUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm read-link">
                        Leer artículo completo
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ stroke: 'url(#grad)' }}>
                          <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#2563eb" />
                              <stop offset="100%" stopColor="#4ade80" />
                            </linearGradient>
                          </defs>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Newsletter */}
            <div className="newsletter-card rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15), transparent)' }} />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl"
                style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.1), transparent)' }} />

              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2 gradient-text">
                  Newsletter
                </p>
                <h4 className="text-xl font-black text-white mb-2 leading-tight">
                  TIYUY al día
                </h4>
                <p className="text-slate-400 text-sm mb-6 font-light leading-relaxed">
                  Recibe las mejores oportunidades de inversión y noticias de la SUNARP en tu correo.
                </p>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  className="newsletter-input w-full rounded-xl px-4 py-3 text-sm mb-3"
                />
                <button className="newsletter-btn w-full text-white font-bold py-3 rounded-xl text-sm tracking-wide">
                  Suscribirme ahora
                </button>
              </div>
            </div>

            {/* Portales */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-5 gradient-text">
                Portales de Referencia
              </p>
              <div className="space-y-2">
                {['Urbania', 'Adondevivir', 'La Encontré', 'ASEI'].map((portal) => (
                  <div key={portal}
                    className="portal-item flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer">
                    <span className="portal-name text-sm font-semibold text-slate-600 transition-colors duration-200">
                      {portal}
                    </span>
                    <svg className="portal-arrow w-4 h-4 text-slate-300 transition-all duration-200"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
