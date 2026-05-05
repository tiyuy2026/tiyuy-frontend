import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía para Alquilar en Perú | SUNARP, SUNAT, SAT - TIYUY',
  description: 'Guía completa para alquilar propiedades en Perú. Aprende a verificar propiedades en SUNARP, consultar deudas en SUNAT/SAT, y protegerte de estafas inmobiliarias.',
  keywords: [
    'guía alquilar Perú',
    'SUNARP consulta',
    'SUNAT consulta',
    'SAT Lima',
    'verificar propiedad',
    'alquilar departamento',
    'contrato alquiler Perú',
    'evitar estafas inmobiliarias',
    'partida registral',
    'predial arbitrios'
  ],
  openGraph: {
    title: 'Guía Completa para Alquilar en Perú | TIYUY',
    description: 'Verifica propiedades en SUNARP, consulta deudas en SUNAT/SAT. Protégete de estafas inmobiliarias.',
    type: 'website',
    locale: 'es_PE',
    siteName: 'TIYUY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía para Alquilar en Perú | TIYUY',
    description: 'SUNARP, SUNAT, SAT - Todo lo que necesitas saber',
  },
  alternates: {
    canonical: 'https://tiyuy.com/rental-guide',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
