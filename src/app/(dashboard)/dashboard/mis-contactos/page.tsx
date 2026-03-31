'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusDetailPanel from './StatusDetailPanel';
import { GrupoPostsPanel } from './grupos/components/GrupoPostsPanel';
import CanalesListPanel from './canales/components/CanalesListPanel';
import { ChannelPostsPanel } from './canales/components/ChannelPostsPanel';
import MisCanalesCreadosView from './canales/components/MisCanalesCreadosView';
import MisCanalesSuscritosView from './canales/components/MisCanalesSuscritosView';
import MisEventosView from './canales/components/MisEventosView';
import DiscoverChannelsView from './canales/components/DiscoverChannelsView';
import CreateChannelView from './canales/components/CreateChannelView';
import { formatCompactNumber } from '@/utils/formatters';
import CreateGroupView from './grupos/components/CreateGroupView';
import DiscoverGroupsView from './grupos/components/DiscoverGroupsView';
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
import MessageInput from '@/presentation/components/contacts/MessageInput';
import { toast } from '@/presentation/store/toastStore';
import StatusInput, { StatusInteractions } from '@/components/StatusInput';
import LocationAutocomplete from '@/presentation/components/LocationAutocomplete';
import { useGooglePlaces } from '@/presentation/hooks/useGooglePlaces';
import { useWebSocket, getCurrentUserId } from '@/presentation/hooks/useWebSocket';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const url = `${API_BASE_URL}${endpoint}`;
  
  let token = null;
  if (typeof window !== 'undefined') {
    // Logs de depuración para tokens
    console.log('TOKEN1:', localStorage.getItem('tiyuy-auth-token'));
    console.log('TOKEN2:', localStorage.getItem('token'));
    console.log('TOKEN3:', localStorage.getItem('auth-token'));
    
    try {
      const { useAuthStore } = require('@/presentation/store/authStore');
      const authStore = useAuthStore.getState();
      token = authStore.token;
      
      if (!token) {
        token = localStorage.getItem('tiyuy-auth-token') || 
               localStorage.getItem('token') || 
               localStorage.getItem('auth-token');
      }
    } catch {
      token = localStorage.getItem('tiyuy-auth-token') || 
             localStorage.getItem('token') || 
             localStorage.getItem('auth-token');
    }
  }
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
}

type MainTab = 'chats' | 'estados' | 'canales' | 'grupos';
type ChatFilter = 'all' | 'unread' | 'favorites';

type NavItem = {
  key: MainTab;
  Icon: (props: { a?: boolean }) => React.ReactElement;
  label: string;
  badge?: number;
};

// ──── HELPERS ────────────────────────────────────────────────────────────────
function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
}

