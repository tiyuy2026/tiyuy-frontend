'use client';

import { Card } from '@/presentation/components/ui/Card';
import { AlertTriangle, BellRing, Calendar, Clock, Loader, Mail, Megaphone, Settings, Smartphone, TrendingUp, TriangleAlert } from 'lucide-react';

interface CreateAlertProps {
  newAlert: {
    subject: string;
    message: string;
    alertType: 'EMERGENCY' | 'SYSTEM' | 'ANNOUNCEMENT' | 'MARKETING';
    status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
    sendInApp: boolean;
    sendEmail: boolean;
    sendPush: boolean;
    scheduledFor?: string;
  };
  setNewAlert: (alert: any) => void;
  createAdminAlert: { mutate: (data: any) => void; isPending: boolean };
}

export function CreateAlert({ newAlert, setNewAlert, createAdminAlert }: CreateAlertProps) {
  return (
    <Card className="overflow-hidden border-red-200">
      <div className="bg-gradient-to-r from-red-50 to-red-100/50 p-6 border-b border-red-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500 rounded-lg">
            <TriangleAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-900">Crear Alerta</h2>
            <p className="text-sm text-red-700">Envía alertas por múltiples canales (in-app, email, push)</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Alert Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Alerta</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'EMERGENCY', label: 'Emergencia', color: 'red', Icon: AlertTriangle },
              { id: 'SYSTEM', label: 'Sistema', color: 'blue', Icon: Settings },
              { id: 'ANNOUNCEMENT', label: 'Anuncio', color: 'teal', Icon: Megaphone },
              { id: 'MARKETING', label: 'Marketing', color: 'cyan', Icon: TrendingUp }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setNewAlert((prev: any) => ({ ...prev, alertType: type.id }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  newAlert.alertType === type.id
                    ? type.color === 'red' ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                      type.color === 'blue' ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' :
                      type.color === 'teal' ? 'bg-teal-100 text-teal-700 border-2 border-teal-300' :
                      'bg-cyan-100 text-cyan-700 border-2 border-cyan-300'
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <type.Icon className="w-5 h-5" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject and Message */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
            <input
              type="text"
              value={newAlert.subject}
              onChange={(e) => setNewAlert((prev: any) => ({ ...prev, subject: e.target.value }))}
              placeholder="Ej: Mantenimiento programado del sistema"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
            <textarea
              value={newAlert.message}
              onChange={(e) => setNewAlert((prev: any) => ({ ...prev, message: e.target.value }))}
              placeholder="Describe la alerta o emergencia..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* Scheduling */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="scheduleAlert"
              checked={!!newAlert.scheduledFor}
              onChange={(e) => {
                if (e.target.checked) {
                  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
                  setNewAlert((prev: any) => ({ ...prev, scheduledFor: oneHourFromNow, status: 'SCHEDULED' }));
                } else {
                  setNewAlert((prev: any) => ({ ...prev, scheduledFor: undefined, status: 'SENDING' }));
                }
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="scheduleAlert" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Programar envío para más tarde
            </label>
          </div>

          {newAlert.scheduledFor && (
            <div className="ml-7">
              <label className="block text-xs text-gray-500 mb-1">Fecha y hora de envío</label>
              <input
                type="datetime-local"
                value={newAlert.scheduledFor}
                onChange={(e) => {
                  const localDate = new Date(e.target.value);
                  const utcISO = localDate.toISOString();
                  setNewAlert((prev: any) => ({ ...prev, scheduledFor: utcISO }));
                }}
                min={new Date().toISOString().slice(0, 16)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                La alerta se enviará automáticamente en la fecha seleccionada
              </p>
            </div>
          )}
        </div>

        {/* Channels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Canales de Envío</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newAlert.sendInApp}
                onChange={(e) => setNewAlert((prev: any) => ({ ...prev, sendInApp: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Smartphone className="w-4 h-4 text-teal-500" />
              <span className="text-sm text-gray-700">In-App</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newAlert.sendEmail}
                onChange={(e) => setNewAlert((prev: any) => ({ ...prev, sendEmail: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Mail className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newAlert.sendPush}
                onChange={(e) => setNewAlert((prev: any) => ({ ...prev, sendPush: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <BellRing className="w-4 h-4 text-cyan-500" />
              <span className="text-sm text-gray-700">Push</span>
            </label>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (!newAlert.subject || !newAlert.message) {
                alert('Completa el asunto y mensaje');
                return;
              }
              createAdminAlert.mutate(newAlert);
            }}
            disabled={createAdminAlert.isPending}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {createAdminAlert.isPending ? (
              <>
                <Loader className="animate-spin w-5 h-5" />
                {newAlert.scheduledFor ? 'Programando...' : 'Enviando...'}
              </>
            ) : (
              <>
                {newAlert.scheduledFor ? (
                  <>
                    <Clock className="w-5 h-5" />
                    Programar Alerta
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    Enviar Alerta
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}
