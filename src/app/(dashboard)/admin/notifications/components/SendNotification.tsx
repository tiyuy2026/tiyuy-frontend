'use client';

import { Card } from '@/presentation/components/ui/Card';

interface SendNotificationProps {
  newNotification: {
    subject: string;
    message: string;
    userIds: number[];
    roles: string[];
    agencyIds: string[];
    sendToAll: boolean;
    sendEmail: boolean;
    sendInApp: boolean;
  };
  setNewNotification: (notification: any) => void;
  sendNotification: { mutate: (data: any) => void; isPending: boolean };
  userSearch: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    users: any[];
    isLoading: boolean;
    hasSearched: boolean;
  };
  agentSearch: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    users: any[];
    isLoading: boolean;
    hasSearched: boolean;
  };
}

export function SendNotification({
  newNotification,
  setNewNotification,
  sendNotification,
  userSearch,
  agentSearch,
}: SendNotificationProps) {
  const toggleUserSelection = (userId: number) => {
    setNewNotification((prev: any) => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter((id: number) => id !== userId)
        : [...prev.userIds, userId]
    }));
  };

  const toggleRoleSelection = (role: string) => {
    setNewNotification((prev: any) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r: string) => r !== role)
        : [...prev.roles, role]
    }));
  };

  const toggleAgencySelection = (agencyRuc: string) => {
    setNewNotification((prev: any) => ({
      ...prev,
      agencyIds: prev.agencyIds.includes(agencyRuc)
        ? prev.agencyIds.filter((r: string) => r !== agencyRuc)
        : [...prev.agencyIds, agencyRuc]
    }));
  };

  const handleSend = () => {
    if (!newNotification.subject || !newNotification.message) {
      return;
    }
    const hasTargets = newNotification.sendToAll ||
      newNotification.userIds.length > 0 ||
      newNotification.roles.length > 0 ||
      newNotification.agencyIds.length > 0;
    if (!hasTargets) {
      alert('Selecciona al menos un destinatario');
      return;
    }
    sendNotification.mutate(newNotification);
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Enviar Notificación</h2>

      <div className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
          <input
            type="text"
            value={newNotification.subject}
            onChange={(e) => setNewNotification((prev: any) => ({ ...prev, subject: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            placeholder="Ingresa el asunto del email"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
          <textarea
            value={newNotification.message}
            onChange={(e) => setNewNotification((prev: any) => ({ ...prev, message: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            placeholder="Ingresa el mensaje de la notificación"
          />
        </div>

        {/* Target Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destinatarios</label>

          {/* Send to All */}
          <div className="mb-4 p-3 border rounded-lg bg-gray-50">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newNotification.sendToAll}
                onChange={(e) => setNewNotification((prev: any) => ({
                  ...prev,
                  sendToAll: e.target.checked,
                  roles: e.target.checked ? [] : prev.roles,
                  userIds: e.target.checked ? [] : prev.userIds
                }))}
                className="mr-3 h-4 w-4"
              />
              <span className="font-medium text-gray-900">Enviar a todos los usuarios</span>
            </label>
          </div>

          {/* By Roles */}
          {!newNotification.sendToAll && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Por Rol:</p>
              <div className="flex flex-wrap gap-2">
                {['USER', 'AGENT', 'DEVELOPER', 'ADMIN'].map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleRoleSelection(role)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      newNotification.roles.includes(role)
                        ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-500/30'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* By Specific Users */}
          {!newNotification.sendToAll && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Usuarios específicos:</p>
              <div className="mb-2">
                <input
                  type="text"
                  value={userSearch.searchQuery}
                  onChange={(e) => userSearch.setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, email o DNI (mín. 2 caracteres)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                />
              </div>
              {userSearch.isLoading && (
                <p className="text-sm text-gray-500 mb-2">Buscando usuarios...</p>
              )}
              {!userSearch.hasSearched && (
                <p className="text-xs text-gray-500 mb-2">
                  Escribe al menos 2 caracteres para buscar usuarios.
                </p>
              )}
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                {userSearch.users.map((user: any) => (
                  <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newNotification.userIds.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      {user.firstName} {user.lastName} ({user.email}) - {user.role}
                    </span>
                  </label>
                ))}
                {userSearch.hasSearched && userSearch.users.length === 0 && !userSearch.isLoading && (
                  <p className="text-sm text-gray-500 p-2">No se encontraron usuarios</p>
                )}
              </div>
            </div>
          )}

          {/* By Agency */}
          {!newNotification.sendToAll && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Por Inmobiliaria (RUC):</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  id="agencyRuc"
                  placeholder="Ingresa RUC de inmobiliaria"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        toggleAgencySelection(input.value.trim());
                        input.value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('agencyRuc') as HTMLInputElement;
                    if (input?.value.trim()) {
                      toggleAgencySelection(input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg shadow-teal-500/30"
                >
                  Agregar
                </button>
              </div>
              {newNotification.agencyIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newNotification.agencyIds.map((ruc) => (
                    <span
                      key={ruc}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800"
                    >
                      RUC: {ruc}
                      <button
                        onClick={() => toggleAgencySelection(ruc)}
                        className="ml-2 text-teal-600 hover:text-teal-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* By Agent */}
          {!newNotification.sendToAll && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Agentes específicos:</p>
              <div className="mb-2">
                <input
                  type="text"
                  value={agentSearch.searchQuery}
                  onChange={(e) => agentSearch.setSearchQuery(e.target.value)}
                  placeholder="Buscar agente por nombre, email o DNI..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                />
              </div>
              {agentSearch.isLoading && (
                <p className="text-sm text-gray-500 mb-2">Buscando agentes...</p>
              )}
              {!agentSearch.hasSearched && (
                <p className="text-xs text-gray-500 mb-2">
                  Escribe al menos 2 caracteres para buscar agentes.
                </p>
              )}
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
                {agentSearch.users
                  .filter((agent: any) => agent.role === 'AGENT')
                  .map((agent: any) => (
                    <label key={agent.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newNotification.userIds.includes(agent.id)}
                        onChange={() => toggleUserSelection(agent.id)}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">
                        {agent.firstName} {agent.lastName} ({agent.email})
                      </span>
                    </label>
                  ))}
                {agentSearch.hasSearched && agentSearch.users.filter((agent: any) => agent.role === 'AGENT').length === 0 && !agentSearch.isLoading && (
                  <p className="text-sm text-gray-500 p-2">No se encontraron agentes</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Channels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Canales</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newNotification.sendEmail}
                onChange={(e) => setNewNotification((prev: any) => ({ ...prev, sendEmail: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Email (Brevo)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newNotification.sendInApp}
                onChange={(e) => setNewNotification((prev: any) => ({ ...prev, sendInApp: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Notificación en App</span>
            </label>
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
          <p className="text-sm text-teal-800">
            <strong>Resumen:</strong>
            {newNotification.sendToAll
              ? ' Enviar a todos los usuarios'
              : newNotification.roles.length > 0
                ? ` Roles: ${newNotification.roles.join(', ')}`
                : newNotification.userIds.length > 0
                  ? ` ${newNotification.userIds.length} usuarios seleccionados`
                  : newNotification.agencyIds.length > 0
                    ? ` ${newNotification.agencyIds.length} inmobiliarias`
                    : ' Selecciona destinatarios'}
            {newNotification.sendEmail && ' via Email'}
            {newNotification.sendInApp && ' + In-App'}
          </p>
        </div>

        {/* Send Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={!newNotification.subject || !newNotification.message || sendNotification.isPending}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/30"
          >
            {sendNotification.isPending ? 'Enviando...' : 'Enviar Notificación'}
          </button>
        </div>
      </div>
    </Card>
  );
}
