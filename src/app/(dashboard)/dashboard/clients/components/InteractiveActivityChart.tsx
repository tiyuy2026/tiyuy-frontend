'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { CRMMetrics } from '@/core/domain/entities/CRM';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface InteractiveActivityChartProps {
  metrics: CRMMetrics;
}

interface ChartDataPoint {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  detail: string;
}

const TREND_CONFIG = {
  up: {
    gradient: ['#10b981', '#10b98100'],
    line: '#059669',
    label: 'Al alza',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    dot: '#10b981',
  },
  down: {
    gradient: ['#ef4444', '#ef444400'],
    line: '#dc2626',
    label: 'A la baja',
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: '#ef4444',
  },
  stable: {
    gradient: ['#6b7280', '#6b728000'],
    line: '#6b7280',
    label: 'Estable',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    dot: '#6b7280',
  },
};

function calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  if (previous === 0) return 'stable';
  const ratio = current / previous;
  if (ratio > 1.1) return 'up';
  if (ratio < 0.9) return 'down';
  return 'stable';
}

export function InteractiveActivityChart({ metrics }: InteractiveActivityChartProps) {
  const chartData: ChartDataPoint[] = useMemo(() => [
    {
      name: 'Mensajes',
      value: metrics.messagesExchanged,
      trend: calculateTrend(metrics.messagesExchanged, Math.max(metrics.messagesExchanged - metrics.interactionsThisWeek, 1)),
      detail: `${metrics.messagesExchanged} intercambiados`
    },
    {
      name: 'Activos',
      value: metrics.activeClients,
      trend: calculateTrend(metrics.activeClients, metrics.totalClients - metrics.activeClients),
      detail: `${((metrics.activeClients / Math.max(metrics.totalClients, 1)) * 100).toFixed(0)}% del total`
    },
    {
      name: 'Alto Interés',
      value: metrics.highInterestClients,
      trend: calculateTrend(metrics.highInterestClients, metrics.mediumInterestClients),
      detail: `${metrics.highInterestClients} leads calificados`
    },
    {
      name: 'Interés Medio',
      value: metrics.mediumInterestClients,
      trend: calculateTrend(metrics.mediumInterestClients, metrics.lowInterestClients),
      detail: 'Requieren seguimiento'
    },
    {
      name: 'Bajo Interés',
      value: metrics.lowInterestClients,
      trend: 'down',
      detail: 'Menor prioridad'
    },
    {
      name: 'En Riesgo',
      value: metrics.clientsAtRisk.length,
      trend: 'down',
      detail: `${metrics.clientsAtRisk.length} clientes por recuperar`
    },
  ], [metrics]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload as ChartDataPoint;
    const trend = TREND_CONFIG[data.trend];
    
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-100 p-4 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">{data.name}</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${trend.bg} ${trend.text}`}>
            {data.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
             data.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {trend.label}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-2xl font-extrabold text-gray-900">{data.value}</span>
          <span className="text-[11px] text-gray-400 font-medium">unidades</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <Activity className="w-3 h-3" />
          <span>{data.detail}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Estadísticas de Clientes</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Pasa el mouse sobre las barras para ver más detalles</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-gray-500">Al alza</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-[11px] text-gray-500">Estable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[11px] text-gray-500">A la baja</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 py-5">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={entry.name} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TREND_CONFIG[entry.trend].gradient[0]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={TREND_CONFIG[entry.trend].gradient[1]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f3f4f6" 
                vertical={false}
              />
              
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                dy={8}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                dx={-5}
              />
              
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#gradient-0)"
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: '#6366f1',
                  fill: '#fff',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer metrics */}
        <div className="mt-4 pt-4 border-t border-gray-50">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{metrics.totalClients}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{metrics.activeClients}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Activos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600">{metrics.highInterestClients + metrics.mediumInterestClients}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Calificados</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-600">{metrics.clientsAtRisk.length}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">En Riesgo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}