'use client';

import { Modal } from '@/presentation/components/ui/Modal';
import { Group, Channel } from '../../types';

interface SuspendModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Group | Channel | null;
  reason: string;
  setReason: (value: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function SuspendModal({
  isOpen,
  onClose,
  item,
  reason,
  setReason,
  onConfirm,
  isPending,
}: SuspendModalProps) {
  if (!item) return null;

  const isChannel = 'city' in item;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Suspender ${isChannel ? 'Canal' : 'Grupo'}`}
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          ¿Estás seguro de que quieres suspender este {isChannel ? 'canal' : 'grupo'}? 
          Esta acción lo hará no disponible para todos los usuarios.
        </p>
        <p className="text-gray-900 font-medium">{item.name}</p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Razón de la suspensión
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Describe por qué se está suspendiendo este ${isChannel ? 'canal' : 'grupo'}`}
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
            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50"
          >
            {isPending ? 'Suspendiendo...' : 'Suspender'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
