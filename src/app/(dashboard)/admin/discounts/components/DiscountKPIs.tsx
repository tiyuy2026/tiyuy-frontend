'use client';

import { useCentralDiscountSummary } from '@/presentation/hooks/useAdmin';
import { Ban, CheckCircle, Clock, Tag } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number | string;
  gradient: string;
  icon: React.ReactNode;
  subtitle?: string;
}

function KpiCard({ label, value, gradient, icon, subtitle }: KpiCardProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
      {/* Gradient accent top */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-60`} />
      
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm`}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        </div>
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-400 mt-3 ml-[52px]">{subtitle}</p>
      )}
    </div>
  );
}

export default function DiscountKPIs() {
  const { data: summary, isLoading } = useCentralDiscountSummary();

  const kpis = [
    {
      label: 'Total Descuentos',
      value: summary?.total ?? 0,
      gradient: 'from-indigo-500 to-blue-600',
      subtitle: 'En todo el sistema',
      icon: (
        <Tag className="w-5 h-5" />
      ),
    },
    {
      label: 'Activos',
      value: summary?.active ?? 0,
      gradient: 'from-emerald-500 to-teal-600',
      subtitle: 'Vigentes y disponibles',
      icon: (
        <CheckCircle className="w-5 h-5" />
      ),
    },
    {
      label: 'Inactivos',
      value: summary?.inactive ?? 0,
      gradient: 'from-gray-500 to-slate-600',
      subtitle: 'Desactivados manualmente',
      icon: (
        <Ban className="w-5 h-5" />
      ),
    },
    {
      label: 'Vencidos',
      value: summary?.expired ?? 0,
      gradient: 'from-amber-500 to-orange-600',
      subtitle: 'Expirados o agotados',
      icon: (
        <Clock className="w-5 h-5" />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-xl mb-3" />
            <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
