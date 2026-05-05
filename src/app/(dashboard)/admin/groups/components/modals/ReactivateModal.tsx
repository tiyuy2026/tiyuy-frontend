'use client';

import { Modal } from '@/presentation/components/ui/Modal';
import { Group, Channel } from '../../types';

interface ReactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Group | Channel | null;
  itemType: 'group' | 'channel';
  reason: string;
  setReason: (value: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function ReactivateModal({
  isOpen,
  onClose,
  item,
  itemType,
  reason,
  setReason,
  onConfirm,
  isPending,
}: ReactivateModalProps) {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reactivar ${itemType === 'group' ? 'Grupo' : 'Canal'}`}
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          ¿Estás seguro de que quieres reactivar este ${itemType === 'group' ? 'grupo' : 'canal'}? 
          Esta acción lo hará disponible para todos los usuarios nuevamente.
        </p>
        <p className="text-gray-900 font-medium">{item.name}</p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Razón de la reactivación
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Describe por qué se está reactivando este ${itemType === 'group' ? 'grupo' : 'canal'} (ej: apelación aceptada, acuerdo alcanzado)`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason || isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {isPending ? 'Reactivando...' : `Reactivar ${itemType === 'group' ? 'Grupo' : 'Canal'}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
