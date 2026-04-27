/**
 * LiveAreaChart - Componente reutilizable para gráficas de área en tiempo real
 * Estilo "En Vivo" con tooltip interactivo, línea meta y gradiente
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
    
    // Meses abreviados en español
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
          // Para 1M, mostrar cada 5 días aproximadamente para evitar saturación
          if (i % 5 === 0 || i === 0 || i === points) {
            dateLabel = `${date.getDate()}-${mesesAbrev[date.getMonth()]}`;
          } else {
            dateLabel = '';
          }
          break;
        case '3M':
          date.setDate(date.getDate() - i * 7);
          // Para 3M, mostrar cada 2 semanas
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

  const periods: TimePeriod[] = ['1D', '1W', '1M', '3M', '1Y'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">En Vivo</span>
          </div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded-md transition-all duration-200 ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Valor Actual */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl font-bold text-gray-900">{totalValue}</span>
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
              <stop offset="0%" stopColor={gradientColor} stopOpacity="0.5"/>
              <stop offset="100%" stopColor={gradientColor} stopOpacity="0.05"/>
            </linearGradient>
          </defs>

          {/* Grid lines horizontales */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="0" y1={40 + i * 40} x2="400" y2={40 + i * 40} stroke="#f3f4f6" strokeWidth="1"/>
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
                r="3"
                fill={lineColor}
                stroke="white"
                strokeWidth="1.5"
                className="hover:r-4 transition-all duration-200"
              />
            );
          })}

          {/* Etiquetas eje X - mostrar fechas con formato limpio */}
          {data.length > 0 && (
            <>
              {/* Primera fecha (inicio) */}
              <text x="10" y="195" textAnchor="start" className="text-[9px] fill-gray-400">{data[0].date || ''}</text>
              
              {/* Fecha del medio */}
              <text x="200" y="195" textAnchor="middle" className="text-[9px] fill-gray-400">
                {data[Math.floor(data.length / 2)].date || ''}
              </text>
              
              {/* Última fecha (fin) */}
              <text x="390" y="195" textAnchor="end" className="text-[9px] fill-gray-400">{data[data.length - 1].date || ''}</text>
            </>
          )}
        </svg>

        {/* Tooltip flotante */}
        {tooltip && (
          <div
            className="absolute z-10 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl pointer-events-none"
            style={{
              left: Math.min(Math.max(tooltip.x, 60), 280),
              top: Math.max(tooltip.y - 50, 10),
            }}
          >
            <div className="text-xs text-gray-400">{tooltip.date}</div>
            <div className="text-lg font-bold text-amber-400">{tooltip.value}</div>
          </div>
        )}

        {/* Label Meta */}
        {data.length > 0 && (
          <div 
            className="absolute right-0 bg-orange-100 text-orange-700 text-[10px] font-semibold px-2 py-0.5 rounded"
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
