'use client';

import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { SubscriptionPlan } from '@/core/domain/entities/Admin';
import { Settings, X } from 'lucide-react';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan;
  editForm: Partial<SubscriptionPlan>;
  setEditForm: (form: Partial<SubscriptionPlan>) => void;
  onSave: () => void;
  isPending: boolean;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  editForm,
  setEditForm,
  onSave,
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
                <Settings className="w-5 h-5 text-green-800" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Configurar Plan</h3>
                <p className="text-xs text-green-700">{selectedPlan.displayName} ({selectedPlan.name})</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-green-300 rounded-lg transition-colors text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Nombre para Mostrar</label>
            <input
              type="text"
              value={editForm.displayName || ''}
              onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Descripción del Plan</label>
            <textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Precio (S/)</label>
              <input
                type="number"
                value={editForm.priceInPen || ''}
                onChange={(e) => setEditForm({...editForm, priceInPen: parseFloat(e.target.value)})}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Precio ($)</label>
              <input
                type="number"
                value={editForm.priceInUsd || ''}
                onChange={(e) => setEditForm({...editForm, priceInUsd: parseFloat(e.target.value)})}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 text-center block">Duración (días)</label>
              <input
                type="number"
                value={editForm.durationDays || ''}
                onChange={(e) => setEditForm({...editForm, durationDays: parseInt(e.target.value)})}
                className="w-full px-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 text-center block">Publicaciones</label>
              <input
                type="number"
                value={editForm.publicationsLimit || ''}
                onChange={(e) => setEditForm({...editForm, publicationsLimit: parseInt(e.target.value)})}
                className="w-full px-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 text-center block">Límite Fotos</label>
              <input
                type="number"
                value={editForm.photosLimit || ''}
                onChange={(e) => setEditForm({...editForm, photosLimit: parseInt(e.target.value)})}
                className="w-full px-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center font-bold"
              />
            </div>
          </div>
          
          {/* Toggles */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={editForm.isActive || false}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                  className="sr-only"
                />
                <div className={`w-9 h-5 rounded-full transition-colors ${editForm.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${editForm.isActive ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="text-xs font-semibold text-gray-700">Activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={editForm.isFeatured || false}
                  onChange={(e) => setEditForm({...editForm, isFeatured: e.target.checked})}
                  className="sr-only"
                />
                <div className={`w-9 h-5 rounded-full transition-colors ${editForm.isFeatured ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${editForm.isFeatured ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="text-xs font-semibold text-gray-700">Destacado</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 flex-shrink-0">
          <Button variant="outline" className="flex-1 py-2.5 text-sm font-medium" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg text-sm font-medium shadow-lg shadow-teal-500/30"
            onClick={onSave}
            disabled={isPending}
          >
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
