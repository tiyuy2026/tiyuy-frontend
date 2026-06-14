'use client';

import { useState } from 'react';
import { useGetChannels } from '@/presentation/hooks/useContacts';
import { formatCompactNumber } from '@/utils/formatters';

interface MisCanalesSuscritosViewProps {
  user: any;
  onChannelSelect: (channel: any) => void;
}

export default function MisCanalesSuscritosView({ user, onChannelSelect }: MisCanalesSuscritosViewProps) {
  const { data: channels, isLoading } = useGetChannels(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  
  //  Canales suscritos (soy miembro pero no admin)
  const misCanalesSuscritos = channels?.filter((c: any) => c.isSubscribed && !c.isAdmin) ?? [];
  
  // Filtrado por búsqueda
  const filteredChannels = misCanalesSuscritos.filter((channel: any) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Cargando tus suscripciones...</p>
        </div>
      </div>
    );
  }

  if (filteredChannels.length === 0 && searchQuery) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron canales</h3>
          <p className="text-gray-500 text-sm">
            No hay canales suscritos que coincidan con "{searchQuery}"
          </p>
        </div>
      </div>
    );
  }

  if (misCanalesSuscritos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No estás suscrito a canales</h3>
          <p className="text-gray-500 text-sm mb-4">
            Descubre canales de otros agentes e inmobiliarias para estar al día con las últimas novedades del mercado.
          </p>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <p className="text-teal-700 text-sm font-medium mb-1"> Beneficios de suscribirte:</p>
            <ul className="text-teal-600 text-xs space-y-1">
              <li> Recibir actualizaciones de propiedades</li>
              <li> Conocer nuevas oportunidades</li>
              <li> Comentar y interactuar</li>
              <li> Mantenerte informado del mercado</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Mis Canales Suscritos</h2>
        <p className="text-gray-600 text-sm mb-4">
          Canales en los que estás suscrito. Puedes ver contenido, comentar y interactuar con las publicaciones.
        </p>
        
        {/* Input de búsqueda */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 max-w-md">
          <svg className="w-4 h-4 fill-gray-400" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input 
            type="text"
            placeholder="Buscar canales suscritos por nombre, descripción, categoría o ciudad..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 flex-1 focus:outline-none" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {searchQuery && (
          <p className="text-xs text-gray-500 mt-2">
            Se encontraron {filteredChannels.length} canal(es) suscrito(s) que coinciden con "{searchQuery}"
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel: any) => (
          <div
            key={channel.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onChannelSelect(channel)}
          >
            {/* Header del canal */}
            <div className="h-20 bg-gradient-to-r from-teal-500 to-blue-400 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-2xl">
                  {getChannelEmoji(channel.city)}
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  SUSCRIPTOR
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{channel.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{channel.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {channel.city}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {formatCompactNumber(channel.subscriberCount)} suscriptores
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-teal-50 text-teal-600 py-2 px-3 rounded-lg text-xs font-medium hover:bg-teal-100 transition-colors">
                  Ver posts
                </button>
                <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                  Comentar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
