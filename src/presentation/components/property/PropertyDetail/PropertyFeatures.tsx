import { Property } from '@/core/domain/entities/Property';

const BedIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12V7a2 2 0 012-2h14a2 2 0 012 2v5M3 12h18M3 12v5h18v-5M7 12V9h4v3M13 12V9h4v3" />
  </svg>
);
const BathIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12a2 2 0 01-2-2V7h4v3M4 12v5a2 2 0 002 2h12a2 2 0 002-2v-5M8 7V5a2 2 0 114 0v2" />
  </svg>
);
const AreaIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);
const CarIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM4 9l2-5h12l2 5M4 9h16M4 9H2m18 0h2" />
  </svg>
);
const FloorIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4h4v4H9z" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface PropertyFeaturesProps {
  property: Property;
}

export function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const features = [
    { icon: <BedIcon />, label: 'Dormitorios', value: property.bedrooms },
    { icon: <BathIcon />, label: 'Baños', value: property.bathrooms },
    { icon: <CarIcon />, label: 'Estacionamientos', value: property.parkingSpots },
    { icon: <AreaIcon />, label: 'Área total', value: property.totalArea ? `${property.totalArea} m²` : null },
    { icon: <AreaIcon />, label: 'Área construida', value: property.builtArea ? `${property.builtArea} m²` : null },
    { icon: <FloorIcon />, label: 'Piso', value: property.floor },
    { icon: <CalendarIcon />, label: 'Antigüedad', value: property.age ? `${property.age} años` : null },
  ].filter((f) => f.value);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Características</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {feature.icon}
            <div>
              <p className="text-xs text-gray-600">{feature.label}</p>
              <p className="text-lg font-semibold text-gray-900">{feature.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
