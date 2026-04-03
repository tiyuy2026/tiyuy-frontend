'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  useReceivedContacts,
  useSentContacts,
  useMarkAsRead,
  useGetChats,
  useGetChatMessages,
  useSendMessage,
  useMarkChatAsRead,
  useToggleFavoriteChat,
  useGetActiveStatusPosts,
  useCreateStatusPost,
  useShareStatusPost,
  useGetChannels,
  useSubscribeToChannel,
  useUnsubscribeFromChannel,
  useGetGroups,
  useCreateGroup,
  useJoinGroup,
  useLeaveGroup,
} from '@/presentation/hooks/useContacts';
import { useAuthStore } from '@/presentation/store/authStore';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type MainTab = 'chats' | 'estados' | 'canales' | 'grupos';
type ChatFilter = 'all' | 'unread' | 'favorites';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
}

function timeLeft(expiresAt: Date | string): string {
  const d = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return 'Expirado';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function expiresPercent(createdAt: Date | string, expiresAt: Date | string): number {
  const c = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const e = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const total = e.getTime() - c.getTime();
  const elapsed = Date.now() - c.getTime();
  return Math.min(100, Math.round((elapsed / total) * 100));
}

const ROLE_LABEL: Record<string, string> = {
  USER: 'Propietario',
  AGENT: 'Agente',
  DEVELOPER: 'Desarrollador',
  ADMIN: 'Admin',
};

const ROLE_COLOR: Record<string, string> = {
  USER: 'from-blue-500 to-blue-700',
  AGENT: 'from-teal-500 to-teal-700',
  DEVELOPER: 'from-purple-500 to-purple-700',
  ADMIN: 'from-slate-500 to-slate-700',
};

const ROLE_BADGE: Record<string, string> = {
  USER: 'bg-blue-100 text-blue-700',
  AGENT: 'bg-teal-100 text-teal-700',
  DEVELOPER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-slate-100 text-slate-700',
};

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({
  name, role, size = 'md', src,
}: {
  name: string; role?: string; size?: 'xs' | 'sm' | 'md' | 'lg'; src?: string;
}) {
  const sizes = { xs: 'w-7 h-7 text-[10px]', sm: 'w-9 h-9 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const color = ROLE_COLOR[role ?? 'USER'] ?? 'from-slate-500 to-slate-700';
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-semibold flex-shrink-0 select-none`}>
      {(name ?? '?').charAt(0).toUpperCase()}
    </div>
  );
}

// ─── ICONOS SVG ELEGANTES ─────────────────────────────────────────────────────
const IC = {
  Chat: (p: { a?: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-[22px] h-[22px] transition-all ${p.a ? 'fill-white' : 'fill-white/55'}`}>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    </svg>
  ),
  Status: (p: { a?: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-[22px] h-[22px] transition-all ${p.a ? 'fill-white' : 'fill-white/55'}`}>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-4l6-4-6-4v8z"/>
    </svg>
  ),
  Channel: (p: { a?: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-[22px] h-[22px] transition-all ${p.a ? 'fill-white' : 'fill-white/55'}`}>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.5c1.93 0 3.5 1.57 3.5 3.5S13.93 13.5 12 13.5 8.5 11.93 8.5 10s1.57-3.5 3.5-3.5zM20 18H4v-.57c0-2 4-3.08 8-3.08s8 1.08 8 3.08V18z"/>
    </svg>
  ),
  Groups: (p: { a?: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-[22px] h-[22px] transition-all ${p.a ? 'fill-white' : 'fill-white/55'}`}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-400">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 16 15" className="w-4 h-3 inline ml-1" style={{ fill: '#53bdeb' }}>
      <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>
  ),
  Share: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-red-400">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  ),
  Emoji: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-400">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
    </svg>
  ),
  Attach: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-400">
      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
    </svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-400">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>
  ),
  ArrowBack: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-500">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  ),
};

// ─── FONDO TIPO WHATSAPP ──────────────────────────────────────────────────────
function ChatBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-y-auto relative" style={{
      backgroundColor: '#e5ddd5',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M0 0h80v80H0z' fill='%23e5ddd5'/%3E%3Cpath d='M40 0v80M0 40h80' stroke='%23d4c9bf' stroke-width='0.5' opacity='0.4'/%3E%3C/svg%3E")` 
    }}>
      <div className="px-4 py-3 space-y-1">{children}</div>
    </div>
  );
}

