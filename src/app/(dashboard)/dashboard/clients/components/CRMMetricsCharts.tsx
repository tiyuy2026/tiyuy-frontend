'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { CRMMetrics } from '@/core/domain/entities/CRM';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CRMMetricsChartsProps {
  metrics: CRMMetrics;
}

const COLORS = {
  primary: 'rgb(59, 130, 246)',
  secondary: 'rgb(20, 184, 166)',
  accent: 'rgb(139, 92, 246)',
  success: 'rgb(34, 197, 94)',
  warning: 'rgb(251, 146, 60)',
  danger: 'rgb(239, 68, 68)',
  gray: 'rgb(156, 163, 175)'
};

export function CRMMetricsCharts({ metrics }: CRMMetricsChartsProps) {
  const interestData = {
    labels: ['Alto Interés', 'Interés Medio', 'Bajo Interés'],
    datasets: [{
      data: [
        metrics.highInterestClients,
        metrics.mediumInterestClients,
        metrics.lowInterestClients
      ],
      backgroundColor: [COLORS.success, COLORS.warning, COLORS.gray],
      borderWidth: 0
    }]
  };

  const moduleActivityData = {
    labels: ['Mensajes', 'Grupos', 'Canales', 'Eventos'],
    datasets: [{
      label: 'Actividad',
      data: [
        metrics.messagesExchanged,
        metrics.groupParticipations,
        metrics.channelSubscriptions,
        metrics.eventParticipations
      ],
      backgroundColor: [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.warning],
      borderRadius: 6
    }]
  };

  const activeClientsData = {
    labels: ['Activos', 'Inactivos'],
    datasets: [{
      data: [metrics.activeClients, metrics.inactiveClients],
      backgroundColor: [COLORS.success, COLORS.gray],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 11 }
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Nivel de Interés</h3>
        <div className="h-44">
          <Doughnut data={interestData} options={chartOptions} />
        </div>
        <div className="mt-3 text-center">
          <span className="text-xl font-bold text-gray-900">{metrics.averageInteractionScore}</span>
          <span className="text-xs text-gray-500 ml-1">score promedio</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Actividad por Módulo</h3>
        <div className="h-44">
          <Bar data={moduleActivityData} options={barOptions} />
        </div>
        <div className="mt-3 flex justify-around">
          <div className="text-center">
            <span className="block font-semibold text-blue-600 text-sm">{metrics.messagesExchanged}</span>
            <span className="text-xs text-gray-500">Mensajes</span>
          </div>
          <div className="text-center">
            <span className="block font-semibold text-teal-600 text-sm">{metrics.groupParticipations}</span>
            <span className="text-xs text-gray-500">Grupos</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Estado de Clientes</h3>
        <div className="h-44">
          <Doughnut data={activeClientsData} options={chartOptions} />
        </div>
        <div className="mt-3 flex justify-around">
          <div className="text-center">
            <span className="block font-semibold text-green-600 text-sm">{metrics.activeClients}</span>
            <span className="text-xs text-gray-500">Activos</span>
          </div>
          <div className="text-center">
            <span className="block font-semibold text-gray-500 text-sm">{metrics.inactiveClients}</span>
            <span className="text-xs text-gray-500">Inactivos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
