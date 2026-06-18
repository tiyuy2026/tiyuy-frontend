import { Metadata } from 'next';
import { RegisterUsuarioForm } from '@/presentation/components/auth/RegisterForm/RegisterUsuarioForm';

export const metadata: Metadata = {
  title: 'Registro Usuario - TIYUY',
  description: 'Crea tu cuenta de usuario en TIYUY',
  robots: { index: false, follow: false },
};

export default function RegisterUsuarioPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-sm bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300">
        <RegisterUsuarioForm />
      </div>
    </div>
  );
}