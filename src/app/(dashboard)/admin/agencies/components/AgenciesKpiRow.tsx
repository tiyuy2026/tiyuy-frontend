'use client';

import { Building2, Users, CreditCard, Tag, DollarSign } from 'lucide-react';

interface AgenciesKpiRowProps {
  totalAgencies: number;
  totalAgents: number;
  activePlans: number;
  activeDiscounts: number;
  revenue30Days: number;
}

export default function AgenciesKpiRow({
  totalAgencies,
  totalAgents,
  activePlans,
  activeDiscounts,
  revenue30Days,
}: AgenciesKpiRowProps) {
  const kpis = [
    {
      icon: Building2,
      value: totalAgencies,
      label: 'Registradas',
      bgColor: 'bg-blue-500',
      iconColor: 'text-white',
    },
    {
      icon: Users,
      value: totalAgents,
      label: 'Agentes totales',
      bgColor: 'bg-emerald-500',
      iconColor: 'text-white',
    },
    {
      icon: CreditCard,
      value: activePlans,
      label: 'Planes activos',
      bgColor: 'bg-purple-500',
      iconColor: 'text-white',
    },
    {
      icon: Tag,
      value: activeDiscounts,
      label: 'Descuentos activos',
      bgColor: 'bg-orange-500',
      iconColor: 'text-white',
    },
    {
      icon: DollarSign,
      value: `$${revenue30Days.toLocaleString()}`,
      label: 'Ingresos últimos 30 días',
      bgColor: 'bg-teal-500',
      iconColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${kpi.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-3xl font-bold text-gray-900 leading-tight">{kpi.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
