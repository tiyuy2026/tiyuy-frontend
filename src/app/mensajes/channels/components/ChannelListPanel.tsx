// COMPONENTES DE CANALES - Arquitectura Hexagonal
// Este archivo pertenece al modulo de CANALES (Presentation Layer - Componentes UI)

'use client';

import { useState } from 'react';
import { useChannels } from '@/presentation/hooks/useChannels';
import { InfoDialog } from '@/presentation/components/ui';
import { ArrowLeft, Plus, Search, Users } from 'lucide-react';;

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
  
  // Canales que creé (soy admin)
  const misCanalesCreados = channels?.filter((c: any) => c.isAdmin) ?? [];
  
  // Canales suscritos (soy miembro pero no admin)
  const misCanalesSuscritos = channels?.filter((c: any) => c.isSubscribed && !c.isAdmin) ?? [];
  
  // Filtrado por búsqueda
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
  
  // Verificar si el usuario ya es admin de un canal
  const hasChannel = misCanalesCreados.length > 0;

  const getChannelEmoji = (city: string) => {
    const cityEmojis: Record<string, string> = {
      'Lima': '️',
      'Arequipa': '',
      'Trujillo': '',
      'Piura': '️',
      'Chiclayo': '',
      'Cusco': '️',
    };
    return cityEmojis[city] || '️';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header estilo Facebook */}
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

      {/* Nav items */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => onSectionChange('mis-canales-creados')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'mis-canales-creados' ? 'bg-[var(--brand-primary-light)] text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Mis canales creados
          {misCanalesCreados.length > 0 && (
            <span className="ml-auto bg-brand/100 text-white text-xs px-2 py-1 rounded-full">
              {misCanalesCreados.length}
            </span>
          )}
        </button>

        <button
          onClick={() => onSectionChange('mis-canales-suscritos')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'mis-canales-suscritos' ? 'bg-[var(--brand-primary-light)] text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Users className="w-5 h-5" />
          Mis canales suscritos
          {misCanalesSuscritos.length > 0 && (
            <span className="ml-auto bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
              {misCanalesSuscritos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => onSectionChange('descubrir-canales')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'descubrir-canales' ? 'bg-[var(--brand-primary-light)] text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Search className="w-5 h-5" />
          Descubrir canales
        </button>

        <button
          onClick={() => onSectionChange('crear-canal')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'crear-canal' ? 'bg-[var(--brand-primary-light)] text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Plus className="w-5 h-5" />
          Crear canal
        </button>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700" />

      {/* Mini lista de canales creados filtrados */}
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
                <span className="text-lg">{getChannelEmoji(channel.city)}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{channel.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{channel.subscriberCount} suscriptores</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mini lista de canales suscritos filtrados */}
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
                <span className="text-lg">{getChannelEmoji(channel.city)}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{channel.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{channel.subscriberCount} suscriptores</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay resultados de búsqueda */}
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

      {/* Botón crear - Verificación inteligente de rol */}
      <div className="px-3 pb-3">
        <button
          onClick={() => {
            const canCreate = user?.role === 'AGENT' || user?.role === 'INMOBILIARIA';
            if (canCreate) {
              onSectionChange('crear-canal');
            } else {
              setInfoDialog(true);
            }
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors relative ${
            hasChannel 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
              : (user?.role === 'AGENT' || user?.role === 'INMOBILIARIA')
                ? 'bg-[var(--brand-primary-light)] text-[var(--text-primary)] hover:bg-[var(--brand-primary-light-hover)]'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {hasChannel && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          <span className="text-lg font-bold leading-none">
            {hasChannel ? '' : 
              (user?.role === 'AGENT' || user?.role === 'INMOBILIARIA') ? '+' : ''}
          </span>
          {hasChannel ? 'Límite alcanzado' : 
            (user?.role === 'AGENT' || user?.role === 'INMOBILIARIA') ? 'Crear nuevo canal' : 'No tienes permisos'}
        </button>
        {hasChannel && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
            Ya tienes 1 canal activo
          </p>
        )}
      </div>
    </div>
  );
}

export default CanalesListPanel;
