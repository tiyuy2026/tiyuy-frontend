import { Metadata } from 'next';
import ProjectsContent from './components/ProjectsContent';

export const metadata: Metadata = {
  title: 'Proyectos Inmobiliarios en Perú | Departamentos y Casas - TIYUY',
  description: 'Descubre los mejores proyectos inmobiliarios en Perú. Departamentos, casas y lotes en Lima y provincias. Proyectos de vivienda e inversión de las principales inmobiliarias.',
  keywords: [
    'proyectos inmobiliarios Perú',
    'departamentos en venta Lima',
    'proyectos de vivienda',
    'inversión inmobiliaria',
    'casas nuevas Perú',
    'proyectos inmobiliarios 2024',
    'inmobiliarias Perú',
    'comprar departamento estreno'
  ],
  openGraph: {
    title: 'Proyectos Inmobiliarios en Perú | TIYUY',
    description: 'Descubre departamentos, casas y lotes en los mejores proyectos inmobiliarios del Perú',
    type: 'website',
    locale: 'es_PE',
    siteName: 'TIYUY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proyectos Inmobiliarios en Perú | TIYUY',
    description: 'Departamentos y casas en los mejores proyectos del Perú',
  },
  alternates: {
    canonical: 'https://tiyuy.com/projects',
  },
};

export default function ProjectsPage() {
  return <ProjectsContent />;
}
