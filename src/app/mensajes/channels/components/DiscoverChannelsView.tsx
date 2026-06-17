'use client';

import { useState } from 'react';
import { useChannels } from '@/presentation/hooks/useChannels';
import { formatCompactNumber } from '@/utils/formatters';
import { Bell, BellOff, FileText, Search, Users } from 'lucide-react';;

export default function DiscoverChannelsView({ user, onChannelSelect }: { user: any; onChannelSelect: (channel: any) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { channels, channelsLoading: isLoading, subscribeToChannel, isSubscribing } = useChannels(user?.id);
  
  // Filtrar canales donde el usuario NO esta suscrito
  const availableChannels = channels?.filter((c: any) => !c.isSubscribed) ?? [];
  const filteredChannels = availableChannels.filter((channel: any) =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.city.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSubscribeChannel = (channelId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    subscribeToChannel(channelId);
  };

  return (
    <div className="h-full bg-white p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Descubrir Canales</h2>
          <div className="text-sm text-gray-500">
            {filteredChannels.length} canales disponibles
          </div>
        </div>

        {/* Barra de busqueda */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar canales por nombre, descripción, categoría o ciudad..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>
        )}

        {/* No channels available */}
        {!isLoading && filteredChannels.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl"></span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {searchTerm ? 'No se encontraron canales' : 'No hay canales disponibles'}
            </h3>
            <p className="text-gray-600 text-sm text-center max-w-md leading-relaxed">
              {searchTerm 
                ? 'Intenta con otros terminos de busqueda'
                : 'No hay canales disponibles para suscribirse en este momento'
              }
            </p>
          </div>
        )}

        {/* Grid de canales disponibles */}
        {!isLoading && filteredChannels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel: any) => (
              <div
                key={channel.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onChannelSelect(channel)}
              >
                {/* Banner del canal */}
                <div className="h-24 bg-gradient-to-br brand flex items-center justify-center text-4xl">
                  {getChannelEmoji(channel.city)}
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
                    {channel.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {channel.description || 'Sin descripcion disponible'}
                  </p>
                  
                  {/* Facebook-style stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{formatCompactNumber(channel.subscriberCount)} suscriptores</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{channel.postsPerDay || 0} posts/dia</span>
                    </div>
                  </div>

                  {/* Tipo de canal */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className={`px-2 py-1 rounded-full ${
                      channel.isPublic 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {channel.isPublic ? ' Público' : ' Privado'}
                    </span>
                    <span>{channel.city}</span>
                  </div>

                  {/* Boton de suscribirse */}
                  <button
                    onClick={(e) => handleSubscribeChannel(channel.id, e)}
                    disabled={isSubscribing}
                    className="w-full py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubscribing ? 'Suscribiendose...' : 'Suscribirse'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
