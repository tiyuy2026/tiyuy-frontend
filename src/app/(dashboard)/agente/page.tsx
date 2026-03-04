import { Metadata } from 'next';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { AgentDashboardClient } from './AgentDashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard Agente | TIYUY - Gestiona tu Cartera de Clientes',
  description: 'Panel especial para agentes inmobiliarios. Gestiona propiedades, clientes y leads desde tu dashboard TIYUY.',
  keywords: ['dashboard agente', 'gestión clientes', 'cartera inmobiliaria', 'TIYUY agente'],
  openGraph: {
    title: 'Dashboard Agente | TIYUY',
    description: 'Gestiona tu cartera de clientes y propiedades',
    url: 'https://tiyuy.com/dashboard/agente',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tiyuy.com/dashboard/agente'
  }
};

export default function AgentDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Dashboard de Agente
            </h1>
            <p className="text-lg text-gray-600">
              Gestiona tus propiedades y cartera de clientes
            </p>
          </div>

          <AgentDashboardClient />
        </div>
      </div>
    </ProtectedRoute>
  );
}
