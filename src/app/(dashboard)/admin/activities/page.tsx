/**
 * Actividades Recientes - Página independiente
 * Muestra actividades con paginación real y filtro por fecha
 * y gráfica en tiempo real estilo trading
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserActivities, useActivityStats } from '@/presentation/hooks/useAnalytics';
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

// ─── Componente de gráfica en tiempo real estilo trading ───
function RealtimeActivityChart({ activities }: { activities: UserActivity[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // Agrupar actividades por hora para la gráfica
  const chartData = (() => {
    const grouped: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const h = new Date(now.getTime() - i * 3600000);
      const key = h.getHours() + ':00';
      grouped[key] = 0;
    }
    (activities || []).forEach((a) => {
      const d = new Date(a.date);
      const h = d.getHours();
      const key = h + ':00';
      if (grouped[key] !== undefined) grouped[key]++;
    });
    return Object.entries(grouped).map(([label, value]) => ({ label, value }));
  })();

  // Efecto para dibujar la gráfica en el canvas
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

    // Limpiar
    ctx.clearRect(0, 0, w, h);

    if (chartData.length === 0) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos', w / 2, h / 2);
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

    // Área bajo la línea (gradiente)
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
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-48 cursor-crosshair"
        style={{ maxHeight: '200px' }}
      />
      {hoveredPoint && (
        <div
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none z-10"
          style={{
            left: Math.min(hoveredPoint.x + 10, 300),
            top: Math.max(hoveredPoint.y - 40, 0),
          }}
        >
          <p className="font-semibold text-gray-900">{hoveredPoint.label}</p>
          <p className="text-[#1693a5]">{hoveredPoint.value} actividades</p>
        </div>
      )}
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

  const activities = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  const handleCategoryClick = (type: string) => {
    setSelectedType(type);
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
        <RealtimeActivityChart activities={activities} />
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
