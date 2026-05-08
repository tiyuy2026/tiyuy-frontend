'use client';

import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { SubscriptionPlan, AgencyPlanDiscount } from '@/core/domain/entities/Admin';
import { Search } from 'lucide-react';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discountPlan: SubscriptionPlan;
  agencyRuc: string;
  setAgencyRuc: (val: string) => void;
  agentDni: string;
  setAgentDni: (val: string) => void;
  isSearching: boolean;
  onSearch: () => void;
  searchResult: { id: number; name: string; type: string } | null;
  customPrice: string;
  setCustomPrice: (val: string) => void;
  discountPercentage: string;
  setDiscountPercentage: (val: string) => void;
  discountNotes: string;
  setDiscountNotes: (val: string) => void;
  onCreateDiscount: () => void;
  isPending: boolean;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  discountPlan,
  agencyRuc,
  setAgencyRuc,
  agentDni,
  setAgentDni,
  isSearching,
  onSearch,
  searchResult,
  customPrice,
  setCustomPrice,
  discountPercentage,
  setDiscountPercentage,
  discountNotes,
  setDiscountNotes,
  onCreateDiscount,
  isPending
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-gray-100">
        <div className="flex flex-col gap-1 mb-6">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Gestionar Descuentos</h3>
          <p className="text-xs text-gray-400 font-medium">Plan: {discountPlan.displayName}</p>
        </div>
        
        <div className="space-y-6">
          <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Buscar Inmobiliaria o Agente</p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="RUC Inmobiliaria"
                  value={agencyRuc}
                  onChange={(e) => { setAgencyRuc(e.target.value); setAgentDni(''); }}
                  className="w-full px-4 py-2.5 bg-white border border-blue-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <input
                  type="text"
                  placeholder="DNI Agente"
                  value={agentDni}
                  onChange={(e) => { setAgentDni(e.target.value); setAgencyRuc(''); }}
                  className="w-full px-4 py-2.5 bg-white border border-blue-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={onSearch}
                disabled={isSearching || (!agencyRuc && !agentDni)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {isSearching ? 'Buscando...' : 'Verificar Identidad'}
              </Button>
            </div>

            {searchResult && (
              <div className="mt-4 p-4 bg-white border border-green-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">{searchResult.type === 'AGENCY' ? 'Inmobiliaria' : 'Agente'}</p>
                  <p className="text-sm font-bold text-gray-800">{searchResult.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-mono">ID: {searchResult.id}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Precio Final (S/)</label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Ej: 299"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">O % de Descuento</label>
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                placeholder="Ej: 20"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Notas Administrativas</label>
            <textarea
              value={discountNotes}
              onChange={(e) => setDiscountNotes(e.target.value)}
              placeholder="Especifique el motivo del descuento..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Precio Original:</span>
            <span className="text-lg font-black text-gray-900">S/ {discountPlan.priceInPen}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-gray-100">
          <Button 
            className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-gray-100 transition-all active:scale-95 disabled:opacity-50" 
            onClick={onCreateDiscount}
            disabled={!searchResult || isPending}
          >
            {isPending ? 'Aplicando...' : 'Aplicar Beneficio'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full py-3 rounded-2xl font-bold text-gray-500 border border-gray-200 hover:bg-gray-50" 
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
