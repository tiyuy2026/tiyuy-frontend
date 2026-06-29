'use client';

import { useState } from 'react';
import { useChannels } from '@/presentation/hooks/useChannels';
import { InfoDialog } from '@/presentation/components/ui';
import { Search, FolderKanban, Users, Compass, Plus, ShieldAlert, Ban, Building2, MapPin, Mountain, Compass as CityIcon } from 'lucide-react';

const ChannelIcon = ({ city }: { city: string }) => {
  const icons: Record<string, React.ReactNode> = {
    'Lima': <Building2 className="w-5 h-5 text-slate-500" />,
    'Arequipa': <Mountain className="w-5 h-5 text-slate-500" />,
    'Trujillo': <CityIcon className="w-5 h-5 text-slate-500" />,
    'Piura': <MapPin className="w-5 h-5 text-slate-500" />,
    'Chiclayo': <MapPin className="w-5 h-5 text-slate-500" />,
    'Cusco': <Mountain className="w-5 h-5 text-slate-500" />,
  };

  return icons[city] || <Building2 className="w-5 h-5 text-slate-500" />;
};

function CanalesListPanel({ 
  user, 
  onChannelSelect, 
  activeSection,
  onSectionChange,
}: { 
  user: any; 
  onChannelSelect: (channel: any) => void;
  activeSection: 'mis-canales-creados' | 'mis-canales-suscritos' | 'descubrir-canales' | 'crear-canal';
  onSectionChange: (s: 'mis-canales-creados' | 'mis-canales-suscritos' | 'descubrir-canales' | 'crear-canal') => void;
}) {
  const { channels, channelsLoading: isLoading } = useChannels(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [infoDialog, setInfoDialog] = useState(false);
  
  const misCanalesCreados = channels?.filter((c: any) => c.isAdmin) ?? [];
  const misCanalesSuscritos = channels?.filter((c: any) => c.isSubscribed && !c.isAdmin) ?? [];
  
  const filteredCanalesCreados = misCanalesCreados.filter((channel: any) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredCanalesSuscritos = misCanalesSuscritos.filter((channel: any) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const hasChannel = misCanalesCreados.length > 0;
  const isAuthorizedRole = user?.role === 'AGENT' || user?.role === 'INMOBILIARIA';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Canales</h1>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input 
            placeholder="Buscar canales" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 flex-1 focus:outline-none" 
          />
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => onSectionChange('mis-canales-creados')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'mis-canales-creados' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <FolderKanban className="w-5 h-5" />
          Mis canales creados
          {misCanalesCreados.length > 0 && (
            <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {misCanalesCreados.length}
            </span>
          )}
        </button>

        <button
          onClick={() => onSectionChange('mis-canales-suscritos')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'mis-canales-suscritos' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Users className="w-5 h-5" />
          Mis canales suscritos
          {misCanalesSuscritos.length > 0 && (
            <span className="ml-auto bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              {misCanalesSuscritos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => onSectionChange('descubrir-canales')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'descubrir-canales' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Compass className="w-5 h-5" />
          Descubrir canales
        </button>

        <button
          onClick={() => {
            if (hasChannel) return;
            if (isAuthorizedRole) {
              onSectionChange('crear-canal');
            } else {
              setInfoDialog(true);
            }
          }}
          disabled={hasChannel}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            hasChannel 
              ? 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 cursor-not-allowed' 
              : activeSection === 'crear-canal' 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Plus className="w-5 h-5" />
          Crear canal
        </button>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700" />

      {filteredCanalesCreados.length > 0 && (
        <div className="px-3 py-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Mis Canales Creados {searchQuery && `(${filteredCanalesCreados.length})`}
          </h3>
          <div className="space-y-1">
            {filteredCanalesCreados.slice(0, 3).map((channel: any) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  <ChannelIcon city={channel.city} />
                </div>
                <div className="flex-1 text-left truncate">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{channel.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{channel.subscriberCount} suscriptores</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredCanalesSuscritos.length > 0 && (
        <div className="px-3 py-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Suscrito {searchQuery && `(${filteredCanalesSuscritos.length})`}
          </h3>
          <div className="space-y-1">
            {filteredCanalesSuscritos.slice(0, 3).map((channel: any) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  <ChannelIcon city={channel.city} />
                </div>
                <div className="flex-1 text-left truncate">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{channel.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{channel.subscriberCount} suscriptores</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {searchQuery && filteredCanalesCreados.length === 0 && filteredCanalesSuscritos.length === 0 && (
        <div className="px-3 py-6 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">No se encontraron canales con "{searchQuery}"</p>
        </div>
      )}

      <InfoDialog
        isOpen={infoDialog}
        onClose={() => setInfoDialog(false)}
        title="Permisos insuficientes"
        message="Para crear canales necesitas ser Agente Inmobiliario o Empresa. Contacta a nuestro equipo para actualizar tu rol."
        variant="info"
      />

      <div className="px-3 pb-3 mt-auto">
        <button
          onClick={() => {
            if (hasChannel) return;
            if (isAuthorizedRole) {
              onSectionChange('crear-canal');
            } else {
              setInfoDialog(true);
            }
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors relative ${
            hasChannel 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
              : isAuthorizedRole
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer'
                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer'
          }`}
        >
          {hasChannel && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          
          {hasChannel ? (
            <Ban className="w-4 h-4" />
          ) : isAuthorizedRole ? (
            <Plus className="w-4 h-4" />
          ) : (
            <ShieldAlert className="w-4 h-4" />
          )}

          <span>
            {hasChannel ? 'Límite alcanzado' : isAuthorizedRole ? 'Crear nuevo canal' : 'Verificar permisos'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default CanalesListPanel;