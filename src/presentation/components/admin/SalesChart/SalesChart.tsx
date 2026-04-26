'use client';

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
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminRepository } from '@/infrastructure/repositories/AdminRepository';

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

interface SalesChartProps {
  data?: {
    labels: string[];
    values: number[];
  };
}

// Custom Dropdown Component
interface DropdownOption {
  value: string;
  label: string;
}

function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar',
}: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition-colors"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs text-left transition-all hover:bg-gradient-to-r hover:from-blue-500 hover:to-teal-500 hover:text-white ${
                  value === option.value
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium'
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const periodOptions: DropdownOption[] = [
  { value: '6months', label: 'Últimos 6 meses' },
  { value: '3months', label: 'Últimos 3 meses' },
  { value: '12months', label: 'Último año' },
];

export function SalesChart({ data }: SalesChartProps) {
  const [period, setPeriod] = useState('6months');

  // Fetch real data from backend
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['salesHistory', period],
    queryFn: () => adminRepository.getProjectsSalesHistory()
  });

  const chartJsData = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: 'Ingresos ($K)',
        data: chartData?.revenue || [],
        borderColor: '#3b82f6',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradient;
        },
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Developers',
        data: chartData?.developers || [],
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        fill: false,
        yAxisID: 'y1',
      },
      {
        label: 'Proyectos',
        data: chartData?.projects || [],
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            return `$${value.toFixed(1)}K`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
          },
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
          },
          callback: (value: any) => {
            return `$${value.toFixed(1)}K`;
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#10b981',
          font: {
            size: 11,
          },
          callback: (value: any) => {
            return value.toString();
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
      },
      point: {
        radius: 0,
        hitRadius: 20,
        hoverRadius: 6,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm h-64 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Resumen de ventas</h3>
        <CustomDropdown
          options={periodOptions}
          value={period}
          onChange={setPeriod}
          placeholder="Últimos 6 meses"
        />
      </div>
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Cargando datos...
          </div>
        ) : (
          <Line options={options} data={chartJsData} />
        )}
      </div>
      {/* Plan Distribution - Show most demanded plan */}
      {chartData?.planDistribution && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Plan más demandado:</div>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(chartData.planDistribution).map(([month, plans]) => {
              const mostDemanded = Object.entries(plans).sort((a, b) => b[1] - a[1])[0];
              if (!mostDemanded) return null;
              return (
                <div key={month} className="flex items-center gap-1 text-xs">
                  <span className="text-gray-600">{month}:</span>
                  <span className="font-medium text-blue-600">{mostDemanded[0]}</span>
                  <span className="text-gray-400">({mostDemanded[1]})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
