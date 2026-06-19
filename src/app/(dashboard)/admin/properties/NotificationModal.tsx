'use client';

import { useState } from 'react';
import { Button } from '@/presentation/components/ui/Button';
import { PropertyModerationItem } from '@/core/domain/entities/Admin';

interface NotificationModalProps {
  property: PropertyModerationItem;
  onSend: (subject: string, message: string, includeDetails: boolean) => void;
  onCancel: () => void;
}

export function NotificationModal({ property, onSend, onCancel }: NotificationModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeDetails, setIncludeDetails] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(subject, message, includeDetails);
  };

  // Plantillas predefinidas
  const templates = [
    {
      label: 'Propiedad deshabilitada',
      subject: 'Tu propiedad ha sido deshabilitada',
      message: `Hola ${property.ownerName},\n\nTu propiedad "${property.title}" ha sido deshabilitada por incumplimiento de nuestras políticas.\n\nPor favor, revisa las reglas de publicación y realiza los cambios necesarios para habilitarla nuevamente.\n\nSi tienes dudas, contacta con soporte.\n\nSaludos,\nEquipo Tiyuy`
    },
    {
      label: 'Reportes recibidos',
      subject: 'Reportes sobre tu propiedad',
      message: `Hola ${property.ownerName},\n\nHemos recibido reportes de usuarios sobre tu propiedad "${property.title}".\n\nTe recomendamos revisar la información publicada y actualizarla si es necesario para evitar suspensiones.\n\nSaludos,\nEquipo Tiyuy`
    },
    {
      label: 'Recordatorio de suscripción',
      subject: 'Tu suscripción está por vencer',
      message: `Hola ${property.ownerName},\n\nTe recordamos que tu suscripción está próxima a vencer. Para mantener tu propiedad "${property.title}" visible, te recomendamos renovar tu plan.\n\nSaludos,\nEquipo Tiyuy`
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-0 max-w-lg w-full shadow-2xl overflow-hidden">
      {/* Header con verde encendido */}
      <div className="bg-[#00E645] px-5 py-4">
        <h3 className="text-lg font-bold text-gray-800">Notificar Propietario</h3>
      </div>
      <div className="p-5">

      <div className="mb-4 bg-blue-50 p-3 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Para:</strong> {property.ownerName} ({property.ownerEmail})
        </div>
        <div className="text-sm text-blue-800">
          <strong>Propiedad:</strong> {property.title}
        </div>
      </div>

      {/* Plantillas rápidas */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Plantillas rápidas</label>
        <div className="flex flex-wrap gap-2">
          {templates.map((template, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSubject(template.subject);
                setMessage(template.message);
              }}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Asunto del mensaje"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Escribe tu mensaje aquí..."
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeDetails"
            checked={includeDetails}
            onChange={(e) => setIncludeDetails(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="includeDetails" className="text-sm text-gray-700">
            Incluir detalles de la propiedad en el email
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="primary" className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/30">
            Enviar Notificación
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
