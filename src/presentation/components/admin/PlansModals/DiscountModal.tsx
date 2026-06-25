'use client';

import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { SubscriptionPlan } from '@/core/domain/entities/Admin';
import { Search, X, Percent } from 'lucide-react';

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
      <div className="bg-white rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header verde */}
        <div className="bg-[#00E676] px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Percent className="w-5 h-5 text-green-800" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Gestionar Descuentos</h3>
                <p className="text-xs text-green-700">Plan: {discountPlan.displayName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-green-300 rounded-lg transition-colors text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Buscar Inmobiliaria o Agente */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
            <p className="text-xs font-semibold text-blue-700">Buscar Inmobiliaria o Agente</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="RUC Inmobiliaria"
                value={agencyRuc}
                onChange={(e) => { setAgencyRuc(e.target.value); setAgentDni(''); }}
                className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="DNI Agente"
                value={agentDni}
                onChange={(e) => { setAgentDni(e.target.value); setAgencyRuc(''); }}
                className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={onSearch}
              disabled={isSearching || (!agencyRuc && !agentDni)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 py-2"
            >
              <Search className="w-4 h-4" />
              {isSearching ? 'Buscando...' : 'Verificar Identidad'}
            </Button>

            {searchResult && (
              <div className="p-3 bg-white border border-green-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-green-600 uppercase">{searchResult.type === 'AGENCY' ? 'Inmobiliaria' : 'Agente'}</p>
                  <p className="text-sm font-bold text-gray-800">{searchResult.name}</p>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">ID: {searchResult.id}</span>
              </div>
            )}
          </div>

          {/* Precio y Descuento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Precio Final (S/)</label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Ej: 299"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">O % de Descuento</label>
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                placeholder="Ej: 20"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Notas Administrativas</label>
            <textarea
              value={discountNotes}
              onChange={(e) => setDiscountNotes(e.target.value)}
              placeholder="Especifique el motivo del descuento..."
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Precio Original */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs font-semibold text-gray-500">Precio Original:</span>
            <span className="text-base font-bold text-gray-900">S/ {discountPlan.priceInPen}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" className="flex-1 py-2.5 text-sm font-medium" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg text-sm font-medium shadow-lg shadow-teal-500/30"
            onClick={onCreateDiscount}
            disabled={!searchResult || isPending}
          >
            {isPending ? 'Aplicando...' : 'Aplicar Beneficio'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
