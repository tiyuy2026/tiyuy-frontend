'use client';

import React from 'react';

interface ProjectInfoStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ProjectInfoStep({ formData, onChange }: ProjectInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
        <p className="text-sm text-gray-600 mb-6">
          Describe tu proyecto inmobiliario y especifica la fase actual
        </p>
      </div>

      {/* Tipo de Proyecto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Proyecto *
        </label>
        <select
          value={formData.projectType || 'RESIDENTIAL'}
          onChange={(e) => onChange('projectType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="RESIDENTIAL">Residencial</option>
          <option value="COMMERCIAL">Comercial</option>
          <option value="MIXED">Mixto</option>
        </select>
      </div>

      {/* Fase del Proyecto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fase Actual *
        </label>
        <select
          value={formData.phase || 'PRE_SALE'}
          onChange={(e) => onChange('phase', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="PRE_SALE">Preventa</option>
          <option value="SALE">En Venta</option>
          <option value="DELIVERY">Entrega Inmediata</option>
        </select>
      </div>

      {/* Unidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total de Unidades *
          </label>
          <input
            type="number"
            value={formData.totalUnits || ''}
            onChange={(e) => onChange('totalUnits', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="100"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unidades Disponibles *
          </label>
          <input
            type="number"
            value={formData.availableUnits || ''}
            onChange={(e) => onChange('availableUnits', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="80"
            min="0"
          />
        </div>
      </div>

      {/* Precios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Desde (S/) *
          </label>
          <input
            type="number"
            value={formData.priceFrom || ''}
            onChange={(e) => onChange('priceFrom', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="150000"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Hasta (S/)
          </label>
          <input
            type="number"
            value={formData.priceTo || ''}
            onChange={(e) => onChange('priceTo', parseFloat(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="500000"
            min="0"
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción del Proyecto *
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Describe tu proyecto, características principales, amenities, ubicación privilegiada..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Mínimo 50 caracteres para mejor SEO
        </p>
      </div>

      {/* Amenidades */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amenidades Principales
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Piscina', 'Gimnasio', 'Sauna', 'Jacuzzi', 'Sala de Juegos', 
            'Coworking', 'Pet Friendly', 'Seguridad 24/7', 'Recepción',
            'Área Infantil', 'BBQ', 'Terraza Panorámica'
          ].map((amenity) => (
            <label key={amenity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.amenities?.includes(amenity) || false}
                onChange={(e) => {
                  const current = formData.amenities || [];
                  if (e.target.checked) {
                    onChange('amenities', [...current, amenity]);
                  } else {
                    onChange('amenities', current.filter((a: string) => a !== amenity));
                  }
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
