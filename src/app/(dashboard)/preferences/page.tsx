'use client';
import { NotificationPreferencesForm } from '@/presentation/components/notifications/NotificationPreferences';
import { Bell, Mail, Shield, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PreferenciasPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-primary)] to-[var(--bg-secondary)]">
      {/* Header */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/notifications')}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)] rotate-180" />
            </button>
            <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl">
              <Bell className="w-6 h-6 text-[var(--text-secondary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Preferencias de Notificaciones</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Controla qué notificaciones y emails recibes de la plataforma
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulario - ocupa 2/3 */}
          <div className="lg:col-span-2">
            <NotificationPreferencesForm />
          </div>

          {/* Sidebar Info - ocupa 1/3 */}
          <div className="space-y-4">
            <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-color)] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Seguridad</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Tus preferencias se guardan automáticamente y están protegidas.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <span>Solo enviamos emails importantes</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-500" />
                  </div>
                  <span>Tus datos están encriptados</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-amber-500" />
                  </div>
                  <span>Cambios guardados al instante</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-lg p-6 text-white">
              <h3 className="font-semibold mb-2">¿Necesitas ayuda?</h3>
              <p className="text-sm text-slate-300 mb-4">
                Si tienes dudas sobre las notificaciones, contáctanos.
              </p>
              <button
                onClick={() => {
                  const subject = encodeURIComponent('Ayuda con notificaciones - Tiyuy');
                  const body = encodeURIComponent(
                    'Hola equipo de Tiyuy,\n\n' +
                    'Escribo para consultar sobre...\n\n' +
                    '---\n' +
                    'Enviado desde Preferencias de Notificaciones'
                  );
                  window.location.href = `mailto:soporte@tiyuy.com?subject=${subject}&body=${body}`;
                }}
                className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/10 hover:border-white/20"
              >
                Contactar soporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
