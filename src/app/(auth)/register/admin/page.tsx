import { Metadata } from 'next';
import { RegisterAdminForm } from '@/presentation/components/auth/RegisterForm/RegisterAdminForm';

export const metadata: Metadata = {
  title: 'Registro Administrador - TIYUY | Bienes Raíces en Perú',
  description: 'Accede como administrador a TIYUY y gestiona la plataforma líder de bienes raíces en Perú.',
  keywords: ['admin tiyuy', 'administrador bienes raíces', 'gestión plataforma inmobiliaria', 'tiyuy admin'],
  robots: { index: false, follow: false },
};

export default function RegisterAdminPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Acceso Restringido
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Registro de Administrador
        </h1>
        <p className="text-gray-600">
          Panel de control completo de la plataforma
        </p>
      </div>
      <RegisterAdminForm />
    </div>
  );
}
