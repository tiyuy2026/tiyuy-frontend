'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminRepository } from '@/infrastructure/repositories/AdminRepository';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartProps {
  period?: string;
}

export function RevenueChart({ period = '6months' }: RevenueChartProps) {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['admin', 'finance', 'history', period],
    queryFn: () => adminRepository.getSubscriptionSalesHistory(period)
  });

  const chartJsData = {
    labels: chartData?.labels || [],
    datasets: [
      {
        label: 'Ingresos (S/)',
        data: chartData?.revenue || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 4,
      }
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
          label: (context: any) => `S/ ${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6', drawBorder: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          callback: (value: any) => `S/ ${value.toLocaleString()}`,
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500 font-medium">Cargando datos financieros...</span>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <div className="text-center">
          <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No hay datos históricos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar options={options} data={chartJsData} />
    </div>
  );
}
