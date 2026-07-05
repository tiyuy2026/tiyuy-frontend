'use client';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react'
import { useAuthStore } from '@/presentation/store/authStore';
import { useGetChats, useSendMessage, useMarkChatAsRead, useToggleFavoriteChat, useGetChatMessages, useGetActiveStatusPosts, useGetGroups } from '@/presentation/hooks/useContacts';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/presentation/hooks/useWebSocket';
import { IC, formatLastSeen, formatDateSeparator, apiCall } from '../../page';
import { toast } from '@/presentation/store/toastStore';
import { MessageSquare, Lock, Globe, ArrowLeft } from 'lucide-react';
import { ChatsPanel, Avatar } from '../../chats/components/ChatsPanel';
import EstadosPanel from '../../states/page';
import CanalesListPanel from '../../channels/components/ChannelListPanel';
import { GruposListPanel } from './GruposListPanel';
import { GrupoDetailPanel } from './GrupoDetailPanel';
import { NewGroupModal } from './NewGroupModal';
import DiscoverGroupsView from './DiscoverGroupsView';
import { GruposMisGruposView } from './GruposMisGruposView';
import NewStatusModal from '../../states/components/NewStatusModal';
import StatusDetailPanel from '../../states/components/StatusDetailPanel';
import { ChannelPostsPanel } from '../../channels/components/ChannelPostsPanel';
import MisCanalesCreadosView from '../../channels/components/MyCreatedChannelsView';
import MisCanalesSuscritosView from '../../channels/components/MySubscribedChannelsView';
import DiscoverChannelsView from '../../channels/components/DiscoverChannelsView';
import CreateChannelView from '../../channels/components/CreateChannelView';


type MainTab = 'chats' | 'estados' | 'canales' | 'grupos';
type ChatFilter = 'all' | 'unread' | 'favorites';

type NavItem = {
  key: MainTab;
  Icon: (props: { a?: boolean }) => React.ReactElement;
  label: string;
  badge?: number;
};

