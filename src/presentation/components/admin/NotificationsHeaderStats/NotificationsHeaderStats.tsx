/**
 * Notifications Header Stats Component
 * Muestra las 4 tarjetas de estadísticas en el header
 */

interface NotificationsHeaderStatsProps {
  activeTab: 'send' | 'history' | 'alerts' | 'stats';
  onTabChange: (tab: 'send' | 'history' | 'alerts' | 'stats') => void;
}

export function NotificationsHeaderStats({ activeTab, onTabChange }: NotificationsHeaderStatsProps) {
  const tabs = [
    { id: 'send' as const, label: 'Enviar' },
    { id: 'history' as const, label: 'Historial' },
    { id: 'alerts' as const, label: 'Alertas' },
    { id: 'stats' as const, label: 'Estadísticas' }
  ];

  return (
    <div className="flex items-stretch gap-3 py-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`bg-white rounded-xl px-4 py-3 border shadow-sm flex items-center justify-center flex-1 transition-all duration-200 ${
            activeTab === tab.id
              ? 'border-blue-500 shadow-md scale-105'
              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
          }`}
        >
          <h2 className="text-base font-bold tracking-tight ${
            activeTab === tab.id ? 'text-blue-600' : 'text-gray-800'
          }">{tab.label}</h2>
        </button>
      ))}
    </div>
  );
}
