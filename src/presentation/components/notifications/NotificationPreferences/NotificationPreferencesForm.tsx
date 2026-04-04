'use client';
import { useNotifications } from '../../../hooks/useNotifications';
import { NotificationPreferences } from '../../../../core/domain/entities/Notification';

const preferenceLabels: Record<keyof NotificationPreferences, { title: string; description: string }> = {
  emailOnContact: {
    title: 'Contactos recibidos',
    description: 'Recibe un email cuando alguien contacte una de tus propiedades'
  },
  emailOnFavorite: {
    title: 'Nuevos favoritos',
    description: 'Notificación cuando marcan tu propiedad como favorita'
  },
  emailOnPropertyPublished: {
    title: 'Propiedades publicadas',
    description: 'Confirmación cuando publicas una nueva propiedad'
  },
  emailOnSubscriptionExpiring: {
    title: 'Suscripción expirando',
    description: 'Recordatorio cuando tu plan esté por vencer'
  },
  emailMarketing: {
    title: 'Ofertas y promociones',
    description: 'Novedades, consejos y ofertas especiales'
  },
  emailOnEventCreated: {
    title: 'Eventos creados',
    description: 'Notificación cuando se crea un nuevo evento en un canal que sigues'
  },
  emailOnEventUpdated: {
    title: 'Eventos actualizados',
    description: 'Notificación cuando se actualiza un evento al que asistirás'
  },
  emailOnEventReminder: {
    title: 'Recordatorio de eventos',
    description: 'Recordatorio antes de que comience un evento'
  },
  emailOnEventJoined: {
    title: 'Nuevo asistente a evento',
    description: 'Notificación cuando alguien se une a un evento que organizas'
  },
};

interface Props {
  className?: string;
}

export const NotificationPreferencesForm = ({ className = '' }: Props) => {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotifications();

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (preferences) {
      const newPrefs = { ...preferences, [key]: !preferences[key] };
      updatePreferences(newPrefs);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded animate-pulse">
              <div className="h-4 bg-gray-200 w-32 rounded"></div>
              <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6 space-y-4">
        {Object.entries(preferenceLabels).map(([key, { title, description }]) => {
          const fieldKey = key as keyof NotificationPreferences;
          const isEnabled = preferences?.[fieldKey] ?? false;
          
          return (
            <div 
              key={key} 
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex-1 mr-4">
                <label className="block text-sm font-semibold text-gray-900 cursor-pointer">
                  {title}
                </label>
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              </div>
              
              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                onClick={() => handleToggle(fieldKey)}
                disabled={isUpdating}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${isEnabled ? 'bg-blue-600' : 'bg-gray-300'}
                  ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          );
        })}
      </div>
      
      {isUpdating && (
        <div className="px-6 pb-4">
          <p className="text-sm text-blue-600 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Guardando cambios...
          </p>
        </div>
      )}
    </div>
  );
};
