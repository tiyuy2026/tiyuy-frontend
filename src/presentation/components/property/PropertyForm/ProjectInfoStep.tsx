'use client';

import { AlertTriangle } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { PROJECT_PHASES, PROJECT_PHASES_LABELS, PROJECT_TYPES, PROJECT_TYPES_LABELS, CURRENCIES } from '@/config/constants';

interface ProjectInfoStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  validationErrors?: Record<string, string>;
}

export function ProjectInfoStep({ formData, onChange, validationErrors }: ProjectInfoStepProps) {
  const selectedCurrency = formData.currency || 'PEN';
  const currencySymbol = CURRENCIES[selectedCurrency as keyof typeof CURRENCIES]?.symbol || 'S/';
  
  const AMENITY_OPTIONS = [
    'Piscina', 'Gimnasio', 'Sauna', 'Jacuzzi', 'Sala de Juegos', 
    'Coworking', 'Pet Friendly', 'Seguridad 24/7', 'Recepción',
    'Área Infantil', 'BBQ', 'Terraza Panorámica'
  ];

  const handleChangeWithLog = (field: string, value: any) => {
    console.log(`ProjectInfoStep - Actualizando ${field}:`, value);
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Información del Proyecto</h3>
        <p className="text-sm text-gray-500">
          Describe tu proyecto inmobiliario y especifica la fase actual. Los campos con (*) son obligatorios.
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] bg-white outline-none"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] bg-white outline-none"
            required
          >
            {Object.entries(PROJECT_PHASES_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selector de Moneda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Moneda
          </label>
          <select
            value={formData.currency || 'PEN'}
            onChange={(e) => handleChangeWithLog('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] bg-white outline-none"
          >
            {Object.entries(CURRENCIES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.symbol} ({key})
              </option>
            ))}
          </select>
        </div>

        {/* Precio Desde */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Desde ({currencySymbol})
          </label>
          <input
            type="number"
            value={formData.priceFrom ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              handleChangeWithLog('priceFrom', raw === '' ? '' : parseFloat(raw));
            }}
            placeholder="Ej: 150000"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] bg-white text-gray-900 outline-none"
          />
          {validationErrors?.priceFrom && (
            <div className="mt-2 flex items-start gap-2 bg-red-50/50 border-l-4 border-red-500 p-2.5 rounded-r-lg text-sm text-red-700">
              <span className="mt-0.5">⚠️</span>
              <span className="font-medium">{validationErrors.priceFrom}</span>
            </div>
          )}
        </div>

        {/* Precio Hasta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Hasta ({currencySymbol})
          </label>
          <input
            type="number"
            value={formData.priceTo ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              handleChangeWithLog('priceTo', raw === '' ? '' : parseFloat(raw));
            }}
            placeholder="Ej: 300000"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] bg-white text-gray-900 outline-none"
          />
          {validationErrors?.priceTo && (
            <div className="mt-2 flex items-start gap-2 bg-red-50/50 border-l-4 border-red-500 p-2.5 rounded-r-lg text-sm text-red-700">
              <span className="mt-0.5">⚠️</span>
              <span className="font-medium">{validationErrors.priceTo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Alerta de suscripción */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-600" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-amber-950 text-sm">Plan Desarrollador</h4>
            <div className="text-sm text-amber-800 space-y-1 mt-0.5">
              <p>• <strong>Primer proyecto GRATIS</strong> (30 días de prueba)</p>
              <p>• <strong>Proyectos adicionales</strong> requieren suscripción <span className="font-semibold text-[var(--brand-primary)]">ENTERPRISE</span></p>
              <Link 
                href="/plans"
                className="inline-block text-amber-950 underline hover:text-amber-700 font-semibold mt-1"
              >
                Ver planes y precios
              </Link>
            </div>
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
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none ${
            validationErrors?.name ? 'border-red-300 bg-red-50/10' : 'border-gray-300'
          }`}
          placeholder="Ej: Residencial Las Flores"
          required
        />
        {validationErrors?.name && (
          <div className="mt-2 flex items-start gap-2 bg-red-50/50 border-l-4 border-red-500 p-2.5 rounded-r-lg text-sm text-red-700">
            <span className="mt-0.5">⚠️</span>
            <span className="font-medium">{validationErrors.name}</span>
          </div>
        )}
      </div>

      {/* Descripción */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Descripción del Proyecto *
          </label>
          <span className={`text-xs font-medium ${
            (formData.description?.length || 0) < 50 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {formData.description?.length || 0} caracteres (Mín. 50)
          </span>
        </div>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleChangeWithLog('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] outline-none ${
            validationErrors?.description ? 'border-red-300 bg-red-50/10' : 'border-gray-300'
          }`}
          placeholder="Describe tu proyecto, características principales, amenities, ubicación privilegiada..."
          required
        />
        <p className="text-xs text-gray-400 mt-1">
          Una buena descripción mejora significativamente el posicionamiento SEO en los motores de búsqueda.
        </p>
        {validationErrors?.description && (
          <div className="mt-2 flex items-start gap-2 bg-red-50/50 border-l-4 border-red-500 p-2.5 rounded-r-lg text-sm text-red-700">
            <span className="mt-0.5">⚠️</span>
            <span className="font-medium">{validationErrors.description}</span>
          </div>
        )}
      </div>

      {/* Amenidades */}
      <div>
        <div className={`p-4 rounded-xl border transition-colors ${
          validationErrors?.amenities ? 'border-red-200 bg-red-50/5' : 'border-gray-200 bg-gray-50/30'
        }`}>
          <label className="block text-sm font-bold text-gray-800 mb-3">
            Amenidades Principales
          </label>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AMENITY_OPTIONS.map((amenity) => {
              const isChecked = formData.amenities?.includes(amenity) || false;
              return (
                <label 
                  key={amenity} 
                  className={`flex items-center space-x-3 p-2.5 rounded-lg border cursor-pointer select-none transition-all duration-150 ${
                    isChecked 
                      ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)] text-gray-900 font-medium' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const current = formData.amenities || [];
                      if (e.target.checked) {
                        handleChangeWithLog('amenities', [...current, amenity]);
                      } else {
                        handleChangeWithLog('amenities', current.filter((a: string) => a !== amenity));
                      }
                    }}
                    style={{ color: 'var(--brand-primary)' }}
                    className="rounded h-4 w-4 border-gray-300 focus:ring-[var(--brand-primary)] dynamic-checkbox"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        {validationErrors?.amenities && (
          <div className="mt-2 flex items-start gap-2 bg-red-50/50 border-l-4 border-red-500 p-2.5 rounded-r-lg text-sm text-red-700">
            <span className="mt-0.5">⚠️</span>
            <span className="font-medium">{validationErrors.amenities}</span>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .dynamic-checkbox:checked {
          background-color: var(--brand-primary) !important;
          border-color: var(--brand-primary) !important;
        }
      `}</style>
    </div>
  );
}