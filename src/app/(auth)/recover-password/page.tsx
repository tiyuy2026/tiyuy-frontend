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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
