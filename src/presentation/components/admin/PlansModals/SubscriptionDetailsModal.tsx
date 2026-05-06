'use client';

import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { Subscription } from '@/core/domain/entities/Admin';
import { CreditCard, Calendar, User, Tag, ShieldCheck, Clock } from 'lucide-react';

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
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <ShieldCheck className="w-32 h-32 rotate-12" />
        </div>

        <div className="flex flex-col gap-1 mb-8">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Gestión de Suscripción</h3>
          <p className="text-xs text-gray-400 font-mono">ID: #{subscription.id}</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="p-3 bg-white rounded-xl shadow-sm text-purple-600">
              <Tag className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Contratado</p>
              <p className="text-lg font-black text-gray-900">{subscription.tier}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm ${
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

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent text-gray-700">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Suscriptor</p>
                <p className="text-sm font-bold">Usuario ID: {subscription.userId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent text-gray-700">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Método de Pago</p>
                <p className="text-sm font-bold">{subscription.paymentMethod}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent text-gray-700">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Auto Renovación</p>
                <p className="text-sm font-bold">{subscription.autoRenew ? 'SÍ, activado automáticamente' : 'NO, desactivado'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Inicio
              </p>
              <p className="text-sm font-black text-blue-900">{new Date(subscription.startDate).toLocaleDateString('es-PE')}</p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Vence
              </p>
              <p className="text-sm font-black text-purple-900">
                {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('es-PE') : 'ILIMITADO'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center mt-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Valor Mensual</span>
            <span className="text-xl font-black text-green-600">
              {subscription.currency === 'PEN' ? 'S/' : '$'} {subscription.price.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-gray-100">
          <Button 
            className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-gray-100 transition-all active:scale-95" 
            onClick={onClose}
          >
            Cerrar Detalles
          </Button>
        </div>
      </div>
    </Modal>
  );
};
