import { Metadata } from 'next';
import ProfileSelector from '@/presentation/components/auth/ProfileSelector/ProfileSelector';

export const metadata: Metadata = {
  title: 'Elige tu Perfil - TIYUY | Bienes Raíces en Perú',
  description: 'Únete a TIYUY como usuario, agente inmobiliario, desarrollador o administrador. La plataforma líder de bienes raíces en Perú.',
  keywords: ['bienes raíces perú', 'perfil inmobiliario', 'agente inmobiliario', 'desarrollador inmobiliario', 'tiyuy perú'],
  openGraph: {
    title: 'Elige tu Perfil - TIYUY | Bienes Raíces en Perú',
    description: 'Únete a TIYUY y encuentra tu hogar ideal o publica propiedades. Plataforma líder de bienes raíces en Perú.',
    type: 'website',
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elige tu Perfil - TIYUY | Bienes Raíces en Perú',
    description: 'Únete a TIYUY y encuentra tu hogar ideal o publica propiedades.',
  },
  robots: { index: true, follow: true },
};

export default function ProfileSelectorPage() {
  return (
    <div className="py-8">
      <ProfileSelector />
    </div>
  );
}
