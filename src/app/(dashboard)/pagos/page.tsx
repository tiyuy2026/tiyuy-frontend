import { Metadata } from 'next';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { PaymentHistoryClient } from './PaymentHistoryClient';

export const metadata: Metadata = {
  title: 'Historial de Pagos | TIYUY - Gestiona tus Transacciones',
  description: 'Consulta tu historial completo de pagos en TIYUY. Visualiza todas tus transacciones, estados y comprobantes.',
  keywords: ['historial pagos', 'mis pagos', 'transacciones TIYUY', 'comprobantes pago'],
  openGraph: {
    title: 'Historial de Pagos | TIYUY',
    description: 'Gestiona tu historial de pagos en TIYUY',
    url: 'https://tiyuy.com/dashboard/pagos',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tiyuy.com/dashboard/pagos'
  }
};

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Historial de Pagos
            </h1>
            <p className="text-lg text-gray-600">
              Consulta todas tus transacciones y descarga comprobantes
            </p>
          </div>

          <PaymentHistoryClient />
        </div>
      </div>
    </ProtectedRoute>
  );
}
