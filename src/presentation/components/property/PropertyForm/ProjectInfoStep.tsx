'use client';

import React from 'react';
import Link from 'next/link';
import { PROJECT_PHASES, PROJECT_PHASES_LABELS, PROJECT_TYPES, PROJECT_TYPES_LABELS, CURRENCIES } from '@/config/constants';

interface ProjectInfoStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ProjectInfoStep({ formData, onChange }: ProjectInfoStepProps) {
  const selectedCurrency = formData.currency || 'PEN';
  const currencySymbol = CURRENCIES[selectedCurrency as keyof typeof CURRENCIES]?.symbol || 'S/';

  // Función para actualizar con logging
  const handleChangeWithLog = (field: string, value: any) => {
    console.log(`📝 ProjectInfoStep - Actualizando ${field}:`, value);
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
        <p className="text-sm text-gray-600 mb-6">
          Describe tu proyecto inmobiliario y especifica la fase actual
        </p>
      </div>

      {/* Tipo de Propiedad y Fase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Propiedad *
          </label>
          <select
            value={formData.projectType || 'RESIDENTIAL'}
            onChange={(e) => handleChangeWithLog('projectType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          >
            {Object.entries(PROJECT_TYPES_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fase Actual *
          </label>
          <select
            value={formData.phase || 'PRE_SALE'}
            onChange={(e) => handleChangeWithLog('phase', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          >
            {Object.entries(PROJECT_PHASES_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Moneda y Rango de Precios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Moneda
          </label>
          <select
            value={formData.currency || 'PEN'}
            onChange={(e) => handleChangeWithLog('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {Object.entries(CURRENCIES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.symbol} ({key})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Desde
          </label>
          <input
            type="number"
            value={formData.priceFrom || 0}
            onChange={(e) => handleChangeWithLog('priceFrom', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Hasta
          </label>
          <input
            type="number"
            value={formData.priceTo || 0}
            onChange={(e) => handleChangeWithLog('priceTo', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Alerta de suscripción inteligente */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13 7c-1.5-1.5-5.5-1.5-7 0L4.5 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-amber-900 mb-1">Plan Desarrollador</h4>
            <p className="text-sm text-amber-800">
              <strong>✅ Primer proyecto GRATIS</strong> (30 días de prueba)
              <br />
              <strong>📈 Proyectos adicionales</strong> requieren suscripción ENTERPRISE
              <br />
              <Link 
                href="/planes"
                className="text-amber-900 underline hover:text-amber-700 font-medium"
              >
                Ver planes y precios
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Nombre del Proyecto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Proyecto *
        </label>
        <input
          type="text"
          value={formData.name || formData.projectName || ''}
          onChange={(e) => handleChangeWithLog('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Ej: Residencial Las Flores"
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción del Proyecto *
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleChangeWithLog('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Describe tu proyecto, características principales, amenities, ubicación privilegiada..."
          required
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
                    handleChangeWithLog('amenities', [...current, amenity]);
                  } else {
                    handleChangeWithLog('amenities', current.filter((a: string) => a !== amenity));
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
