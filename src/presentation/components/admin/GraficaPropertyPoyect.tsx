/**
 * LiveAreaChart - Componente reutilizable para gráficas de área en tiempo real
 * Estilo "Bolsa de Valores / KPI Financiero" elegante y moderno
 */

'use client';

import React, { useState, useMemo } from 'react';

export type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y';

interface DataPoint {
  date: string;
  value: number;
}

interface LiveAreaChartProps {
  title: string;
  totalValue: number;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  gradientColor?: string;
  lineColor?: string;
  height?: number;
}

export function LiveAreaChart({
  title,
  totalValue,
  period,
  onPeriodChange,
  gradientColor = '#0d9488',
  lineColor = '#0d9488',
  height = 200,
}: LiveAreaChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; value: number } | null>(null);

  // Generar datos de tiempo
  const data = useMemo(() => {
    const today = new Date();
    const dataPoints: DataPoint[] = [];
    
    let points = 30;
    switch (period) {
      case '1D': points = 24; break;
      case '1W': points = 7; break;
      case '1M': points = 30; break;
      case '3M': points = 12; break;
      case '1Y': points = 12; break;
    }
    
    const mesesAbrev = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    for (let i = points; i >= 0; i--) {
      const date = new Date(today);
      let dateLabel = '';
      
      switch (period) {
        case '1D':
          date.setHours(date.getHours() - i);
          dateLabel = date.getHours().toString().padStart(2, '0') + ':00';
          break;
        case '1W':
          date.setDate(date.getDate() - i);
          dateLabel = `${date.getDate()}-${mesesAbrev[date.getMonth()]}`;
          break;
        case '1M':
          date.setDate(date.getDate() - i);
          if (i % 5 === 0 || i === 0 || i === points) {
            dateLabel = `${date.getDate()}-${mesesAbrev[date.getMonth()]}`;
          } else {
            dateLabel = '';
          }
          break;
        case '3M':
          date.setDate(date.getDate() - i * 7);
          if (i % 2 === 0 || i === 0 || i === points) {
            dateLabel = `${date.getDate()}-${mesesAbrev[date.getMonth()]}`;
          } else {
            dateLabel = '';
          }
          break;
        case '1Y':
          date.setMonth(date.getMonth() - i);
          dateLabel = mesesAbrev[date.getMonth()];
          break;
      }
      
      const progress = 1 - (i / (points || 1));
      const noise = (Math.sin(i * 0.5) * 0.1 + Math.cos(i * 0.3) * 0.05);
      const factor = Math.max(0.1, Math.min(1, progress + noise));
      
      dataPoints.push({
        date: dateLabel,
        value: Math.round(totalValue * factor)
      });
    }
    
    return dataPoints;
  }, [totalValue, period]);

  // Meta dinámica
  const goal = useMemo(() => {
    const max = Math.max(...data.map(d => d.value), 1);
    return Math.round(max * 0.9);
  }, [data]);

  // Calcular cambio porcentual (último vs primero)
  const percentChange = useMemo(() => {
    if (data.length < 2) return 0;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    if (first === 0) return 0;
    return ((last - first) / first) * 100;
  }, [data]);

  const isPositive = percentChange >= 0;
  const periods: TimePeriod[] = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.10)] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {/* Indicador EN VIVO */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">En Vivo</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all duration-200 ${
                period === p
                  ? 'bg-[#90EE90] text-green-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Valor Actual + Cambio Porcentual */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-3xl font-bold text-gray-900 tracking-tight">{totalValue}</span>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
          isPositive 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
            : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          <svg className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span>{isPositive ? '+' : ''}{percentChange.toFixed(1)}%</span>
        </div>
      </div>

      {/* Gráfica */}
      <div 
        className="w-full relative"
        style={{ height }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const index = Math.round((x / rect.width) * (data.length - 1));
          if (index >= 0 && index < data.length) {
            const point = data[index];
            setTooltip({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
              date: point.date,
              value: point.value
            });
          }
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={gradientColor} stopOpacity="0.35"/>
              <stop offset="100%" stopColor={gradientColor} stopOpacity="0.02"/>
            </linearGradient>
          </defs>

          {/* Grid lines horizontales sutiles */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="0" y1={40 + i * 40} x2="400" y2={40 + i * 40} stroke="#f9fafb" strokeWidth="1"/>
          ))}

          {/* Línea Meta punteada naranja */}
          {data.length > 0 && (
            <line
              x1="0"
              y1={180 - (goal / Math.max(...data.map(d => d.value), 1)) * 160}
              x2="400"
              y2={180 - (goal / Math.max(...data.map(d => d.value), 1)) * 160}
              stroke="#f97316"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.6"
            />
          )}

          {/* Área bajo la curva */}
          {data.length > 0 && (
            <polygon
              fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
              points={`0,180 ${data.map((d: DataPoint, i: number) => {
                const x = (i / (data.length - 1 || 1)) * 400;
                const maxValue = Math.max(...data.map((d: DataPoint) => d.value), 1);
                const y = 180 - (d.value / maxValue) * 160;
                return `${x},${y}`;
              }).join(' ')} 400,180`}
            />
          )}

          {/* Línea principal */}
          {data.length > 0 && (
            <polyline
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data.map((d: DataPoint, i: number) => {
                const x = (i / (data.length - 1 || 1)) * 400;
                const maxValue = Math.max(...data.map((d: DataPoint) => d.value), 1);
                const y = 180 - (d.value / maxValue) * 160;
                return `${x},${y}`;
              }).join(' ')}
            />
          )}

          {/* Puntos en la línea */}
          {data.map((d: DataPoint, i: number) => {
            const x = (i / (data.length - 1 || 1)) * 400;
            const maxValue = Math.max(...data.map((d: DataPoint) => d.value), 1);
            const y = 180 - (d.value / maxValue) * 160;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2.5"
                fill={lineColor}
                stroke="white"
                strokeWidth="1.5"
                className="hover:r-4 transition-all duration-200"
              />
            );
          })}

          {/* Etiquetas eje X */}
          {data.length > 0 && (
            <>
              <text x="10" y="195" textAnchor="start" className="text-[9px] fill-gray-400 font-medium">{data[0].date || ''}</text>
              <text x="200" y="195" textAnchor="middle" className="text-[9px] fill-gray-400 font-medium">
                {data[Math.floor(data.length / 2)].date || ''}
              </text>
              <text x="390" y="195" textAnchor="end" className="text-[9px] fill-gray-400 font-medium">{data[data.length - 1].date || ''}</text>
            </>
          )}
        </svg>

        {/* Tooltip flotante */}
        {tooltip && (
          <div
            className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-xl shadow-2xl pointer-events-none border border-gray-700"
            style={{
              left: Math.min(Math.max(tooltip.x, 60), 280),
              top: Math.max(tooltip.y - 50, 10),
            }}
          >
            <div className="text-[10px] text-gray-400 font-medium">{tooltip.date}</div>
            <div className="text-lg font-bold text-amber-400">{tooltip.value}</div>
          </div>
        )}

        {/* Label Meta */}
        {data.length > 0 && (
          <div 
            className="absolute right-0 bg-orange-50 text-orange-700 text-[9px] font-bold px-2 py-0.5 rounded-l-md border border-orange-200 border-r-0"
            style={{
              top: `${180 - (goal / Math.max(...data.map((d: DataPoint) => d.value), 1)) * 160 - 10}px`
            }}
          >
            Meta: {goal}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveAreaChart;
