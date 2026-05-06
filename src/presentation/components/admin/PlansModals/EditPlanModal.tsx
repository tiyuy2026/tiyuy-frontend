'use client';

import React from 'react';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { SubscriptionPlan } from '@/core/domain/entities/Admin';

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
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="flex flex-col gap-1 mb-6">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Configurar Plan</h3>
          <p className="text-xs text-gray-400 font-medium">Editando: {selectedPlan.displayName} ({selectedPlan.name})</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Nombre para Mostrar</label>
            <input
              type="text"
              value={editForm.displayName || ''}
              onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Descripción del Plan</label>
            <textarea
              value={editForm.description || ''}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Precio (S/)</label>
              <input
                type="number"
                value={editForm.priceInPen || ''}
                onChange={(e) => setEditForm({...editForm, priceInPen: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Precio ($)</label>
              <input
                type="number"
                value={editForm.priceInUsd || ''}
                onChange={(e) => setEditForm({...editForm, priceInUsd: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-900"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1 text-center">Duración (Días)</label>
              <input
                type="number"
                value={editForm.durationDays || ''}
                onChange={(e) => setEditForm({...editForm, durationDays: parseInt(e.target.value)})}
                className="w-full px-2 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1 text-center">Publicaciones</label>
              <input
                type="number"
                value={editForm.publicationsLimit || ''}
                onChange={(e) => setEditForm({...editForm, publicationsLimit: parseInt(e.target.value)})}
                className="w-full px-2 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-center"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1 text-center">Límite Fotos</label>
              <input
                type="number"
                value={editForm.photosLimit || ''}
                onChange={(e) => setEditForm({...editForm, photosLimit: parseInt(e.target.value)})}
                className="w-full px-2 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-center"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={editForm.isActive || false}
                  onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${editForm.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${editForm.isActive ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="text-xs font-black text-gray-700 uppercase tracking-wider">Activo</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={editForm.isFeatured || false}
                  onChange={(e) => setEditForm({...editForm, isFeatured: e.target.checked})}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${editForm.isFeatured ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${editForm.isFeatured ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="text-xs font-black text-gray-700 uppercase tracking-wider">Destacado</span>
            </label>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-gray-100">
          <Button 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50" 
            onClick={onSave}
            disabled={isPending}
          >
            {isPending ? 'Guardando Cambios...' : 'Guardar Configuración'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full py-3 rounded-2xl font-bold text-gray-400 border-none hover:bg-gray-50" 
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