// ─── SHARE MODAL ──────────────────────────────────────────────────────────────
function ShareModal({ title, link, onClose }: { title: string; link: string; onClose: () => void }) {
  const encoded = encodeURIComponent(`${title} - Únete en Tiyuy: ${link}`);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-base">Compartir</h3>
            <button onClick={onClose} className="text-white/70 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg leading-none">✕</button>
          </div>
          <p className="text-white/70 text-xs mt-1 truncate">{title}</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <span className="text-xs text-gray-500 truncate flex-1 font-mono">{link}</span>
            <button onClick={copy}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex-shrink-0 ${copied ? 'bg-green-500 text-white' : 'bg-teal-500 text-white hover:bg-teal-600'}`}>
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <span className="text-xs text-green-700 font-medium">WhatsApp</span>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <span className="text-xs text-blue-700 font-medium">Facebook</span>
            </a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encoded}`} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors">
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </div>
              <span className="text-xs text-sky-700 font-medium">Telegram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL NUEVO ESTADO ───────────────────────────────────────────────────────
function NewStatusModal({ onClose, userRole }: { onClose: () => void; userRole?: string }) {
  const [message, setMessage] = useState('');
  const [zone, setZone] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [isPromoted, setIsPromoted] = useState(false);
  const createStatus = useCreateStatusPost();

  const handleSubmit = async () => {
    if (!message.trim() || !zone.trim()) return;
    await createStatus.mutateAsync({
      content: message,
      location: zone,
      propertyType,
      isPromoted,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Nuevo Estado</h2>
              <p className="text-white/70 text-xs mt-0.5">Visible para la comunidad Tiyuy por 48 horas</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-xl leading-none">✕</button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Zona / Distrito</label>
              <input value={zone} onChange={e => setZone(e.target.value)}
                placeholder="Ej: Lince, Miraflores..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo de propiedad</label>
              <select value={propertyType} onChange={e => setPropertyType(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all bg-white">
                <option value="">Seleccionar...</option>
                <option>Cuarto</option>
                <option>Departamento</option>
                <option>Casa</option>
                <option>Oficina</option>
                <option>Local Comercial</option>
                <option>Terreno</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Mensaje</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              rows={4} maxLength={280}
              placeholder={userRole === 'USER'
                ? 'Ej: Busco cuarto en Lince para 2 personas, presupuesto S/700...'
                : 'Ej: Ofrezco departamento en San Isidro, 2 dorm, S/1500/mes...'}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none transition-all" />
            <div className="text-right text-xs text-gray-400 mt-1">{message.length}/280</div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-amber-500 text-lg">⏳</span>
            <p className="text-xs text-amber-700 flex-1">Este estado expirará en <strong>48 horas</strong> automáticamente</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={!message.trim() || !zone.trim() || createStatus.isPending}
              className="flex-1 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
              {createStatus.isPending ? 'Publicando...' : 'Publicar Estado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL CREAR GRUPO ────────────────────────────────────────────────────────
function NewGroupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);
  const createGroup = useCreateGroup();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await createGroup.mutateAsync({ name, description, isRestrictedByEmail: isRestricted });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Crear Grupo</h2>
              <p className="text-white/70 text-xs mt-0.5">Solo puedes crear 1 grupo en Tiyuy</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-xl leading-none">✕</button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre del grupo</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Ej: Alquiler Miraflores, Venta Casas Lima Norte..."
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="¿De qué trata este grupo?"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none transition-all" />
          </div>
          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Restringir por correo</p>
              <p className="text-xs text-gray-400 mt-0.5">Solo emails aprobados pueden unirse</p>
            </div>
            <button onClick={() => setIsRestricted(!isRestricted)}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isRestricted ? 'bg-teal-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isRestricted ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <span className="text-blue-500">ℹ️</span>
            <p className="text-xs text-blue-700">Podrás compartir el link del grupo en Facebook, WhatsApp y otras redes para atraer miembros</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={!name.trim() || createGroup.isPending}
              className="flex-1 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
              {createGroup.isPending ? 'Creando...' : 'Crear Grupo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PANEL CHATS ──────────────────────────────────────────────────────────────
function ChatsPanel({ user }: { user: any }) {
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chats, isLoading: loadingChats, error: chatsError } = useGetChats(filter);
  const { data: messages, isLoading: loadingMessages } = useGetChatMessages(selectedChatId!, { enabled: !!selectedChatId });
  const sendMessage = useSendMessage();
  const markAsRead = useMarkChatAsRead();
  const toggleFavorite = useToggleFavoriteChat();

  const selectedChat = chats?.find((c: any) => c.id === selectedChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedChatId) markAsRead.mutate(selectedChatId);
  }, [selectedChatId]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChatId) return;
    sendMessage.mutate({ chatId: selectedChatId, content: newMessage, type: 'TEXT' });
    setNewMessage('');
  };

  const filters: { key: ChatFilter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'unread', label: 'No leídos' },
    { key: 'favorites', label: 'Favoritos' },
  ];

  // Vista conversación
  if (selectedChatId && selectedChat) {
    return (
      <div className="flex flex-col h-full">
        {/* Header conversación */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#075e54] border-b border-[#054d44]">
          <button onClick={() => setSelectedChatId(null)}
            className="text-white/70 hover:text-white transition-colors">
            <IC.ArrowBack />
          </button>
          <Avatar name={selectedChat.participantName ?? 'U'} role="USER" size="md" src={selectedChat.participantAvatar} />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{selectedChat.participantName}</p>
            <p className="text-white/60 text-xs truncate">{selectedChat.participantEmail}</p>
          </div>
          <button onClick={() => toggleFavorite.mutate(selectedChatId)}
            className={`text-sm ${selectedChat.isFavorite ? 'text-yellow-400' : 'text-white/40 hover:text-white/70'} transition-colors`}>
            ★
          </button>
        </div>

        {/* Mensajes */}
        <ChatBackground>
          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
            </div>
          ) : messages?.content?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm bg-white/80 px-4 py-2 rounded-full inline-block">
                No hay mensajes aún. ¡Inicia la conversación!
              </p>
            </div>
          ) : (
            messages?.content?.map((msg: any) => {
              const isOwn = msg.isOwn;
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${
                    isOwn
                      ? 'bg-[#dcf8c6] rounded-tr-sm'
                      : 'bg-white rounded-tl-sm'
                  }`}>
                    {!isOwn && (
                      <p className="text-xs font-semibold text-teal-600 mb-0.5">{msg.senderName}</p>
                    )}
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOwn && <IC.Check />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </ChatBackground>

        {/* Input mensaje */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#f0f0f0] border-t border-gray-200">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors flex-shrink-0">
            <IC.Emoji />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors flex-shrink-0">
            <IC.Attach />
          </button>
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Escribe un mensaje"
            className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none shadow-sm border border-gray-100"
          />
          <button
            onClick={newMessage.trim() ? handleSend : undefined}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              newMessage.trim()
                ? 'bg-gradient-to-br from-blue-600 to-teal-500 shadow-md hover:opacity-90'
                : 'bg-gray-300'
            }`}>
            {newMessage.trim() ? <IC.Send /> : <IC.Mic />}
          </button>
        </div>
      </div>
    );
  }

  // Lista chats
  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
          <IC.Search />
          <input placeholder="Buscar un chat o iniciar uno nuevo"
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 flex-1 focus:outline-none" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-3 py-2 bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-[#075e54] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loadingChats ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          </div>
        ) : chatsError ? (
          <div className="text-center py-16 px-6">
            <p className="text-red-400 text-sm font-medium">Error al cargar los chats</p>
            <p className="text-gray-400 text-xs mt-1">Verifica tu conexión e intenta de nuevo</p>
          </div>
        ) : !chats?.length ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <IC.Chat />
            </div>
            <p className="text-gray-600 text-sm font-medium">No tienes conversaciones aún</p>
            <p className="text-gray-400 text-xs mt-1">Los clientes que te contacten aparecerán aquí</p>
          </div>
        ) : (
          chats.map((chat: any) => (
            <div key={chat.id} onClick={() => setSelectedChatId(chat.id)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors ${selectedChatId === chat.id ? 'bg-[#f0f2f5]' : ''}`}>
              <div className="relative">
                <Avatar name={chat.participantName ?? chat.groupName ?? 'U'} role="USER" size="md" src={chat.participantAvatar} />
                {chat.type === 'GROUP' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {chat.type === 'GROUP' ? chat.groupName : chat.participantName}
                  </span>
                  <span className={`text-[11px] flex-shrink-0 ml-2 ${chat.unreadCount > 0 ? 'text-[#25d366] font-medium' : 'text-gray-400'}`}>
                    {chat.lastMessageAt ? timeAgo(new Date(chat.lastMessageAt)) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessagePreview ?? 'Sin mensajes'}</p>
                  {chat.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-[#25d366] rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ml-2">
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </span>
                  )}
                  {chat.isFavorite && !chat.unreadCount && (
                    <span className="text-yellow-400 text-xs ml-2">★</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── PANEL ESTADOS ────────────────────────────────────────────────────────────
function EstadosPanel({ user, onNewStatus }: { user: any; onNewStatus: () => void }) {
  const [shareTarget, setShareTarget] = useState<{ title: string; link: string } | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const shareStatus = useShareStatusPost();

  const { data: statusData, isLoading, fetchNextPage, hasNextPage } = useGetActiveStatusPosts({
    location: locationFilter || undefined,
  });

  const allPosts = statusData?.pages?.flatMap((p: any) => p.content) ?? [];

  const handleShare = async (postId: number, postTitle: string) => {
    const result = await shareStatus.mutateAsync(postId);
    setShareTarget({ title: postTitle, link: result.shareUrl });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Estados · 48h</h2>
        <button onClick={onNewStatus}
          className="text-xs bg-gradient-to-r from-blue-600 to-teal-500 text-white px-4 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity shadow-sm">
          + Publicar
        </button>
      </div>

      {/* Filtro ubicación */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
          <IC.Search />
          <input
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            placeholder="Filtrar por zona o distrito..."
            className="bg-transparent text-xs text-gray-700 placeholder-gray-400 flex-1 focus:outline-none"
          />
        </div>
      </div>

      {/* Mi estado */}
      <div onClick={onNewStatus}
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
        <div className="relative">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-blue-600 to-teal-500">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <Avatar name={user?.firstName ?? 'U'} role={user?.role} size="md" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-white text-xs font-bold leading-none">+</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Mi estado</p>
          <p className="text-xs text-gray-400">Toca para publicar · dura 48 horas</p>
        </div>
      </div>

      {/* Sección recientes */}
      {!isLoading && allPosts.length > 0 && (
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recientes</p>
        </div>
      )}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          </div>
        ) : allPosts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <p className="text-gray-500 text-sm font-medium">No hay estados activos</p>
            <p className="text-gray-400 text-xs mt-1">Sé el primero en publicar una búsqueda</p>
          </div>
        ) : (
          <>
            {allPosts.map((post: any) => {
              const percent = expiresPercent(new Date(post.createdAt), new Date(post.expiresAt));
              const isUrgent = percent >= 75;
              const badge = ROLE_BADGE[post.userRole] ?? 'bg-gray-100 text-gray-600';
              const roleLabel = ROLE_LABEL[post.userRole] ?? 'Usuario';
              return (
                <div key={post.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors cursor-pointer">
                  {/* Avatar con anillo SVG de tiempo */}
                  <div className="relative flex-shrink-0 w-12 h-12">
                    <svg className="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="22" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                      <circle cx="24" cy="24" r="22" fill="none"
                        stroke={isUrgent ? '#f87171' : 'url(#grad)'}
                        strokeWidth="2.5"
                        strokeDasharray={`${(1 - percent / 100) * 138.2} 138.2`}
                        strokeLinecap="round" />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#2563eb" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-1.5">
                      <Avatar name={post.userName ?? 'U'} role={post.userRole} size="md" src={post.userAvatar} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{post.userName}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge}`}>{roleLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <span className={`text-[10px] font-medium ${isUrgent ? 'text-red-400' : 'text-gray-400'}`}>
                          {isUrgent ? '⚠ ' : ''}{timeLeft(new Date(post.expiresAt))}
                        </span>
                        <button onClick={() => handleShare(post.id, `${post.userName} - ${post.location}`)}
                          className="text-gray-400 hover:text-teal-600 transition-colors">
                          <IC.Share />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {post.location && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                          📍 {post.location}
                        </span>
                      )}
                      {post.propertyType && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-medium">
                          🏠 {post.propertyType}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 ml-auto">{post.viewCount} vistas</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {hasNextPage && (
              <div className="flex justify-center py-4">
                <button onClick={() => fetchNextPage()}
                  className="text-xs text-teal-600 font-medium hover:underline">
                  Cargar más estados
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {shareTarget && (
        <ShareModal title={shareTarget.title} link={shareTarget.link} onClose={() => setShareTarget(null)} />
      )}
    </div>
  );
}

// ─── PANEL CANALES ────────────────────────────────────────────────────────────
function CanalesPanel({ user }: { user: any }) {
  const [shareTarget, setShareTarget] = useState<{ title: string; link: string } | null>(null);
  const { data: channels, isLoading } = useGetChannels(user?.id);
  const subscribe = useSubscribeToChannel();
  const unsubscribe = useUnsubscribeFromChannel();

  const handleToggle = (channel: any) => {
    if (channel.isSubscribed) {
      unsubscribe.mutate(channel.id);
    } else {
      subscribe.mutate(channel.id);
    }
  };

  const cityEmojis: Record<string, string> = {
    Lima: '🏙', Arequipa: '🌋', Trujillo: '🏺', Piura: '☀️', Chiclayo: '🌿', Cusco: '🏔',
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Canales Tiyuy</h2>
        <p className="text-xs text-gray-400 mt-0.5">Canales oficiales por ciudad</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          </div>
        ) : !channels?.length ? (
          <div className="text-center py-16 px-6">
            <p className="text-gray-500 text-sm">No hay canales disponibles</p>
          </div>
        ) : (
          channels.map((channel: any) => (
            <div key={channel.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                {cityEmojis[channel.city] ?? '🏘'}
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
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all disabled:opacity-50 ${
                    channel.isSubscribed
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:opacity-90 shadow-sm'
                  }`}>
                  {channel.isSubscribed ? '✓ Suscrito' : 'Suscribirse'}
                </button>
                <button
                  onClick={() => setShareTarget({ title: `Canal ${channel.city} en Tiyuy`, link: `https://tiyuy.com/canales/${channel.shareLink}` })}
                  className="text-[10px] text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-1">
                  <IC.Share /> Compartir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {shareTarget && (
        <ShareModal title={shareTarget.title} link={shareTarget.link} onClose={() => setShareTarget(null)} />
      )}
    </div>
  );
}

// ─── PANEL GRUPOS ─────────────────────────────────────────────────────────────
function GruposPanel({ user }: { user: any }) {
  const [shareTarget, setShareTarget] = useState<{ title: string; link: string } | null>(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const { data: groups, isLoading } = useGetGroups();
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  const userHasGroup = groups?.some((g: any) => g.adminEmail === user?.email);

  const handleToggle = (group: any) => {
    if (group.isMember) {
      leaveGroup.mutate(group.id);
    } else {
      joinGroup.mutate(group.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h2 className="font-semibold text-gray-800">Grupos Tiyuy</h2>
          <p className="text-xs text-gray-400 mt-0.5">Comunidades inmobiliarias</p>
        </div>
        {!userHasGroup && (
          <button onClick={() => setShowNewGroup(true)}
            className="text-xs bg-gradient-to-r from-blue-600 to-teal-500 text-white px-4 py-1.5 rounded-full font-medium hover:opacity-90 shadow-sm">
            + Crear
          </button>
        )}
      </div>

      {userHasGroup && (
        <div className="mx-4 mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-700">
            <strong>Ya tienes un grupo creado.</strong> Solo se permite 1 grupo por usuario.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto mt-1">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          </div>
        ) : !groups?.length ? (
          <div className="text-center py-16 px-6">
            <p className="text-gray-500 text-sm font-medium">No hay grupos disponibles</p>
            <p className="text-gray-400 text-xs mt-1">¡Crea el primero para tu zona!</p>
          </div>
        ) : (
          groups.map((group: any) => (
            <div key={group.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center text-2xl flex-shrink-0 border border-gray-100 shadow-sm">
                {group.avatar ?? '🏘'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-semibold text-gray-900 truncate">{group.name}</span>
                  {group.isRestrictedByEmail && <IC.Lock />}
                </div>
                <p className="text-xs text-gray-500 truncate">{group.lastMessage ?? group.description}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{group.memberCount} miembros · {group.lastTime}</p>
              </div>
              <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                <button onClick={() => handleToggle(group)}
                  disabled={joinGroup.isPending || leaveGroup.isPending}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all disabled:opacity-50 ${
                    group.isMember
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : group.isRestrictedByEmail
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        : 'bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:opacity-90 shadow-sm'
                  }`}>
                  {group.isMember ? '✓ Unido' : group.isRestrictedByEmail ? '🔒 Solicitar' : 'Unirse'}
                </button>
                <button
                  onClick={() => setShareTarget({ title: group.name, link: `https://tiyuy.com/grupos/${group.shareLink}` })}
                  className="text-[10px] text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-1">
                  <IC.Share /> Compartir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showNewGroup && <NewGroupModal onClose={() => setShowNewGroup(false)} />}
      {shareTarget && (
        <ShareModal title={shareTarget.title} link={shareTarget.link} onClose={() => setShareTarget(null)} />
      )}
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function MisContactosPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('chats');
  const [showNewStatus, setShowNewStatus] = useState(false);
  const { user } = useAuthStore();

  const { data: chatsData } = useGetChats('unread');
  const unreadCount = chatsData?.reduce((acc: number, c: any) => acc + (c.unreadCount ?? 0), 0) ?? 0;

  const NAV = [
    { key: 'chats'   as MainTab, Icon: IC.Chat,    label: 'Chats',    badge: unreadCount },
    { key: 'estados' as MainTab, Icon: IC.Status,  label: 'Estados' },
    { key: 'canales' as MainTab, Icon: IC.Channel, label: 'Canales' },
    { key: 'grupos'  as MainTab, Icon: IC.Groups,  label: 'Grupos' },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#111b21] overflow-hidden">

      {/* ── Sidebar iconos estilo WhatsApp ── */}
      <div className="w-[70px] bg-[#202c33] flex flex-col items-center py-4 gap-1 flex-shrink-0">
        {/* Logo Tiyuy */}
        <div className="w-10 h-10 mb-6 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">T</span>
        </div>

        {NAV.map(({ key, Icon, label, badge }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            title={label}
            className={`relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group ${
              activeTab === key ? 'bg-[#2a3942]' : 'hover:bg-[#2a3942]/60'
            }`}>
            <Icon a={activeTab === key} />
            <span className={`text-[9px] font-medium transition-all ${activeTab === key ? 'text-white' : 'text-white/40'}`}>
              {label}
            </span>
            {badge ? (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-[#25d366] rounded-full flex items-center justify-center text-white text-[9px] font-bold px-1">
                {badge > 99 ? '99+' : badge}
              </span>
            ) : null}
          </button>
        ))}

        {/* Avatar usuario al fondo */}
        <div className="mt-auto">
          <Avatar name={user?.firstName ?? 'U'} role={user?.role} size="sm" src={user?.avatar} />
        </div>
      </div>

      {/* ── Panel lista izquierdo ── */}
      <div className="w-[380px] flex flex-col bg-[#111b21] border-r border-[#2a3942] flex-shrink-0 overflow-hidden">
        {/* Header del panel con gradiente Tiyuy */}
        <div className="bg-gradient-to-r from-blue-700 to-teal-600 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-base leading-tight">
                {activeTab === 'chats'   && 'Mis Contactos'}
                {activeTab === 'estados' && 'Estados · 48h'}
                {activeTab === 'canales' && 'Canales Tiyuy'}
                {activeTab === 'grupos'  && 'Grupos Tiyuy'}
              </h1>
              <p className="text-white/60 text-[11px] mt-0.5">
                {user?.firstName} {user?.lastName} · {ROLE_LABEL[user?.role ?? ''] ?? 'Usuario'}
              </p>
            </div>
            {activeTab === 'estados' && (
              <button onClick={() => setShowNewStatus(true)}
                className="bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-full transition-colors font-medium">
                + Estado
              </button>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden bg-white">
          {activeTab === 'chats'   && <ChatsPanel user={user} />}
          {activeTab === 'estados' && <EstadosPanel user={user} onNewStatus={() => setShowNewStatus(true)} />}
          {activeTab === 'canales' && <CanalesPanel user={user} />}
          {activeTab === 'grupos'  && <GruposPanel user={user} />}
        </div>
      </div>

      {/* ── Panel derecho — conversación ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Pantalla de bienvenida cuando no hay chat seleccionado */}
        <div className="flex-1 flex flex-col items-center justify-center"
          style={{
            backgroundColor: '#222e35',
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center mb-6 shadow-2xl">
            <span className="text-white font-bold text-3xl">T</span>
          </div>
          <h2 className="text-white/90 text-2xl font-light mb-2">Tiyuy Mensajes</h2>
          <p className="text-white/40 text-sm text-center max-w-xs leading-relaxed">
            Selecciona un chat para comenzar a conversar con clientes, o explora canales y grupos inmobiliarios
          </p>
          <div className="mt-8 flex items-center gap-2 text-white/20 text-xs">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            Tus mensajes están cifrados de extremo a extremo
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewStatus && (
        <NewStatusModal onClose={() => setShowNewStatus(false)} userRole={user?.role} />
      )}
    </div>
  );
}
