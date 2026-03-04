'use client';
import { useState } from 'react';

interface PropertyFiltersProps {
  initialFilters: any;
  onFilterChange: (filters: any) => void;
  propertyType: string;  // departamentos/casas/etc
}

const FILTERS_BY_TYPE: Record<string, string[]> = {
  departamentos: ['PRECIO', 'DORMITORIOS', 'BAÑOS', 'ÁREA', 'ESTACIONAMIENTO'],
  casas: ['PRECIO', 'DORMITORIOS', 'BAÑOS', 'ÁREA', 'ESTACIONAMIENTO', 'TERRENO'],
  terrenos: ['PRECIO', 'ÁREA', 'FRONTIS'],
  oficinas: ['PRECIO', 'ÁREA', 'ESTACIONAMIENTO'],
  locales: ['PRECIO', 'ÁREA', 'FRONTIS'],
  habitaciones: ['PRECIO'],  // ← DINÁMICO!
};

export function PropertyFilters({ initialFilters, onFilterChange, propertyType }: PropertyFiltersProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [currency, setCurrency] = useState<'PEN'|'USD'>('PEN');
  const [includeMaintenance, setIncludeMaintenance] = useState(false);

  const visibleFilters = FILTERS_BY_TYPE[propertyType] || ['PRECIO'];

  const handleSubmit = () => {
    onFilterChange({ ...filters, currency, includeMaintenance });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
      {/* PRECIO - TU DISEÑO EXACTO */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Precio</label>
        <div className="flex gap-2 mb-2">
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium ${currency === 'PEN' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setCurrency('PEN')}
          >
            Soles
          </button>
          <button 
            className={`px-4 py-2 rounded-lg text-sm font-medium ${currency === 'USD' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setCurrency('USD')}
          >
            USD
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="number" 
            placeholder="Desde" 
            className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
          />
          <input 
            type="number" 
            placeholder="Hasta" 
            className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
          />
        </div>
        <label className="flex items-center mt-3">
          <input 
            type="checkbox" 
            className="mr-2" 
            checked={includeMaintenance}
            onChange={(e) => setIncludeMaintenance(e.target.checked)}
          />
          <span className="text-sm text-gray-700">Incluir Mantenimiento en el precio final.</span>
        </label>
      </div>

      {/* FILTROS DINÁMICOS */}
      {visibleFilters.includes('DORMITORIOS') && (
        <div>
          <label className="block text-sm font-semibold mb-2">Dormitorios</label>
          <select className="w-full p-3 border rounded-lg">
            <option>1+</option><option>2+</option><option>3+</option>
          </select>
        </div>
      )}

      {visibleFilters.includes('BAÑOS') && (
        <div>
          <label className="block text-sm font-semibold mb-2">Baños</label>
          <select className="w-full p-3 border rounded-lg">
            <option>1+</option><option>2+</option><option>3+</option>
          </select>
        </div>
      )}

      {visibleFilters.includes('ÁREA') && (
        <div>
          <label className="block text-sm font-semibold mb-2">Área (m²)</label>
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" 
              placeholder="Desde" 
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              onChange={(e) => setFilters({...filters, minArea: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Hasta" 
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              onChange={(e) => setFilters({...filters, maxArea: e.target.value})}
            />
          </div>
        </div>
      )}

      {visibleFilters.includes('ESTACIONAMIENTO') && (
        <div>
          <label className="block text-sm font-semibold mb-2">Estacionamiento</label>
          <select className="w-full p-3 border rounded-lg">
            <option>Sin preferencia</option>
            <option>1+</option>
            <option>2+</option>
          </select>
        </div>
      )}

      {visibleFilters.includes('TERRENO') && (
        <div>
          <label className="block text-sm font-semibold mb-2">Terreno (m²)</label>
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number" 
              placeholder="Desde" 
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <input 
              type="number" 
              placeholder="Hasta" 
              className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}

      {visibleFilters.includes('FRONTIS') && (
        <div>
          <label className="block text-sm font-semibold mb-2">Frontis (m)</label>
          <input 
            type="number" 
            placeholder="Mínimo" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button 
          className="flex-1 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg font-medium text-gray-800"
          onClick={() => onFilterChange({})}  // Limpiar
        >
          Limpiar
        </button>
        <button 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          onClick={handleSubmit}
        >
          Ver resultados ({initialFilters.totalElements || 0})
        </button>
      </div>
    </div>
  );
}
