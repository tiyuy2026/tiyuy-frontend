import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Índice de Precio por m² | Precio del Metro Cuadrado por Distrito en Perú | TIYUY',
  description: 'Precio del metro cuadrado de viviendas, departamentos, lotes y proyectos por distrito en Perú. Datos actualizados del mercado inmobiliario peruano para profesionales del sector y compradores.',
  openGraph: {
    title: 'Índice de Precio por m² | TIYUY',
    description: 'Precio del metro cuadrado por distrito en Perú. Datos del mercado inmobiliario actualizados para profesionales del sector.',
    type: 'website',
    siteName: 'TIYUY',
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Índice de Precio por m² | TIYUY',
    description: 'Precio del metro cuadrado por distrito en Perú. Datos actualizados.',
  },
  robots: { index: true, follow: true },
};

export default function PricePerM2Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}