/**
 * Projects Header Stats Component
 * 6 stat cards grid matching the screenshot exactly
 */

'use client';

import { FolderOpen, Building2, DollarSign, Package, TrendingUp, Home } from 'lucide-react';
import { ProjectsStatsCard } from '../ProjectsStatsCard';
import { ProjectStats } from '@/core/domain/entities/Admin';

interface ProjectsHeaderStatsProps {
  stats?: ProjectStats;
  isLoading?: boolean;
}

export function ProjectsHeaderStats({ stats, isLoading }: ProjectsHeaderStatsProps) {
  // Calculate dynamic values from stats
  const totalProjects = stats?.totalProjects || 0;
  const activeProjects = stats?.activeProjects || 0;
  const totalSales = stats?.totalSalesValue || 0;
  const unitsSold = stats?.totalSoldUnits || 0;
  const conversionRate = stats?.conversionRate || 0;
  const availableUnits = stats?.totalAvailableUnits || 0;

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm animate-pulse">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
            <div className="mt-3">
              <div className="w-20 h-8 bg-gray-200 rounded" />
              <div className="w-24 h-4 bg-gray-200 rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <ProjectsStatsCard
        icon={FolderOpen}
        label="Total Proyectos"
        value={String(stats?.totalProjects ?? 0)}
        colorClass="bg-blue-100 text-blue-600"
      />
      <ProjectsStatsCard
        icon={Building2}
        label="Proyectos Activos"
        value={String(stats?.activeProjects ?? 0)}
        colorClass="bg-green-100 text-green-600"
      />
      <ProjectsStatsCard
        icon={DollarSign}
        label="Ventas Totales"
        value={formatCurrency(totalSales)}
        colorClass="bg-purple-50 text-purple-600"
      />
      <ProjectsStatsCard
        icon={Package}
        label="Unidades Vendidas"
        value={unitsSold.toString()}
        colorClass="bg-orange-50 text-orange-600"
      />
      <ProjectsStatsCard
        icon={TrendingUp}
        label="Tasa de Conversion"
        value={`${conversionRate.toFixed(1)}%`}
        colorClass="bg-teal-50 text-teal-600"
      />
      <ProjectsStatsCard
        icon={Home}
        label="Unidades Disponibles"
        value={availableUnits.toString()}
        colorClass="bg-gray-50 text-gray-600"
      />
    </div>
  );
}
