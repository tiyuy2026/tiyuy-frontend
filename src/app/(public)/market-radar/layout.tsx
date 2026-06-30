import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Radar del Mercado Inmobiliario | Indicadores de Precio, Oferta y Demanda | TIYUY',
  description: 'Analítica del mercado inmobiliario en Perú: precios por distrito, distritos más buscados, oferta de viviendas, proyectos y lotes. Datos actualizados para inversores y profesionales del sector inmobiliario.',
  openGraph: {
    title: 'Radar del Mercado Inmobiliario | TIYUY',
    description: 'Indicadores de precio, oferta y demanda del mercado inmobiliario en Perú. Datos actualizados para profesionales del sector.',
    type: 'website',
    siteName: 'TIYUY',
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radar del Mercado Inmobiliario | TIYUY',
    description: 'Indicadores de precio, oferta y demanda del mercado inmobiliario en Perú.',
  },
  robots: { index: true, follow: true },
};

export default function MarketRadarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}