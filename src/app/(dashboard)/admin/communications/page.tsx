/**
 * Communications Page -> Centro de Soporte/Incidencias
 * Sistema de tickets con gráficas en tiempo real estilo trading, paginación 5/5 (frontend) con carga 20/20 (backend)
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { useAuthStore } from '@/presentation/store/authStore';
import {
  useSupportTickets,
  useSupportTicketsForChart,
  useSupportTicketStats,
  useUpdateSupportTicketStatus,
  useNotifyTicketUser,
} from '@/presentation/hooks/admin/useSupportTickets';
import { Card } from '@/presentation/components/ui/Card';
import { Button } from '@/presentation/components/ui/Button';
import { Spinner } from '@/presentation/components/ui/Spinner';
import {
  TicketCategory,
  TicketSeverity,
  TicketStatus,
  SupportTicket,
} from '@/core/domain/entities/Admin';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  HelpCircle,
  Mail,
  Lock,
  CreditCard,
  Building2,
  Settings,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  TrendingUp,
  Activity,
  Bell,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react';

// ==================== Constants ====================

const CATEGORY_CONFIG: Record<TicketCategory, { label: string; icon: React.ReactNode; color: string }> = {
  WRONG_EMAIL: { label: 'Correo Incorrecto', icon: <Mail className="w-4 h-4" />, color: 'text-orange-600 bg-orange-100' },
  PASSWORD_CHANGE: { label: 'Cambio de Contrasena', icon: <Lock className="w-4 h-4" />, color: 'text-red-600 bg-red-100' },
  SYSTEM_ERROR: { label: 'Falla del Sistema', icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-600 bg-red-100' },
  PAYMENT_ISSUE: { label: 'Problema de Pago', icon: <CreditCard className="w-4 h-4" />, color: 'text-purple-600 bg-purple-100' },
  ACCOUNT_ISSUE: { label: 'Problema de Cuenta', icon: <Settings className="w-4 h-4" />, color: 'text-blue-600 bg-blue-100' },
  PROPERTY_ISSUE: { label: 'Problema de Propiedad', icon: <Building2 className="w-4 h-4" />, color: 'text-teal-600 bg-teal-100' },
  OTHER: { label: 'Otro', icon: <HelpCircle className="w-4 h-4" />, color: 'text-gray-600 bg-gray-100' },
};

const SEVERITY_CONFIG: Record<TicketSeverity, { label: string; color: string }> = {
  LOW: { label: 'Baja', color: 'text-green-700 bg-green-100' },
  MEDIUM: { label: 'Media', color: 'text-yellow-700 bg-yellow-100' },
  HIGH: { label: 'Alta', color: 'text-orange-700 bg-orange-100' },
  CRITICAL: { label: 'Critica', color: 'text-red-700 bg-red-100' },
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  OPEN: { label: 'Abierto', color: 'text-blue-700 bg-blue-100', icon: <AlertCircle className="w-4 h-4" /> },
  IN_PROGRESS: { label: 'En Progreso', color: 'text-yellow-700 bg-yellow-100', icon: <Clock className="w-4 h-4" /> },
  RESOLVED: { label: 'Resuelto', color: 'text-green-700 bg-green-100', icon: <CheckCircle2 className="w-4 h-4" /> },
  CLOSED: { label: 'Cerrado', color: 'text-gray-500 bg-gray-100', icon: <X className="w-4 h-4" /> },
};

const CATEGORIES: TicketCategory[] = [
  'WRONG_EMAIL', 'PASSWORD_CHANGE', 'SYSTEM_ERROR', 'PAYMENT_ISSUE',
  'ACCOUNT_ISSUE', 'PROPERTY_ISSUE', 'OTHER',
];

const SEVERITIES: TicketSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const STATUS_TABS: { key: TicketStatus | null; label: string }[] = [
  { key: null, label: 'Todas' },
  { key: 'OPEN', label: 'Abiertas' },
  { key: 'IN_PROGRESS', label: 'En Progreso' },
  { key: 'RESOLVED', label: 'Resueltas' },
  { key: 'CLOSED', label: 'Cerradas' },
];

const BACKEND_PAGE_SIZE = 20;
const FRONTEND_PAGE_SIZE = 5;

// ==================== Trading-style Line Chart (Canvas) ====================

function RealtimeTicketChart({ tickets }: { tickets: SupportTicket[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Agrupar tickets por día para la gráfica (últimos 7 días)
  const chartData = (() => {
    const grouped: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      grouped[key] = 0;
    }
    (tickets || []).forEach((t) => {
      if (!t.createdAt) return;
      const d = new Date(t.createdAt);
      const now2 = new Date();
      const diffDays = Math.floor((now2.getTime() - d.getTime()) / 86400000);
      if (diffDays >= 0 && diffDays <= 6) {
        const key = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
        if (grouped[key] !== undefined) grouped[key]++;
      }
    });
    return Object.entries(grouped).map(([label, value]) => ({ label, value }));
  })();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    if (chartData.length === 0 || chartData.every(d => d.value === 0)) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos de actividad', w / 2, h / 2);
      return;
    }

    const maxVal = Math.max(...chartData.map(d => d.value), 1);
    const values = chartData.map(d => d.value);
    const labels = chartData.map(d => d.label);

    // Grid lines
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal - (maxVal / 4) * i).toString(), padding.left - 8, y + 4);
    }

    // Dibujar línea
    const stepX = chartW / (values.length - 1 || 1);
    ctx.beginPath();
    ctx.strokeStyle = '#1693a5';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    values.forEach((v, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (v / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Área bajo la línea
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(22, 147, 165, 0.2)');
    gradient.addColorStop(1, 'rgba(22, 147, 165, 0.01)');
    ctx.lineTo(padding.left + (values.length - 1) * stepX, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Puntos
    values.forEach((v, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (v / maxVal) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1693a5';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Labels del eje X
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = padding.left + i * stepX;
      ctx.fillText(label, x, h - padding.bottom + 16);
    });
  }, [chartData]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-48"
      style={{ maxHeight: '200px' }}
    />
  );
}

// ==================== Horizontal Bar Chart (Canvas) ====================

function HorizontalBarChart({ data, colors, label }: { data: { label: string; value: number }[]; colors: string[]; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    if (data.length === 0) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos', w / 2, h / 2);
      return;
    }

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const barH = Math.min((h - 20) / data.length - 6, 28);
    const padding = { left: 100, right: 40, top: 10, bottom: 10 };

    data.forEach((d, i) => {
      const y = padding.top + i * (barH + 6);
      const barW = (d.value / maxVal) * (w - padding.left - padding.right);

      // Label
      ctx.fillStyle = '#374151';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(d.label, padding.left - 8, y + barH / 2 + 4);

      // Bar
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.roundRect(padding.left, y, Math.max(barW, 4), barH, [4, 4, 4, 4]);
      ctx.fill();

      // Value
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(d.value.toString(), padding.left + Math.max(barW, 4) + 6, y + barH / 2 + 4);
    });
  }, [data, colors]);

  return (
    <canvas ref={canvasRef} className="w-full" style={{ height: `${Math.max(data.length * 34 + 20, 60)}px` }} />
  );
}

// ==================== Component ====================

export default function CommunicationsPage() {
  const { isSuperAdmin, isRegularAdmin, isSupport } = usePermissions();
  const { user } = useAuthStore();
  const userRole = user?.role?.toString().toUpperCase();
  const canManage = isSuperAdmin || isRegularAdmin || isSupport || ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(userRole || '');

  // Stats
  const { data: stats, isLoading: isLoadingStats } = useSupportTicketStats();

  // Tickets list state
  const [statusFilter, setStatusFilter] = useState<TicketStatus | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | ''>('');
  const [severityFilter, setSeverityFilter] = useState<TicketSeverity | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [backendPage, setBackendPage] = useState(0);
  const [frontendPage, setFrontendPage] = useState(0);

  // Query for chart data (unfiltered - always fetches all tickets for the chart)
  // Usa hook separado con queryKey diferente para evitar conflictos con la lista
  const { data: chartTicketsData } = useSupportTicketsForChart({
    page: 0,
    size: 100,
  });

  // Query for filtered list
  const { data: ticketsData, isLoading: isLoadingTickets, refetch: refetchTickets } = useSupportTickets({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    severity: severityFilter || undefined,
    search: searchQuery || undefined,
    page: backendPage,
    size: BACKEND_PAGE_SIZE,
  });

  const allTickets = ticketsData?.content || [];
  const chartTickets = chartTicketsData?.content || [];
  const totalFrontendPages = Math.ceil(allTickets.length / FRONTEND_PAGE_SIZE);
  const displayedTickets = allTickets.slice(frontendPage * FRONTEND_PAGE_SIZE, (frontendPage + 1) * FRONTEND_PAGE_SIZE);

  useEffect(() => {
    setFrontendPage(0);
  }, [backendPage]);

  const updateStatusMutation = useUpdateSupportTicketStatus();
  const notifyMutation = useNotifyTicketUser();
  const [notifyModal, setNotifyModal] = useState<{ ticketId: number; userName: string; userEmail: string; isGuest?: boolean } | null>(null);
  const [notifyData, setNotifyData] = useState({ subject: '', message: '', sendEmail: true, sendInApp: true });

  const handleUpdateStatus = async (ticketId: number, status: TicketStatus, adminNotes?: string) => {
    try {
      await updateStatusMutation.mutateAsync({ ticketId, request: { status, adminNotes } });
      refetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleNotifyUser = async () => {
    if (!notifyModal) return;
    try {
      await notifyMutation.mutateAsync({ ticketId: notifyModal.ticketId, data: notifyData });
      setNotifyModal(null);
      setNotifyData({ subject: '', message: '', sendEmail: true, sendInApp: true });
    } catch (error) {
      console.error('Error notifying user:', error);
    }
  };

  const openNotifyModal = (ticket: SupportTicket) => {
    const isGuest = !ticket.userId;
    setNotifyData({
      subject: `Re: ${ticket.subject}`,
      message: `Hola ${ticket.userName || 'usuario'},\n\nTu incidencia #${ticket.id} ha sido resuelta.\n\n`,
      sendEmail: true,
      sendInApp: !isGuest,
    });
    setNotifyModal({ ticketId: ticket.id, userName: ticket.userName || '', userEmail: ticket.userEmail || '', isGuest });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendPage(0);
    // React Query refetch automáticamente cuando cambian los parámetros
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setCategoryFilter('');
    setSeverityFilter('');
    setSearchQuery('');
    setBackendPage(0);
  };

  const hasActiveFilters = statusFilter || categoryFilter || severityFilter || searchQuery;

  // Preparar datos para gráficas
  const categoryChartData = stats?.ticketsByCategory
    ? Object.entries(stats.ticketsByCategory)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([key, value]) => ({
          label: CATEGORY_CONFIG[key as TicketCategory]?.label?.split(' ')[0] || key,
          value: value as number,
        }))
    : [];

  const severityChartData = stats?.ticketsBySeverity
    ? Object.entries(stats.ticketsBySeverity)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([key, value]) => ({
          label: SEVERITY_CONFIG[key as TicketSeverity]?.label || key,
          value: value as number,
        }))
    : [];

  const categoryColors = ['#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#14B8A6', '#10B981', '#6B7280'];
  const severityColors = ['#10B981', '#F59E0B', '#EF4444', '#DC2626'];

  // Stats cards
  const statCards = [
    { label: 'Abiertas', value: stats?.openTickets ?? 0, icon: <AlertCircle className="w-5 h-5" />, color: 'text-blue-600 bg-blue-100' },
    { label: 'En Progreso', value: stats?.inProgressTickets ?? 0, icon: <Clock className="w-5 h-5" />, color: 'text-yellow-600 bg-yellow-100' },
    { label: 'Resueltas', value: stats?.resolvedTickets ?? 0, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600 bg-green-100' },
    { label: 'Criticas', value: stats?.criticalTickets ?? 0, icon: <Zap className="w-5 h-5" />, color: 'text-red-600 bg-red-100' },
    { label: 'Total', value: stats?.totalTickets ?? 0, icon: <Activity className="w-5 h-5" />, color: 'text-gray-600 bg-gray-100' },
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Soporte</h1>
          <p className="text-gray-500 mt-1 text-sm">Monitorea y gestiona las incidencias del sistema en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            En vivo
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section - Trading style */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfica de línea - Actividad en tiempo real (ocupa 2 columnas) */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#1693a5]" />
                <h2 className="text-lg font-semibold text-gray-900">Actividad de Tickets</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#1693a5]" />
                  Ultimos 7 dias
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {stats.ticketsLast7Days} esta semana
                </span>
              </div>
            </div>
            <RealtimeTicketChart tickets={chartTickets} />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-4">
                <span className="text-gray-500">
                  Tiempo promedio: <strong className="text-gray-900">{stats.averageResolutionTimeHours > 0 ? `${Math.round(stats.averageResolutionTimeHours)}h` : 'N/A'}</strong>
                </span>
                <span className="text-gray-500">
                  Ultimos 7 dias: <strong className="text-gray-900">{stats.ticketsLast7Days}</strong>
                </span>
                <span className="text-gray-500">
                  Ultimos 30 dias: <strong className="text-gray-900">{stats.ticketsLast30Days}</strong>
                </span>
              </div>
            </div>
          </Card>

          {/* Gráfica de barras horizontales - Categorías */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#1693a5]" />
                <h2 className="text-lg font-semibold text-gray-900">Categorias</h2>
              </div>
            </div>
            <HorizontalBarChart data={categoryChartData} colors={categoryColors} label="Categorias" />
          </Card>
        </div>
      )}

      {/* Tickets List */}
      <Card className="p-6">
        {/* Filters */}
        <div className="space-y-4">
          {/* Search Bar - busca en tiempo real */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setBackendPage(0);
                }}
                placeholder="Buscar por asunto, descripcion, usuario o email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1693a5] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setBackendPage(0); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key || 'all'}
                onClick={() => { setStatusFilter(tab.key); setBackendPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-[#1693a5] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value as TicketCategory | ''); setBackendPage(0); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 bg-white text-gray-700"
            >
              <option value="">Todas las categorias</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
              ))}
            </select>
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value as TicketSeverity | ''); setBackendPage(0); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 bg-white text-gray-700"
            >
              <option value="">Todas las severidades</option>
              {SEVERITIES.map((sev) => (
                <option key={sev} value={sev}>{SEVERITY_CONFIG[sev].label}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <X className="w-3 h-3 inline mr-1" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Tickets Table */}
        <div className="mt-6">
          {isLoadingTickets ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : allTickets.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Asunto</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Usuario</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Categoria</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Severidad</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedTickets.map((ticket: SupportTicket) => (
                      <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-500 font-mono text-xs">#{ticket.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{ticket.subject}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{ticket.description}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900 text-xs">{ticket.userName || '-'}</p>
                          <p className="text-gray-500 text-xs">{ticket.userEmail || '-'}</p>
                          {!ticket.userId && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 mt-0.5">
                              Invitado
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${CATEGORY_CONFIG[ticket.category]?.color || 'text-gray-600 bg-gray-100'}`}>
                            {CATEGORY_CONFIG[ticket.category]?.icon}
                            {CATEGORY_CONFIG[ticket.category]?.label || ticket.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${SEVERITY_CONFIG[ticket.severity]?.color || 'text-gray-600 bg-gray-100'}`}>
                            {SEVERITY_CONFIG[ticket.severity]?.label || ticket.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${STATUS_CONFIG[ticket.status]?.color || 'text-gray-600 bg-gray-100'}`}>
                            {STATUS_CONFIG[ticket.status]?.icon}
                            {STATUS_CONFIG[ticket.status]?.label || ticket.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          }) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {canManage && ticket.status !== 'CLOSED' && (
                            <div className="flex items-center justify-end gap-1">
                              {ticket.status === 'OPEN' && (
                                <button
                                  onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS')}
                                  className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200"
                                  title="Tomar en progreso"
                                >
                                  <Clock className="w-3 h-3" />
                                </button>
                              )}
                              {ticket.status === 'IN_PROGRESS' && (
                                <button
                                  onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                                  className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                                  title="Marcar como resuelto"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                </button>
                              )}
                              {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                                <button
                                  onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}
                                  className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                  title="Cerrar ticket"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                              {ticket.status === 'RESOLVED' && (
                                <>
                                  <button
                                    onClick={() => openNotifyModal(ticket)}
                                    className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                                    title="Notificar al usuario"
                                  >
                                    <Bell className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(ticket.id, 'CLOSED')}
                                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                    title="Cerrar ticket"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Mostrando {displayedTickets.length} de {ticketsData?.totalElements || 0} incidencias
                  {allTickets.length > FRONTEND_PAGE_SIZE && (
                    <span className="text-gray-400 ml-1">
                      (pág. {frontendPage + 1}/{totalFrontendPages} de {BACKEND_PAGE_SIZE} cargadas)
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  {totalFrontendPages > 1 && (
                    <>
                      <button
                        onClick={() => setFrontendPage(p => Math.max(0, p - 1))}
                        disabled={frontendPage === 0}
                        className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 text-xs"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-gray-500 min-w-[40px] text-center">
                        {frontendPage + 1}/{totalFrontendPages}
                      </span>
                      <button
                        onClick={() => setFrontendPage(p => Math.min(totalFrontendPages - 1, p + 1))}
                        disabled={frontendPage >= totalFrontendPages - 1}
                        className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 text-xs"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  {ticketsData && ticketsData.totalPages > 1 && (
                    <>
                      <span className="text-xs text-gray-300 mx-1">|</span>
                      <button
                        onClick={() => setBackendPage(p => Math.max(0, p - 1))}
                        disabled={backendPage === 0}
                        className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 text-xs"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-gray-500 min-w-[40px] text-center">
                        {backendPage + 1}/{ticketsData.totalPages}
                      </span>
                      <button
                        onClick={() => setBackendPage(p => Math.min(ticketsData.totalPages - 1, p + 1))}
                        disabled={backendPage >= ticketsData.totalPages - 1}
                        className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 text-xs"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">No hay incidencias</p>
              <p className="text-sm text-gray-400 mt-1">
                {hasActiveFilters
                  ? 'No se encontraron incidencias con los filtros actuales'
                  : 'No se han reportado incidencias aun'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-[#1693a5] text-white rounded-lg hover:bg-[#137a8a] text-sm"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Notify User Modal */}
      {notifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {notifyModal.isGuest ? 'Notificar al Contacto' : 'Notificar al Usuario'}
                  </h2>
                  <p className="text-sm text-gray-500">{notifyModal.userName} ({notifyModal.userEmail})</p>
                  {notifyModal.isGuest && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                      Invitado
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setNotifyModal(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input
                  type="text"
                  value={notifyData.subject}
                  onChange={(e) => setNotifyData({ ...notifyData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1693a5] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  value={notifyData.message}
                  onChange={(e) => setNotifyData({ ...notifyData, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1693a5] focus:border-transparent resize-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={notifyData.sendEmail}
                    onChange={(e) => setNotifyData({ ...notifyData, sendEmail: e.target.checked })}
                    className="rounded border-gray-300 text-[#1693a5] focus:ring-[#1693a5]"
                  />
                  Enviar por email
                </label>
                {!notifyModal.isGuest && (
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={notifyData.sendInApp}
                      onChange={(e) => setNotifyData({ ...notifyData, sendInApp: e.target.checked })}
                      className="rounded border-gray-300 text-[#1693a5] focus:ring-[#1693a5]"
                    />
                    Notificar en app
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setNotifyModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <Button
                onClick={handleNotifyUser}
                isLoading={notifyMutation.isPending}
                className="bg-[#1693a5] hover:bg-[#137a8a] text-white"
              >
                <Send className="w-4 h-4 mr-1" />
                Enviar notificacion
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
