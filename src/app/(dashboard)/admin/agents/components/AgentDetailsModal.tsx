import { AgentListItem } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import Link from 'next/link';
import { Building, CheckCircle, Clock, LayoutDashboard, User, UserCheck } from 'lucide-react';

interface AgentDetailsModalProps {
  agent: AgentListItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentDetailsModal({ agent, isOpen, onClose }: AgentDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col mx-2 sm:mx-0">
        {/* Header Profesional */}
        <div className="bg-[#16DB16] px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {agent.profilePhotoUrl ? (
              <img
                src={agent.profilePhotoUrl}
                alt={`${agent.firstName} ${agent.lastName}`}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover border-2 border-green-300 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-green-200 flex items-center justify-center text-green-800 text-base sm:text-xl font-bold border-2 border-green-300 shadow-sm">
                {`${agent.firstName?.[0] || ''}${agent.lastName?.[0] || ''}`.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-green-900 truncate">
                {agent.firstName} {agent.lastName}
              </h3>
              <p className="text-green-700 text-[10px] sm:text-xs mt-0.5 truncate">{agent.email}</p>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold ${
                  agent.enabled 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-red-200 text-red-800'
                }`}>
                  {agent.enabled ? 'Activo' : 'Inactivo'}
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-blue-200 text-blue-800">
                  {agent.currentPlan || 'Free'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6 flex-1 overflow-y-auto">
          {/* Grid de Informacion Profesional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Informacion Personal */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Informacion Personal</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">DNI</span>
                  <span className="font-medium text-gray-900">{agent.dni || 'No especificado'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ciudad</span>
                  <span className="font-medium text-gray-900">{agent.city || 'No especificado'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Pais</span>
                  <span className="font-medium text-gray-900">{agent.country || 'No especificado'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Miembro Desde</span>
                  <span className="font-medium text-gray-900">
                    {new Date(agent.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Verificaciones */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Verificaciones</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Email</span>
                  <span className={`font-medium ${agent.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {agent.emailVerified ? 'Verificado' : 'No Verificado'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Telefono</span>
                  <span className={`font-medium ${agent.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {agent.phoneVerified ? 'Verificado' : 'No Verificado'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ingresos */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Ingresos</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Semana</span>
                  <span className="font-semibold text-green-600">${agent.weekRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Mes</span>
                  <span className="font-semibold text-green-600">${agent.monthRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ano</span>
                  <span className="font-semibold text-green-600">${agent.yearRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actividad */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Actividad</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Propiedades</span>
                  <span className="font-semibold text-gray-900">{agent.propertiesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Conversion</span>
                  <span className="font-semibold text-gray-900">{agent.conversionRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Actual */}
          <div className="mt-4 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building className="w-4 h-4 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Plan Actual</h4>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-semibold">{agent.currentPlan || 'Free'}</span>
            </div>
          </div>

          {/* Ultimo Login */}
          <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Ultimo Login</h4>
                  <p className="text-xs text-gray-500">
                    {agent.lastLoginAt ? (
                      new Date(agent.lastLoginAt).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    ) : (
                      <span className="text-orange-500 font-medium">No disponible</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con Botones */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <Button variant="secondary" onClick={onClose} className="text-xs sm:text-sm w-full sm:w-auto">Cerrar</Button>
          <Link href="/admin/agents/discounts" className="w-full sm:w-auto">
            <Button className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm w-full sm:w-auto">
              Gestionar Descuentos
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
