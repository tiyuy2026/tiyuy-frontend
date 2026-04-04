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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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

// Colores corporativos Tiyuy
const COLORS = {
  primary: 'rgb(59, 130, 246)',    // blue-500
  secondary: 'rgb(20, 184, 166)', // teal-500
  accent: 'rgb(139, 92, 246)',    // violet-500
  success: 'rgb(34, 197, 94)',    // green-500
  warning: 'rgb(251, 146, 60)',   // orange-400
  danger: 'rgb(239, 68, 68)',     // red-500
  gray: 'rgb(156, 163, 175)'      // gray-400
};

export function CRMMetricsCharts({ metrics }: CRMMetricsChartsProps) {
  // Gráfico de distribución de interés
  const interestData = {
    labels: ['Alto Interés', 'Interés Medio', 'Bajo Interés'],
    datasets: [{
      data: [
        metrics.highInterestClients,
        metrics.mediumInterestClients,
        metrics.lowInterestClients
      ],
      backgroundColor: [
        COLORS.success,
        COLORS.warning,
        COLORS.gray
      ],
      borderWidth: 0
    }]
  };

  // Gráfico de actividad por módulo
  const moduleActivityData = {
    labels: ['Mensajes', 'Grupos', 'Canales', 'Eventos'],
    datasets: [{
      label: 'Actividad Total',
      data: [
        metrics.messagesExchanged,
        metrics.groupParticipations,
        metrics.channelSubscriptions,
        metrics.eventParticipations
      ],
      backgroundColor: [
        COLORS.primary,
        COLORS.secondary,
        COLORS.accent,
        COLORS.warning
      ],
      borderRadius: 8
    }]
  };

  // Gráfico de clientes activos vs inactivos
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
          padding: 20,
          font: { size: 12 }
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Distribución de Interés */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nivel de Interés</h3>
        <div className="h-48">
          <Doughnut data={interestData} options={chartOptions} />
        </div>
        <div className="mt-4 text-center">
          <span className="text-2xl font-bold text-gray-900">
            {metrics.averageInteractionScore}
          </span>
          <span className="text-sm text-gray-500 ml-2">Score Promedio</span>
        </div>
      </div>

      {/* Actividad por Módulo */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad por Módulo</h3>
        <div className="h-48">
          <Bar data={moduleActivityData} options={barOptions} />
        </div>
        <div className="mt-4 flex justify-around text-sm">
          <div className="text-center">
            <span className="block font-semibold text-blue-600">
              {metrics.messagesExchanged}
            </span>
            <span className="text-gray-500">Mensajes</span>
          </div>
          <div className="text-center">
            <span className="block font-semibold text-teal-600">
              {metrics.groupParticipations}
            </span>
            <span className="text-gray-500">Grupos</span>
          </div>
        </div>
      </div>

      {/* Clientes Activos vs Inactivos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Clientes</h3>
        <div className="h-48">
          <Doughnut data={activeClientsData} options={chartOptions} />
        </div>
        <div className="mt-4 flex justify-around text-sm">
          <div className="text-center">
            <span className="block font-semibold text-green-600">
              {metrics.activeClients}
            </span>
            <span className="text-gray-500">Activos</span>
          </div>
          <div className="text-center">
            <span className="block font-semibold text-gray-500">
              {metrics.inactiveClients}
            </span>
            <span className="text-gray-500">Inactivos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
