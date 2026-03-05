import { Metadata } from 'next';
import { ResetPasswordForm } from '@/presentation/components/auth/ResetPasswordForm/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña - TIYUY | Bienes Raíces en Perú',
  description: 'Restablece tu contraseña de TIYUY de forma segura. Plataforma líder de bienes raíces en Perú.',
  keywords: ['restablecer contraseña tiyuy', 'cambiar contraseña', 'reset password', 'tiyuy perú'],
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
