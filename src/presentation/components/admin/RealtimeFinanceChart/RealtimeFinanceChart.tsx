'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useFinanceHistory } from '@/presentation/hooks/useAdmin';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

type FilterKey = 'revenue' | 'subscriptions' | 'transactions' | 'conversion';

interface FilterConfig {
  key: FilterKey;
  label: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
}

const FILTERS: FilterConfig[] = [
  {
    key: 'revenue',
    label: 'Ingresos',
    color: '#5dae4c',
    gradientFrom: 'rgba(93, 174, 76, 0.25)',
    gradientTo: 'rgba(93, 174, 76, 0.01)',
    cardBg: 'bg-emerald-50',
    cardBorder: 'border-emerald-100',
    cardText: 'text-emerald-700',
  },
  {
    key: 'subscriptions',
    label: 'Suscripciones',
    color: '#3b82f6',
    gradientFrom: 'rgba(59, 130, 246, 0.25)',
    gradientTo: 'rgba(59, 130, 246, 0.01)',
    cardBg: 'bg-blue-50',
    cardBorder: 'border-blue-100',
    cardText: 'text-blue-700',
  },
  {
    key: 'transactions',
    label: 'Transacciones',
    color: '#8b5cf6',
    gradientFrom: 'rgba(139, 92, 246, 0.25)',
    gradientTo: 'rgba(139, 92, 246, 0.01)',
    cardBg: 'bg-violet-50',
    cardBorder: 'border-violet-100',
    cardText: 'text-violet-700',
  },
  {
    key: 'conversion',
    label: 'Conversión',
    color: '#f97316',
    gradientFrom: 'rgba(249, 115, 22, 0.25)',
    gradientTo: 'rgba(249, 115, 22, 0.01)',
    cardBg: 'bg-orange-50',
    cardBorder: 'border-orange-100',
    cardText: 'text-orange-700',
  },
];

const PERIODS = [
  { key: '7D', label: '7 días' },
  { key: '1M', label: '30 días' },
  { key: '3M', label: '3 meses' },
  { key: '6M', label: '6 meses' },
  { key: '1Y', label: '1 año' },
];

function formatCurrency(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString('es-PE');
}

