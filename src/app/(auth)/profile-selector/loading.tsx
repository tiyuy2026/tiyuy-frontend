import { Metadata } from 'next';
import { RegisterUsuarioForm } from '@/presentation/components/auth/RegisterForm/RegisterUsuarioForm';

export const metadata: Metadata = {
  title: 'Registro Usuario - TIYUY',
  description: 'Crea tu cuenta de usuario en TIYUY',
  robots: { index: false, follow: false },
};

export default function RegisterUsuarioPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Registro de Usuario
        </h1>
        <p className="text-gray-600">
          Completa tus datos para crear tu cuenta
        </p>
      </div>
      <RegisterUsuarioForm />
    </div>
  );
}
