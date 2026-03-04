'use client';

import { useState } from 'react';
import { useReportProperty } from '@/presentation/hooks/useModeration';
import { ReportReason } from '@/core/domain/entities/Moderation';

interface ReportModalProps {
  propertyId: number;
  propertyTitle: string;
  onClose: () => void;
}

export function ReportModal({ propertyId, propertyTitle, onClose }: ReportModalProps) {
  const reportMutation = useReportProperty();
  const [reason, setReason] = useState<ReportReason>('SPAM');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await reportMutation.mutateAsync({
      propertyId,
      reason,
      description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reportar anuncio</h2>
        <p className="text-sm text-gray-600 mb-6">{propertyTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo del reporte
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="SPAM">🚫 Spam o contenido no deseado</option>
              <option value="SCAM">⚠️ Fraude o estafa</option>
              <option value="INCORRECT_DATA">📋 Información incorrecta</option>
              <option value="OFFENSIVE">😡 Contenido ofensivo</option>
              <option value="DUPLICATE">📑 Anuncio duplicado</option>
              <option value="OTHER">❓ Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción detallada
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Describe por qué reportas este anuncio..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={reportMutation.isPending}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
            >
              {reportMutation.isPending ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
