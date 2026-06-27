/**
 * Actividades Recientes - Página independiente
 * Muestra actividades con paginación real y filtro por fecha
 * y gráfica en tiempo real estilo trading
 */

'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useUserActivities, useActivityStats, useDailyActivityFlow } from '@/presentation/hooks/useAnalytics';
import { Spinner } from '@/presentation/components/ui/Spinner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserActivity } from '@/core/domain/entities/Analytics';
import {
  Activity,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Calendar,
} from 'lucide-react';

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  contact: <MessageCircle className="w-4 h-4" />,
  favorite: <Heart className="w-4 h-4" />,
  view: <Eye className="w-4 h-4" />,
  publication: <Megaphone className="w-4 h-4" />,
};

const ACTIVITY_COLORS: Record<string, string> = {
  contact: 'text-blue-600 bg-blue-100',
  favorite: 'text-red-600 bg-red-100',
  view: 'text-green-600 bg-green-100',
  publication: 'text-purple-600 bg-purple-100',
};

const ACTIVITY_LABELS: Record<string, string> = {
  all: 'Todas',
  contact: 'Contacto',
  favorite: 'Favorito',
  view: 'Vista',
  publication: 'Publicación',
};

const CATEGORIES = [
  { key: 'all', label: 'Todas', color: 'bg-gray-500' },
  { key: 'contact', label: 'Contacto', color: 'bg-blue-500' },
  { key: 'favorite', label: 'Favorito', color: 'bg-red-500' },
  { key: 'view', label: 'Vista', color: 'bg-green-500' },
  { key: 'publication', label: 'Publicación', color: 'bg-purple-500' },
];

const PAGE_SIZE = 20;

