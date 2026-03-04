import { Property } from '@/core/domain/entities/Property';

interface PropertyQuickInfoProps {
  property: Property;
}

export function PropertyQuickInfo({ property }: PropertyQuickInfoProps) {
  const currentYear = new Date().getFullYear();
  const buildYear = property.constructionYear ?? (property.age ? currentYear - property.age : null);
  const age = buildYear ? `${buildYear} años` : '—';

  const stats: { icon: React.ReactNode; value: string }[] = [];

  if (property.totalArea) {
    stats.push({
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
      value: `${property.totalArea.toLocaleString('es-PE')} m² tot.`,
    });
  }

  if (property.builtArea) {
    stats.push({
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20H5a2 2 0 01-2-2V6a2 2 0 012-2h4m6 16h4a2 2 0 002-2V6a2 2 0 00-2-2h-4m-6 16V4m6 16V4M9 4h6" />
        </svg>
      ),
      value: `${property.builtArea.toLocaleString('es-PE')} m² cub.`,
    });
  }

  if (property.bathrooms != null) {
    stats.push({
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.75V4.5h15v5.25M3 9.75h18v1.5A6.75 6.75 0 0114.25 18H9.75A6.75 6.75 0 013 11.25v-1.5zM8 21v-3m8 3v-3" />
        </svg>
      ),
      value: `${property.bathrooms} baño${property.bathrooms !== 1 ? 's' : ''}`,
    });
  }

  if (property.bedrooms != null) {
    stats.push({
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12V8a1 1 0 011-1h16a1 1 0 011 1v4M3 12h18M3 12v5a1 1 0 001 1h16a1 1 0 001-1v-5M7 7V5a1 1 0 011-1h8a1 1 0 011 1v2" />
        </svg>
      ),
      value: `${property.bedrooms} dorm.`,
    });
  }

  if (property.parkingSpots != null && property.parkingSpots > 0) {
    stats.push({
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v4m0 0h-2m2 0h2" />
        </svg>
      ),
      value: `${property.parkingSpots} estac.`,
    });
  }

  stats.push({
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    value: age,
  });

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-2 text-gray-600">
          <span className="text-gray-400">{stat.icon}</span>
          <span className="text-sm font-semibold text-gray-800">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}