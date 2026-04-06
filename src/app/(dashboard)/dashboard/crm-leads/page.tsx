'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useAuthStore } from '@/presentation/store/authStore';
import {
  useReceivedLeads,
  useUnreadLeadsCount,
  useMarkLeadAsRead,
  useUpdateLeadStatus,
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  Lead
} from '@/presentation/hooks/useLeads';
import { UserAvatar } from '@/presentation/components/shared/UserAvatar';
import Link from 'next/link';
import { toast } from '@/presentation/store/toastStore';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Flame, Home, MessageSquare, Users, Diamond, User,
  ChevronDown, LogOut, Building
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  ALL: 'bg-gray-500',
  NEW: 'bg-blue-500',
  CONTACTED: 'bg-yellow-500',
  SCHEDULED: 'bg-purple-500',
  NEGOTIATING: 'bg-orange-500',
  CLOSED_WON: 'bg-green-500',
  CLOSED_LOST: 'bg-gray-400',
};

// Function to get status options - static Spanish labels
const getStatusOptions = () => [
  { value: 'ALL', label: 'Todos', color: STATUS_COLORS.ALL },
  { value: 'NEW', label: 'Nuevo', color: STATUS_COLORS.NEW },
  { value: 'CONTACTED', label: 'Contactado', color: STATUS_COLORS.CONTACTED },
  { value: 'SCHEDULED', label: 'Agendado', color: STATUS_COLORS.SCHEDULED },
  { value: 'NEGOTIATING', label: 'Negociando', color: STATUS_COLORS.NEGOTIATING },
  { value: 'CLOSED_WON', label: 'Ganado', color: STATUS_COLORS.CLOSED_WON },
  { value: 'CLOSED_LOST', label: 'Perdido', color: STATUS_COLORS.CLOSED_LOST },
];

