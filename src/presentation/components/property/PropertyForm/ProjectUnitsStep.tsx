'use client';

import React, { useState } from 'react';

interface ProjectUnitsStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ProjectUnitsStep({ formData, onChange }: ProjectUnitsStepProps) {
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [currentUnit, setCurrentUnit] = useState({
    type: 'APARTMENT',
    bedrooms: 1,
    bathrooms: 1,
    area: 60,
    price: 150000,
    floor: 1,
  });

  const addUnit = () => {
    const units = formData.units || [];
    onChange('units', [...units, { ...currentUnit, id: Date.now() }]);
    setCurrentUnit({
      type: 'APARTMENT',
      bedrooms: 1,
      bathrooms: 1,
      area: 60,
      price: 150000,
      floor: 1,
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

      {/* Unidades existentes */}
      {formData.units && formData.units.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Unidades Configuradas</h4>
          <div className="grid gap-4">
            {formData.units.map((unit: any) => (
              <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <span className="text-xs text-gray-500">Tipo</span>
                      <p className="font-medium">{unit.type}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Dormitorios</span>
                      <p className="font-medium">{unit.bedrooms}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Área</span>
                      <p className="font-medium">{unit.area}m²</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Precio</span>
                      <p className="font-medium">S/ {unit.price.toLocaleString()}</p>
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

      {/* Botón agregar unidad */}
      <button
        onClick={() => setShowUnitForm(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors"
      >
        + Agregar Tipo de Unidad
      </button>

      {/* Formulario nueva unidad */}
      {showUnitForm && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Nueva Tipo de Unidad</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Unidad
              </label>
              <select
                value={currentUnit.type}
                onChange={(e) => setCurrentUnit({...currentUnit, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="APARTMENT">Departamento</option>
                <option value="PENTHOUSE">Penthouse</option>
                <option value="OFFICE">Oficina</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dormitorios
              </label>
              <input
                type="number"
                value={currentUnit.bedrooms}
                onChange={(e) => setCurrentUnit({...currentUnit, bedrooms: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="0"
                max="6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baños
              </label>
              <input
                type="number"
                value={currentUnit.bathrooms}
                onChange={(e) => setCurrentUnit({...currentUnit, bathrooms: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="1"
                max="6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área (m²)
              </label>
              <input
                type="number"
                value={currentUnit.area}
                onChange={(e) => setCurrentUnit({...currentUnit, area: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (S/)
              </label>
              <input
                type="number"
                value={currentUnit.price}
                onChange={(e) => setCurrentUnit({...currentUnit, price: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Piso Típico
              </label>
              <input
                type="number"
                value={currentUnit.floor}
                onChange={(e) => setCurrentUnit({...currentUnit, floor: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowUnitForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={addUnit}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Agregar Unidad
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
