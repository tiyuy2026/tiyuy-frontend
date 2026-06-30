import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inmobiliarias en Perú | Directorio de Agencias Inmobiliarias | TIYUY',
  description: 'Directorio completo de inmobiliarias en Perú. Encuentra agencias y corredores de bienes raíces, compara sus propiedades publicadas y contacta directamente con profesionales del sector inmobiliario.',
  openGraph: {
    title: 'Inmobiliarias en Perú | TIYUY',
    description: 'Directorio de agencias inmobiliarias en Perú. Encuentra la mejor agencia para tu próxima propiedad.',
    type: 'website',
    siteName: 'TIYUY',
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inmobiliarias en Perú | TIYUY',
    description: 'Directorio de agencias inmobiliarias en Perú.',
  },
  robots: { index: true, follow: true },
};

export default function InmobiliariasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}