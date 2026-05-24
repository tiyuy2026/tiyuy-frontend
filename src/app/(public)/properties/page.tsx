import { Metadata } from 'next';
import PropertiesContent from './components/PropertiesContent';

export const metadata: Metadata = {
  title: 'Propiedades Inmobiliarias en Perú | Departamentos, Casas y Terrenos - TIYUY',
  description: 'Descubre las mejores propiedades inmobiliarias en Perú. Departamentos, casas, oficinas y terrenos en Lima y provincias. Encuentra tu hogar ideal o tu próxima inversión.',
  keywords: [
    'propiedades en venta Perú',
    'departamentos en venta Lima',
    'casas en venta Perú',
    'terrenos en venta',
    'oficinas en venta',
    'inversión inmobiliaria',
    'comprar inmueble',
    'inmobiliarias Perú'
  ],
  openGraph: {
    title: 'Propiedades Inmobiliarias en Perú | TIYUY',
    description: 'Descubre departamentos, casas y terrenos en las mejores zonas del Perú',
    type: 'website',
    locale: 'es_PE',
    siteName: 'TIYUY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propiedades Inmobiliarias en Perú | TIYUY',
    description: 'Departamentos y casas en las mejores zonas del Perú',
  },
  alternates: {
    canonical: 'https://tiyuy.com/properties',
  },
};

export default function PropertiesPage() {
  return <PropertiesContent />;
}
