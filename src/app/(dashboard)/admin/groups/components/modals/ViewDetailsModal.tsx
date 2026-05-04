'use client';

import { Modal } from '@/presentation/components/ui/Modal';
import { Group, Channel, ViewType } from '../../types';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Group | Channel | null;
  viewType: ViewType;
}

export function ViewDetailsModal({ isOpen, onClose, item, viewType }: ViewDetailsModalProps) {
  if (!item) return null;

  const isChannel = 'city' in item;
  const memberCount = isChannel ? (item as Channel).subscriberCount : (item as Group).memberCount;
  const memberLabel = isChannel ? 'suscriptores' : 'miembros';
  const adminName = isChannel ? (item as Channel).adminName : (item as Group).adminName;
  const adminEmail = isChannel ? (item as Channel).adminEmail : (item as Group).adminEmail;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={viewType === 'groups' ? 'Detalles del Grupo' : 'Detalles del Canal'}
      size="lg"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-2xl font-bold">
            {item.name[0]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-gray-600">{memberCount} {memberLabel}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              item.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {item.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Creado</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
          {isChannel && (
            <div>
              <p className="text-sm text-gray-500">Ciudad</p>
              <p className="text-sm font-medium text-gray-900">{(item as Channel).city}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Administrador</p>
            <p className="text-sm font-medium text-gray-900">{adminName || 'No disponible'}</p>
            <p className="text-xs text-gray-500">{adminEmail || 'No disponible'}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Descripción</p>
          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{item.description}</p>
        </div>
      </div>
    </Modal>
  );
}
