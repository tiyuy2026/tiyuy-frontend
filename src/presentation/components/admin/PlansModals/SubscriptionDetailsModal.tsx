'use client';

import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { Subscription } from '@/core/domain/entities/Admin';
import { CreditCard, Calendar, User, Tag, Clock, X } from 'lucide-react';

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
}

export const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({
  isOpen,
  onClose,
  subscription
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header verde */}
        <div className="bg-[#00E676] px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-green-800" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Gestión de Suscripción</h3>
                <p className="text-xs text-green-700">ID: #{subscription.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-green-300 rounded-lg transition-colors text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Plan y Estado */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="p-2.5 bg-white rounded-lg shadow-sm text-purple-600 flex-shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase">Plan Contratado</p>
              <p className="text-base font-bold text-gray-900 truncate">{subscription.tier}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
              subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
              subscription.status === 'INACTIVE' ? 'bg-gray-100 text-gray-700' :
              subscription.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              {subscription.status === 'ACTIVE' ? 'ACTIVO' :
               subscription.status === 'INACTIVE' ? 'INACTIVO' :
               subscription.status === 'CANCELLED' ? 'CANCELADO' :
               subscription.status === 'EXPIRED' ? 'EXPIRADO' : subscription.status}
            </span>
          </div>

          {/* Detalles */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">Suscriptor</p>
                <p className="text-sm font-medium text-gray-700">Usuario ID: {subscription.userId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">Método de Pago</p>
                <p className="text-sm font-medium text-gray-700 truncate">{subscription.paymentMethod}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-semibold text-gray-400 uppercase">Auto Renovación</p>
                <p className="text-sm font-medium text-gray-700">{subscription.autoRenew ? 'SÍ, activado' : 'NO, desactivado'}</p>
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-[9px] font-semibold text-blue-600 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Inicio
              </p>
              <p className="text-sm font-bold text-blue-900">{new Date(subscription.startDate).toLocaleDateString('es-PE')}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-[9px] font-semibold text-purple-600 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Vence
              </p>
              <p className="text-sm font-bold text-purple-900">
                {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('es-PE') : 'ILIMITADO'}
              </p>
            </div>
          </div>

          {/* Valor */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase">Valor Mensual</span>
            <span className="text-lg font-bold text-green-600">
              {subscription.currency === 'PEN' ? 'S/' : '$'} {subscription.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center p-4 border-t border-gray-200 flex-shrink-0">
          <Button
            className="px-8 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg text-sm font-medium shadow-lg shadow-teal-500/30"
            onClick={onClose}
          >
            Cerrar Detalles
          </Button>
        </div>
      </div>
    </Modal>
  );
};
