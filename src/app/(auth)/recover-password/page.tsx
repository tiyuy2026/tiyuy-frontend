import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/presentation/components/auth/ForgotPasswordForm/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Recuperar Contraseña - TIYUY | Bienes Raíces en Perú',
  description: 'Recupera tu contraseña de TIYUY fácilmente. Plataforma líder de bienes raíces en Perú.',
  keywords: ['recuperar contraseña tiyuy', 'olvidé mi contraseña', 'resetear contraseña', 'tiyuy perú'],
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-sm bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}