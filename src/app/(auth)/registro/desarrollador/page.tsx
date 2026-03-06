import { Metadata } from 'next';
import { RegisterDeveloperForm } from '@/presentation/components/auth/RegisterForm/RegisterDeveloperForm';

export const metadata: Metadata = {
  title: 'Publica tu Proyecto Gratis - TIYUY | Desarrolladores Inmobiliarios',
  description: 'Regístra tu empresa y publica tu primer proyecto inmobiliario gratis. 30 días de prueba + unidades ilimitadas (departamentos, casas, oficinas, lotes).',
  keywords: ['publicar proyecto gratis tiyuy', 'desarrollador inmobiliario', 'proyecto departamentos', 'inmobiliaria peru', 'tiyuy developer'],
  robots: { index: false, follow: false },
};

export default function RegisterDeveloperPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          30 días gratis - Trial Enterprise
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Publica tu Proyecto Inmobiliario
        </h1>
        <p className="text-gray-600">
          Regístra tu empresa y publica tu primer proyecto con unidades ilimitadas
        </p>
      </div>
      <RegisterDeveloperForm />
    </div>
  );
}
