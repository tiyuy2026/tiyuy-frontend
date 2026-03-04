import { Metadata } from 'next';
import { RegisterForm } from '@/presentation/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Crear Cuenta - TIYUY | Bienes Raíces en Perú',
  description: 'Regístrate en TIYUY y únete a la mejor plataforma de bienes raíces en Perú. Publica propiedades o encuentra tu hogar ideal.',
  keywords: ['crear cuenta tiyuy', 'registrarse bienes raíces perú', 'cuenta inmobiliaria', 'tiyuy registro'],
  openGraph: {
    title: 'Crear Cuenta - TIYUY | Bienes Raíces en Perú',
    description: 'Regístrate en TIYUY y accede a las mejores oportunidades inmobiliarias en Perú.',
    type: 'website',
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crear Cuenta - TIYUY | Bienes Raíces en Perú',
    description: 'Regístrate en TIYUY y accede a las mejores oportunidades inmobiliarias en Perú.',
  },
  robots: { index: true, follow: true },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
