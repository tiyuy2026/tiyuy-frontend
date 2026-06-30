interface FeaturesStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  propertyId?: number;
}

export function FeaturesStep({ formData, onChange }: FeaturesStepProps) {
  return (
    <div className="space-y-6">
      {/* Dormitorios */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dormitorios *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange('bedrooms', num)}
              className={`
                flex-1 py-3 rounded-lg border-2 font-semibold transition-all
                ${formData.bedrooms === num
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Baños */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Baños *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange('bathrooms', num)}
              className={`
                flex-1 py-3 rounded-lg border-2 font-semibold transition-all
                ${formData.bathrooms === num
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Estacionamientos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estacionamientos
        </label>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange('parkingSpots', num)}
              className={`
                flex-1 py-3 rounded-lg border-2 font-semibold transition-all
                ${formData.parkingSpots === num
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Áreas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área total (m²) *
          </label>
          <input
            type="number"
            value={formData.totalArea}
            onChange={(e) => onChange('totalArea', Number(e.target.value))}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            placeholder="Ej: 120"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área construida (m²)
          </label>
          <input
            type="number"
            value={formData.builtArea}
            onChange={(e) => onChange('builtArea', Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            placeholder="Ej: 110"
          />
        </div>
      </div>

      {/* Piso y Antigüedad */}
      {formData.type === 'APARTMENT' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Piso
            </label>
            <input
              type="number"
              value={formData.floor}
              onChange={(e) => onChange('floor', Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="Ej: 3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Antigüedad (años)
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => onChange('age', Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              placeholder="Ej: 5"
            />
          </div>
        </div>
      )}

      {/* Mantenimiento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mantenimiento mensual (opcional)
        </label>
        <input
          type="number"
          value={formData.maintenanceFee}
          onChange={(e) => onChange('maintenanceFee', Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          placeholder="Ej: 250"
        />
      </div>
    </div>
  );
}
