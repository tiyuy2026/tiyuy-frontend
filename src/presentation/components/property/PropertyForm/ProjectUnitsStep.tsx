'use client';

import React, { useState } from 'react';
import { PROJECT_UNIT_TYPES, PROJECT_UNIT_TYPES_LABELS, PROJECT_UNIT_STATUS, PROJECT_UNIT_STATUS_LABELS, CURRENCIES } from '@/config/constants';

interface ProjectUnitsStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ProjectUnitsStep({ formData, onChange }: ProjectUnitsStepProps) {
  console.log('ProjectUnitsStep renderizado:', { formData, units: formData.units, currency: formData.currency });
  
  const selectedCurrency = formData.currency || 'PEN';
  const currencySymbol = CURRENCIES[selectedCurrency as keyof typeof CURRENCIES]?.symbol || 'S/';
  
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [currentUnit, setCurrentUnit] = useState({
    unitNumber: '',
    type: 'APARTMENT',
    floor: 1,
    area: 60,
    bedrooms: 1,
    bathrooms: 1,
    parkingSpots: 1,
    price: 150000,
    status: 'AVAILABLE',
    view: '',
  });

  // Actualizar el precio por defecto cuando cambia la moneda
  React.useEffect(() => {
    if (selectedCurrency === 'USD' && currentUnit.price === 150000) {
      setCurrentUnit({ ...currentUnit, price: 50000 }); // Valor por defecto en dólares
    } else if (selectedCurrency === 'PEN' && currentUnit.price === 50000) {
      setCurrentUnit({ ...currentUnit, price: 150000 }); // Valor por defecto en soles
    }
  }, [selectedCurrency]);

  const addUnit = () => {
    const units = formData.units || [];
    onChange('units', [...units, { ...currentUnit, id: Date.now() }]);
    setCurrentUnit({
      unitNumber: '',
      type: 'APARTMENT',
      floor: 1,
      area: 60,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 1,
      price: 150000,
      status: 'AVAILABLE',
      view: '',
    });
    setShowUnitForm(false);
  };

  const removeUnit = (unitId: number) => {
    const units = formData.units || [];
    onChange('units', units.filter((u: any) => u.id !== unitId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Unidades</h3>
        <p className="text-sm text-gray-600 mb-6">
          Define los diferentes tipos de departamentos que ofrece tu proyecto
        </p>
      </div>

      {/* Debug: Mostrar información actual */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Información de depuración</h4>
        <p className="text-sm text-blue-800">Unidades configuradas: {formData.units?.length || 0}</p>
        <p className="text-sm text-blue-800">Formulario tipo: {formData.projectType || formData.type || 'No definido'}</p>
        <p className="text-sm text-blue-800">Moneda seleccionada: {selectedCurrency} ({currencySymbol})</p>
      </div>

      {/* Unidades existentes */}
      {formData.units && formData.units.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Unidades Configuradas</h4>
          <div className="grid gap-4">
            {formData.units.map((unit: any) => (
              <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
                    <div>
                      <span className="text-xs text-gray-500">Unidad</span>
                      <p className="font-medium">{unit.unitNumber}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Tipo</span>
                      <p className="font-medium">{PROJECT_UNIT_TYPES_LABELS[unit.type as keyof typeof PROJECT_UNIT_TYPES_LABELS] || unit.type}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Área</span>
                      <p className="font-medium">{unit.area}m²</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Dormitorios</span>
                      <p className="font-medium">{unit.bedrooms || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Precio</span>
                      <p className="font-medium">{currencySymbol} {unit.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeUnit(unit.id)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón para agregar unidad - siempre visible */}
      <button
        onClick={() => setShowUnitForm(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors"
      >
        + Agregar Tipo de Unidad
      </button>

      {/* Formulario para agregar unidad */}
      {showUnitForm && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Nueva Unidad</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Unidad *
              </label>
              <input
                type="text"
                value={currentUnit.unitNumber}
                onChange={(e) => setCurrentUnit({ ...currentUnit, unitNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: 101-A"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Unidad *
              </label>
              <select
                value={currentUnit.type}
                onChange={(e) => setCurrentUnit({ ...currentUnit, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                {Object.entries(PROJECT_UNIT_TYPES_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Piso *
              </label>
              <input
                type="number"
                value={currentUnit.floor}
                onChange={(e) => setCurrentUnit({ ...currentUnit, floor: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="1"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área (m²) *
              </label>
              <input
                type="number"
                value={currentUnit.area}
                onChange={(e) => setCurrentUnit({ ...currentUnit, area: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="60"
                min="0"
                step="0.01"
                required
              />
            </div>

            {(currentUnit.type === 'APARTMENT' || currentUnit.type === 'PENTHOUSE') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dormitorios *
                </label>
                <input
                  type="number"
                  value={currentUnit.bedrooms}
                  onChange={(e) => setCurrentUnit({ ...currentUnit, bedrooms: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="2"
                  min="0"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Baños *
              </label>
              <input
                type="number"
                value={currentUnit.bathrooms}
                onChange={(e) => setCurrentUnit({ ...currentUnit, bathrooms: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="2"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estacionamientos *
              </label>
              <input
                type="number"
                value={currentUnit.parkingSpots}
                onChange={(e) => setCurrentUnit({ ...currentUnit, parkingSpots: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="1"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio ({currencySymbol}) *
              </label>
              <input
                type="number"
                value={currentUnit.price}
                onChange={(e) => setCurrentUnit({ ...currentUnit, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="150000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vista
              </label>
              <input
                type="text"
                value={currentUnit.view}
                onChange={(e) => setCurrentUnit({ ...currentUnit, view: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Calle principal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                value={currentUnit.status}
                onChange={(e) => setCurrentUnit({ ...currentUnit, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                {Object.entries(PROJECT_UNIT_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={addUnit}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Agregar Unidad
            </button>
            <button
              onClick={() => setShowUnitForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Resumen */}
      {formData.units && formData.units.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">Resumen de Unidades</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-purple-700">Total Tipos:</span>
              <p className="font-semibold text-purple-900">{formData.units.length}</p>
            </div>
            <div>
              <span className="text-purple-700">Área Promedio:</span>
              <p className="font-semibold text-purple-900">
                {Math.round(formData.units.reduce((sum: number, u: any) => sum + u.area, 0) / formData.units.length)}m²
              </p>
            </div>
            <div>
              <span className="text-purple-700">Precio Desde:</span>
              <p className="font-semibold text-purple-900">
                S/ {Math.min(...formData.units.map((u: any) => u.price)).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-purple-700">Precio Hasta:</span>
              <p className="font-semibold text-purple-900">
                S/ {Math.max(...formData.units.map((u: any) => u.price)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
