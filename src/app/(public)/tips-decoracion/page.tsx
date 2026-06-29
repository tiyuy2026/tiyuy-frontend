'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Home, Palette, Lightbulb, Sparkles, Sofa,
  Maximize2, RotateCcw, Paintbrush, Ruler, TrendingUp, ArrowUpRight,
  ExternalLink, Layout, BookOpen, Leaf, Star
} from 'lucide-react';

const blogs = [
  {
    name: 'Decor Center',
    url: 'https://blog.decorcenter.pe/',
    description: 'Remodelación, acabados y estilo para transformar tu hogar con calidad y diseño.',
    image: 'https://blog.decorcenter.pe/wp-content/uploads/2024/02/griferias-para-todo-tipo-de-bano.jpg',
  },
  {
    name: 'Decorplas',
    url: 'https://decorplas.pe/blog/',
    description: 'Tendencias, consejos prácticos y soluciones inteligentes para interiores modernos.',
    image: 'https://decorplas.pe/wp-content/uploads/cortinas-roller-decoblinds-scaled.png',
  },
  {
    name: 'Yolodecoro',
    url: 'https://yolodecoro.pe/blog/',
    description: 'Ideas frescas de muebles y decoración para el día a día de tu hogar.',
    image: 'https://yolodecoro.pe/wp-content/uploads/2022/10/Cama-Matryoshka-con-almacenaje-blanco-2.jpg.webp',
  },
  {
    name: 'Decorilla',
    url: 'https://www.decorilla.com/online-decorating/es/sitios-web-de-diseno-de-interiores',
    description: 'Inspiración global y recursos curados de diseño de interiores de primer nivel.',
    image: 'https://cdn-bnokp.nitrocdn.com/QNoeDwCprhACHQcnEmHgXDhDpbEOlRHH/assets/images/optimized/rev-2f89e05/www.decorilla.com/online-decorating/wp-content/uploads/2024/10/living-room-by-top-interior-design-website-Decorilla-2048x1148.jpg',
  },
];

const tips = [
  {
    icon: <Maximize2 className="w-5 h-5" />,
    title: 'Ideas para espacios pequeños',
    description: 'Aprovecha cada metro cuadrado con soluciones inteligentes de almacenamiento, muebles multifuncionales y distribución estratégica.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: 'Colores y materiales',
    description: 'Descubre cómo elegir paletas cromáticas y texturas que transforman la personalidad de cada ambiente de tu hogar.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Tendencias por ambiente',
    description: 'Desde la sala hasta el dormitorio, explora estilos actuales que combinan confort, estética y funcionalidad.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: <RotateCcw className="w-5 h-5" />,
    title: 'Errores comunes al decorar',
    description: 'Evita los fallos más frecuentes y aprende a distribuir, iluminar y decorar con criterios profesionales.',
    color: 'bg-blue-50 text-blue-600',
  },
];

export default function TipsDecoracionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-[420px] sm:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://cdn-bnokp.nitrocdn.com/QNoeDwCprhACHQcnEmHgXDhDpbEOlRHH/assets/images/optimized/rev-2f89e05/www.decorilla.com/online-decorating/wp-content/uploads/2024/10/living-room-by-top-interior-design-website-Decorilla-2048x1148.jpg"
            alt="Living room decor"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full tracking-wide uppercase mb-4">
              <BookOpen className="w-3 h-3" />
              Guía de inspiración
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              Tips de decoración
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mt-4 max-w-lg leading-relaxed">
              Inspírate, aprende y transforma tu hogar con ideas curadas para cada espacio.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Editorial */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-8 sm:p-10">
            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                En Tiyuy creemos que un hogar no es solo un lugar donde vivir, es el espacio donde la vida sucede. Por eso creamos esta sección: para inspirarte, orientarte y ayudarte a tomar las mejores decisiones de decoración para tu hogar.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Sabemos que decorar puede ser abrumador. Colores que no combinan, muebles que no encajan, espacios que no fluyen. Pero también sabemos que con la información adecuada, cualquier persona puede transformar su casa en un espacio que refleje su personalidad, su estilo y sus necesidades.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Aquí encontrarás ideas prácticas, tendencias actuales, guías paso a paso y recomendaciones curadas de los mejores blogs de decoración del Perú y el mundo. Desde cómo aprovechar espacios pequeños hasta cómo elegir la paleta de colores perfecta para cada ambiente, nuestro objetivo es acompañarte en cada decisión.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Tiyuy no solo te ayuda a encontrar el inmueble ideal, también queremos que lo hagas tuyo. Porque un hogar no se compra solo con llaves, se construye con cada detalle, cada color, cada mueble y cada recuerdo que pones en él.
              </p>
              <div className="border-t border-gray-100 pt-6 mt-8">
                <p className="text-gray-500 italic">
                  Explora nuestras guías, descubre nuevas ideas y empieza a imaginar cómo quieres que se vea tu próximo hogar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Internal Cards */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Guías prácticas</h2>
            <p className="text-gray-400 mt-2">Contenido curado para ayudarte a decorar con confianza</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl border border-gray-100/80 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl ${tip.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {tip.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{tip.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorar <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blogs Section */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Blogs que recomendamos</h2>
            <p className="text-gray-400 mt-2">Fuentes de inspiración que seguimos y recomendamos</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {blogs.map((blog, idx) => (
              <a
                key={idx}
                href={blog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border border-gray-100/80 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 block"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5 group-hover:text-teal-600 transition-colors">{blog.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{blog.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 uppercase tracking-wider">
                    Visitar blog <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-8 sm:p-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">¿Listo para transformar tu hogar?</h3>
            <p className="text-teal-100 text-sm sm:text-base max-w-lg mx-auto mb-6">
              Explora propiedades que se adapten a tu estilo y empieza a imaginar tu próximo espacio.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-colors shadow-lg"
            >
              <Home className="w-4 h-4" />
              Explorar propiedades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}