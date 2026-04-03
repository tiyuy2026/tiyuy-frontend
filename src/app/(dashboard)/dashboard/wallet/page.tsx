'use client';

import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useWalletBalance, useWalletTransactions } from '@/presentation/hooks/useFinance';
import { WalletCard } from '@/presentation/components/finance';
import Link from 'next/link';

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading } = useWalletBalance();
  const { data: transactions, isLoading: transactionsLoading } = useWalletTransactions();

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Billetera</h1>
          <p className="text-gray-600 mt-1">Gestiona tus créditos y transacciones</p>
        </div>

        {walletLoading ? (
          <div className="animate-pulse bg-white rounded-lg shadow p-8 h-64" />
        ) : wallet ? (
          <WalletCard wallet={wallet} />
        ) : null}

        {/* Transacciones recientes aquí */}
      </div>
    </ProtectedRoute>
  );
}
