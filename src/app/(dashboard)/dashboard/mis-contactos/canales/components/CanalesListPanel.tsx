// COMPONENTES DE CANALES - Arquitectura Hexagonal
// Este archivo pertenece al modulo de CANALES (Presentation Layer - Componentes UI)

'use client';

import { useState } from 'react';
import { useGetChannels, useCreateChannel } from '@/presentation/hooks/useContacts';

function CanalesListPanel({ 
  user, 
  onChannelSelect, 
  activeSection,
  onSectionChange,
}: { 
  user: any; 
  onChannelSelect: (channel: any) => void;
  activeSection: 'mis-canales-creados' | 'mis-canales-suscritos' | 'mis-eventos' | 'descubrir-canales' | 'crear-canal';
  onSectionChange: (s: 'mis-canales-creados' | 'mis-canales-suscritos' | 'mis-eventos' | 'descubrir-canales' | 'crear-canal') => void;
}) {
  const { data: channels, isLoading } = useGetChannels(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Canales que creé (soy admin)
  const misCanalesCreados = channels?.filter((c: any) => c.isAdmin) ?? [];
  
  // ✅ Canales suscritos (soy miembro pero no admin)
  const misCanalesSuscritos = channels?.filter((c: any) => c.isSubscribed && !c.isAdmin) ?? [];
  
  // ✅ Filtrado por búsqueda
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
      'Lima': '🏙️',
      'Arequipa': '🌋',
      'Trujillo': '🏺',
      'Piura': '☀️',
      'Chiclayo': '🌿',
      'Cusco': '🏔️',
    };
    return cityEmojis[city] || '🏘️';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header estilo Facebook */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Canales</h1>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
          <svg className="w-4 h-4 fill-gray-400" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input 
            placeholder="Buscar canales" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 flex-1 focus:outline-none" 
          />
        </div>
      </div>

      {/* Nav items */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => onSectionChange('mis-canales-creados')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'mis-canales-creados' ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Mis canales creados
          {misCanalesCreados.length > 0 && (
            <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {misCanalesCreados.length}
            </span>
          )}
        </button>

        <button
          onClick={() => onSectionChange('mis-canales-suscritos')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'mis-canales-suscritos' ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Mis canales suscritos
          {misCanalesSuscritos.length > 0 && (
            <span className="ml-auto bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
              {misCanalesSuscritos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => onSectionChange('mis-eventos')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'mis-eventos' ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4l8-4-8-4m0 4v4m0-4h8M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Mis eventos
        </button>

        <button
          onClick={() => onSectionChange('descubrir-canales')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'descubrir-canales' ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Descubrir canales
        </button>

        <button
          onClick={() => onSectionChange('crear-canal')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'crear-canal' ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear canal
        </button>
      </div>

      <div className="border-t border-gray-100" />

      {/* Mini lista de canales creados filtrados */}
      {filteredCanalesCreados.length > 0 && (
        <div className="px-3 py-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Mis Canales Creados {searchQuery && `(${filteredCanalesCreados.length})`}
          </h3>
          <div className="space-y-1">
            {filteredCanalesCreados.slice(0, 3).map((channel: any) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg">{getChannelEmoji(channel.city)}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">{channel.name}</p>
                  <p className="text-xs text-gray-400">{channel.subscriberCount} suscriptores</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mini lista de canales suscritos filtrados */}
      {filteredCanalesSuscritos.length > 0 && (
        <div className="px-3 py-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Suscrito {searchQuery && `(${filteredCanalesSuscritos.length})`}
          </h3>
          <div className="space-y-1">
            {filteredCanalesSuscritos.slice(0, 3).map((channel: any) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg">{getChannelEmoji(channel.city)}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">{channel.name}</p>
                  <p className="text-xs text-gray-400">{channel.subscriberCount} suscriptores</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay resultados de búsqueda */}
      {searchQuery && filteredCanalesCreados.length === 0 && filteredCanalesSuscritos.length === 0 && (
        <div className="px-3 py-6 text-center">
          <p className="text-sm text-gray-400">No se encontraron canales con "{searchQuery}"</p>
        </div>
      )}

      {/* Botón crear - Verificación inteligente de rol */}
      <div className="px-3 pb-3">
        <button
          onClick={() => {
            // Verificar si el usuario puede crear canales según su rol
            const canCreate = user?.role === 'AGENT' || user?.role === 'INMOBILIARIA';
            if (canCreate) {
              onSectionChange('crear-canal');
            } else {
              // Mostrar mensaje amable si no tiene permisos
              alert('¡Hola! Para crear canales necesitas ser Agente Inmobiliario o Empresa. Contacta a nuestro equipo para actualizar tu rol.');
            }
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors relative ${
            hasChannel 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : (user?.role === 'AGENT' || user?.role === 'INMOBILIARIA')
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {hasChannel && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          <span className="text-lg font-bold leading-none">
            {hasChannel ? '🚫' : 
              (user?.role === 'AGENT' || user?.role === 'INMOBILIARIA') ? '+' : '🔒'}
          </span>
          {hasChannel ? 'Límite alcanzado' : 
            (user?.role === 'AGENT' || user?.role === 'INMOBILIARIA') ? 'Crear nuevo canal' : 'No tienes permisos'}
        </button>
        {hasChannel && (
          <p className="text-xs text-gray-400 text-center mt-1">
            Ya tienes 1 canal activo
          </p>
        )}
      </div>
    </div>
  );
}

export default CanalesListPanel;
