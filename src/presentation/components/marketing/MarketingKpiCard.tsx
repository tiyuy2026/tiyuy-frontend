'use client';

import { TrendingUp } from 'lucide-react';

interface MarketingKpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  subtitle?: string;
  valueColor?: string;
  trend?: string;
  trendUp?: boolean;
}

export function MarketingKpiCard({
  icon,
  iconBg,
  label,
  value,
  subtitle,
  valueColor = 'text-gray-900',
  trend,
  trendUp = true,
}: MarketingKpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`${iconBg} rounded-xl p-3 flex-shrink-0`}>
          {icon}
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            <TrendingUp className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} />
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
