import { Metadata } from 'next';
import { RegisterAdminForm } from '@/presentation/components/auth/RegisterForm/RegisterAdminForm';
import { ShieldAlert } from 'lucide-react'; 
export const metadata: Metadata = {
  title: 'Registro Administrador - TIYUY | Bienes Raíces en Perú',
  description: 'Accede como administrador a TIYUY y gestiona la plataforma líder de bienes raíces en Perú.',
  keywords: ['admin tiyuy', 'administrador bienes raíces', 'gestión plataforma inmobiliaria', 'tiyuy admin'],
  robots: { index: false, follow: false },
};

export default function RegisterAdminPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-sm animate-pulse">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>Acceso Restringido</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Registro de Administrador
        </h1>
        <p className="text-gray-500 text-sm">
          Panel de control completo de la plataforma TIYUY
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-1">
        <RegisterAdminForm />
      </div>
    </div>
  );
}