'use client';

import { useCentralDiscountSummary } from '@/presentation/hooks/useAdmin';

const statusItems = [
  {
    label: 'Activos',
    key: 'active' as const,
    bar: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  {
    label: 'Inactivos',
    key: 'inactive' as const,
    bar: 'bg-gray-400',
    text: 'text-gray-600',
  },
  {
    label: 'Vencidos',
    key: 'expired' as const,
    bar: 'bg-amber-500',
    text: 'text-amber-700',
  },
];

export default function DiscountStatusSection() {
  const { data: summary, isLoading } = useCentralDiscountSummary();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse">
        <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const total = (summary?.active ?? 0) + (summary?.inactive ?? 0) + (summary?.expired ?? 0) || 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900">Estados de Descuentos</h3>
        <span className="text-xs text-gray-400 font-medium">{summary?.total ?? 0} total</span>
      </div>

      <div className="space-y-4">
        {statusItems.map((item) => {
          const value = summary?.[item.key] ?? 0;
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

          return (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.bar}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{value}</span>
                  <span className="text-xs text-gray-400 w-8 text-right">{percentage}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.bar} transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
