import { Metadata } from 'next';
import { BlogSection } from '@/presentation/components/blog/BlogSection/BlogSection';
import { BlogPosts } from '@/presentation/components/blog/BlogPosts/BlogPosts';
import { CompleteServices } from '@/presentation/components/services/CompleteServices/CompleteServices';

export const metadata: Metadata = {
  title: 'Blog Inmobiliario | Tips, Guías y Noticias - TIYUY',
  description: 'Descubre tips, guías y noticias sobre bienes raíces en Perú. Aprende a comprar, vender y alquilar propiedades con seguridad. Consejos de expertos inmobiliarios.',
  keywords: [
    'blog inmobiliario Perú',
    'tips bienes raíces',
    'guía comprar departamento',
    'consejos vender casa',
    'noticias inmobiliarias',
    'inversión inmobiliaria Perú',
    'mercado inmobiliario Lima'
  ],
  openGraph: {
    title: 'Blog Inmobiliario | Tips y Guías - TIYUY',
    description: 'Tips, guías y noticias sobre bienes raíces en Perú',
    type: 'website',
    locale: 'es_PE',
    siteName: 'TIYUY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Inmobiliario | TIYUY',
    description: 'Tips y guías sobre bienes raíces en Perú',
  },
  alternates: {
    canonical: 'https://tiyuy.com/blog',
  },
};

export default function BlogPage() {
  return (
    <main>
      <BlogSection />
      <BlogPosts />
      <CompleteServices />
    </main>
  );
}
