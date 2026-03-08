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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
        <p className="text-sm text-gray-600 mb-6">
          Describe tu proyecto inmobiliario y especifica la fase actual
        </p>
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
          onChange={(e) => onChange('name', e.target.value)}
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
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Describe las características principales de tu proyecto..."
          required
        />
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
          required
        >
          {Object.entries(PROJECT_TYPES_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
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
          required
        >
          {Object.entries(PROJECT_PHASES_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
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
            required
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
            required
          />
        </div>
      </div>

      {/* Moneda */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Moneda de los Precios *
        </label>
        <select
          value={selectedCurrency}
          onChange={(e) => onChange('currency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        >
          {Object.entries(CURRENCIES).map(([key, currency]) => (
            <option key={key} value={currency.code}>
              {currency.symbol} {currency.name}
            </option>
          ))}
        </select>
      </div>

      {/* Precios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Desde ({currencySymbol}) *
          </label>
          <input
            type="number"
            value={formData.priceFrom || ''}
            onChange={(e) => onChange('priceFrom', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="150000"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Hasta ({currencySymbol})
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
