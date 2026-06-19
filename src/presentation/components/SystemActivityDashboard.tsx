'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSystemStats } from '@/presentation/hooks/useSystemStats';
import {
  Users,
  Radio,
  FileText,
  Calendar,
  TrendingUp,
  Activity,
  ArrowUpRight,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  delay?: number;
}

function StatCard({ title, value, subtitle, icon, color, trend, delay = 0 }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    blue: {
      bg: 'from-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/20',
      text: 'text-blue-600',
      glow: 'group-hover:shadow-blue-500/20',
    },
    teal: {
      bg: 'from-teal-500/10 to-teal-600/5',
      border: 'border-teal-500/20',
      text: 'text-teal-600',
      glow: 'group-hover:shadow-teal-500/20',
    },
    cyan: {
      bg: 'from-cyan-500/10 to-cyan-600/5',
      border: 'border-cyan-500/20',
      text: 'text-cyan-600',
      glow: 'group-hover:shadow-cyan-500/20',
    },
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-600/5',
      border: 'border-indigo-500/20',
      text: 'text-indigo-600',
      glow: 'group-hover:shadow-indigo-500/20',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-sm
        transition-all duration-500 ease-out cursor-pointer
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${colors.border} ${colors.glow}
        hover:scale-[1.02] hover:shadow-xl
        ${isHovered ? 'shadow-lg' : 'shadow-sm'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colors.bg} blur-xl`} />
      </div>

      <div className="relative p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
              {title}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-gray-900">
                {value.toLocaleString()}
              </span>
              {typeof trend === 'number' && trend > 0 && (
                <span className={`flex items-center text-[10px] font-medium ${colors.text}`}>
                  <ArrowUpRight className="w-3 h-3" />
                  +{trend}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
          </div>
          
          <div className={`
            p-2 rounded-lg bg-gradient-to-br ${colors.bg} 
            transition-transform duration-300 group-hover:scale-110
            ${colors.border} border flex-shrink-0 ml-2
          `}>
            <div className={`${colors.text}`}>
              {icon}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out`}
            style={{ 
              width: isVisible ? `${Math.min((value / 50) * 100, 100)}%` : '0%',
              background: color === 'blue' ? '#3b82f6' : 
                         color === 'teal' ? '#14b8a6' :
                         color === 'cyan' ? '#06b6d4' : '#6366f1'
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function SystemActivityDashboard() {
  const { data: stats, isLoading, refetch } = useSystemStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = {
    labels: stats?.events.data.map(d => d.label) || [],
    datasets: [
      {
        label: 'Eventos Creados',
        data: stats?.events.data.map(d => d.count) || [],
        fill: true,
        borderColor: '#0ea5e9',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(14, 165, 233, 0.3)');
          gradient.addColorStop(1, 'rgba(14, 165, 233, 0.01)');
          return gradient;
        },
        tension: 0.4,
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y} eventos`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(100, 116, 139, 0.1)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          stepSize: 1,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (!mounted) return null;

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/admin/activities" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg shadow-md group-hover:shadow-lg transition-all">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Actividad del Sistema</h2>
            <p className="text-xs text-gray-500">Análisis de red Tiyuy en tiempo real</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          
          <Link
            href="/admin/activities"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg hover:shadow-md transition-all"
          >
            Ver Actividad Completa
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Single Row Layout */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Chart Section - takes available space */}
        <div className="flex-1 min-w-0">
          <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900">Eventos Creados</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-gray-500">Tiempo real</span>
              </div>
            </div>
            
            <div className="p-3">
              {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-xs text-gray-500">Cargando...</span>
                  </div>
                </div>
              ) : (
                <div className="h-40">
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
            </div>

            {/* Stats below chart */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
              <div className="p-3 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Eventos</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">
                  {stats?.events.total || 0}
                </p>
              </div>
              <div className="p-3 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Hoy</p>
                <p className="text-xl font-bold text-blue-600 mt-0.5">
                  {stats?.events.recentCreated || 0}
                </p>
              </div>
              <div className="p-3 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Tendencia</p>
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-teal-600 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - horizontal on large screens */}
        <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[280px] xl:w-72">
          <StatCard
            title="Grupos"
            value={stats?.groups.total || 0}
            subtitle="Total de grupos"
            icon={<Users className="w-5 h-5" />}
            color="blue"
            trend={stats?.groups.recentGrowth}
            delay={100}
          />

          <StatCard
            title="Canales"
            value={stats?.channels.total || 0}
            subtitle="Total de canales"
            icon={<Radio className="w-5 h-5" />}
            color="teal"
            trend={stats?.channels.recentGrowth}
            delay={200}
          />

          <StatCard
            title="Estados"
            value={stats?.states.total || 0}
            subtitle="Publicaciones activas"
            icon={<FileText className="w-5 h-5" />}
            color="cyan"
            trend={stats?.states.recentGrowth}
            delay={300}
          />
        </div>
      </div>
    </div>
  );
}
