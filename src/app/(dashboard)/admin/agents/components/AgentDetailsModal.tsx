import { AgentListItem } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';
import Link from 'next/link';

interface AgentDetailsModalProps {
  agent: AgentListItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentDetailsModal({ agent, isOpen, onClose }: AgentDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-0 max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header Profesional con Gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-5">
          <div className="flex items-center gap-4">
            {agent.profilePhotoUrl ? (
              <img
                src={agent.profilePhotoUrl}
                alt={`${agent.firstName} ${agent.lastName}`}
                className="w-20 h-20 rounded-xl object-cover border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30 shadow-lg">
                {`${agent.firstName?.[0] || ''}${agent.lastName?.[0] || ''}`.toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">
                {agent.firstName} {agent.lastName}
              </h3>
              <p className="text-blue-100 text-sm mt-0.5">{agent.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  agent.enabled 
                    ? 'bg-green-400/30 text-green-50 border border-green-400/40' 
                    : 'bg-red-400/30 text-red-50 border border-red-400/40'
                }`}>
                  {agent.enabled ? 'Activo' : 'Inactivo'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-400/30 text-blue-50 border border-blue-400/40">
                  {agent.currentPlan || 'Free'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Grid de Informacion Profesional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Informacion Personal */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
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
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
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
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
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
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
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
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
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
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
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
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Link href="/admin/agents/discounts">
            <Button className="bg-green-600 hover:bg-green-700">
              Gestionar Descuentos
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
