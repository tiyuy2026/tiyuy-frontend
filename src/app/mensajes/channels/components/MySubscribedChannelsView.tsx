'use client';

import { useState } from 'react';
import { useGetChannels } from '@/presentation/hooks/useContacts';
import { formatCompactNumber } from '@/utils/formatters';
import { MapPin, Search, Users, X } from 'lucide-react';
import { EntityIcon } from '@/utils/entityIcons';

interface MisCanalesSuscritosViewProps {
  user: any;
  onChannelSelect: (channel: any) => void;
}

export default function MisCanalesSuscritosView({ user, onChannelSelect }: MisCanalesSuscritosViewProps) {
  const { data: channels, isLoading } = useGetChannels(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  
  const misCanalesSuscritos = channels?.filter((c: any) => c.isSubscribed && !c.isAdmin) ?? [];
  const filteredChannels = misCanalesSuscritos.filter((channel: any) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><div className="text-center"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div><p className="text-gray-500 text-sm">Cargando tus suscripciones...</p></div></div>;
  }

  if (misCanalesSuscritos.length === 0) {
    return <div className="flex-1 flex items-center justify-center"><div className="text-center max-w-md"><Users className="w-8 h-8 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-900 mb-2">No estás suscrito a canales</h3><p className="text-gray-500 text-sm mb-4">Descubre canales de otros agentes e inmobiliarias.</p></div></div>;
  }

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 h-full">
      <div className="bg-green-600 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Mis Canales Suscritos</h1>
            <p className="text-white/70 text-xs">Canales en los que estás suscrito</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 max-w-md">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input type="text" placeholder="Buscar canales suscritos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 flex-1 focus:outline-none" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map((channel: any) => (
            <div key={channel.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onChannelSelect(channel)}>
              <div className="h-20 bg-gradient-to-r from-green-500 to-green-700 relative flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <EntityIcon name={channel.name} className="w-7 h-7 text-white" />
                </div>
                <div className="absolute top-2 right-2"><span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-medium">SUSCRIPTOR</span></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">{channel.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{channel.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{channel.city}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{formatCompactNumber(channel.subscriberCount)} suscriptores</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}