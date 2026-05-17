'use client';

import { useCentralDiscountSummary } from '@/presentation/hooks/useAdmin';

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
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      ),
    },
    {
      label: 'Activos',
      value: summary?.active ?? 0,
      gradient: 'from-emerald-500 to-teal-600',
      subtitle: 'Vigentes y disponibles',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Inactivos',
      value: summary?.inactive ?? 0,
      gradient: 'from-gray-500 to-slate-600',
      subtitle: 'Desactivados manualmente',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
    {
      label: 'Vencidos',
      value: summary?.expired ?? 0,
      gradient: 'from-amber-500 to-orange-600',
      subtitle: 'Expirados o agotados',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
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
