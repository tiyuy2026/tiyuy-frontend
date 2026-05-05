'use client';

import { Modal } from '@/presentation/components/ui/Modal';
import { Group, Channel } from '../../types';

interface ViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Group | Channel | null;
  violationType: string;
  setViolationType: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}

const VIOLATION_TYPES = [
  { value: 'CONTENT_VIOLATION', label: 'Contenido Inapropiado' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Acoso' },
  { value: 'HATE_SPEECH', label: 'Discurso de Odio' },
  { value: 'COPYRIGHT', label: 'Violación de Copyright' },
  { value: 'OTHER', label: 'Otro' },
];

export function ViolationModal({
  isOpen,
  onClose,
  item,
  violationType,
  setViolationType,
  message,
  setMessage,
  onConfirm,
  isPending,
}: ViolationModalProps) {
  if (!item) return null;

  const isChannel = 'city' in item;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enviar Notificación de Violación - ${item.name}`}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Violación
          </label>
          <select
            value={violationType}
            onChange={(e) => setViolationType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {VIOLATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje al Administrador
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Ingresa detalles sobre la violación de políticas para este ${isChannel ? 'canal' : 'grupo'}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
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
            disabled={!message || isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            {isPending ? 'Enviando...' : 'Enviar Notificación'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
