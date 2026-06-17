'use client';

import { useState, useMemo } from 'react';
import { Clock, BookOpen, ArrowRight, Mail } from 'lucide-react';

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
    title: 'Créditos Mivivienda: Requisitos para acceder al bono este 2026',
    excerpt: 'Conoce los nuevos valores de los bonos para la compra de viviendas sostenibles y los requisitos del Fondo Mivivienda.',
    externalUrl: 'https://www.mivivienda.com.pe/PORTALWEB/usuario-busca-viviendas/nuevo-credito-mivivienda.aspx',
    author: 'Gestión Inmobiliaria',
    publishedAt: '2026-02-20',
    readTime: 7,
    category: 'Financiamiento',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    featured: true,
    source: 'Mivivienda.pe'
  },
  {
    id: '2',
    title: '¿Cómo inscribir una propiedad en SUNARP? Guía legal 2026',
    excerpt: 'Evita estafas inmobiliarias registrando tu propiedad. Te explicamos los pasos legales ante la Superintendencia Nacional.',
    externalUrl: 'https://www.gob.pe/709-inscribir-una-propiedad-en-sunarp',
    author: 'Legal TIYUY',
    publishedAt: '2026-02-18',
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
    publishedAt: '2026-02-15',
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
    publishedAt: '2026-02-12',
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
    <div className="w-full bg-[var(--bg-secondary)] antialiased text-[var(--text-primary)] py-12 sm:py-16">
      <div className="w-full max-w-[1920px] mx-auto px-8 xl:px-16">

        {/* HEADER EDITORIAL */}
        <header className="mb-12 border-b border-[var(--border-light)] pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)] mb-2">
                Instituciones & Recursos
              </p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                Blog y Noticias
              </h1>
              <p className="mt-2 text-base text-[var(--text-secondary)] max-w-xl font-medium">
                Información actualizada y fácil de entender sobre el sector inmobiliario peruano.
              </p>
            </div>

            {/* Filtros */}
            <nav className="flex gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[var(--brand-primary)] text-[var(--bg-primary)] shadow-sm'
                      : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* FEED DE CONTENIDO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Listado de Artículos con Elevación Suave */}
          <main className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <article 
                  key={post.id} 
                  className="group flex flex-col justify-between bg-[var(--bg-card)] rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[var(--border-light)] hover:border-[var(--brand-primary)]/30 transition-all duration-300"
                >
                  <div>
                    {/* Imagen con Aspect Ratio controlado */}
                    <div className="w-full aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-[var(--bg-secondary)] relative">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[var(--bg-card)]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold uppercase text-[var(--brand-primary)] tracking-wider shadow-xs">
                        {post.source}
                      </span>
                    </div>

                    {/* Metadatos */}
                    <div className="flex items-center gap-2 mb-2 text-[11px] text-[var(--text-muted)] font-medium">
                      <span className="text-[var(--brand-primary)] font-bold">{post.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime} min
                      </span>
                    </div>

                    {/* Título */}
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2 leading-snug group-hover:text-[var(--brand-primary)] transition-colors line-clamp-2">
                      <a href={post.externalUrl} target="_blank" rel="noopener noreferrer">
                        {post.title}
                      </a>
                    </h2>

                    {/* Excerpt / Resumen */}
                    <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3 opacity-90">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Footer del Post */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-light)] text-xs mt-auto">
                    <span className="text-[var(--text-muted)]">
                      Por <span className="font-semibold text-[var(--text-secondary)]">{post.author}</span>
                    </span>
                    
                    <a 
                      href={post.externalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-[var(--brand-primary)] group-hover:underline underline-offset-4"
                    >
                      <span>Leer artículo</span>
                      <BookOpen className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </main>

          {/* ASIDE LATERAL */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Newsletter Integrado en Bloque Limpio */}
            <section className="bg-[var(--bg-card)] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[var(--border-light)]">
              <div className="w-8 h-1.5 bg-[var(--brand-primary)] rounded-full mb-4" />
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                Boletín TIYUY al día
              </h3>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-4 leading-relaxed font-medium">
                Recibe oportunidades de inversión y guías de la SUNARP directo en tu correo.
              </p>
              
              <div className="space-y-2">
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    id="email-newsletter"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] focus:border-[var(--brand-primary)] focus:outline-none pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm transition-all placeholder-[var(--text-muted)] font-medium"
                  />
                </div>
                <button className="w-full bg-[var(--brand-primary)] text-[var(--bg-primary)] font-bold py-3.5 rounded-xl text-xs sm:text-sm hover:opacity-95 transition-opacity shadow-xs">
                  Registrar mi correo
                </button>
              </div>
            </section>

            {/* Páginas Útiles */}
            <section className="bg-[var(--bg-card)] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[var(--border-light)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Páginas útiles recomendadas
              </h3>
              <div className="divide-y divide-[var(--border-light)]">
                {['Urbania', 'Adondevivir', 'La Encontré', 'ASEI'].map((portal) => (
                  <a 
                    key={portal}
                    href="#"
                    className="flex items-center justify-between py-3 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] group transition-colors"
                  >
                    <span>{portal}</span>
                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all" />
                  </a>
                ))}
              </div>
            </section>

          </aside>
        </div>
      </div>
    </div>
  );
}