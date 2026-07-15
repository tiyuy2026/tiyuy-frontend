'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { BrickCheckout } from '@/presentation/components/payments/BrickCheckout/BrickCheckout';

export default function CheckoutPage() {
  const params = useParams();
  const sp = useSearchParams();
  const sid = params.subscriptionId as string;
  const [amount, setAmount] = useState(Number(sp.get('amount') || '0'));
  const [plan, setPlan] = useState(sp.get('plan') || 'Plan');

  useEffect(() => {
    if (amount > 0) return;
    if (!sid) return;
    fetch(`/api/finance/subscriptions/${sid}/price`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setAmount(d.amount || 0); setPlan(d.plan || 'Plan'); } })
      .catch(() => {});
  }, [sid, amount]);

  if (amount <= 0) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#5CB85C] rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-[500px] mx-auto px-4 pt-6 pb-96">
        {/* LED banner */}
        <div className="rounded-xl p-6 mb-6 text-center" style={{ background: '#7AC943' }}>
          <img src="/tiyuy.svg" alt="TIYUY" className="h-8 mx-auto mb-3" />
          <p className="text-white/80 text-sm italic max-w-[400px] mx-auto leading-relaxed">Cada propiedad publicada es una puerta que abres.</p>
          <p className="text-white/40 text-[10px] font-mono tracking-wider uppercase mt-2">pago seguro · mercado pago</p>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Resumen</h2>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium text-gray-900">{plan}</p>
                <p className="text-xs text-gray-400 mt-0.5">Mensual</p>
              </div>
              <p className="text-xl font-bold text-gray-900">S/ {amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Tarjeta</h2>
          <BrickCheckout amount={amount} subscriptionId={sid} />
        </div>

        <p className="text-xs text-gray-400 text-center">Procesado por <span className="text-[#009EE3] font-medium">Mercado Pago</span></p>
      </div>
    </ProtectedRoute>
  );
}