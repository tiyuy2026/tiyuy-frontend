/**
 * Notifications Chart Component
 * Gráfica moderna que muestra el histórico de envíos de notificaciones por fecha
 */

'use client';

interface NotificationChartData {
  date: string;
  count: number;
}

interface NotificationsChartProps {
  data: NotificationChartData[];
  isLoading?: boolean;
}

export function NotificationsChart({ data, isLoading }: NotificationsChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando gráfica...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900">Sin datos</h4>
          <p className="text-gray-500 mt-1">No hay datos disponibles para mostrar</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Envíos por Fecha</h3>
        <div className="text-sm text-gray-500">
          Última semana
        </div>
      </div>

      <div className="relative h-[200px]">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div key={percent} className="border-b border-gray-100" style={{ top: `${percent}%` }} />
          ))}
        </div>

        {/* Bars */}
        <div className="flex items-end justify-between gap-2 h-full pt-4">
          {data.map((item, index) => {
            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            const isIncreased = index > 0 && item.count > data[index - 1].count;
            const isDecreased = index > 0 && item.count < data[index - 1].count;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full h-full flex items-end">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      isIncreased ? 'bg-gradient-to-t from-green-400 to-green-500' :
                      isDecreased ? 'bg-gradient-to-t from-red-400 to-red-500' :
                      'bg-gradient-to-t from-blue-400 to-blue-500'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.count} envíos
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 truncate text-center">
                  {new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-gray-600">Incremento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-600">Decremento</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className="text-gray-600">Sin cambio</span>
        </div>
      </div>
    </div>
  );
}
