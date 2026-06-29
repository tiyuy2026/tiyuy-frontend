'use client';

import { useState } from 'react';
import { useGetChannels } from '@/presentation/hooks/useContacts';
import { formatCompactNumber } from '@/utils/formatters';
import { MapPin, Search, Users, X } from 'lucide-react';;

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
          <p className="text-[var(--text-secondary)] text-sm">Cargando tus suscripciones...</p>
        </div>
      </div>
    );
  }

  if (filteredChannels.length === 0 && searchQuery) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No se encontraron canales</h3>
          <p className="text-[var(--text-secondary)] text-sm">
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
          <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No estás suscrito a canales</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-4">
            Descubre canales de otros agentes e inmobiliarias para estar al día con las últimas novedades del mercado.
          </p>
          <div className="bg-[var(--brand-primary-light)] border border-[var(--border-color)] rounded-lg p-3">
            <p className="text-[var(--text-primary)] text-sm font-medium mb-1"> Beneficios de suscribirte:</p>
            <ul className="text-[var(--text-secondary)] text-xs space-y-1">
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
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Mis Canales Suscritos</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          Canales en los que estás suscrito. Puedes ver contenido, comentar y interactuar con las publicaciones.
        </p>
        
        {/* Input de búsqueda */}
        <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] rounded-full px-4 py-2 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input 
            type="text"
            placeholder="Buscar canales suscritos por nombre, descripción, categoría o ciudad..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] flex-1 focus:outline-none" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {searchQuery && (
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Se encontraron {filteredChannels.length} canal(es) suscrito(s) que coinciden con "{searchQuery}"
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChannels.map((channel: any) => (
          <div
            key={channel.id}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onChannelSelect(channel)}
          >
            {/* Header del canal */}
            <div className="h-20 bg-gradient-to-r from-teal-500 to-blue-400 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-[var(--bg-card)]/90 rounded-full flex items-center justify-center text-2xl">
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
              <h3 className="font-semibold text-[var(--text-primary)] mb-1 truncate">{channel.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{channel.description}</p>
              
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {channel.city}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {formatCompactNumber(channel.subscriberCount)} suscriptores
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-[var(--brand-primary-light)] text-[var(--text-primary)] py-2 px-3 rounded-lg text-xs font-medium hover:bg-[var(--brand-primary-light-hover)] transition-colors">
                  Ver posts
                </button>
                <button className="flex-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] py-2 px-3 rounded-lg text-xs font-medium hover:bg-[var(--bg-secondary)] transition-colors">
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
