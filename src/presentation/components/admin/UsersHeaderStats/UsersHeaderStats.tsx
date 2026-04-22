/**
 * Users Header Stats Component
 * Muestra las 3 tarjetas de estadísticas en el header
 */

interface UsersHeaderStatsProps {
  activeUsers: number;
  pendingUsers: number;
}

export function UsersHeaderStats({ activeUsers, pendingUsers }: UsersHeaderStatsProps) {
  return (
    <div className="flex items-stretch gap-4 py-4">
      {/* Título en tarjeta */}
      <div className="bg-white rounded-2xl px-8 py-5 border border-gray-200 shadow-lg flex-1 flex flex-col justify-center">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Gestión de Usuarios</h2>
        <p className="text-gray-400 text-sm font-light tracking-wide mt-1">Administra cuentas, roles y permisos</p>
      </div>

      {/* Tarjeta Activos */}
      <div className="bg-white rounded-2xl px-6 py-4 border border-gray-200 shadow-lg flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Activos</p>
          <p className="text-2xl font-bold text-gray-800">{activeUsers}</p>
        </div>
      </div>

      {/* Tarjeta Pendientes */}
      <div className="bg-white rounded-2xl px-6 py-4 border border-gray-200 shadow-lg flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Pendientes</p>
          <p className="text-2xl font-bold text-gray-800">{pendingUsers}</p>
        </div>
      </div>
    </div>
  );
}
