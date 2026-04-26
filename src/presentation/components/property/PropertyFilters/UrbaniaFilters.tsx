'use client';
import { useState } from 'react';
import { LocationSearch } from '@/presentation/components/forms/LocationSearch/LocationSearch';

interface UrbaniaFiltersProps {
  initialFilters: any;
  onFilterChange: (filters: any) => void;
  propertyType: string;
}

const FILTERS_BY_TYPE: Record<string, string[]> = {
  departamentos: ['PRECIO', 'DORMITORIOS', 'BAÑOS', 'ÁREA', 'ESTACIONAMIENTO'],
  casas: ['PRECIO', 'DORMITORIOS', 'BAÑOS', 'ÁREA', 'ESTACIONAMIENTO', 'TERRENO'],
  terrenos: ['PRECIO', 'ÁREA', 'FRONTIS'],
  oficinas: ['PRECIO', 'ÁREA', 'ESTACIONAMIENTO'],
  locales: ['PRECIO', 'ÁREA', 'FRONTIS'],
  habitaciones: ['PRECIO', 'TIPO_BAÑO'],
};

export function UrbaniaFilters({ initialFilters, onFilterChange, propertyType }: UrbaniaFiltersProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [includeMaintenance, setIncludeMaintenance] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const visibleFilters = FILTERS_BY_TYPE[propertyType] || ['PRECIO'];

  const handleSubmit = () => {
    onFilterChange({
      ...filters,
      currency,
      includeMaintenance,
      location: selectedLocation,
    });
  };

  const handleClear = () => {
    setFilters({});
    setIncludeMaintenance(false);
    setSelectedLocation(null);
    onFilterChange({});
  };

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
    setFilters({ ...filters, location });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-5">

      {/* PRECIO */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-900">Precio</span>
          <div className="flex items-center gap-3">
            <button
              className="text-sm text-green-600 hover:text-green-700 font-medium"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
            >
              ≡ {showMoreFilters ? 'Menos filtros' : 'Más filtros'}
            </button>
            <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
              Crear alerta
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currency === 'PEN' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setCurrency('PEN')}
          >
            Soles
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currency === 'USD' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setCurrency('USD')}
          >
            USD
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Desde"
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <input
            type="number"
            placeholder="Hasta"
            className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>

        <label className="flex items-center mt-3 cursor-pointer">
          <input
            type="checkbox"
            className="mr-2 accent-green-600"
            checked={includeMaintenance}
            onChange={(e) => setIncludeMaintenance(e.target.checked)}
          />
          <span className="text-sm text-gray-600">Incluir Mantenimiento en el precio final.</span>
        </label>
      </div>

      <hr className="border-gray-100" />

      {/* DORMITORIOS */}
      {visibleFilters.includes('DORMITORIOS') && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Dormitorios</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
          >
            <option value="">Sin preferencia</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
      )}

      {/* BAÑOS */}
      {visibleFilters.includes('BAÑOS') && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Baños</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
          >
            <option value="">Sin preferencia</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      )}

      {/* TIPO_BAÑO - Solo para habitaciones */}
      {visibleFilters.includes('TIPO_BAÑO') && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Tipo de baño</label>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
              <input
                type="radio"
                name="tipoBano"
                value="propio"
                className="mr-3 accent-green-600"
                onChange={(e) => setFilters({ ...filters, hasPrivateBathroom: true })}
                checked={filters.hasPrivateBathroom === true}
              />
              <span className="text-sm text-gray-700">Baño propio</span>
            </label>
            <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
              <input
                type="radio"
                name="tipoBano"
                value="compartido"
                className="mr-3 accent-green-600"
                onChange={(e) => setFilters({ ...filters, hasPrivateBathroom: false })}
                checked={filters.hasPrivateBathroom === false}
              />
              <span className="text-sm text-gray-700">Baño compartido</span>
            </label>
          </div>
        </div>
      )}

      {/* ÁREA */}
      {visibleFilters.includes('ÁREA') && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Área m²</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Desde"
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
            />
            <input
              type="number"
              placeholder="Hasta"
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* ESTACIONAMIENTO */}
      {visibleFilters.includes('ESTACIONAMIENTO') && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Estacionamiento</label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onChange={(e) => setFilters({ ...filters, parking: e.target.value })}
          >
            <option value="">Sin preferencia</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      )}

      {/* TERRENO */}
      {visibleFilters.includes('TERRENO') && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Terreno m²</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Desde"
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onChange={(e) => setFilters({ ...filters, minLand: e.target.value })}
            />
            <input
              type="number"
              placeholder="Hasta"
              className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onChange={(e) => setFilters({ ...filters, maxLand: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* MÁS FILTROS - FRONTIS */}
      {showMoreFilters && visibleFilters.includes('FRONTIS') && (
        <>
          <hr className="border-gray-100" />
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Frontis (m)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Desde"
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onChange={(e) => setFilters({ ...filters, minFrontis: e.target.value })}
              />
              <input
                type="number"
                placeholder="Hasta"
                className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onChange={(e) => setFilters({ ...filters, maxFrontis: e.target.value })}
              />
            </div>
          </div>
        </>
      )}

      <hr className="border-gray-100" />

      {/* BOTONES */}
      <div className="flex gap-3">
        <button
          className="flex-1 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg font-medium text-gray-800 text-sm transition-colors"
          onClick={handleClear}
        >
          Limpiar
        </button>
        <button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
          onClick={handleSubmit}
        >
          Ver resultados
        </button>
      </div>
    </div>
  );
}
