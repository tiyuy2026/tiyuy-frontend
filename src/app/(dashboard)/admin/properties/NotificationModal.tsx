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
    <div className="bg-white rounded-2xl p-0 max-w-lg w-full shadow-2xl overflow-hidden mx-2 sm:mx-0">
      {/* Header con verde encendido */}
      <div className="bg-[#00E645] px-4 sm:px-5 py-3 sm:py-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-800">Notificar Propietario</h3>
      </div>
      <div className="p-3 sm:p-5">

      <div className="mb-3 sm:mb-4 bg-blue-50 p-2.5 sm:p-3 rounded-lg">
        <div className="text-xs sm:text-sm text-blue-800 break-words">
          <strong>Para:</strong> {property.ownerName} ({property.ownerEmail})
        </div>
        <div className="text-xs sm:text-sm text-blue-800 break-words">
          <strong>Propiedad:</strong> {property.title}
        </div>
      </div>

      {/* Plantillas rápidas */}
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Plantillas rápidas</label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {templates.map((template, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSubject(template.subject);
                setMessage(template.message);
              }}
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Asunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Asunto del mensaje"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Mensaje</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
          <label htmlFor="includeDetails" className="text-xs sm:text-sm text-gray-700">
            Incluir detalles de la propiedad en el email
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Button type="submit" variant="primary" className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/30 text-xs sm:text-sm w-full sm:w-auto">
            Enviar Notificación
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="text-xs sm:text-sm w-full sm:w-auto">
            Cancelar
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}