export function MisContactosPageContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<MainTab>('chats');
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
    const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [selectedChannel, setSelectedChannel] = useState<any>(null);
    const [channelsSection, setChannelsSection] = useState<'mis-canales-creados' | 'mis-canales-suscritos' | 'descubrir-canales' | 'crear-canal'>('mis-canales-creados');
    const [gruposSection, setGruposSection] = useState<'mis-grupos' | 'descubrir' | 'crear'>('mis-grupos');
    const [activeRightView, setActiveRightView] = useState<'default' | 'create-group' | 'discover'>('default' as const);
    const [showNewStatus, setShowNewStatus] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [pinnedMessage, setPinnedMessage] = useState<any>(null);
    const [contextMenu, setContextMenu] = useState<{ msg: any; x: number; y: number } | null>(null);
    const [replyToMessage, setReplyToMessage] = useState<any>(null);
    const [showReactionPicker, setShowReactionPicker] = useState<{ msg: any; x: number; y: number } | null>(null);
    const [localReactions, setLocalReactions] = useState<{ [key: string]: { [emoji: string]: { count: number, users: string[] } } }>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user, token, isAuthenticated } = useAuthStore();
    const [initialChatProcessed, setInitialChatProcessed] = useState(false);

    const { data: chats } = useGetChats('all');
    const { data: messages, isLoading: loadingMessages, error: messagesError } = useGetChatMessages(selectedChatId!, { enabled: !!selectedChatId });

    const sendMessage = useSendMessage();
    const markAsRead = useMarkChatAsRead();
    const toggleFavorite = useToggleFavoriteChat();

    useEffect(() => {
        if (!isAuthenticated || !token) {
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, [messages]);

    useEffect(() => {
        const handleClick = () => {
            setContextMenu(null);
            setShowReactionPicker(null);
        };
        if (contextMenu || showReactionPicker) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [contextMenu, showReactionPicker]);

    const queryClient = useQueryClient();

    const handleReaction = (msg: any, emoji: string) => {
        const messageId = String(msg.id);
        const userId = String(user?.id || 'anonymous');
        setLocalReactions(prev => {
            const messageReactions = { ...prev[messageId] };
            const reaction = messageReactions[emoji] || { count: 0, users: [] };
            if (reaction.users.includes(userId)) {
                reaction.count--;
                reaction.users = reaction.users.filter(id => id !== userId);
                if (reaction.count === 0) delete messageReactions[emoji];
            } else {
                reaction.count++;
                reaction.users.push(userId);
                messageReactions[emoji] = reaction;
            }
            return { ...prev, [messageId]: messageReactions };
        });
        setShowReactionPicker(null);
    };

    const { isConnected: wsConnected } = useWebSocket({
        enabled: isAuthenticated,
        onNewMessage: (message: any) => {
            queryClient.invalidateQueries({ queryKey: ['chat-messages', message.chatId] });
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        },
        onConnectionChange: (connected: any) => {}
    });

    useEffect(() => {
        if (!chats || initialChatProcessed) return;
        const organizerData = localStorage.getItem('chat_with_organizer');
        if (organizerData) {
            const { userId, name, phone, timestamp } = JSON.parse(organizerData);
            if (Date.now() - timestamp < 30000) {
                setActiveTab('chats');
                const existingChat = chats.find((c: any) => c.participantId === userId || c.targetUserId === userId);
                if (existingChat) {
                    setSelectedChatId(existingChat.id);
                } else {
                    apiCall('/contacts/extended/chats', {
                        method: 'POST',
                        body: JSON.stringify({ targetUserId: userId, initialMessage: `Hola ${name || ''}, me interesa contactarte sobre tu evento.`, interactionType: 'event_contact' })
                    }).then((response: any) => { if (response?.id) setSelectedChatId(response.id); })
                      .catch((err: any) => toast.error('No se pudo iniciar la conversación'));
                }
            }
            localStorage.removeItem('chat_with_organizer');
        }
        setInitialChatProcessed(true);
    }, [chats, initialChatProcessed]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedChatId) return;
        const messagePayload: any = { chatId: selectedChatId, content: newMessage, type: 'TEXT' };
        if (replyToMessage) messagePayload.replyToMessageId = String(replyToMessage.id);
        sendMessage.mutate(messagePayload);
        setNewMessage('');
        if (replyToMessage) setReplyToMessage(null);
    };

    const { data: chatsData } = useGetChats('unread');
    const { data: groups, isLoading: groupsLoading } = useGetGroups(0, 50);
    const { data: statusData } = useGetActiveStatusPosts();
    const allPosts = statusData?.pages?.flatMap((p: any) => p.content) ?? [];
    const unreadCount = chatsData?.reduce((acc: number, c: any) => acc + (c.unreadCount ?? 0), 0) ?? 0;

    const NAV: NavItem[] = [
        { key: 'chats' as MainTab, Icon: IC.Chat, label: 'Chats', badge: unreadCount },
        { key: 'estados' as MainTab, Icon: IC.Status, label: 'Estados' },
        { key: 'grupos' as MainTab, Icon: IC.Groups, label: 'Grupos' },
        { key: 'canales' as MainTab, Icon: IC.Channel, label: 'Comunidades' },
    ];

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Para grupos y canales en móvil: las subsecciones abren el panel derecho
    const hasGroupSubSection = activeTab === 'grupos' && (gruposSection !== 'mis-grupos' || selectedGroup !== null);
    const hasChannelSubSection = activeTab === 'canales' && (selectedChannel !== null || channelsSection !== 'mis-canales-creados');
    const hasSelection = selectedChatId || selectedStatusId || selectedGroup || selectedChannel || hasGroupSubSection || hasChannelSubSection;

    // ============ Render de la vista de chat en el panel derecho ============
    const renderChatView = () => {
        if (activeTab === 'chats' && selectedChatId && chats?.find((c: any) => c.id === selectedChatId)) {
            const chat = chats.find((c: any) => c.id === selectedChatId);
            return (
                <div className="flex flex-col h-full" onClick={() => setContextMenu(null)}>
                    <div className="flex items-center gap-3 px-4 py-3 bg-green-600 border-b border-[#054d44] flex-shrink-0">
                        <button onClick={() => { setSelectedChatId(null); setReplyToMessage(null); }} className="text-white/70 hover:text-white transition-colors">
                            <IC.ArrowBack />
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm">{chat?.participantName}</p>
                            <p className="text-white/70 text-xs">{(chat?.participantLastSeen || chat?.lastMessageAt) ? `visto ${formatLastSeen(chat?.participantLastSeen || chat?.lastMessageAt)}` : 'en línea'}</p>
                        </div>
                        <button onClick={() => toggleFavorite.mutate(selectedChatId)}
                            className={`text-sm transition-colors ${chat?.isFavorite ? 'text-yellow-400' : 'text-white/40 hover:text-white/70'}`}>⭐</button>
                    </div>
                    {pinnedMessage && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
                            <div className="w-1 h-8 rounded-full bg-green-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-[#075e54]">{pinnedMessage.isOwn ? 'Tú' : pinnedMessage.senderName?.split(' ')[0]}</p>
                                <p className="text-xs text-gray-600 truncate">{pinnedMessage.content}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setPinnedMessage(null); }} className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0 ml-2">×</button>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1" data-chat-area
                        style={{ backgroundColor: '#e5ddd5', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M0 0h80v80H0z' fill='%23e5ddd5'/%3E%3Cpath d='M40 0v80M0 40h80' stroke='%23d4c9bf' stroke-width='0.5' opacity='0.4'/%3E%3C/svg%3E")` }}>
                        {messagesError ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-red-600 p-4">
                                <p className="font-semibold">Error al cargar mensajes</p>
                                <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Reintentar</button>
                            </div>
                        ) : loadingMessages ? (
                            <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-[#075e54] border-t-transparent animate-spin" /></div>
                        ) : !messages?.length ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500"><p className="text-sm">Sin mensajes aún</p></div>
                        ) : (
                            messages.slice().sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((msg: any, index: number, arr: any[]) => {
                                const isMe = msg.isOwn === true;
                                const prevMsg = arr[index - 1] ?? null;
                                const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                                const isPinned = pinnedMessage?.id === msg.id;
                                return (
                                    <div key={msg.id ?? `msg-${index}`}>
                                        {showDate && (
                                            <div className="flex justify-center my-3">
                                                <span className="text-[11px] px-3 py-1 rounded-lg shadow-sm" style={{ background: '#d9f0f9', color: '#54656f' }}>{formatDateSeparator(new Date(msg.createdAt))}</span>
                                            </div>
                                        )}
                                        <div className={`flex mb-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                                            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ msg, x: e.clientX, y: e.clientY }); }}>
                                            <div className={`relative max-w-[70%] px-3 py-2 shadow-sm text-sm leading-relaxed cursor-pointer ${isMe ? 'rounded-tl-2xl rounded-tr-sm rounded-bl-2xl rounded-br-2xl' : 'rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'} ${isPinned ? 'ring-2 ring-[#075e54]' : ''}`}
                                                style={{ background: isMe ? '#dcf8c6' : '#ffffff', color: '#111b21', wordBreak: 'break-word', minWidth: '80px', paddingBottom: '20px' }}>
                                                {(msg.replyToContent || msg.replyToSenderName) && (
                                                    <div className="mb-1 p-2 bg-gray-100 rounded-md border-l-2 border-blue-500">
                                                        <p className="text-xs text-gray-600 font-medium">Respondiendo a {msg.replyToIsOwn ? 'ti mismo' : msg.replyToSenderName?.split(' ')[0] || 'alguien'}</p>
                                                        <p className="text-xs text-gray-800 truncate">{msg.replyToContent}</p>
                                                    </div>
                                                )}
                                                {isPinned && <span className="text-[10px] text-[#075e54] font-semibold block mb-0.5">Fijado</span>}
                                                <span className="break-words">{msg.content}</span>
                                                <div className="absolute bottom-1 right-2 flex items-center gap-0.5 pointer-events-none">
                                                    <span className="text-[10px]" style={{ color: '#667781' }}>
                                                        {new Date(msg.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                    </span>
                                                    {isMe && <Icon icon="mdi:check-all" className="w-4 h-3 text-[#53bdeb]" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    {contextMenu && (
                        <div className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 py-1 min-w-[180px] overflow-hidden"
                            style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 200) }} onClick={(e) => e.stopPropagation()}>
                            <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                onClick={() => { setReplyToMessage(contextMenu.msg); setContextMenu(null); }}><span>️</span> Responder</button>
                            <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                onClick={() => { navigator.clipboard.writeText(contextMenu.msg.content ?? ''); setContextMenu(null); }}><span></span> Copiar</button>
                            <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                onClick={() => { setContextMenu(null); setTimeout(() => setShowReactionPicker({ msg: contextMenu.msg, x: contextMenu.x, y: contextMenu.y - 60 }), 100); }}><span></span> Reaccionar</button>
                            <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                onClick={() => { setPinnedMessage(contextMenu.msg); setContextMenu(null); }}><span></span> {pinnedMessage?.id === contextMenu.msg.id ? 'Ya está fijado' : 'Fijar mensaje'}</button>
                        </div>
                    )}
                    <div className="px-3 py-2 bg-[#f0f2f5] flex-shrink-0">
                        {replyToMessage && (
                            <div className="mb-2 p-2 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-600 font-medium">Respondiendo a {replyToMessage.isOwn ? 'ti mismo' : replyToMessage.senderName?.split(' ')[0] || 'alguien'}</p>
                                    <p className="text-sm text-gray-800 truncate">{replyToMessage.content}</p>
                                </div>
                                <button onClick={() => setReplyToMessage(null)} className="ml-2 text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={replyToMessage ? "Escribe una respuesta..." : "Escribe un mensaje..."}
                                className="flex-1 px-4 py-2.5 bg-white rounded-full text-sm focus:outline-none shadow-sm" />
                            <button onClick={handleSendMessage} disabled={!newMessage.trim() || sendMessage.isPending}
                                className="w-10 h-10 rounded-full bg-[#128c7e] text-white flex items-center justify-center hover:bg-green-600 transition-colors disabled:opacity-50 shadow-sm flex-shrink-0">
                                <IC.Send /></button>
                        </div>
                    </div>
                </div>
            );
        }
        if (activeTab === 'estados' && selectedStatusId) {
            return (
                <StatusDetailPanel status={allPosts.find((post: any) => post.id === selectedStatusId) || {
                    id: selectedStatusId, user: { name: 'Usuario' }, content: 'Contenido no encontrado', createdAt: new Date().toISOString(), tags: [], likes: 0, comments: []
                }} user={user} onClose={() => setSelectedStatusId(null)} />
            );
        }
        if (activeTab === 'grupos') {
            if (selectedGroup) return <GrupoDetailPanel group={selectedGroup} user={user} onBack={() => setSelectedGroup(null)} />;
            if (gruposSection === 'crear') return (
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {isMobile && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-green-600">
                            <button onClick={() => setGruposSection('mis-grupos')} className="text-white/70 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5 fill-current" /></button>
                            <span className="text-white font-semibold text-sm">Crear Grupo</span>
                        </div>
                    )}
                    <NewGroupModal onClose={() => setGruposSection('mis-grupos')} />
                </div>
            );
            if (gruposSection === 'descubrir') return (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {isMobile && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-green-600">
                            <button onClick={() => setGruposSection('mis-grupos')} className="text-white/70 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5 fill-current" /></button>
                            <span className="text-white font-semibold text-sm">Descubrir Grupos</span>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto"><DiscoverGroupsView user={user} onGroupSelect={(group: any) => setSelectedGroup(group)} /></div>
                </div>
            );
            return (
                <div className="flex-1 flex flex-col overflow-hidden">
                    {isMobile && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-green-600">
                            <button onClick={() => { setGruposSection('mis-grupos'); setSelectedGroup(null); }} className="text-white/70 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5 fill-current" /></button>
                            <span className="text-white font-semibold text-sm">Mis Grupos</span>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto"><GruposMisGruposView user={user} onGroupSelect={(group: any) => setSelectedGroup(group)} /></div>
                </div>
            );
        }
        // Default/empty view
        return (
            <div className="flex-1 flex items-center justify-center" data-msg-bg="true"
                style={{ backgroundColor: '#e5ddd5', backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`, backgroundSize: '24px 24px' }}>
                <div className="text-center px-6 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mb-6 shadow-2xl">
                        <span className="text-white font-bold text-3xl">{activeTab === 'chats' ? 'T' : 'E'}</span>
                    </div>
                    <h2 className="text-gray-800 dark:text-white text-2xl font-light mb-2">{activeTab === 'chats' ? 'Tiyuy Mensajes' : 'Estados'}</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm text-center max-w-xs leading-relaxed mb-6">
                        {activeTab === 'chats' ? 'Selecciona un chat para comenzar a conversar con clientes' : 'Comparte tu estado con otros profesionales'}
                    </p>
                </div>
            </div>
        );
    };

    // ============ Render de canales en el panel derecho ============
    const renderChannelsView = () => {
        if (selectedChannel) {
            return (
                <div className={`flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden ${isMobile ? 'w-full' : ''}`}>
                    <div className="flex-none flex items-center gap-3 px-4 py-3 bg-green-600 border-b border-[#054d44]">
                        <button onClick={() => setSelectedChannel(null)} className="text-white/70 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5 fill-current" /></button>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm">{selectedChannel.name}</p>
                            <p className="text-white/60 text-xs">{selectedChannel.subscriberCount?.toLocaleString('es-PE') || 0} suscriptores</p>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-row overflow-hidden">
                        <div className="flex-1 overflow-y-auto">
                            <ChannelPostsPanel channelId={selectedChannel.id} channelName={selectedChannel.name}
                                currentUserId={user?.id || 0} currentUser={user}
                                isChannelAdmin={selectedChannel.adminId === user?.id || selectedChannel.isAdmin}
                                onCreatePost={() => {}} onCreateEvent={() => {}} />
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
                {isMobile && channelsSection !== 'mis-canales-creados' && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-green-600 flex-shrink-0">
                        <button onClick={() => setChannelsSection('mis-canales-creados')} className="text-white/70 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5 fill-current" /></button>
                        <span className="text-white font-semibold text-sm">
                            {channelsSection === 'descubrir-canales' ? 'Descubrir Canales' : 
                             channelsSection === 'crear-canal' ? 'Crear Canal' :
                             channelsSection === 'mis-canales-suscritos' ? 'Mis Canales Suscritos' : 'Canales'}
                        </span>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto">
                    {channelsSection === 'mis-canales-creados' && <MisCanalesCreadosView user={user} onChannelSelect={setSelectedChannel} />}
                    {channelsSection === 'mis-canales-suscritos' && <MisCanalesSuscritosView user={user} onChannelSelect={setSelectedChannel} />}
                    {channelsSection === 'descubrir-canales' && <DiscoverChannelsView user={user} onChannelSelect={setSelectedChannel} />}
                    {channelsSection === 'crear-canal' && <CreateChannelView user={user} onBack={() => setChannelsSection('mis-canales-creados')} />}
                </div>
            </div>
        );
    };

    return (
        <div className={`flex ${isMobile ? 'h-[calc(100vh-64px)] pb-14' : 'h-[calc(100vh-64px)]'} bg-[#efebe2] dark:bg-gray-900 overflow-hidden`}>
            {!isAuthenticated && (
                <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                        <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><MessageSquare className="w-7 h-7 fill-white" /></div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Inicia sesión para chatear</h2>
                        <a href="/login" className="block w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity mb-3">Iniciar sesión</a>
                        <a href="/" className="block text-gray-400 text-sm hover:text-gray-600">Volver</a>
                    </div>
                </div>
            )}

            {/* Sidebar iconos */}
            <div className="hidden md:flex w-[76px] bg-white dark:bg-gray-800 flex-col items-center py-3 gap-1 flex-shrink-0">
                <div className="w-10 h-10 mb-6 rounded-full bg-green-600 flex items-center justify-center shadow-lg"><span className="text-white font-bold text-sm">T</span></div>
                {NAV.map(({ key, Icon, label, badge }) => (
                    <button key={key} onClick={() => setActiveTab(key)} title={label}
                        className={`relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group ${activeTab === key ? 'bg-[#e9edef] dark:bg-gray-600' : 'hover:bg-[#f0f2f5] dark:hover:bg-gray-700'}`}>
                        <Icon a={activeTab === key} />
                        <span className={`text-[9px] font-medium transition-all ${activeTab === key ? 'text-[#111b21] dark:text-white' : 'text-[#667781] dark:text-gray-400'}`}>{label}</span>
                        {badge ? <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-[#25d366] rounded-full flex items-center justify-center text-white text-[9px] font-bold px-1">{badge > 99 ? '99+' : badge}</span> : null}
                    </button>
                ))}
                <div className="mt-auto"><Avatar name={user?.firstName ?? 'U'} role={user?.role} size="sm" src={user?.avatar ?? undefined} /></div>
            </div>

            {/* Contenedor principal */}
            <div className="flex-1 flex overflow-hidden">
                {/* Panel izquierdo */}
                <div className={`flex-initial w-[350px] md:w-[350px] flex flex-col bg-white dark:bg-gray-800 border-r border-[#e9edef] dark:border-gray-700 overflow-hidden ${isMobile && hasSelection ? 'hidden' : 'flex'} ${isMobile ? 'w-full' : ''}`}>
                    <div className="bg-green-600 px-4 py-3 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-white font-bold text-base leading-tight">
                                    {activeTab === 'chats' && 'Mis Contactos'}
                                    {activeTab === 'estados' && 'Estados'}
                                    {activeTab === 'canales' && 'Canales'}
                                    {activeTab === 'grupos' && 'Grupos'}
                                </h1>
                                <p className="text-white/80 text-xs">Mensajería inmobiliaria</p>
                            </div>
                            {activeTab === 'estados' && (
                                <button onClick={() => setShowNewStatus(true)} className="bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-full transition-colors font-medium">+ Estado</button>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden bg-white">
                        {activeTab === 'chats' && <ChatsPanel user={user} selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} />}
                        {activeTab === 'estados' && <EstadosPanel user={user} onNewStatus={() => setShowNewStatus(true)} onStatusSelect={setSelectedStatusId} selectedStatusId={selectedStatusId} />}
                        {activeTab === 'canales' && <CanalesListPanel user={user} onChannelSelect={setSelectedChannel} activeSection={channelsSection} onSectionChange={setChannelsSection} />}
                        {activeTab === 'grupos' && (
                            <GruposListPanel user={user} onGroupSelect={(group) => { setSelectedGroup(group); }}
                                activeSection={gruposSection} onSectionChange={(s) => { setGruposSection(s); setSelectedGroup(null); }} />
                        )}
                    </div>
                </div>

                {/* Panel derecho - unificado */}
                <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? (hasSelection ? 'w-full flex' : 'hidden') : ''}`}>
                    {activeTab === 'canales' ? renderChannelsView() : renderChatView()}
                </div>
            </div>

            {/* Mobile bottom navigation */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around px-2 py-1 safe-area-bottom">
                    {NAV.map(({ key, Icon, label, badge }) => (
                        <button key={key} onClick={() => { setActiveTab(key); setSelectedChatId(null); setSelectedStatusId(null); setSelectedGroup(null); setSelectedChannel(null); }}
                            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${activeTab === key ? 'text-green-600' : 'text-gray-500'}`}>
                            <div className="relative">
                                <Icon a={activeTab === key} />
                                {badge ? <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 bg-[#25d366] rounded-full flex items-center justify-center text-white text-[8px] font-bold px-0.5">{badge > 99 ? '99+' : badge}</span> : null}
                            </div>
                            <span className={`text-[9px] mt-0.5 font-medium ${activeTab === key ? 'text-green-600' : 'text-gray-500'}`}>{label}</span>
                        </button>
                    ))}
                </div>
            )}

            {showNewStatus && <NewStatusModal onClose={() => setShowNewStatus(false)} userRole={user?.role} />}
        </div>
    );
}