'use client';

interface PaymentSuccessProps {
  payment: any;
  onClose: () => void;
}

export function PaymentSuccess({ payment, onClose }: PaymentSuccessProps) {
  return (
    <div className="text-center p-12">
      <div className="text-6xl mb-6">✅</div>
      <h2 className="text-3xl font-bold text-green-600 mb-4">¡Pago exitoso!</h2>
      <p className="text-xl text-gray-700 mb-8">
        Se acreditaron {payment.amount} {payment.currency} a tu wallet
      </p>
      
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 max-w-md mx-auto">
        <p className="text-sm text-green-800 mb-2">ID de transacción:</p>
        <p className="font-mono font-semibold text-green-900">{payment.transactionId}</p>
      </div>

      <button
        onClick={onClose}
        className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
      >
        Ir a mi wallet
      </button>
    </div>
  );
}
