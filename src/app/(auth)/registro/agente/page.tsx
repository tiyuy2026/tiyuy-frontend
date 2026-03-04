import { Metadata } from 'next';
import { RegisterAgenteForm } from '@/presentation/components/auth/RegisterForm/';

export const metadata: Metadata = {
  title: 'Registro Agente Inmobiliario - TIYUY | Bienes Raíces en Perú',
  description: 'Regístrate como agente inmobiliario en TIYUY y publica propiedades. Únete a la mejor plataforma de bienes raíces en Perú.',
  keywords: ['agente inmobiliario tiyuy', 'registro agente', 'publicar propiedades perú', 'tiyuy agentes'],
  robots: { index: false, follow: false },
};

export default function RegisterAgentePage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Registro de Agente Inmobiliario
        </h1>
        <p className="text-gray-600">
          Completa tus datos profesionales
        </p>
      </div>
      <RegisterAgenteForm />
    </div>
  );
}