// ─── Componente de gráfica profesional tipo TradingView ───
function RealtimeActivityChart({ dailyFlow }: { dailyFlow: Array<{ date: string; total: number }> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number; index: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  // Calcular datos de la gráfica
  const chartData = useMemo(() => {
    if (!dailyFlow || dailyFlow.length === 0) return [];
    return dailyFlow.map(d => {
      const date = new Date(d.date + 'T00:00:00');
      const label = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
      return { label, value: d.total };
    });
  }, [dailyFlow]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (chartData.length === 0) return { total: 0, avg: 0, max: 0, min: 0, trend: 0, trendPct: 0 };
    const values = chartData.map(d => d.value);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / values.length);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const trend = values.length >= 2 ? values[values.length - 1] - values[0] : 0;
    const trendPct = values[0] > 0 ? Math.round((trend / values[0]) * 100) : 0;
    return { total, avg, max, min, trend, trendPct };
  }, [chartData]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ w: Math.floor(width), h: Math.floor(height) });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Dibujar gráfica
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.w === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.w * dpr;
    canvas.height = dimensions.h * dpr;
    ctx.scale(dpr, dpr);

    const w = dimensions.w;
    const h = dimensions.h;
    const padding = { top: 24, right: 16, bottom: 28, left: 44 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    if (chartData.length === 0) {
      ctx.fillStyle = '#64748B';
      ctx.font = '13px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos disponibles', w / 2, h / 2);
      return;
    }

    const values = chartData.map(d => d.value);
    const labels = chartData.map(d => d.label);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;
    const paddedMax = maxVal + range * 0.1;
    const paddedMin = Math.max(0, minVal - range * 0.1);
    const paddedRange = paddedMax - paddedMin || 1;

    // ── Fondo con gradiente sutil ──
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#F8FAFC');
    bgGrad.addColorStop(1, '#F1F5F9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // ── Grid horizontal (4 líneas) ──
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      // Labels del eje Y
      const val = Math.round(paddedMax - (paddedRange / 4) * i);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val.toString(), padding.left - 8, y + 3);
    }
    ctx.setLineDash([]);

    const stepX = chartW / (values.length - 1 || 1);

    // ── Área bajo la curva (gradiente más elegante) ──
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - ((v - paddedMin) / paddedRange) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + (values.length - 1) * stepX, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    const areaGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    areaGrad.addColorStop(0, 'rgba(22, 147, 165, 0.25)');
    areaGrad.addColorStop(0.5, 'rgba(22, 147, 165, 0.08)');
    areaGrad.addColorStop(1, 'rgba(22, 147, 165, 0.01)');
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // ── Línea principal (más gruesa y con glow) ──
    // Glow
    ctx.save();
    ctx.shadowColor = 'rgba(22, 147, 165, 0.3)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - ((v - paddedMin) / paddedRange) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#1693a5';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // ── Puntos en los datos ──
    values.forEach((v, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - ((v - paddedMin) / paddedRange) * chartH;
      // Círculo exterior blanco
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#1693a5';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Círculo interior
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#1693a5';
      ctx.fill();
    });

    // ── Labels del eje X ──
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = padding.left + i * stepX;
      ctx.fillText(label, x, h - padding.bottom + 16);
    });

    // ── Tooltip en hover ──
    if (hoveredPoint) {
      const { index } = hoveredPoint;
      const x = padding.left + index * stepX;
      const y = padding.top + chartH - ((values[index] - paddedMin) / paddedRange) * chartH;

      // Línea vertical
      ctx.strokeStyle = 'rgba(22, 147, 165, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Círculo destacado
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(22, 147, 165, 0.15)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#1693a5';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

  }, [chartData, dimensions, hoveredPoint]);

  // Manejar movimiento del mouse
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setMousePos({ x: mouseX, y: mouseY });

    const padding = { top: 24, right: 16, bottom: 28, left: 44 };
    const chartW = dimensions.w - padding.left - padding.right;
    const stepX = chartW / (chartData.length - 1 || 1);
    const index = Math.round((mouseX - padding.left) / stepX);
    if (index >= 0 && index < chartData.length) {
      const x = padding.left + index * stepX;
      const values = chartData.map(d => d.value);
      const maxVal = Math.max(...values, 1);
      const minVal = Math.min(...values, 0);
      const range = maxVal - minVal || 1;
      const paddedMax = maxVal + range * 0.1;
      const paddedMin = Math.max(0, minVal - range * 0.1);
      const paddedRange = paddedMax - paddedMin || 1;
      const y = padding.top + dimensions.h - padding.top - padding.bottom - ((values[index] - paddedMin) / paddedRange) * (dimensions.h - padding.top - padding.bottom);
      setHoveredPoint({ x, y, label: chartData[index].label, value: chartData[index].value, index });
    } else {
      setHoveredPoint(null);
    }
  }, [chartData, dimensions]);

  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
    setMousePos(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.total.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">últimos 7 días</p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Promedio</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.avg.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">actividades/día</p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Máximo</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.max.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">pico del período</p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-3.5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tendencia</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className={`text-xl font-bold ${stats.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {stats.trend >= 0 ? '+' : ''}{stats.trendPct}%
            </p>
            <svg className={`w-4 h-4 ${stats.trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {stats.trend >= 0 ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
              )}
            </svg>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">vs inicio del período</p>
        </div>
      </div>

      {/* ── Gráfica ── */}
      <div ref={containerRef} className="relative w-full" style={{ height: '220px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair rounded-lg"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {/* Tooltip flotante */}
        {hoveredPoint && mousePos && (
          <div
            className="absolute pointer-events-none z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl px-4 py-3 min-w-[140px]"
            style={{
              left: Math.min(mousePos.x + 16, dimensions.w - 160),
              top: Math.max(mousePos.y - 70, 8),
            }}
          >
            <p className="text-xs font-medium text-slate-500">{hoveredPoint.label}</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{hoveredPoint.value.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">actividades</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente de tarjeta de actividad ───
function ActivityCard({ activity }: { activity: UserActivity }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200">
      <div
        className={'w-10 h-10 rounded-full flex items-center justify-center shrink-0 ' + (ACTIVITY_COLORS[activity.type] || 'text-gray-600 bg-gray-100')}
      >
        {ACTIVITY_ICONS[activity.type] || <Activity className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {activity.title}
          </h3>
          <span
            className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ' + (ACTIVITY_COLORS[activity.type] || 'text-gray-600 bg-gray-100')}
          >
            {ACTIVITY_ICONS[activity.type]}
            {ACTIVITY_LABELS[activity.type] || activity.type}
          </span>
        </div>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.details}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(activity.date), "d MMM HH:mm", { locale: es })}
            </span>
            {activity.propertyTitle && (
              <span className="truncate max-w-[150px]">{activity.propertyTitle}</span>
            )}
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-[#1693a5] hover:text-[#127a8a] font-medium transition-colors"
          >
            {showDetails ? 'Ocultar' : 'Detalle'}
          </button>
        </div>

        {showDetails && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400">ID:</span>
              <span className="ml-1 font-medium text-gray-700">{activity.id}</span>
            </div>
            <div>
              <span className="text-gray-400">Estado:</span>
              <span className="ml-1 font-medium text-gray-700">{activity.status}</span>
            </div>
            <div>
              <span className="text-gray-400">Usuario:</span>
              <span className="ml-1 font-medium text-gray-700">{activity.userId}</span>
            </div>
            <div>
              <span className="text-gray-400">Fecha:</span>
              <span className="ml-1 font-medium text-gray-700">
                {format(new Date(activity.date), "d MMM yyyy HH:mm", { locale: es })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ───
export default function ActivitiesPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Solo cambia el filtro cuando el usuario hace clic en "Aplicar"
  const [activeType, setActiveType] = useState<string>('all');
  const [activeStartDate, setActiveStartDate] = useState('');
  const [activeEndDate, setActiveEndDate] = useState('');

  const { data, isLoading, isFetching, error } = useUserActivities(
    activeType === 'all' ? undefined : activeType,
    activeStartDate || undefined,
    activeEndDate || undefined,
    page,
    PAGE_SIZE
  );
  const { data: stats } = useActivityStats();
  const { data: dailyFlow } = useDailyActivityFlow();

  const activities = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  const handleCategoryClick = (type: string) => {
    setSelectedType(type);
    setActiveType(type); // Aplica el filtro inmediatamente
    setPage(0);
  };

  const applyFilter = () => {
    setActiveType(selectedType);
    setActiveStartDate(startDate);
    setActiveEndDate(endDate);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actividades Recientes</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Monitorea en tiempo real las interacciones de los usuarios en la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ' + (isFetching ? 'bg-[#1693a5]/10 text-[#1693a5]' : 'bg-green-50 text-green-700')}
          >
            <span
              className={'w-1.5 h-1.5 rounded-full ' + (isFetching ? 'bg-[#1693a5] animate-pulse' : 'bg-green-500')}
            />
            {isFetching ? 'Actualizando...' : 'En vivo'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Vistas</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {stats?.totalViews || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Contactos</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {stats?.totalContacts || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Favoritos</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {stats?.totalFavorites || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Pendientes</p>
              <p className="text-xl font-bold text-orange-600 mt-0.5">
                {stats?.pendingActions || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica en tiempo real */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1693a5]" />
            <h2 className="text-lg font-semibold text-gray-900">
              Actividad en Tiempo Real
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1693a5]" />
              Actividades
            </span>
          </div>
        </div>
        <RealtimeActivityChart dailyFlow={dailyFlow || []} />
      </div>

      {/* Filtro por categoría y fecha */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => handleCategoryClick(cat.key)}
                className={'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ' + (selectedType === cat.key ? 'bg-[#1693a5] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
              >
                <span className={'w-1.5 h-1.5 rounded-full ' + cat.color} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por fecha */}
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Fecha:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1693a5] focus:border-transparent"
            />
            <span className="text-xs text-gray-400">a</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1693a5] focus:border-transparent"
            />
          </div>
          {(selectedType !== activeType || startDate !== activeStartDate || endDate !== activeEndDate) && (
            <button
              onClick={applyFilter}
              className="ml-auto px-4 py-1.5 bg-[#1693a5] text-white text-xs font-medium rounded-lg hover:bg-[#127a8a] transition-colors shadow-sm"
            >
              Aplicar filtro
            </button>
          )}
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#1693a5]" />
            <h2 className="text-lg font-semibold text-gray-900">
              {ACTIVITY_LABELS[activeType] || 'Todas'} las Actividades
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            {totalElements} registros
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-3 text-sm text-gray-500">Cargando actividades...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-gray-900 font-medium mb-1">Error al cargar actividades</p>
            <p className="text-sm text-gray-500">
              {error instanceof Error ? error.message : 'Error de conexión'}
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium mb-1">Sin actividades</p>
            <p className="text-sm text-gray-500">
              No hay actividades registradas en esta categoría
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity: UserActivity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {/* Paginación real (20 por página) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Mostrando {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalElements)} de{' '}
              {totalElements}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 min-w-[60px] text-center">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