function formatGrowth(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function RealtimeFinanceChart() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('revenue');
  const [activePeriod, setActivePeriod] = useState('1M');

  const { data: history, isLoading } = useFinanceHistory(activePeriod);

  const activeConfig = FILTERS.find((f) => f.key === activeFilter)!;

  const handleFilterChange = useCallback((key: FilterKey) => {
    setActiveFilter(key);
  }, []);

  const handlePeriodChange = useCallback((period: string) => {
    setActivePeriod(period);
  }, []);

  const chartData = useMemo(() => {
    if (!history || !history.labels || history.labels.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: activeConfig.label,
            data: [],
            borderColor: activeConfig.color,
            backgroundColor: activeConfig.gradientFrom,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: activeConfig.color,
            pointHoverBorderWidth: 3,
            borderWidth: 2.5,
          },
        ],
      };
    }

    let data: number[];
    let label: string;

    switch (activeFilter) {
      case 'revenue':
        data = history.revenue;
        label = 'Ingresos (S/)';
        break;
      case 'subscriptions':
        data = history.subscriptions;
        label = 'Suscripciones';
        break;
      case 'transactions':
        data = history.transactions;
        label = 'Transacciones';
        break;
      case 'conversion':
        // Conversion rate: subscriptions / transactions * 100
        data = history.labels.map((_, i) => {
          const txns = history.transactions[i] || 0;
          const subs = history.subscriptions[i] || 0;
          return txns > 0 ? Math.round((subs / txns) * 100 * 10) / 10 : 0;
        });
        label = 'Tasa de Conversión (%)';
        break;
      default:
        data = history.revenue;
        label = 'Ingresos (S/)';
    }

    return {
      labels: history.labels,
      datasets: [
        {
          label,
          data,
          borderColor: activeConfig.color,
          backgroundColor: (ctx: any) => {
            if (!ctx.chart?.chartArea) return activeConfig.gradientFrom;
            const gradient = ctx.chart.ctx.createLinearGradient(
              0,
              ctx.chart.chartArea.top,
              0,
              ctx.chart.chartArea.bottom
            );
            gradient.addColorStop(0, activeConfig.gradientFrom);
            gradient.addColorStop(1, activeConfig.gradientTo);
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: activeConfig.color,
          pointHoverBorderWidth: 3,
          borderWidth: 2.5,
        },
      ],
    };
  }, [history, activeFilter, activeConfig]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: 'easeInOutQuart' as const,
      },
      transitions: {
        active: {
          animation: {
            duration: 400,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          titleColor: '#111827',
          titleFont: { size: 13, weight: 'bold' as const },
          bodyColor: '#374151',
          bodyFont: { size: 12 },
          borderColor: 'rgba(0, 0, 0, 0.06)',
          borderWidth: 1,
          padding: 14,
          cornerRadius: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          displayColors: true,
          boxPadding: 6,
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y;
              if (activeFilter === 'revenue') {
                return ` ${formatCurrency(value)}`;
              }
              if (activeFilter === 'conversion') {
                return ` ${value.toFixed(1)}%`;
              }
              return ` ${formatNumber(value)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#9ca3af',
            font: { size: 11, family: "'Inter', sans-serif" },
            maxTicksLimit: 8,
            maxRotation: 0,
          },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.04)',
            drawBorder: false,
          },
          ticks: {
            color: '#9ca3af',
            font: { size: 11, family: "'Inter', sans-serif" },
            padding: 8,
            callback: (value: any) => {
              if (activeFilter === 'revenue') {
                if (value >= 1000) return `S/ ${(value / 1000).toFixed(1)}K`;
                return `S/ ${value}`;
              }
              if (activeFilter === 'conversion') {
                return `${value}%`;
              }
              if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
              return value;
            },
          },
          border: { display: false },
        },
      },
    }),
    [activeFilter]
  );

  const summary = history?.summary;

  const kpiCards = useMemo(() => {
    if (!summary) {
      return [
        { label: 'Total', value: '—', growth: '—' },
        { label: 'Hoy', value: '—', growth: '—' },
        { label: 'Crecimiento', value: '—', growth: '—' },
      ];
    }

    switch (activeFilter) {
      case 'revenue':
        return [
          {
            label: 'Total Ingresos',
            value: formatCurrency(summary.totalRevenue),
            growth: formatGrowth(summary.revenueGrowth),
          },
          {
            label: 'Hoy',
            value: history?.revenue?.[history.revenue.length - 1]
              ? formatCurrency(history.revenue[history.revenue.length - 1])
              : 'S/ 0.00',
            growth: '—',
          },
          {
            label: 'Crecimiento',
            value: formatGrowth(summary.revenueGrowth),
            growth: summary.revenueGrowth >= 0 ? '↑' : '↓',
          },
        ];
      case 'subscriptions':
        return [
          {
            label: 'Total Suscripciones',
            value: formatNumber(summary.totalSubscriptions),
            growth: formatGrowth(summary.subscriptionsGrowth),
          },
          {
            label: 'Hoy',
            value: history?.subscriptions?.[history.subscriptions.length - 1]
              ? formatNumber(history.subscriptions[history.subscriptions.length - 1])
              : '0',
            growth: '—',
          },
          {
            label: 'Crecimiento',
            value: formatGrowth(summary.subscriptionsGrowth),
            growth: summary.subscriptionsGrowth >= 0 ? '↑' : '↓',
          },
        ];
      case 'transactions':
        return [
          {
            label: 'Total Transacciones',
            value: formatNumber(summary.totalTransactions),
            growth: formatGrowth(summary.transactionsGrowth),
          },
          {
            label: 'Hoy',
            value: history?.transactions?.[history.transactions.length - 1]
              ? formatNumber(history.transactions[history.transactions.length - 1])
              : '0',
            growth: '—',
          },
          {
            label: 'Crecimiento',
            value: formatGrowth(summary.transactionsGrowth),
            growth: summary.transactionsGrowth >= 0 ? '↑' : '↓',
          },
        ];
      case 'conversion':
        const lastVal =
          history?.transactions?.[history.transactions.length - 1] &&
          history?.subscriptions?.[history.subscriptions.length - 1]
            ? history.transactions[history.transactions.length - 1] > 0
              ? (
                  (history.subscriptions[history.subscriptions.length - 1] /
                    history.transactions[history.transactions.length - 1]) *
                  100
                ).toFixed(1)
              : '0.0'
            : '0.0';
        return [
          {
            label: 'Tasa de Conversión',
            value: `${lastVal}%`,
            growth: '—',
          },
          {
            label: 'Suscripciones',
            value: formatNumber(summary.totalSubscriptions),
            growth: formatGrowth(summary.subscriptionsGrowth),
          },
          {
            label: 'Transacciones',
            value: formatNumber(summary.totalTransactions),
            growth: formatGrowth(summary.transactionsGrowth),
          },
        ];
      default:
        return [
          { label: 'Total', value: '—', growth: '—' },
          { label: 'Hoy', value: '—', growth: '—' },
          { label: 'Crecimiento', value: '—', growth: '—' },
        ];
    }
  }, [summary, activeFilter, history]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header with filters */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-gray-50/80 rounded-xl p-1">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1">
            {PERIODS.map((period) => (
              <button
                key={period.key}
                onClick={() => handlePeriodChange(period.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activePeriod === period.key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-6 pt-5 pb-3">
        <div className="grid grid-cols-3 gap-4">
          {kpiCards.map((card, i) => (
            <div
              key={i}
              className={`rounded-xl border ${activeConfig.cardBorder} ${activeConfig.cardBg} p-4 transition-all duration-300`}
            >
              <p className="text-xs font-medium text-gray-500 mb-1">
                {card.label}
              </p>
              <p className={`text-lg font-bold ${activeConfig.cardText}`}>
                {card.value}
              </p>
              {card.growth !== '—' && (
                <p
                  className={`text-xs font-medium mt-0.5 ${
                    parseFloat(card.growth) >= 0
                      ? 'text-emerald-600'
                      : 'text-red-500'
                  }`}
                >
                  {card.growth}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-6 pb-6">
        <div className="h-72">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-7 h-7 border-[3px] rounded-full animate-spin"
                  style={{
                    borderColor: `${activeConfig.color}20`,
                    borderTopColor: activeConfig.color,
                  }}
                />
                <span className="text-sm text-gray-400 font-medium">
                  Cargando datos...
                </span>
              </div>
            </div>
          ) : !history || !history.labels || history.labels.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  No hay datos disponibles para este período
                </p>
              </div>
            </div>
          ) : (
            <Line options={options} data={chartData} />
          )}
        </div>
      </div>
    </div>
  );
}