// Sidebar Navigation Component
function Sidebar() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const menuItems = [
    { href: '/dashboard/crm-leads', icon: Flame, label: 'CRM Leads' },
    { href: '/my-properties', icon: Home, label: 'Mis Propiedades' },
    { href: '/dashboard/my-contacts', icon: MessageSquare, label: 'Mensajes' },
    { href: '/dashboard/clients', icon: Users, label: 'Clientes' },
    { href: '/plans', icon: Diamond, label: 'Planes' },
    { href: '/dashboard/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Header con Logo */}
      <div className="p-4 border-b border-gray-200">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">TIYUY</h1>
            <p className="text-xs text-gray-500">CRM Inmobiliario</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && <span className="ml-auto w-2 h-2 bg-teal-500 rounded-full"></span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// Stat Card Component (estilo Creatio)
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color,
  trend
}: { 
  title: string; 
  value: number | string; 
  subtitle?: string;
  icon: string; 
  color: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className={`${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
      {subtitle && (
        <p className="text-white/70 text-sm">{subtitle}</p>
      )}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-sm font-medium ${trend.positive ? 'text-green-300' : 'text-red-300'}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-white/50 text-xs">vs mes anterior</span>
        </div>
      )}
    </div>
  );
}

// Pipeline Funnel Component
function PipelineFunnel({ leads }: { leads: Lead[] }) {
  const stages = [
    { status: 'NEW', label: 'Nuevo', color: 'bg-blue-500', width: '100%' },
    { status: 'CONTACTED', label: 'Contactado', color: 'bg-yellow-500', width: '85%' },
    { status: 'SCHEDULED', label: 'Visita Agendada', color: 'bg-purple-500', width: '70%' },
    { status: 'NEGOTIATING', label: 'Negociando', color: 'bg-orange-500', width: '55%' },
    { status: 'CLOSED_WON', label: 'Ganado', color: 'bg-green-500', width: '40%' },
  ];

  const getCount = (status: string) => leads.filter(l => l.status === status).length;
  const total = leads.length || 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Pipeline de Leads</h3>
      <div className="space-y-3">
        {stages.map((stage) => {
          const count = getCount(stage.status);
          const percentage = Math.round((count / total) * 100);
          return (
            <div key={stage.status} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium text-gray-600">{stage.label}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${stage.color} transition-all duration-500 flex items-center justify-end pr-3`}
                      style={{ width: count > 0 ? `${Math.max((count / Math.max(...stages.map(s => getCount(s.status)))) * 100, 10)}%` : '0%' }}
                    >
                      {count > 0 && (
                        <span className="text-white font-bold text-sm">{count}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 w-12">{percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Lead Row Component (tabla profesional)
function LeadRow({ 
  lead, 
  onMarkAsRead, 
  onStatusChange,
  isUpdating,
  statusOptions
}: { 
  lead: Lead; 
  onMarkAsRead: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  isUpdating: boolean;
  statusOptions: {value: string; label: string; color: string}[];
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!lead.isRead ? 'bg-blue-50/30' : ''}`}>
      {/* Lead Info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar 
            user={{ firstName: lead.interestedUserName || '', lastName: '' }} 
            size="sm" 
          />
          <div>
            <p className="font-semibold text-gray-900">
              {lead.interestedUserName || 'Usuario Anonimo'}
              {!lead.isRead && (
                <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </p>
            <p className="text-sm text-gray-500">{lead.contactEmail}</p>
          </div>
        </div>
      </td>

      {/* Property */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {lead.propertyCoverPhoto ? (
            <img 
              src={lead.propertyCoverPhoto} 
              alt={lead.propertyTitle}
              className="w-12 h-9 object-cover rounded-lg"
            />
          ) : (
            <div className="w-12 h-9 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-lg"></span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 text-sm">{lead.propertyTitle}</p>
            <Link 
              href={`/property/${lead.propertySlug || lead.propertyId}`}
              target="_blank"
              className="text-xs text-blue-600 hover:underline"
            >
              Ver Propiedad →
            </Link>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            disabled={isUpdating}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)} transition-colors`}
          >
            <span>{getStatusIcon(lead.status)}</span>
            {getStatusLabel(lead.status)}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20 py-2">
              <p className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                Cambiar Estado
              </p>
              {statusOptions.filter(s => s.value !== 'ALL').map(status => (
                <button
                  key={status.value}
                  onClick={() => {
                    onStatusChange(lead.id, status.value);
                    setShowStatusMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                    lead.status === status.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                  {status.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>

      {/* Contact */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {lead.contactPhone && (
            <a
              href={`https://wa.me/${lead.contactPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              title="WhatsApp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.607.941.964-3.515-.233-.374a9.86 9.86 0 01-1.422-5.129c0-5.503 4.462-9.972 9.972-9.972 2.662 0 5.164 1.038 7.043 2.922 1.879 1.879 2.92 4.381 2.92 7.044 0 5.512-4.461 9.973-9.972 9.973M19.14 4.932C16.852 2.645 13.876 1.5 10.7 1.5c-6.455 0-11.71 5.255-11.71 11.71 0 2.054.537 4.068 1.555 5.827L0 23.5l4.55-1.19a11.57 11.57 0 005.15 1.222h.004c6.454 0 11.708-5.254 11.708-11.71 0-3.127-1.222-6.071-3.443-8.294"/>
              </svg>
            </a>
          )}
          <a
            href={`mailto:${lead.contactEmail}`}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            title="Email"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600">
          {new Date(lead.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(lead.createdAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {!lead.isRead && (
            <button
              onClick={() => onMarkAsRead(lead.id)}
              disabled={isUpdating}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Marcar como Leido
            </button>
          )}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Ver Detalles"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// Lead Card Component (vista de tarjetas)
function LeadCard({ 
  lead, 
  onMarkAsRead, 
  onStatusChange,
  isUpdating,
  statusOptions
}: { 
  lead: Lead; 
  onMarkAsRead: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  isUpdating: boolean;
  statusOptions: {value: string; label: string; color: string}[];
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 p-6 hover:shadow-lg transition-all ${
      !lead.isRead ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar 
            user={{ firstName: lead.interestedUserName || '', lastName: '' }} 
            size="md" 
          />
          <div>
            <h3 className="font-bold text-gray-900">
              {lead.interestedUserName || 'Usuario Anonimo'}
              {!lead.isRead && (
                <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </h3>
            <p className="text-sm text-gray-500">{lead.contactEmail}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)}`}>
          {getStatusIcon(lead.status)} {getStatusLabel(lead.status)}
        </span>
      </div>

      {/* Property */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          {lead.propertyCoverPhoto ? (
            <img 
              src={lead.propertyCoverPhoto} 
              alt={lead.propertyTitle}
              className="w-16 h-12 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{lead.propertyTitle}</p>
            <Link 
              href={`/property/${lead.propertySlug || lead.propertyId}`}
              target="_blank"
              className="text-xs text-blue-600 hover:underline"
            >
              Ver Propiedad →
            </Link>
          </div>
        </div>
      </div>

      {/* Message */}
      {lead.message && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-xl mb-4">
          <p className="text-sm text-yellow-800 italic line-clamp-2">
            &ldquo;{lead.message}&rdquo;
          </p>
        </div>
      )}

      {/* Contact Info */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        {lead.contactPhone && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {lead.contactPhone}
          </span>
        )}
      </div>

      {/* Fecha */}
      <p className="text-xs text-gray-400 mb-4">
        {new Date(lead.createdAt).toLocaleString('es-ES', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!lead.isRead && (
          <button
            onClick={() => onMarkAsRead(lead.id)}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Marcar como Leido
          </button>
        )}
        
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            disabled={isUpdating}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cambiar Estado
          </button>

          {showStatusMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20 py-2">
              {statusOptions.filter(s => s.value !== 'ALL').map(status => (
                <button
                  key={status.value}
                  onClick={() => {
                    onStatusChange(lead.id, status.value);
                    setShowStatusMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    lead.status === status.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {lead.contactPhone && (
          <a
            href={`https://wa.me/${lead.contactPhone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.607.941.964-3.515-.233-.374a9.86 9.86 0 01-1.422-5.129c0-5.503 4.462-9.972 9.972-9.972 2.662 0 5.164 1.038 7.043 2.922 1.879 1.879 2.92 4.381 2.92 7.044 0 5.512-4.461 9.973-9.972 9.973M19.14 4.932C16.852 2.645 13.876 1.5 10.7 1.5c-6.455 0-11.71 5.255-11.71 11.71 0 2.054.537 4.068 1.555 5.827L0 23.5l4.55-1.19a11.57 11.57 0 005.15 1.222h.004c6.454 0 11.708-5.254 11.708-11.71 0-3.127-1.222-6.071-3.443-8.294"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

// Main Page Component
export default function CRMLeadsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [lastCount, setLastCount] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  const statusOptions = getStatusOptions();
  
  const { data: leadsData, isLoading, error } = useReceivedLeads();
  const { data: unreadData } = useUnreadLeadsCount();
  const markAsRead = useMarkLeadAsRead();
  const updateStatus = useUpdateLeadStatus();

  const unreadCount = unreadData?.unreadCount || 0;
  const leads = leadsData?.content || [];

  // New leads notification
  useEffect(() => {
    if (unreadCount > lastCount && lastCount > 0) {
      const newLeads = unreadCount - lastCount;
      toast.success(`${newLeads} nuevo${newLeads > 1 ? 's' : ''} lead${newLeads > 1 ? 's' : ''} recibido${newLeads > 1 ? 's' : ''}!`);
    }
    setLastCount(unreadCount);
  }, [unreadCount, lastCount]);

  // Filter leads
  const filteredLeads = selectedStatus === 'ALL' 
    ? leads 
    : leads.filter(lead => lead.status === selectedStatus);

  // Statistics
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    unread: leads.filter(l => !l.isRead).length,
    contacted: leads.filter(l => l.status === 'CONTACTED').length,
    negotiating: leads.filter(l => l.status === 'NEGOTIATING').length,
    won: leads.filter(l => l.status === 'CLOSED_WON').length,
    conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'CLOSED_WON').length / leads.length) * 100) : 0,
  };

  const handleMarkAsRead = (leadId: number) => {
    markAsRead.mutate(leadId);
  };

  const handleStatusChange = (leadId: number, newStatus: string) => {
    updateStatus.mutate({ leadId, status: newStatus });
  };

  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-gray-50 p-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">!</div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">Error cargando leads</h2>
              <p className="text-red-600">{error.message}</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">CRM Leads</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Gestiona tus prospectos y conviertelos en clientes
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                        {unreadCount} nuevo{unreadCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">En vivo</span>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8 space-y-6">
            {/* Stats Cards - Estilo Creatio */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Leads" 
                value={stats.total} 
                subtitle={`${stats.unread} no leido${stats.unread !== 1 ? 's' : ''}`}
                icon="Users" 
                color="bg-gradient-to-br from-blue-500 to-blue-700"
                trend={{ value: 12, positive: true }}
              />
              <StatCard 
                title="Nuevos" 
                value={stats.new} 
                subtitle="Este mes"
                icon="Fire" 
                color="bg-gradient-to-br from-orange-500 to-red-600"
              />
              <StatCard 
                title="Negociando" 
                value={stats.negotiating} 
                subtitle="Oportunidades activas"
                icon="Handshake" 
                color="bg-gradient-to-br from-purple-500 to-purple-700"
              />
              <StatCard 
                title="Tasa de Conversion" 
                value={`${stats.conversionRate}%`}
                subtitle={`${stats.won} leads ganados`}
                icon="Chart" 
                color="bg-gradient-to-br from-green-500 to-emerald-700"
                trend={{ value: 5, positive: true }}
              />
            </div>

            {/* Pipeline + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PipelineFunnel leads={leads} />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h3>
                <div className="space-y-4">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900 font-medium">
                                                  Nuevo lead de {lead.interestedUserName || 'anonimo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(lead.createdAt).toLocaleString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {leads.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Sin actividad reciente
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Filtrar:</span>
                {statusOptions.map(status => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedStatus === status.value 
                        ? 'bg-gray-900 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.value !== 'ALL' && (
                      <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                    )}
                    {status.label}
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      selectedStatus === status.value ? 'bg-white/20' : 'bg-white'
                    }`}>
                      {status.value === 'ALL' ? leads.length : leads.filter(l => l.status === status.value).length}
                    </span>
                  </button>
                ))}

                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-500 font-medium">Cargando leads...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredLeads.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-gray-400">Vacio</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {selectedStatus === 'ALL' ? 'No hay leads aun' : 'No hay leads en este estado'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Los prospectos interesados en tus propiedades apareceran aqui automaticamente
                </p>
                {selectedStatus !== 'ALL' && (
                  <button
                    onClick={() => setSelectedStatus('ALL')}
                    className="mt-4 px-4 py-2 text-blue-600 font-medium hover:underline"
                  >
                    Ver todos los leads
                  </button>
                )}
              </div>
            )}

            {/* Leads Table */}
            {!isLoading && filteredLeads.length > 0 && viewMode === 'table' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Lead
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Propiedad
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLeads.map((lead) => (
                        <LeadRow
                          key={lead.id}
                          lead={lead}
                          onMarkAsRead={handleMarkAsRead}
                          onStatusChange={handleStatusChange}
                          isUpdating={markAsRead.isPending || updateStatus.isPending}
                          statusOptions={statusOptions}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Leads Cards View */}
            {!isLoading && filteredLeads.length > 0 && viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onMarkAsRead={handleMarkAsRead}
                    onStatusChange={handleStatusChange}
                    isUpdating={markAsRead.isPending || updateStatus.isPending}
                    statusOptions={statusOptions}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
