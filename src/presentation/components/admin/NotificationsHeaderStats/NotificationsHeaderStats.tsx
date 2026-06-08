/**
 * Notifications Header Stats Component
 * Muestra los tabs de navegación para la página de notificaciones
 */

interface NotificationsHeaderStatsProps {
  activeTab: 'send' | 'history';
  onTabChange: (tab: 'send' | 'history') => void;
}

export function NotificationsHeaderStats({ activeTab, onTabChange }: NotificationsHeaderStatsProps) {
  const tabs = [
    { id: 'send' as const, label: 'Notificaciones' },
    { id: 'history' as const, label: 'Alertas e Historial' }
  ];

  return (
    <div className="flex items-stretch gap-3 py-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`bg-white rounded-xl px-4 py-3 border shadow-sm flex items-center justify-center flex-1 transition-all duration-200 ${
            activeTab === tab.id
              ? 'border-teal-500 shadow-md scale-105'
              : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
          }`}
        >
          <h2 className={`text-base font-bold tracking-tight ${
            activeTab === tab.id ? 'text-teal-600' : 'text-gray-800'
          }`}>{tab.label}</h2>
        </button>
      ))}
    </div>
  );
}
