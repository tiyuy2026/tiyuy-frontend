'use client';

import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { PaymentTransaction } from '@/core/domain/entities/Admin';
import { CreditCard, Calendar, User, DollarSign, Tag, Info, X } from 'lucide-react';

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
      <div className="bg-white rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header verde */}
        <div className="bg-[#00E676] px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-green-800" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Detalles de Pago</h3>
                <p className="text-xs text-green-700">ID: #{transaction.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-green-300 rounded-lg transition-colors text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Monto y Estado */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="p-2.5 bg-white rounded-lg shadow-sm text-blue-600 flex-shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase">Monto Total</p>
              <p className="text-base font-bold text-gray-900">
                {transaction.currency === 'PEN' ? 'S/' : '$'} {transaction.amount.toLocaleString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
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

          {/* Detalles */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">Usuario</p>
                <p className="text-sm font-medium text-gray-700">Usuario ID: {transaction.userId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">Suscripción</p>
                <p className="text-sm font-medium text-gray-700">{transaction.subscriptionId ? `#${transaction.subscriptionId}` : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">Fecha</p>
                <p className="text-sm font-medium text-gray-700">{new Date(transaction.createdAt).toLocaleString('es-PE')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">Descripción</p>
                <p className="text-sm font-medium text-gray-700 truncate">{transaction.description}</p>
              </div>
            </div>
          </div>

          {/* ID de Referencia */}
          {transaction.paymentId && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-[10px] font-semibold text-blue-600 uppercase">ID de Referencia Bancaria</p>
              <p className="text-xs font-mono font-bold text-blue-800 break-all mt-0.5">{transaction.paymentId}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 flex-shrink-0">
          {canRefund && transaction.status === 'COMPLETED' && (
            <Button
              variant="primary"
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-red-500/30"
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
            className={`${canRefund && transaction.status === 'COMPLETED' ? 'flex-1' : 'w-full'} py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg text-sm font-medium shadow-lg shadow-teal-500/30`}
            onClick={onClose}
          >
            Cerrar Ventana
          </Button>
        </div>
      </div>
    </Modal>
  );
};
