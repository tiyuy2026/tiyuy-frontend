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
    // Imagen: Edificios modernos residenciales
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
    // Imagen: Mazo de justicia o documentos legales
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
    // Imagen: Skyline de ciudad moderna (Lima style)
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
    // Nueva imagen: Maqueta de arquitectura y planos (más estable)
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
    <div className="w-full bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Seccional */}
        <div className="flex items-end justify-between mb-12 border-b border-slate-200 pb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Blog & <span className="text-blue-600">Noticias</span>
            </h2>
            <p className="text-slate-500 font-medium">Información actualizada del sector inmobiliario peruano.</p>
          </div>
          <div className="hidden md:flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Feed de Noticias */}
          <div className="lg:col-span-8 space-y-10">
            {filteredPosts.map((post) => (
              <article key={post.id} className="group flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-2/5 shrink-0 overflow-hidden rounded-xl bg-slate-200 aspect-video md:aspect-square lg:aspect-video">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                      {post.source}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    <a href={post.externalUrl} target="_blank" rel="noopener noreferrer">
                      {post.title}
                    </a>
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6 line-clamp-2 md:line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{post.author}</span>
                    </div>
                    <a 
                      href={post.externalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-blue-600 flex items-center gap-1 group/link"
                    >
                      Leer fuente original
                      <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 p-8 rounded-2xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2 text-blue-400">Newsletter TIYUY</h4>
                <p className="text-slate-400 text-sm mb-6">Recibe las mejores oportunidades de inversión y noticias de la SUNARP en tu correo.</p>
                <input 
                  type="email" 
                  placeholder="tu@correo.com" 
                  className="w-full bg-slate-800 border-none rounded-lg px-4 py-3 text-sm mb-3 focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                  Suscribirme ahora
                </button>
              </div>
              {/* Decoración abstracta de fondo */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="p-6 border border-slate-200 rounded-2xl">
              <h4 className="font-black text-slate-900 mb-4 tracking-tighter uppercase text-xs">Portales de Referencia</h4>
              <div className="grid grid-cols-1 gap-3">
                {['Urbania', 'Adondevivir', 'La Encontré', 'ASEI'].map((portal) => (
                  <div key={portal} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
                    <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600">{portal}</span>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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