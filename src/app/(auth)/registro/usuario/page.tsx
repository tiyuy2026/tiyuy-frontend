import { Metadata } from 'next';
import { RegisterForm } from '@/presentation/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Registro Usuario - TIYUY | Bienes Raíces en Perú',
  description: 'Regístrate como usuario en TIYUY y encuentra tu hogar ideal. La mejor plataforma de bienes raíces en Perú.',
  keywords: ['registro usuario tiyuy', 'buscar casa perú', 'comprar propiedad', 'tiyuy usuario'],
  robots: { index: false, follow: false },
};

export default function RegisterUsuarioPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
          Usuario
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crea tu cuenta de Usuario
        </h1>
        <p className="text-gray-600">
          Busca tu hogar ideal y contacta con los mejores agentes inmobiliarios
        </p>
      </div>
      
      <RegisterForm />
    </div>
  );
}
