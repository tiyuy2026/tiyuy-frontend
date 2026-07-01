'use client';

import { useState } from "react";
import { IC, ShareModal } from "@/app/mensajes/page";
import { useGetChannels, useSubscribeToChannel, useUnsubscribeFromChannel } from "@/presentation/hooks/useContacts";
import { NewChannelModal } from "./components/NewChannelModal";

//  PANEL CANALES 
export default function CanalesPanel({ user }: { user: any }) {
    const [shareTarget, setShareTarget] = useState<{ title: string; link: string } | null>(null);
    const [showNewChannel, setShowNewChannel] = useState(false);
    const { data: channels, isLoading } = useGetChannels(user?.id);
    const subscribe = useSubscribeToChannel();
    const unsubscribe = useUnsubscribeFromChannel();

    // Canales predeterminados para las 6 ciudades principales
    const defaultChannels = [
        { id: 1, name: 'Tiyuy Oficial', city: 'Lima', description: 'Noticias y novedades de Tiyuy', subscriberCount: 15420, isSubscribed: false, shareLink: 'tiyuy-oficial' },
        { id: 2, name: 'Lima Inmobiliaria', city: 'Lima', description: 'Las mejores propiedades en Lima', subscriberCount: 8930, isSubscribed: false, shareLink: 'lima-inmobiliaria' },
        { id: 3, name: 'Arequipa Propiedades', city: 'Arequipa', description: 'Departamentos y casas en Arequipa', subscriberCount: 5670, isSubscribed: false, shareLink: 'arequipa-propiedades' },
        { id: 4, name: 'Trujillo Bienes Raíces', city: 'Trujillo', description: 'Venta y alquiler en Trujillo', subscriberCount: 4230, isSubscribed: false, shareLink: 'trujillo-bienes-raices' },
        { id: 5, name: 'Cusco Inmobiliarias', city: 'Cusco', description: 'Oportunidades inmobiliarias en Cusco', subscriberCount: 3890, isSubscribed: false, shareLink: 'cusco-inmobiliarias' },
        { id: 6, name: 'Piura Real Estate', city: 'Piura', description: 'El mercado inmobiliario de Piura', subscriberCount: 2760, isSubscribed: false, shareLink: 'piura-real-estate' },
    ];

    const displayChannels = channels?.length ? channels : defaultChannels;

    const handleToggle = (channel: any) => {
        if (channel.isSubscribed) {
            unsubscribe.mutate(channel.id);
        } else {
            subscribe.mutate(channel.id);
        }
    };

    const cityEmojis: Record<string, string> = {
        Lima: '️', Arequipa: '', Trujillo: '', Piura: '️', Chiclayo: '', Cusco: '️',
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Canales Tiyuy</h2>
                <p className="text-xs text-gray-400 mt-0.5">Canales oficiales por ciudad</p>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-transparent animate-spin" />
                    </div>
                ) : !displayChannels?.length ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-sm">No hay canales disponibles</p>
                    </div>
                ) : (
                    displayChannels.map((channel: any) => (
                        <div key={channel.id}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 border-b border-gray-100 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                                {cityEmojis[channel.city] ?? '️'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-sm font-semibold text-gray-900 truncate">{channel.name}</span>
                                    <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{channel.lastTime}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{channel.lastMessage ?? channel.description}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    {channel.subscriberCount?.toLocaleString('es-PE')} suscriptores
                                </p>
                            </div>
                            <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                                <button onClick={() => handleToggle(channel)}
                                    disabled={subscribe.isPending || unsubscribe.isPending}
                                    className={`text-xs px-3 py-1 rounded-full font-medium transition-all disabled:opacity-50 ${channel.isSubscribed
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : 'bg-gray-800 text-white hover:bg-gray-700 shadow-sm'
                                        }`}>
                                    {channel.isSubscribed ? ' Suscrito' : 'Suscribirse'}
                                </button>
                                <button
                                    onClick={() => setShareTarget({ title: `Canal ${channel.city} en Tiyuy`, link: `https://tiyuy.com/channels/${channel.shareLink}` })}
                                    className="text-[10px] text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1">
                                    <IC.Share /> Compartir
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Botones inferiores */}
            <div className="p-3 border-t border-gray-100 space-y-2">
                <button
                    onClick={() => setShowNewChannel(true)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 font-medium hover:bg-gray-700 transition-opacity flex items-center justify-center gap-2 shadow-sm"
                >
                    <IC.Plus />
                    Crear canal
                </button>
                <button className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 font-medium hover:bg-gray-200 transition-colors text-sm">
                    Descubrir más canales
                </button>
            </div>

            {shareTarget && (
                <ShareModal title={shareTarget.title} link={shareTarget.link} onClose={() => setShareTarget(null)} />
            )}
            {showNewChannel && (
                <NewChannelModal onClose={() => setShowNewChannel(false)} userRole={user?.role} />
            )}
        </div>
    );
}