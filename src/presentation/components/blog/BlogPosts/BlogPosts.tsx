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

export function BlogPosts({ selectedRole = { color: 'text-brand', title: 'Usuario' } }) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredPosts = useMemo(() =>
    selectedCategory === 'Todos'
      ? blogPosts
      : blogPosts.filter(post => post.category === selectedCategory),
    [selectedCategory]);

  return (
    <div className="w-full max-w-7xl mx-auto bg-white antialiased text-gray-900 selection:bg-brand/10 py-16">
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">

        <header className="mb-12 border-b border-gray-200 pb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand mb-3">
                Instituciones & Recursos
              </p>
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
                Blog y Noticias
              </h1>
              <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                Información actualizada y fácil de entender sobre el sector inmobiliario peruano.
              </p>
            </div>

            <nav className="flex flex-wrap gap-2" aria-label="Filtros por categoría">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-brand text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-brand-light-hover hover:text-brand hover:border-brand/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <main className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPosts.map((post) => (
                <article 
                  key={post.id} 
                  className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:border-brand/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-48 bg-white rounded-lg overflow-hidden border border-gray-200 mb-4">
                      <img 
                        src={post.image} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-center gap-3 mb-3 flex-wrap text-xs text-gray-600">
                      <span className="bg-brand-light px-2.5 py-0.5 rounded font-bold uppercase text-brand border border-brand/10">
                        {post.source}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {post.readTime} min de lectura
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 mb-2 leading-snug hover:underline decoration-brand line-clamp-2">
                      <a href={post.externalUrl} target="_blank" rel="noopener noreferrer">
                        {post.title}
                      </a>
                    </h2>

                    <p className="text-gray-600 text-xs font-medium leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200 gap-2 mt-auto">
                    <span className="text-xs text-gray-500">
                      Por: <strong className="font-semibold text-gray-700">{post.author}</strong>
                    </span>
                    
                    <a 
                      href={post.externalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:opacity-80 underline underline-offset-4"
                    >
                      <span>Leer completo</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </main>

          <aside className="lg:col-span-4 space-y-6">

            <section className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Boletín TIYUY al día
              </h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed font-medium">
                Recibe oportunidades de inversión y guías de la SUNARP directo en tu correo de forma simple.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="email-newsletter" className="sr-only">Correo electrónico</label>
                  <input
                    id="email-newsletter"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-white text-gray-900 border border-gray-300 focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-none px-4 py-3 rounded-xl text-sm transition-colors placeholder-gray-400 font-medium"
                  />
                </div>
                <button className="w-full bg-brand hover:opacity-90 text-white font-bold py-3.5 rounded-xl text-sm transition-opacity shadow-sm">
                  Registrar mi correo
                </button>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Páginas útiles recomendadas
              </h3>
              <div className="divide-y divide-gray-200">
                {['Urbania', 'Adondevivir', 'La Encontré', 'ASEI'].map((portal) => (
                  <a 
                    key={portal}
                    href="#"
                    className="flex items-center justify-between py-3 text-sm font-semibold text-gray-700 hover:text-brand group transition-colors"
                  >
                    <span>{portal}</span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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