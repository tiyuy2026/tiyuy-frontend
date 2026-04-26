'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { adminRepository } from '@/infrastructure/repositories/AdminRepository';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectsByStatusChartProps {
  data?: {
    labels: string[];
    values: number[];
  };
}

export function ProjectsByStatusChart({ data }: ProjectsByStatusChartProps) {
  // Fetch real data from backend
  const { data: statusData, isLoading } = useQuery({
    queryKey: ['projectsByStatus'],
    queryFn: () => adminRepository.getProjectsByStatus(),
  });

  const chartData = data || statusData || { labels: [], values: [] };

  const total = chartData.values.reduce((a: number, b: number) => a + b, 0);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
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
        padding: 10,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const chartJsData = {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.values,
        backgroundColor: [
          '#86efac', // green-300 for Publicado
          '#fde047', // yellow-300 for Borrador
          '#a78bfa', // purple-300 for Completado
        ],
        borderColor: [
          '#86efac',
          '#fde047',
          '#a78bfa',
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm h-64 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">Proyectos por estado</h3>
      </div>
      <div className="flex items-center gap-3 flex-1">
        <div className="relative w-24 h-24 flex-shrink-0">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
              Cargando...
            </div>
          ) : (
            <Doughnut options={options} data={chartJsData} />
          )}
        </div>
        <div className="flex-1 space-y-1">
          {chartData.labels
            .map((label: string, index: number) => ({ label, value: chartData.values[index] || 0, index }))
            .sort((a, b) => b.value - a.value)
            .map(({ label, value, index }) => {
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            const colors = [
              { bg: 'bg-green-400', text: 'text-green-500' },
              { bg: 'bg-yellow-400', text: 'text-yellow-500' },
              { bg: 'bg-purple-400', text: 'text-purple-500' },
            ];
            const color = colors[index] || colors[2];
            
            return (
              <div key={label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${color.bg}`} />
                  <span className="text-gray-600">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-medium ${color.text}`}>{value}</span>
                  <span className="text-gray-400">({percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
