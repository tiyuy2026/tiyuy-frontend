import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corredores Inmobiliarios en Perú | Directorio de Agentes | TIYUY',
  description: 'Directorio de corredores y agentes inmobiliarios en Perú. Encuentra profesionales de bienes raíces por distrito, especialidad y experiencia. Conecta con el mejor agente para tu propiedad.',
  openGraph: {
    title: 'Corredores Inmobiliarios en Perú | TIYUY',
    description: 'Directorio de agentes y corredores inmobiliarios en Perú. Encuentra al profesional ideal para tu próxima operación.',
    type: 'website',
    siteName: 'TIYUY',
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corredores Inmobiliarios en Perú | TIYUY',
    description: 'Directorio de agentes inmobiliarios en Perú.',
  },
  robots: { index: true, follow: true },
};

export default function CorredoresLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}