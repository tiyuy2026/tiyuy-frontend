/**
 * Role Change Modal Component
 * Modal para cambiar el rol de un usuario
 */

'use client';

import { useState } from 'react';
import { UserListItem } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';

interface RoleChangeModalProps {
  user: UserListItem;
  onConfirm: (newRole: string, reason: string) => void;
  onCancel: () => void;
}

export function RoleChangeModal({ user, onConfirm, onCancel }: RoleChangeModalProps) {
  const [newRole, setNewRole] = useState<"ADMIN" | "USER" | "AGENT" | "DEVELOPER">(user.role as "ADMIN" | "USER" | "AGENT" | "DEVELOPER");
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRole !== user.role && reason.trim()) {
      onConfirm(newRole, reason.trim());
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-4">Cambiar Rol de Usuario</h3>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          Cambiando rol para: <strong>{user.firstName} {user.lastName}</strong> ({user.email})
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Rol</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "ADMIN" | "USER" | "AGENT" | "DEVELOPER")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="USER">Usuario</option>
              <option value="AGENT">Agente</option>
              <option value="DEVELOPER">Desarrollador</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Motivo del cambio de rol..."
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={newRole === user.role || !reason.trim()}>
              Cambiar Rol
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
