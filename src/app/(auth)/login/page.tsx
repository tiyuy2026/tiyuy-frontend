import { Metadata } from 'next';
import { LoginForm } from '@/presentation/components/auth';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - TIYUY | Bienes Raíces en Perú',
  description: 'Inicia sesión en tu cuenta TIYUY y accede a la mejor plataforma de bienes raíces en Perú. Encuentra tu hogar ideal.',
  keywords: ['iniciar sesión tiyuy', 'login bienes raíces perú', 'cuenta tiyuy', 'acceso tiyuy'],
  openGraph: {
    title: 'Iniciar Sesión - TIYUY | Bienes Raíces en Perú',
    description: 'Accede a tu cuenta TIYUY y descubre las mejores propiedades en Perú.',
    type: 'website',
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Iniciar Sesión - TIYUY | Bienes Raíces en Perú',
    description: 'Accede a tu cuenta TIYUY y descubre las mejores propiedades en Perú.',
  },
  robots: { index: true, follow: true },
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <LoginForm />
    </div>
  );
}
