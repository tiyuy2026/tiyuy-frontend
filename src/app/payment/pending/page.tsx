'use client';

import { Suspense } from 'react';
import PaymentPendingContent from './PaymentPendingContent';

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}
