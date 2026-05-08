'use client';

import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { PaymentTransaction } from '@/core/domain/entities/Admin';
import { CreditCard, Calendar, User, DollarSign, Tag, Info } from 'lucide-react';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransaction;
  canRefund: boolean;
  onRefund: (transaction: PaymentTransaction, reason: string) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
  canRefund,
  onRefund
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <CreditCard className="w-32 h-32 rotate-12" />
        </div>

        <div className="flex flex-col gap-1 mb-8">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Detalles de Pago</h3>
          <p className="text-xs text-gray-400 font-mono">ID: #{transaction.id}</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto Total</p>
              <p className="text-lg font-black text-gray-900">
                {transaction.currency === 'PEN' ? 'S/' : '$'} {transaction.amount.toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
              transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
              transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              transaction.status === 'FAILED' ? 'bg-red-100 text-red-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {transaction.status === 'COMPLETED' ? 'COMPLETADO' :
               transaction.status === 'PENDING' ? 'PENDIENTE' :
               transaction.status === 'FAILED' ? 'FALLIDO' :
               transaction.status === 'REFUNDED' ? 'REEMBOLSADO' : transaction.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Usuario</p>
                <p className="text-sm font-bold text-gray-700">Usuario ID: {transaction.userId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent">
              <Tag className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Suscripción</p>
                <p className="text-sm font-bold text-gray-700">{transaction.subscriptionId ? `#${transaction.subscriptionId}` : 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fecha</p>
                <p className="text-sm font-bold text-gray-700">{new Date(transaction.createdAt).toLocaleString('es-PE')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent">
              <Info className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Descripción</p>
                <p className="text-sm font-bold text-gray-700 truncate max-w-[250px]">{transaction.description}</p>
              </div>
            </div>
          </div>

          {transaction.paymentId && (
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-1">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">ID de Referencia Bancaria</p>
              <p className="text-xs font-mono font-bold text-blue-800 break-all">{transaction.paymentId}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-gray-100">
          {canRefund && transaction.status === 'COMPLETED' && (
            <Button 
              variant="primary"
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-red-100 transition-all active:scale-95"
              onClick={() => {
                const reason = prompt('Ingrese el motivo del reembolso:');
                if (reason) {
                  onRefund(transaction, reason);
                  onClose();
                }
              }}
            >
              Reembolsar Operación
            </Button>
          )}
          <Button 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-100 transition-all active:scale-95" 
            onClick={onClose}
          >
            Cerrar Ventana
          </Button>
        </div>
      </div>
    </Modal>
  );
};