// Formatear "última vez conectado" estilo WhatsApp
function formatLastSeen(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  // Menos de 1 minuto
  if (diff < 60) return 'ahora';
  
  // Menos de 1 hora
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `hace ${mins} minuto${mins > 1 ? 's' : ''}`;
  }
  
  // Menos de 24 horas
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  }
  
  // Menos de 7 días
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    if (days === 1) return 'ayer';
    return `hace ${days} días`;
  }
  
  // Más de 7 días - mostrar fecha
  return d.toLocaleDateString('es-PE', { 
    day: '2-digit', 
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// Formatear separador de fecha estilo WhatsApp
function formatDateSeparator(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Hoy
  if (d.toDateString() === now.toDateString()) {
    return 'Hoy';
  }
  
  // Ayer
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Ayer';
  }
  
  // Esta semana
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[d.getDay()];
  }
  
  // Fecha completa
  return d.toLocaleDateString('es-PE', { 
    day: '2-digit', 
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
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

// ──── AVATAR ────────────────────────────────────────────────────────────────
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

// ──── ICONOS SVG ELEGANTES ────────────────────────────────────────────────────────
const IC = {
  Chat: (p: { a?: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-[22px] h-[22px] transition-all ${p.a ? 'fill-[#111b21]' : 'fill-[#667781]'}`}>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    </svg>
  ),
  Status: (p: { a?: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-[22px] h-[22px] transition-all ${p.a ? 'fill-[#111b21]' : 'fill-[#667781]'}`}>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-4l6-4-6-4v8z"/>
    </svg>
  ),
  Channel: (p: { a?: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-[22px] h-[22px] transition-all ${p.a ? 'fill-[#111b21]' : 'fill-[#667781]'}`}>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 2.5c1.93 0 3.5 1.57 3.5 3.5S13.93 13.5 12 13.5 8.5 11.93 8.5 10s1.57-3.5 3.5-3.5zM20 18H4v-.57c0-2 4-3.08 8-3.08s8 1.08 8 3.08V18z"/>
    </svg>
  ),
  Groups: (p: { a?: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-[22px] h-[22px] transition-all ${p.a ? 'fill-[#111b21]' : 'fill-[#667781]'}`}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
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
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  ),
  Emoji: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-400">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-4l6-4-6-4v8z"/>
    </svg>
  ),
  Attach: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-400">
      <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
    </svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-400">
      <path d="M12 14c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>
  ),
  ArrowBack: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-500">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  ),
};

// ──── FONDO TIPO WHATSAPP ────────────────────────────────────────────────────────
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

// ──── SHARE MODAL ────────────────────────────────────────────────────────────────
function ShareModal({ title, link, onClose }: { title: string; link: string; onClose: () => void }) {
  const encoded = encodeURIComponent(`${title} - únete en Tiyuy: ${link}`);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-base">Compartir</h3>
            <button onClick={onClose} className="text-white/70 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg leading-none">×</button>
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

// ──── MODAL NUEVO ESTADO ──────────────────────────────────────────────────────────
function NewStatusModal({ onClose, userRole }: { onClose: () => void; userRole?: string }) {
  const createStatus = useCreateStatusPost();

  const handleSendStatus = (content: string, textStyle?: string, customColor?: string, location?: string, propertyType?: string) => {
    createStatus.mutate({
      content,
      location: location || undefined,
      propertyType: propertyType || undefined,
      isPromoted: false
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Crear nuevo estado</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <StatusInput
            onSendStatus={handleSendStatus}
            placeholder="¿Qué estás pensando?"
            disabled={createStatus.isPending}
            maxLength={500}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ──── MODAL CREAR GRUPO ──────────────────────────────────────────────────────────
function NewGroupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);
  const createGroup = useCreateGroup();
  const { data: groups } = useGetGroups(0, 50);
  
  // Verificar si el usuario ya tiene un grupo
  const userGroups = groups?.filter((g: any) => g.isMember && g.isOwner) ?? [];
  const hasGroup = userGroups.length > 0;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    try {
      await createGroup.mutateAsync({ name, description, isRestrictedByEmail: isRestricted });
      onClose();
    } catch (error: any) {
      // Manejar error específico de límite de grupos
      if (error?.code === 'GROUP_LIMIT_EXCEEDED') {
        // Mensaje más claro y persistente
        const message = `⚠️ LIMITE DE GRUPOS ALCANZADO\n\nYa tienes un grupo creado y no puedes crear mas.\n\nTu grupo actual: "${userGroups[0]?.name || 'Tu grupo'}"\n\nSolo puedes tener UN (1) grupo activo en Tiyuy.\n\nVe a la seccion "Mis Grupos" para gestionarlo.`;
        
        alert(message);
        onClose();
        
        // Opcional: Mostrar notificación toast adicional
        setTimeout(() => {
          alert('💡 Recuerda: Puedes encontrar tu grupo en la seccion "Tus Grupos" del menu izquierdo');
        }, 1000);
        
      } else {
        // Otros errores
        const errorMessage = error?.message || 'Error al crear el grupo';
        alert(` Error: ${errorMessage}`);
      }
    }
  };

  // Si ya tiene un grupo, mostrar mensaje diferente
  if (hasGroup) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-5">
            <div className="text-center">
              <h2 className="text-white font-bold text-lg"> LIMITE ALCANZADO</h2>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl"></span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              NO PUEDES CREAR MAS GRUPOS
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm font-medium">
                Ya alcanzaste el LIMITE de 1 grupo activo
              </p>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Tu grupo actual: <strong>"{userGroups[0]?.name}"</strong>
            </p>
            <p className="text-gray-500 text-xs mb-6">
              En Tiyuy cada usuario puede tener UNICAMENTE UN (1) grupo activo.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              ENTENDIDO - NO CREAR GRUPO
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Crear Grupo</h2>
              <p className="text-white/70 text-xs mt-0.5">Solo puedes crear 1 grupo en Tiyuy</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-xl leading-none">×</button>
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
            <span className="text-blue-500"></span>
            <p className="text-xs text-blue-700">Podrás compartir el link del grupo en WhatsApp, Telegram y otras redes para atraer miembros</p>
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

// ──── MODAL CREAR CANAL ──────────────────────────────────────────────────────────
function NewChannelModal({ onClose, userRole }: { onClose: () => void; userRole?: string }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    // TODO: Implementar lógica de creación de canal
    console.log('Creando canal:', { name, description, category });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Crear Canal</h2>
              <p className="text-white/70 text-xs mt-0.5">Comparte información con muchos seguidores</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-xl leading-none">×</button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre del canal</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Ej: Inmobiliarias Lima Centro..."
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} placeholder="¿De qué trata este canal?"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all bg-white">
              <option value="">Seleccionar...</option>
              <option>Inmobiliarias</option>
              <option>Alquileres</option>
              <option>Ventas</option>
              <option>Inversiones</option>
              <option>Noticias</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 rounded-xl p-3 border border-amber-100">
            <span className="text-amber-500"></span>
            <p className="text-xs text-amber-700">Los canales son ideales para anuncios, noticias y comunicación unidireccional</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={!name.trim()}
              className="flex-1 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
              Crear Canal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──── COMPONENTE RESULTADOS DE BÚSQUEDA ────────────────────────────────────────
function SearchResultItem({ result, onCreateChat }: { result: any; onCreateChat: (params: any) => void }) {
  const handleAction = (action: string) => {
    switch (result.type) {
      case 'property':
        const property = result.data;
        if (action === 'like') {
          onCreateChat({
            targetUserId: property.owner.id,
            propertyId: property.id,
            initialMessage: `👍 Me interesa tu propiedad: ${property.title}`,
            interactionType: 'like'
          });
        } else if (action === 'info') {
          onCreateChat({
            targetUserId: property.owner.id,
            propertyId: property.id,
            initialMessage: `👋 Me gustaría más información sobre: ${property.title}`,
            interactionType: 'info_request'
          });
        } else if (action === 'contact') {
          onCreateChat({
            targetUserId: property.owner.id,
            propertyId: property.id,
            initialMessage: `💬 Hola, estoy interesado en tu propiedad: ${property.title}`,
            interactionType: 'contact'
          });
        }
        break;
        
      case 'user':
        const user = result.data;
        onCreateChat({
          targetUserId: user.id,
          initialMessage: `Hola ${user.name}, me gustaría conversar contigo.`,
          interactionType: 'direct'
        });
        break;
    }
  };

  if (result.type === 'property') {
    const property = result.data;
    return (
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-lg">
            🏠
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{property.title}</h4>
            <p className="text-xs text-gray-600">📍 {property.city} • 💰 {property.price} {property.currency}</p>
            <p className="text-xs text-gray-500">Dueño: {property.owner.name} 📞 {property.owner.phone}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleAction('like')} className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs hover:bg-red-200">
                ❤️ Like
              </button>
              <button onClick={() => handleAction('info')} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs hover:bg-blue-200">
                ℹ️ Info
              </button>
              <button onClick={() => handleAction('contact')} className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs hover:bg-green-200">
                💬 Contactar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result.type === 'user') {
    const user = result.data;
    return (
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} role={user.role} size="md" src={user.avatar} />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h4>
            <p className="text-xs text-gray-600">{user.role} • 📞 {user.phone}</p>
            {user.properties && user.properties.length > 0 && (
              <p className="text-xs text-gray-500">{user.properties.length} propiedades</p>
            )}
          </div>
          <button onClick={() => handleAction('chat')} className="px-3 py-1 bg-teal-100 text-teal-600 rounded-full text-xs hover:bg-teal-200">
            💬 Chatear
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ──── PANEL CHATS ────────────────────────────────────────────────────────────────
function ChatsPanel({ user, selectedChatId, setSelectedChatId }: { user: any; selectedChatId: number | null; setSelectedChatId: (id: number | null) => void }) {
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'name' | 'property' | 'district' | 'phone'>('all');
  const [district, setDistrict] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showContactMenu, setShowContactMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Google Places hook
  const { searchPredictions, loading: placesLoading } = useGooglePlaces();

  const { data: chats, isLoading: loadingChats, error: chatsError } = useGetChats(filter);
  const { data: messages, isLoading: loadingMessages, error: messagesError } = useGetChatMessages(selectedChatId!, { enabled: !!selectedChatId });
  const sendMessage = useSendMessage();
  const markAsRead = useMarkChatAsRead();
  const toggleFavorite = useToggleFavoriteChat();

  // Helper para obtener ID del remitente (funciona con backend real)
  const getSenderId = (msg: any) => {
    return msg.senderId ?? 
           msg.sender?.id ?? 
           msg.userId ?? 
           msg.fromUserId ?? 
           msg.authorId ?? 
           null;
  };

  // Queries para búsqueda específica
  const { data: searchResults = [], isLoading: loadingSearch } = useQuery({
    queryKey: ['specific-search', searchTerm, searchType],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      const results: any[] = [];
      
      // Construir parámetros según el tipo de búsqueda
      let params = new URLSearchParams();
      
      switch (searchType) {
        case 'name':
          params.append('keyword', searchTerm);
          break;
        case 'property':
          params.append('keyword', searchTerm);
          break;
        case 'district':
          params.append('district', searchTerm);
          break;
        case 'phone':
          params.append('keyword', searchTerm);
          break;
        default: // 'all'
          params.append('keyword', searchTerm);
      }
      
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', 'desc');
      
      try {
        // Buscar propiedades
        const propResponse = await apiCall(`/contacts/extended/search/properties?${params}`);
        results.push(...propResponse.map((prop: any) => ({
          type: 'property',
          data: prop
        })));
      } catch (error) {
        console.error('Error searching properties:', error);
      }
      
      try {
        // Buscar usuarios
        const userResponse = await apiCall(`/contacts/extended/search/users?${params}`);
        results.push(...userResponse.map((user: any) => ({
          type: 'user',
          data: user
        })));
      } catch (error) {
        console.error('Error searching users:', error);
      }
      
      return results;
    },
    enabled: !!searchTerm
  });

  const selectedChat = chats?.find((c: any) => c.id === selectedChatId);

  // Mutation para agregar contacto
  const addContact = useMutation({
    mutationFn: async (contactId: number) => {
      const formData = new FormData();
      formData.append('contactId', contactId.toString());
      
      return apiCall('/contacts/extended/contacts', {
        method: 'POST',
        body: formData,
        headers: {} // Dejar que browser establezca Content-Type para FormData
      });
    },
    onSuccess: () => {
      toast.success('Contacto agregado exitosamente');
      // Refrescar lista de contactos si es necesario
    },
    onError: (error: any) => {
      console.error('Error al agregar contacto:', error);
      toast.error(error.message || 'Error al agregar contacto');
    }
  });
  const createChat = useMutation({
    mutationFn: async ({ targetUserId, propertyId, statusId, initialMessage, interactionType }: {
      targetUserId: number;
      propertyId?: number;
      statusId?: number;
      initialMessage: string;
      interactionType: string;
    }) => {
      return apiCall('/contacts/extended/chats', {
        method: 'POST',
        body: JSON.stringify({
          targetUserId,
          propertyId,
          statusId,
          initialMessage,
          interactionType
        })
      });
    },
    onSuccess: (response) => {
      // Actualizar la lista de chats
      window.location.reload(); // Simple refresh para actualizar los chats
    },
    onError: (error: any) => {
      console.error('Error creating chat:', error);
    }
  });

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

  // Lista chats - Solo renderizar la lista de chats
  return (
    <div className="flex flex-col h-full">
      {/* Search con Filtro Integrado */}
      <div className="px-3 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="relative flex-1">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
              <IC.Search />
              <input 
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 flex-1 focus:outline-none pr-20" 
              />
              {/* Botón de filtro dentro del input */}
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-white rounded-full text-xs text-gray-600 hover:bg-gray-50 border border-gray-200"
              >
                ⚙️
              </button>
              
              {/* Dropdown de filtros */}
              {showFilterDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[200px]">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-700 border-b border-gray-100 mb-2">
                      Tipo de búsqueda
                    </div>
                    <button 
                      onClick={() => { setSearchType('all'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        searchType === 'all' ? 'bg-teal-50 text-teal-600' : 'text-gray-700'
                      }`}
                    >
                      🌐 Todos
                    </button>
                    <button 
                      onClick={() => { setSearchType('name'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        searchType === 'name' ? 'bg-teal-50 text-teal-600' : 'text-gray-700'
                      }`}
                    >
                      👤 Nombre
                    </button>
                    <button 
                      onClick={() => { setSearchType('property'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        searchType === 'property' ? 'bg-teal-50 text-teal-600' : 'text-gray-700'
                      }`}
                    >
                      🏠 Propiedad
                    </button>
                    <button 
                      onClick={() => { setSearchType('district'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        searchType === 'district' ? 'bg-teal-50 text-teal-600' : 'text-gray-700'
                      }`}
                    >
                      📍 Distrito
                    </button>
                    <button 
                      onClick={() => { setSearchType('phone'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        searchType === 'phone' ? 'bg-teal-50 text-teal-600' : 'text-gray-700'
                      }`}
                    >
                      📞 Teléfono (PE)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Menú de 3 puntos estilo WhatsApp */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowContactMenu(!showContactMenu)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
              </svg>
            </button>
            
            {/* Dropdown menú */}
            {showContactMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    // Buscar el primer resultado de usuarios y agregarlo como contacto
                    const userResults = searchResults?.filter((r: any) => r.type === 'user');
                    if (userResults && userResults.length > 0) {
                      const firstUser = userResults[0].data;
                      addContact.mutate(firstUser.id);
                      setShowContactMenu(false);
                    } else {
                      // Si no hay resultados, enfocar el buscador
                      setSearchType('phone');
                      const searchInput = document.querySelector('input[placeholder="Buscar..."]') as HTMLInputElement;
                      if (searchInput) {
                        searchInput.focus();
                        searchInput.placeholder = "Buscar contacto por teléfono...";
                      }
                      setShowContactMenu(false);
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-gray-500">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Agregar Contacto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters de chats existentes */}
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
        {loadingSearch ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          </div>
        ) : searchTerm ? (
          // Mostrar resultados de búsqueda
          <>
            {searchResults.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <IC.Search />
                </div>
                <p className="text-gray-600 text-sm font-medium">No se encontraron resultados</p>
                <p className="text-gray-400 text-xs mt-1">Intenta con otros términos o ajusta los filtros</p>
              </div>
            ) : (
              searchResults.map((result: any, index: number) => (
                <SearchResultItem 
                  key={`${result.type}-${result.data.id}-${index}`}
                  result={result} 
                  onCreateChat={createChat.mutate} 
                />
              ))
            )}
          </>
        ) : loadingChats ? (
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
            <p className="text-gray-600 text-sm font-medium">No tienes conversaciones aúnc</p>
            <p className="text-gray-400 text-xs mt-1">Usa el buscador para encontrar propiedades, usuarios o estados</p>
          </div>
        ) : (
          chats.map((chat: any) => (
            <div key={chat.id} onClick={() => setSelectedChatId(chat.id)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors ${selectedChatId === chat.id ? 'bg-[#f0f2f5]' : ''}`}>
              <div className="relative">
                <Avatar name={chat.participantName ?? chat.groupName ?? 'U'} role="USER" size="md" src={chat.participantAvatar} />
                {chat.type === 'GROUP' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
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
                    <span className="text-yellow-400 text-xs ml-2">⭐</span>
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

// ──── PANEL ESTADOS ────────────────────────────────────────────────────────────────
function EstadosPanel({ user, onNewStatus, onStatusSelect, selectedStatusId }: { 
  user: any; 
  onNewStatus: () => void;
  onStatusSelect?: (id: number) => void;
  selectedStatusId?: number | null;
}) {
  const [shareTarget, setShareTarget] = useState<{ title: string; link: string } | null>(null);
  const [locationFilter, setLocationFilter] = useState('');
  const shareStatus = useShareStatusPost();

  const { data: statusData, isLoading, fetchNextPage, hasNextPage } = useGetActiveStatusPosts({
    location: locationFilter || undefined,
  });

  const allPosts = statusData?.pages?.flatMap((p: any) => p.content) ?? [];

  const handleShare = async (postId: number, postTitle: string) => {
    // Mostrar feedback inmediato al usuario
    setShareTarget({ title: postTitle, link: window.location.origin });
    
    // Intentar registrar el share en el backend de forma asíncrona (sin bloquear)
    shareStatus.mutate(postId, {
      onError: (error) => {
        console.warn('No se pudo registrar el share en el backend:', error);
        // No mostrar error al usuario ya que el compartido ya funcionó
      },
      onSuccess: () => {
        console.log('Share registrado exitosamente en el backend');
      }
    });
  };

  const handleStatusClick = (postId: number) => {
    if (onStatusSelect) {
      onStatusSelect(postId);
    }
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Recientes
          </p>
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
                <div key={post.id} 
                     className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors cursor-pointer ${selectedStatusId === post.id ? 'bg-blue-50' : ''}`}
                     onClick={() => handleStatusClick(post.id)}>
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
                          {isUrgent ? '⚠️ ' : ''}{timeLeft(new Date(post.expiresAt))}
                        </span>
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

// ──── PANEL CANALES ────────────────────────────────────────────────────────────────
function CanalesPanel({ user }: { user: any }) {
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
    Lima: '🏙️', Arequipa: '🌋', Trujillo: '🏺', Piura: '☀️', Chiclayo: '🌿', Cusco: '🏔️',
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
            <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
          </div>
        ) : !displayChannels?.length ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No hay canales disponibles</p>
          </div>
        ) : (
          displayChannels.map((channel: any) => (
            <div key={channel.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                {cityEmojis[channel.city] ?? '🏘️'}
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

      {/* Botones inferiores */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        <button 
          onClick={() => setShowNewChannel(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg px-4 py-3 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm"
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

// ──── PANEL LISTA DE GRUPOS (columna izquierda — solo navegación) ─────────────
function GruposListPanel({ 
  user, 
  onGroupSelect, 
  activeSection,
  onSectionChange,
}: { 
  user: any; 
  onGroupSelect: (group: any) => void;
  activeSection: 'mis-grupos' | 'descubrir' | 'crear';
  onSectionChange: (s: 'mis-grupos' | 'descubrir' | 'crear') => void;
}) {
  const { data: groups, isLoading } = useGetGroups(0, 50);
  const misGrupos = groups?.filter((g: any) => g.isMember) ?? [];
  console.log('👥 Mis grupos (member) in GruposListPanel:', misGrupos);
  
  // Verificar si el usuario ya es dueño de un grupo
  const userOwnedGroups = groups?.filter((g: any) => g.isMember && g.isOwner) ?? [];
  const hasGroup = userOwnedGroups.length > 0;

  const getGroupEmoji = (name: string) => {
    if (name.includes('Alquiler')) return '🏠';
    if (name.includes('Venta')) return '💰';
    if (name.includes('Terreno') || name.includes('Lote')) return '🌍';
    if (name.includes('Inversion')) return '📈';
    if (name.includes('Lima')) return '🏙️';
    return '🏘️';
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header estilo Facebook */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Grupos</h1>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
          <IC.Search />
          <input 
            placeholder="Buscar grupos" 
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 flex-1 focus:outline-none" 
          />
        </div>
      </div>

      {/* Nav items */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => onSectionChange('descubrir')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'descubrir' ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            activeSection === 'descubrir' ? 'bg-blue-600' : 'bg-gray-200'
          }`}>
            <svg viewBox="0 0 24 24" className={`w-5 h-5 ${activeSection === 'descubrir' ? 'fill-white' : 'fill-gray-600'}`}>
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </span>
          Descubrir
        </button>

        <button
          onClick={() => onSectionChange('mis-grupos')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeSection === 'mis-grupos' ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            activeSection === 'mis-grupos' ? 'bg-blue-600' : 'bg-gray-200'
          }`}>
            <IC.Groups a={activeSection === 'mis-grupos'} />
          </span>
          Tus grupos
        </button>
      </div>

      {/* Botón crear */}
      <div className="px-3 pb-3">
        <button
          onClick={() => onSectionChange('crear')}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors relative ${
            hasGroup 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {hasGroup && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          <span className="text-lg font-bold leading-none">
            {hasGroup ? '🚫' : '+'}
          </span>
          {hasGroup ? 'Límite alcanzado' : 'Crear nuevo grupo'}
        </button>
        {hasGroup && (
          <p className="text-xs text-gray-400 text-center mt-1">
            Ya tienes 1 grupo activo
          </p>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Mini lista de mis grupos al fondo */}
      {misGrupos.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 pt-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Grupos a los que te uniste
          </p>
          <div className="space-y-1">
            {misGrupos.slice(0, 8).map((group: any) => (
              <button
                key={group.id}
                onClick={() => {
                  // TEMPORAL DEBUG - BORRAR DESPUÉS
                  console.log('🔍 Grupo seleccionado en GruposListPanel:', group.id, group.groupId);
                  console.log('🔍 Grupo object completo:', group);
                  
                  onGroupSelect(group);
                  onSectionChange('mis-grupos');
                }}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-lg flex-shrink-0">
                  {getGroupEmoji(group.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{group.name}</p>
                  <p className="text-xs text-gray-400">{group.memberCount} miembros</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──── VISTA DERECHA: MIS GRUPOS (grid estilo Facebook) ─────────────────────
function GruposMisGruposView({ user, onGroupSelect }: { user: any; onGroupSelect: (g: any) => void }) {
  const { data: groups, isLoading } = useGetGroups(0, 50);
  const leaveGroup = useLeaveGroup();
  const [shareTarget, setShareTarget] = useState<{ title: string; link: string } | null>(null);
  const misGrupos = groups?.filter((g: any) => g.isMember) ?? [];
  console.log('👥 Mis grupos (member) in GruposListPanel:', misGrupos);

  const getGroupEmoji = (name: string) => {
    if (name.includes('Alquiler')) return '🏠';
    if (name.includes('Venta')) return '💰';
    if (name.includes('Terreno') || name.includes('Lote')) return '🌍';
    if (name.includes('Inversion')) return '📈';
    if (name.includes('Lima')) return '🏙️';
    return '🏘️';
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {/* Header estilo Facebook */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Todos los grupos a los que te uniste ({misGrupos.length})
        </h2>
        <button className="text-sm text-blue-600 font-medium hover:underline">
          Ordenar
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && misGrupos.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-700 font-semibold text-lg">No eres miembro de ningún grupo aún</p>
          <p className="text-gray-400 text-sm mt-1">Ve a "Descubrir" para unirte a grupos</p>
        </div>
      )}

      {/* Grid de tarjetas estilo Facebook */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {misGrupos.map((group: any) => (
          <div
            key={group.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer"
          >
            {/* Banner del grupo */}
            <div
              className="h-28 bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-5xl"
              onClick={() => {
                // TEMPORAL DEBUG - BORRAR DESPUÉS
                console.log('🔍 Grupo seleccionado en GruposMisGruposView (banner):', group.id, group.groupId);
                console.log('🔍 Grupo object completo:', group);
                
                onGroupSelect(group);
              }}
            >
              {getGroupEmoji(group.name)}
            </div>

            {/* Info */}
            <div className="p-3" onClick={() => {
              // TEMPORAL DEBUG - BORRAR DESPUÉS
              console.log('🔍 Grupo seleccionado en GruposMisGruposView (info):', group.id, group.groupId);
              
              onGroupSelect(group);
            }}>
              <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug mb-1">
                {group.name}
              </h3>
              <p className="text-xs text-gray-500">
                {group.memberCount || 0} miembros • {group.postCount || 0} publicaciones
              </p>
            </div>

            {/* Acciones */}
            <div className="px-3 pb-3 flex items-center gap-2">
              <button
                onClick={() => {
                  // TEMPORAL DEBUG - BORRAR DESPUÉS
                  console.log('🔍 Grupo seleccionado en GruposMisGruposView (botón):', group.id, group.groupId);
                  
                  onGroupSelect(group);
                }}
                className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors"
              >
                Ver grupo
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShareTarget({
                    title: group.name,
                    link: `${window.location.origin}/grupos/${group.id}` 
                  });
                }}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="text-gray-500 text-xs">···</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {shareTarget && (
        <ShareModal
          title={shareTarget.title}
          link={shareTarget.link}
          onClose={() => setShareTarget(null)}
        />
      )}
    </div>
  );
}

// ──── PANEL DETALLES DE GRUPO ────────────────────────────────────────────────────────
function GrupoDetailPanel({ group, user, onBack }: { group: any; user: any; onBack: () => void }) {
  const leaveGroup = useLeaveGroup();

  const handleLeaveGroup = () => {
    if (confirm(`¿Estás seguro de que quieres salir del grupo "${group.name}"?`)) {
      leaveGroup.mutate(group.id);
      onBack(); // Volver a la lista de grupos
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header del grupo estilo Tiyuy */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{group.name}</h1>
          <button
            onClick={handleLeaveGroup}
            disabled={leaveGroup.isPending}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
          >
            {leaveGroup.isPending ? (
              <>
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                Saliendo...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span className="text-sm">{group.memberCount || 0} miembros</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            <span className="text-sm">{group.postCount || 0} publicaciones</span>
          </div>
        </div>
      </div>

      {/* Área de publicaciones dinámica */}
      <div className="flex-1 overflow-hidden">
        <GrupoPostsPanel 
          groupId={group.id ?? group.groupId ?? 0}
          groupName={group.name}
          currentUserId={user?.id || 0}
          currentUser={user}  
          onCreatePost={() => {
            // TEMPORAL DEBUG - BORRAR DESPUÉS
            console.log('🔍 GrupoPostsPanel groupId:', group.id, group.groupId);
            console.log('🔍 group object completo:', group);
            
            // Función para crear post - puede ser implementada después
            console.log('Crear post en grupo:', group.id);
          }}
        />
      </div>
    </div>
  );
};

// ──── MAIN PAGE COMPONENT ────────────────────────────────────────────────────────────────
export default function MisContactosPage() {
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
  const [localReactions, setLocalReactions] = useState<{[key: string]: {[emoji: string]: {count: number, users: string[]}}}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, token, isAuthenticated } = useAuthStore();
  const [initialChatProcessed, setInitialChatProcessed] = useState(false);

  // Monitorear cambios en selectedGroup para depuración
  useEffect(() => {
    console.log('selectedGroup cambió:', selectedGroup);
  }, [selectedGroup]);
  
  // Get chats data to find selected chat
  const { data: chats } = useGetChats('all');
  const { data: messages, isLoading: loadingMessages, error: messagesError } = useGetChatMessages(selectedChatId!, { enabled: !!selectedChatId });
  
  // Debug messages
  useEffect(() => {
    console.log('📨 Messages data:', messages);
    console.log('📨 Loading:', loadingMessages);
    console.log('📨 Messages Error:', messagesError);
    console.log('📨 Selected chat ID:', selectedChatId);
    
    // Debug específico para respuestas
    if (messages && messages.length > 0) {
      messages.forEach((msg: any, index: number) => {
        console.log(`📨 Mensaje ${index}:`, {
          id: msg.id,
          content: msg.content,
          isOwn: msg.isOwn,
          replyToMessageId: msg.replyToMessageId,
          replyToContent: msg.replyToContent,
          replyToSenderName: msg.replyToSenderName,
          replyToIsOwn: msg.replyToIsOwn,
          fullMessage: msg
        });
      });
    }
  }, [messages, loadingMessages, selectedChatId]);
  
  const sendMessage = useSendMessage();
  const markAsRead = useMarkChatAsRead();
  const toggleFavorite = useToggleFavoriteChat();

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.warn('Usuario no autenticado o sin token');
    }
  }, [isAuthenticated, token]);

  // Scroll to bottom when messages change or when new message is sent
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

  // Close context menu and reaction picker when clicking outside
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

  // Función para manejar reacciones
  const handleReaction = (msg: any, emoji: string) => {
    const messageId = String(msg.id);
    const userId = String(user?.id || 'anonymous');
    
    setLocalReactions(prev => {
      const messageReactions = { ...prev[messageId] };
      const reaction = messageReactions[emoji] || { count: 0, users: [] };
      
      // Si el usuario ya reaccionó con este emoji, quitar la reacción
      if (reaction.users.includes(userId)) {
        reaction.count--;
        reaction.users = reaction.users.filter(id => id !== userId);
        if (reaction.count === 0) {
          delete messageReactions[emoji];
        }
      } else {
        // Si no ha reaccionado, añadir la reacción
        reaction.count++;
        reaction.users.push(userId);
        messageReactions[emoji] = reaction;
      }
      
      return {
        ...prev,
        [messageId]: messageReactions
      };
    });
    
    setShowReactionPicker(null);
    console.log('💫 Reacción local:', emoji, 'Mensaje:', messageId, 'Usuario:', userId);
  };

  // Conectar WebSocket para mensajes en tiempo real (manejo automático de instancias)
  const { isConnected: wsConnected } = useWebSocket({
    onNewMessage: (message) => {
      console.log('💬 Mensaje WebSocket recibido:', message);
      // Invalidar cache para refrescar mensajes
      queryClient.invalidateQueries({ queryKey: ['chat-messages', message.chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onConnectionChange: (connected) => {
      console.log('🔌 WebSocket conexión:', connected ? 'Conectado' : 'Desconectado');
    }
  });

  // Handle auto-open chat from event organizer (using localStorage)
  useEffect(() => {
    if (!chats || initialChatProcessed) return;
    
    // Check for organizer data in localStorage
    const organizerData = localStorage.getItem('chat_with_organizer');
    
    if (organizerData) {
      const { userId, name, phone, timestamp } = JSON.parse(organizerData);
      
      // Only use if less than 30 seconds old
      if (Date.now() - timestamp < 30000) {
        console.log('📱 Datos de organizador encontrados:', { userId, name, phone });
        
        // Switch to chats tab
        setActiveTab('chats');
        
        // Find existing chat with this user
        const existingChat = chats.find((c: any) => 
          c.participantId === userId || c.targetUserId === userId
        );
        
        if (existingChat) {
          console.log('✅ Chat existente encontrado:', existingChat.id);
          setSelectedChatId(existingChat.id);
        } else {
          console.log('🆕 Creando nuevo chat con usuario:', userId);
          // Create new chat
          apiCall('/contacts/extended/chats', {
            method: 'POST',
            body: JSON.stringify({
              targetUserId: userId,
              initialMessage: `Hola ${name || ''}, me interesa contactarte sobre tu evento.`,
              interactionType: 'event_contact'
            })
          }).then((response: any) => {
            console.log('✅ Chat creado:', response);
            if (response?.id) {
              setSelectedChatId(response.id);
            }
          }).catch((err: any) => {
            console.error('❌ Error creando chat:', err);
            toast.error('No se pudo iniciar la conversación');
          });
        }
      }
      
      // Clear localStorage to prevent reprocessing
      localStorage.removeItem('chat_with_organizer');
    }
    
    setInitialChatProcessed(true);
  }, [chats, initialChatProcessed]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatId) return;
    
    // Construir el payload del mensaje
    const messagePayload: any = {
      chatId: selectedChatId,
      content: newMessage,
      type: 'TEXT'
    };
    
    // Agregar replyToMessage si está respondiendo a un mensaje
    if (replyToMessage) {
      messagePayload.replyToMessageId = String(replyToMessage.id);  // Convertir a string
      console.log('📨 Enviando respuesta:', {
        chatId: selectedChatId,
        content: newMessage,
        replyToMessageId: String(replyToMessage.id),
        replyToContent: replyToMessage.content
      });
    }
    
    sendMessage.mutate(messagePayload);
    setNewMessage('');
    
    // Limpiar el estado de respuesta después de enviar
    if (replyToMessage) {
      setReplyToMessage(null);
    }
  };

  const { data: chatsData } = useGetChats('unread');
  const { data: groups, isLoading: groupsLoading } = useGetGroups(0, 50);
  const { data: statusData } = useGetActiveStatusPosts();
  const allPosts = statusData?.pages?.flatMap((p: any) => p.content) ?? [];
  const unreadCount = chatsData?.reduce((acc: number, c: any) => acc + (c.unreadCount ?? 0), 0) ?? 0;

  const NAV: NavItem[] = [
    { key: 'chats' as MainTab, Icon: IC.Chat,    label: 'Chats',    badge: unreadCount },
    { key: 'estados' as MainTab, Icon: IC.Status,  label: 'Estados' },
    { key: 'grupos'  as MainTab, Icon: IC.Groups,  label: 'Grupos' },
    { key: 'canales' as MainTab, Icon: IC.Channel, label: 'Comunidades' },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#efebe2] overflow-hidden">
      {/* Indicador de autenticación */}
      {!isAuthenticated && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">⚠️ No autenticado</p>
          <p className="text-xs">Por favor inicia sesión</p>
        </div>
      )}

      {/* ──── Sidebar iconos estilo WhatsApp ──── */}
      <div className="w-[76px] bg-white flex flex-col items-center py-3 gap-1 flex-shrink-0 flex">
        {/* Logo Tiyuy */}
        <div className="w-10 h-10 mb-6 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">T</span>
        </div>

        {NAV.map(({ key, Icon, label, badge }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            title={label}
            className={`relative w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group ${
              activeTab === key ? 'bg-[#e9edef]' : 'hover:bg-[#f0f2f5]'
            }`}>
            <Icon a={activeTab === key} />
            <span className={`text-[9px] font-medium transition-all ${activeTab === key ? 'text-[#111b21]' : 'text-[#667781]'}`}>
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
          <Avatar name={user?.firstName ?? 'U'} role={user?.role} size="sm" src={user?.avatar ?? undefined} />
        </div>
      </div>

      {/* ──── Contenedor principal para chats y conversación ──── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ──── Panel lista izquierdo ──── */}
        <div className="flex-initial w-[350px] flex flex-col bg-white border-r border-[#e9edef] overflow-hidden">
        {/* Header del panel con gradiente Tiyuy */}
        <div className="bg-gradient-to-r from-blue-700 to-teal-600 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-base leading-tight">
                {activeTab === 'chats'   && 'Mis Contactos'}
                {activeTab === 'estados' && 'Estados'}
                {activeTab === 'canales' && 'Canales'}
                {activeTab === 'grupos'  && 'Grupos'}
              </h1>
              <p className="text-white/80 text-xs">Mensajería inmobiliaria</p>
            </div>
            {/* Botón de nuevo estado */}
            {activeTab === 'estados' && (
              <button onClick={() => setShowNewStatus(true)}
                className="bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-full transition-colors font-medium">
                + Estado
              </button>
            )}
          </div>
        </div>

        {/* Contenido del panel izquierdo */}
        <div className="flex-1 overflow-hidden bg-white">
          {activeTab === 'chats'   && <ChatsPanel user={user} selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} />}
          {activeTab === 'estados' && <EstadosPanel user={user} onNewStatus={() => setShowNewStatus(true)} onStatusSelect={setSelectedStatusId} selectedStatusId={selectedStatusId} />}
          {activeTab === 'canales' && <CanalesListPanel user={user} onChannelSelect={setSelectedChannel} activeSection={channelsSection} onSectionChange={setChannelsSection} />}
          {activeTab === 'grupos' && (
            <GruposListPanel
              user={user}
              onGroupSelect={(group) => {
                setSelectedGroup(group);
              }}
              activeSection={gruposSection}
              onSectionChange={(s) => {
                setGruposSection(s);
                setSelectedGroup(null); // limpiar grupo al cambiar sección
              }}
            />
          )}
        </div>
      </div>

      {/* ──── Panel derecho ──── contenido dinámico segun selección ──── */}
      {activeTab !== 'canales' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Si hay un chat seleccionado, mostrar conversación ocupando todo el espacio */}
        {activeTab === 'chats' && selectedChatId && chats?.find((c: any) => c.id === selectedChatId) ? (
          <div className="flex flex-col h-full" onClick={() => setContextMenu(null)}>
    
            {/* ── HEADER ── */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#075e54] border-b border-[#054d44] flex-shrink-0">
              <button onClick={() => {
                setSelectedChatId(null);
                setReplyToMessage(null);
              }} className="text-white/70 hover:text-white transition-colors">
                <IC.ArrowBack />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">
                  {chats?.find((c: any) => c.id === selectedChatId)?.participantName}
                </p>
                <p className="text-white/70 text-xs">
                  {(() => {
                    const chat = chats?.find((c: any) => c.id === selectedChatId);
                    const lastSeen = chat?.participantLastSeen || chat?.lastMessageAt;
                    return lastSeen ? `visto ${formatLastSeen(lastSeen)}` : 'en línea';
                  })()}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite.mutate(selectedChatId)}
                className={`text-sm transition-colors ${
                  chats?.find((c: any) => c.id === selectedChatId)?.isFavorite
                    ? 'text-yellow-400'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                ⭐
              </button>
            </div>
    
            {/* ── BANNER MENSAJE FIJADO ── */}
            {pinnedMessage && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="w-1 h-8 rounded-full bg-[#075e54] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#075e54]">
                    📌 {pinnedMessage.isOwn ? 'Tú' : pinnedMessage.senderName?.split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{pinnedMessage.content}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setPinnedMessage(null); }}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0 ml-2"
                >
                  ×
                </button>
              </div>
            )}
    
            {/* ── ÁREA DE MENSAJES ── */}
            <div
              className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
              style={{
                backgroundColor: '#e5ddd5',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M0 0h80v80H0z' fill='%23e5ddd5'/%3E%3Cpath d='M40 0v80M0 40h80' stroke='%23d4c9bf' stroke-width='0.5' opacity='0.4'/%3E%3C/svg%3E")`,
              }}
            >
              {messagesError ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-red-600 p-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Error al cargar mensajes</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {messagesError.message || 'Inténtalo de nuevo más tarde'}
                    </p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              ) : loadingMessages ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 rounded-full border-2 border-[#075e54] border-t-transparent animate-spin" />
                </div>
              ) : !messages?.length ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                  <p className="text-sm">Sin mensajes aún</p>
                </div>
              ) : (
                messages
                  .slice()
                  .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((msg: any, index: number, arr: any[]) => {
                    // ✅ CAMPO CORRECTO: el backend devuelve isOwn: true/false
                    const isMe = msg.isOwn === true;
    
                    const prevMsg = arr[index - 1] ?? null;
                    const showDate =
                      !prevMsg ||
                      new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
    
                    const isPinned = pinnedMessage?.id === msg.id;
    
                    return (
                      <div key={msg.id ?? `msg-${index}`}>
    
                        {/* Separador de fecha */}
                        {showDate && (
                          <div className="flex justify-center my-3">
                            <span
                              className="text-[11px] px-3 py-1 rounded-lg shadow-sm"
                              style={{ background: '#d9f0f9', color: '#54656f' }}
                            >
                              {formatDateSeparator(new Date(msg.createdAt))}
                            </span>
                          </div>
                        )}
    
                        {/* Fila del mensaje */}
                        <div
                          className={`flex mb-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setContextMenu({ msg, x: e.clientX, y: e.clientY });
                          }}
                        >
                          {/* Burbuja */}
                          <div
                            className={`
                              relative max-w-[70%] px-3 py-2 shadow-sm text-sm leading-relaxed cursor-pointer
                              ${isMe
                                ? 'rounded-tl-2xl rounded-tr-sm rounded-bl-2xl rounded-br-2xl'
                                : 'rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
                              }
                              ${isPinned ? 'ring-2 ring-[#075e54]' : ''}
                            `}
                            style={{
                              background: isMe ? '#dcf8c6' : '#ffffff',
                              color: '#111b21',
                              wordBreak: 'break-word',
                              minWidth: '80px', // Aumentado para evitar superposición
                              paddingBottom: '20px', // Espacio para timestamp
                            }}
                          >
                            {/* Mensaje respondido */}
                            {(msg.replyToContent || msg.replyToSenderName) && (
                              <div className="mb-1 p-2 bg-gray-100 rounded-md border-l-2 border-blue-500">
                                <p className="text-xs text-gray-600 font-medium">
                                  Respondiendo a {msg.replyToIsOwn ? 'ti mismo' : msg.replyToSenderName?.split(' ')[0] || 'alguien'}
                                </p>
                                <p className="text-xs text-gray-800 truncate">{msg.replyToContent}</p>
                              </div>
                            )}
    
                            {/* Indicador fijado dentro burbuja */}
                            {isPinned && (
                              <span className="text-[10px] text-[#075e54] font-semibold block mb-0.5">
                                📌 Fijado
                              </span>
                            )}
                            
                            {/* Reacciones */}
                            {(() => {
                              const messageId = String(msg.id);
                              const messageReactions = localReactions[messageId] || {};
                              const reactionList = Object.entries(messageReactions).map(([emoji, data]) => ({
                                emoji,
                                count: data.count,
                                users: data.users
                              }));
                              
                              return reactionList.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {reactionList.map((reaction, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-0.5"
                                    >
                                      {reaction.emoji} {reaction.count}
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}
    
                            <span className="break-words">{msg.content}</span>
    
                            {/* Timestamp + doble check */}
                            <div className="absolute bottom-1 right-2 flex items-center gap-0.5 pointer-events-none">
                              <span className="text-[10px]" style={{ color: '#667781' }}>
                                {new Date(msg.createdAt).toLocaleTimeString('es-PE', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false, // Usar formato 24h como WhatsApp
                                })}
                              </span>
                              {isMe && (
                                <svg viewBox="0 0 16 15" className="w-4 h-3" style={{ fill: '#53bdeb' }}>
                                  <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
    
                      </div>
                    );
                  })
              )}
              <div ref={messagesEndRef} />
            </div>
    
            {/* ── MENÚ CONTEXTUAL (clic derecho sobre mensaje) ── */}
            {contextMenu && (
              <>
                <div
                  className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 py-1 min-w-[180px] overflow-hidden"
                  style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 200) }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => {
                      setReplyToMessage(contextMenu.msg);
                      setContextMenu(null);
                    }}
                  >
                    <span>↩️</span>
                    Responder
                  </button>
    
                  <button
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(contextMenu.msg.content ?? '');
                      setContextMenu(null);
                    }}
                  >
                    <span>📋</span>
                    Copiar
                  </button>
                  
                  <button
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => {
                      setContextMenu(null);
                      setTimeout(() => {
                        setShowReactionPicker({ msg: contextMenu.msg, x: contextMenu.x, y: contextMenu.y - 60 });
                      }, 100);
                    }}
                  >
                    <span>😊</span>
                    Reaccionar
                  </button>
    
                  <button
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => {
                      setPinnedMessage(contextMenu.msg);
                      setContextMenu(null);
                    }}
                  >
                    <span>📌</span>
                    {pinnedMessage?.id === contextMenu.msg.id ? 'Ya está fijado' : 'Fijar mensaje'}
                  </button>
    
                  {pinnedMessage?.id === contextMenu.msg.id && (
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      onClick={() => {
                        setPinnedMessage(null);
                        setContextMenu(null);
                      }}
                    >
                      <span>🗑️</span>
                      Desfijar mensaje
                    </button>
                  )}
                </div>
              </>
            )}
    
            {/* ── PICKER DE REACCIONES ── */}
            {showReactionPicker && (
              <div
                className="fixed z-[10000] bg-white rounded-xl shadow-2xl border border-gray-100 p-2 flex gap-1"
                style={{ top: showReactionPicker.y, left: Math.min(showReactionPicker.x, window.innerWidth - 250) }}
                onClick={(e) => e.stopPropagation()}
              >
                {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => (
                  <button
                    key={emoji}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-lg transition-colors"
                    onClick={() => handleReaction(showReactionPicker.msg, emoji)}
                  >
                    {emoji}
                  </button>
                ))}
                <button
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                  onClick={() => setShowReactionPicker(null)}
                >
                  +
                </button>
              </div>
            )}
    
            {/* ── INPUT DE MENSAJE ── */}
            <div className="px-3 py-2 bg-[#f0f2f5] flex-shrink-0">
              {/* Mensaje respondido */}
              {replyToMessage && (
                <div className="mb-2 p-2 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-medium">
                      Respondiendo a {replyToMessage.isOwn ? 'ti mismo' : replyToMessage.senderName?.split(' ')[0] || 'alguien'}
                    </p>
                    <p className="text-sm text-gray-800 truncate">{replyToMessage.content}</p>
                  </div>
                  <button
                    onClick={() => setReplyToMessage(null)}
                    className="ml-2 text-gray-400 hover:text-gray-600 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={replyToMessage ? "Escribe una respuesta..." : "Escribe un mensaje..."}
                  className="flex-1 px-4 py-2.5 bg-white rounded-full text-sm focus:outline-none shadow-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessage.isPending}
                  className="w-10 h-10 rounded-full bg-[#128c7e] text-white flex items-center justify-center hover:bg-[#075e54] transition-colors disabled:opacity-50 shadow-sm flex-shrink-0"
                >
                  <IC.Send />
                </button>
              </div>
            </div>
    
          </div>
        ) : activeTab === 'estados' && selectedStatusId ? (
          /* Si hay un estado seleccionado, mostrar detalle */
          <StatusDetailPanel 
            status={allPosts.find((post: any) => post.id === selectedStatusId) || {
              id: selectedStatusId,
              user: { name: 'Usuario' },
              content: 'Contenido no encontrado',
              createdAt: new Date().toISOString(),
              tags: [],
              likes: 0,
              comments: []
            }}
            user={user}
            onClose={() => setSelectedStatusId(null)}
          />
        ) : activeTab === 'grupos' ? (
          // ── PANEL DERECHO DE GRUPOS — cambia según sección o grupo seleccionado ──
          selectedGroup ? (
            <GrupoDetailPanel
              group={selectedGroup}
              user={user}
              onBack={() => setSelectedGroup(null)}
            />
          ) : gruposSection === 'crear' ? (
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <NewGroupModal onClose={() => setGruposSection('mis-grupos')} />
            </div>
          ) : gruposSection === 'descubrir' ? (
            <DiscoverGroupsView
              user={user}
              onGroupSelect={(group: any) => setSelectedGroup(group)}
            />
          ) : (
            // mis-grupos — grid estilo Facebook
            <GruposMisGruposView
              user={user}
              onGroupSelect={(group: any) => setSelectedGroup(group)}
            />
          )
        ) : (
          /* Si no hay chat seleccionado, mostrar contenido estático */
          <div className="flex-1 flex items-center justify-center"
            style={{
              backgroundColor: '#e5ddd5',
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}>
            
            {/* Contenido que cambia segÃºn el tab seleccionado */}
            {activeTab === 'chats' && (
              <div className="text-center px-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center mb-6 shadow-2xl">
                  <span className="text-white font-bold text-3xl">T</span>
                </div>
                <h2 className="text-gray-800 text-2xl font-light mb-2">Tiyuy Mensajes</h2>
                <p className="text-gray-600 text-sm text-center max-w-xs leading-relaxed mb-6">
                  Selecciona un chat para comenzar a conversar con clientes
                </p>
                <div className="text-center px-4">
                  <p className="text-gray-500 text-xs mb-2">
                    Busca y agrega contactos por telÃ©fono (solo PerÃº)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  Tus mensajes estÃ¡n cifrados de extremo a extremo
                </div>
              </div>
            )}

            {activeTab === 'estados' && (
              <div className="text-center px-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center mb-6 shadow-2xl">
                  <span className="text-white font-bold text-3xl">E</span>
                </div>
                <h2 className="text-gray-800 text-2xl font-light mb-2">Estados</h2>
                <p className="text-gray-600 text-sm text-center max-w-xs leading-relaxed mb-6">
                  Comparte tu estado con otros profesionales
                </p>
                <div className="text-center px-4">
                  <p className="text-gray-500 text-xs mb-2">
                    Publica propiedades y novedades
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41 1.41L10 14.17V7h2v7.17l3.59-3.59L18 17l-5-5z"/>
                  </svg>
                  Actualiza tu estado diariamente
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      )}

        {/* Contenido de canales */}
        {activeTab === 'canales' && (
          selectedChannel ? (
            // Vista detallada del canal seleccionado
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {/* Header del canal */}
              <div className="flex-none flex items-center gap-3 px-4 py-3 bg-[#075e54] border-b border-[#054d44]">
                <button onClick={() => setSelectedChannel(null)}
                  className="text-white/70 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{selectedChannel.name}</p>
                  <p className="text-white/60 text-xs">{selectedChannel.subscriberCount?.toLocaleString('es-PE') || 0} suscriptores</p>
                </div>
                <button className="text-white/70 hover:text-white transition-colors text-sm">
                  ⋯
                </button>
              </div>

              {/* Contenido + Sidebar en flex-row */}
              <div className="flex-1 flex flex-row overflow-hidden">
                {/* Contenido principal scrolleable */}
                <div className="flex-1 overflow-y-auto">
                  <ChannelPostsPanel 
                    channelId={selectedChannel.id}
                    channelName={selectedChannel.name}
                    currentUserId={user?.id || 0}
                    currentUser={user}
                    isChannelAdmin={selectedChannel.adminId === user?.id || selectedChannel.isAdmin}
                    onCreatePost={() => console.log('Crear post...')}
                    onCreateEvent={() => console.log('Crear evento...')}
                  />
                </div>
              </div>
            </div>
          ) : (
            // Vista por defecto - contenido según sección seleccionada
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {channelsSection === 'mis-canales-creados' && (
                <MisCanalesCreadosView
                  user={user}
                  onChannelSelect={setSelectedChannel}
                />
              )}
              {channelsSection === 'mis-canales-suscritos' && (
                <MisCanalesSuscritosView
                  user={user}
                  onChannelSelect={setSelectedChannel}
                />
              )}
              {channelsSection === 'descubrir-canales' && (
                <DiscoverChannelsView
                  user={user}
                  onChannelSelect={setSelectedChannel}
                />
              )}
              {channelsSection === 'crear-canal' && (
                <CreateChannelView
                  user={user}
                  onBack={() => setChannelsSection('mis-canales-creados')}
                />
              )}
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {showNewStatus && (
        <NewStatusModal onClose={() => setShowNewStatus(false)} userRole={user?.role} />
      )}
    </div>
  );
}