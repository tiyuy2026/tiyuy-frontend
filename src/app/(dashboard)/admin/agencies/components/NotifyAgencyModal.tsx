import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import { InmobiliariaWithStats } from '@/core/domain/entities/Admin';
import { X } from 'lucide-react';

interface NotificationData {
  subject: string;
  message: string;
  sendEmail: boolean;
  sendInApp: boolean;
}

interface NotifyAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAgency: InmobiliariaWithStats | null;
  notificationData: NotificationData;
  setNotificationData: (data: NotificationData) => void;
  onSend: () => void;
  isPending: boolean;
}

export default function NotifyAgencyModal({
  isOpen,
  onClose,
  selectedAgency,
  notificationData,
  setNotificationData,
  onSend,
  isPending
}: NotifyAgencyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header Profesional */}
        <div className="bg-[#28E10F] px-5 py-4 border-b border-green-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Notificar Inmobiliaria
              </h3>
              <p className="text-green-700 text-sm mt-0.5">
                Para: {selectedAgency?.name} (RUC: {selectedAgency?.ruc})
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 transition-colors p-1 hover:bg-green-300 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
            <input
              type="text"
              value={notificationData.subject}
              onChange={(e) => setNotificationData({ ...notificationData, subject: e.target.value })}
              placeholder="Ej: Actualización de plan, Recordatorio de pago, Nueva funcionalidad..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
            <textarea
              value={notificationData.message}
              onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
              placeholder="Escribe el mensaje que deseas enviar a la inmobiliaria..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Este mensaje será enviado a los administradores de la inmobiliaria</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">Canales de envío</p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationData.sendEmail}
                  onChange={(e) => setNotificationData({ ...notificationData, sendEmail: e.target.checked })}
                  className="mr-2 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Enviar por email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={notificationData.sendInApp}
                  onChange={(e) => setNotificationData({ ...notificationData, sendInApp: e.target.checked })}
                  className="mr-2 w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Enviar notificación en la aplicación</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              <strong>Información de la inmobiliaria:</strong><br />
              Plan actual: {selectedAgency?.currentPlan || 'Sin plan'}<br />
              Agentes activos: {selectedAgency?.activeAgents || 0}<br />
              Última actividad: {selectedAgency?.lastActivity 
                ? new Date(selectedAgency.lastActivity).toLocaleDateString() 
                : 'Sin actividad registrada'}
            </p>
          </div>
        </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSend}
            disabled={isPending || !notificationData.subject || !notificationData.message || (!notificationData.sendEmail && !notificationData.sendInApp)}
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-medium"
          >
            {isPending ? 'Enviando...' : 'Enviar Notificación'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
