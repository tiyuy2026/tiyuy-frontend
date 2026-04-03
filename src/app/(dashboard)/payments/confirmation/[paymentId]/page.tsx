import { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentConfirmationClient } from './PaymentConfirmationClient';

interface Props {
  params: Promise<{
    paymentId: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Confirmación de Pago | TIYUY',
  description: 'Confirma tu pago y activa tu plan en TIYUY. Proceso seguro y rápido.',
  keywords: ['confirmación pago', 'pago exitoso', 'TIYUY pago', 'activación plan'],
  openGraph: {
    title: 'Confirmación de Pago | TIYUY',
    description: 'Tu pago ha sido procesado exitosamente en TIYUY',
    url: 'https://tiyuy.com/payments/confirmation',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tiyuy.com/payments/confirmation'
  }
};

export default async function PaymentConfirmationPage({ params }: Props) {
  const resolvedParams = await params;
  const paymentId = resolvedParams.paymentId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Cargando confirmación...</p>
          </div>
        </div>
      }>
        <PaymentConfirmationClient paymentId={paymentId} />
      </Suspense>
    </div>
  );
}
