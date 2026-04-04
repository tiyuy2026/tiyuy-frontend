'use client';

import { Wallet } from '@/core/domain/entities/Wallet';
import Link from 'next/link';

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? 'US$' : 'S/';
    return `${symbol} ${amount.toLocaleString('es-PE')}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Tu Wallet</h2>
          <p className="opacity-90">Saldo disponible</p>
        </div>
        <div className="text-4xl">💰</div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="text-3xl font-bold">
          {formatCurrency(wallet.balance, wallet.currency)}
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm opacity-90">
          <div>
            <div className="text-xs">Créditos</div>
            <div className="font-semibold text-lg">{wallet.availableCredits}</div>
          </div>
          <div>
            <div className="text-xs">Comprados</div>
            <div className="font-semibold text-lg">{wallet.totalCreditsPurchased}</div>
          </div>
          <div>
            <div className="text-xs">Gastados</div>
            <div className="font-semibold text-lg">{wallet.totalSpent}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/plans"
          className="py-3 px-4 bg-white/20 backdrop-blur-sm rounded-lg text-center font-semibold hover:bg-white/30 transition-all"
        >
          Recargar
        </Link>
        <Link
          href="/wallet"
          className="py-3 px-4 bg-white/20 backdrop-blur-sm rounded-lg text-center font-semibold hover:bg-white/30 transition-all"
        >
          Ver historial
        </Link>
      </div>
    </div>
  );
}
