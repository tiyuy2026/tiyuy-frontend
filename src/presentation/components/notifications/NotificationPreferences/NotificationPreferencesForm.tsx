'use client';
import { useNotifications } from '../../../hooks/useNotifications';
import { NotificationPreferences } from '../../../../core/domain/entities/Notification';
import { Mail, Bell, Shield, Clock, Home, Heart, MessageSquare, CreditCard, RefreshCw, Calendar, Smartphone, AlertTriangle } from 'lucide-react';

interface PreferenceItem {
  key: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: React.ReactNode;
  section: 'email' | 'push' | 'alerts' | 'frequency';
}

const preferenceItems: PreferenceItem[] = [
  // === EMAIL SECTION ===
  {
    key: 'emailOnContact',
    title: 'Contactos recibidos',
    description: 'Recibe un email cuando alguien contacte una de tus propiedades',
    icon: <MessageSquare className="w-5 h-5" />,
    section: 'email'
  },
  {
    key: 'emailOnFavorite',
    title: 'Nuevos favoritos',
    description: 'Notificación cuando marcan tu propiedad como favorita',
    icon: <Heart className="w-5 h-5" />,
    section: 'email'
  },
  {
    key: 'emailOnPropertyPublished',
    title: 'Propiedades publicadas',
    description: 'Confirmación cuando publicas una nueva propiedad',
    icon: <Home className="w-5 h-5" />,
    section: 'email'
  },
  {
    key: 'emailOnSubscriptionExpiring',
    title: 'Suscripción expirando',
    description: 'Recordatorio cuando tu plan esté por vencer',
    icon: <CreditCard className="w-5 h-5" />,
    section: 'email'
  },
  {
    key: 'emailMarketing',
    title: 'Ofertas y promociones',
    description: 'Novedades, consejos y ofertas especiales',
    icon: <RefreshCw className="w-5 h-5" />,
    section: 'email'
  },
  // === PUSH SECTION ===
  {
    key: 'pushEnabled',
    title: 'Notificaciones push',
    description: 'Recibir notificaciones push en tu navegador',
    icon: <Smartphone className="w-5 h-5" />,
    section: 'push'
  },
  {
    key: 'pushOnMessage',
    title: 'Push por mensajes',
    description: 'Notificaciones push cuando recibas un mensaje',
    icon: <MessageSquare className="w-5 h-5" />,
    section: 'push'
  },
  {
    key: 'pushOnPropertyMatch',
    title: 'Push por propiedades',
    description: 'Notificaciones push cuando haya propiedades que coincidan con tu búsqueda',
    icon: <Home className="w-5 h-5" />,
    section: 'push'
  },
  {
    key: 'pushOnSystemAlert',
    title: 'Push por alertas del sistema',
    description: 'Notificaciones push para alertas importantes del sistema',
    icon: <AlertTriangle className="w-5 h-5" />,
    section: 'push'
  },
  // === ALERTS SECTION ===
  {
    key: 'propertyAlertsEnabled',
    title: 'Alertas de propiedades',
    description: 'Recibir alertas sobre nuevas propiedades que coincidan con tus intereses',
    icon: <Home className="w-5 h-5" />,
    section: 'alerts'
  },
  {
    key: 'messageAlertsEnabled',
    title: 'Alertas de mensajes',
    description: 'Recibir alertas cuando tengas mensajes nuevos',
    icon: <MessageSquare className="w-5 h-5" />,
    section: 'alerts'
  },
  {
    key: 'systemAlertsEnabled',
    title: 'Alertas del sistema',
    description: 'Recibir alertas importantes del sistema y la plataforma',
    icon: <Shield className="w-5 h-5" />,
    section: 'alerts'
  },
];

const sectionConfig = {
  email: {
    title: 'Notificaciones por Email',
    description: 'Controla qué emails recibes de la plataforma',
    icon: <Mail className="w-5 h-5" />,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200'
  },
  push: {
    title: 'Notificaciones Push',
    description: 'Configura las notificaciones push en tu navegador',
    icon: <Bell className="w-5 h-5" />,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200'
  },
  alerts: {
    title: 'Alertas',
    description: 'Personaliza qué alertas deseas recibir',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200'
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

  const handleFrequencyChange = (value: string) => {
    if (preferences) {
      const newPrefs = { ...preferences, notificationFrequency: value };
      updatePreferences(newPrefs);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
        <div className="p-8 space-y-8">
          {[1, 2, 3].map((section) => (
            <div key={section} className="space-y-4">
              <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded w-72 animate-pulse" />
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                      <div>
                        <div className="h-4 bg-slate-200 w-32 rounded mb-2" />
                        <div className="h-3 bg-slate-200 w-48 rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-11 bg-slate-200 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sections = ['email', 'push', 'alerts'] as const;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      <div className="p-8 space-y-10">
        {sections.map((sectionKey) => {
          const config = sectionConfig[sectionKey];
          const items = preferenceItems.filter(item => item.section === sectionKey);
          
          return (
            <div key={sectionKey}>
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.color} text-white shadow-lg`}>
                  {config.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{config.title}</h3>
                  <p className="text-sm text-slate-500">{config.description}</p>
                </div>
              </div>

              {/* Section Items */}
              <div className="mt-4 space-y-2">
                {items.map((item) => {
                  const isEnabled = preferences?.[item.key] ?? false;
                  
                  return (
                    <div
                      key={item.key}
                      className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                        isEnabled 
                          ? `bg-white ${config.borderColor} border` 
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                      }`}
                      onClick={() => handleToggle(item.key)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isEnabled ? `${config.bgColor} ${config.textColor}` : 'bg-slate-100 text-slate-400'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className={`block text-sm font-semibold cursor-pointer transition-colors ${
                            isEnabled ? 'text-slate-900' : 'text-slate-500'
                          }`}>
                            {item.title}
                          </label>
                          <p className={`text-xs mt-0.5 transition-colors ${
                            isEnabled ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled ? 'true' : 'false'}
                        disabled={isUpdating}
                        className={`
                          relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                          ${isEnabled ? 'bg-blue-600' : 'bg-slate-300'}
                          ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(item.key);
                        }}
                      >
                        <span
                          className={`
                            inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform
                            ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Frequency Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Frecuencia de notificaciones</h3>
              <p className="text-sm text-slate-500">Con qué frecuencia deseas recibir notificaciones</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'IMMEDIATE', label: 'Inmediato', desc: 'Tan pronto ocurran' },
              { value: 'DAILY', label: 'Diario', desc: 'Resumen una vez al día' },
              { value: 'WEEKLY', label: 'Semanal', desc: 'Resumen una vez por semana' },
            ].map((option) => {
              const isActive = preferences?.notificationFrequency === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleFrequencyChange(option.value)}
                  disabled={isUpdating}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={`font-semibold text-sm ${isActive ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 ml-5">{option.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Saving indicator */}
      {isUpdating && (
        <div className="px-8 pb-6">
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
            <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium text-blue-700">Guardando cambios...</span>
          </div>
        </div>
      )}
    </div>
  );
};
