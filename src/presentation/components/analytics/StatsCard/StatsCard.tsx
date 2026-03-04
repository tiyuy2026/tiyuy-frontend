interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  icon: string;
}

export function StatsCard({ title, value, change, trend, icon }: StatsCardProps) {
  const formatChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-r rounded-lg from-blue-500 to-blue-600 text-white">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
          trend === 'UP' ? 'bg-green-100 text-green-800' :
          trend === 'DOWN' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {change !== undefined && formatChange(change)}
        </div>
      </div>
      
      <div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
}
