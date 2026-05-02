/**
 * Projects Stats Card Component
 * Individual stat card with icon, value, label and trend indicator
 */

'use client';

import { LucideIcon } from 'lucide-react';

interface ProjectsStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  colorClass: string;
}

export function ProjectsStatsCard({
  icon: Icon,
  label,
  value,
  trend,
  colorClass,
}: ProjectsStatsCardProps) {
  const getTrendColor = () => {
    if (trend?.direction === 'up') return 'text-green-600';
    if (trend?.direction === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const getTrendIcon = () => {
    if (trend?.direction === 'up') return '↑';
    if (trend?.direction === 'down') return '↓';
    return '−';
  };

  return (
    <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-1.5 rounded-md ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-gray-400 ml-1">vs mes anterior</span>
          </div>
        )}
      </div>
      <div className="mt-1">
        <div className="text-lg font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}
