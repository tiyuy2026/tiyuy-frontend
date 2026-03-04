import { Property } from '@/core/domain/entities/Property';

interface PropertyFeaturesProps {
  property: Property;
}

export function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const features = [
    { icon: '🛏️', label: 'Dormitorios', value: property.bedrooms },
    { icon: '🚿', label: 'Baños', value: property.bathrooms },
    { icon: '🚗', label: 'Estacionamientos', value: property.parkingSpots },
    { icon: '📐', label: 'Área total', value: property.totalArea ? `${property.totalArea} m²` : null },
    { icon: '🏗️', label: 'Área construida', value: property.builtArea ? `${property.builtArea} m²` : null },
    { icon: '🏢', label: 'Piso', value: property.floor },
    { icon: '📅', label: 'Antigüedad', value: property.age ? `${property.age} años` : null },
  ].filter((f) => f.value);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Características</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-3xl">{feature.icon}</span>
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
