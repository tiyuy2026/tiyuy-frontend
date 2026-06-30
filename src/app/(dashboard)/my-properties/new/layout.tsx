import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publicar Propiedad | Crear Anuncio Inmobiliario | TIYUY',
  description: 'Publica tu propiedad en TIYUY. Completa el formulario con fotos, precio, ubicación y detalles para llegar a miles de compradores e inquilinos en Perú.',
  robots: { index: false, follow: false },
};

export default function NewPropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}