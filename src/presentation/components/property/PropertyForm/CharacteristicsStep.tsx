'use client';

import { useState } from 'react';

interface CharacteristicsStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function CharacteristicsStep({ formData, onChange }: CharacteristicsStepProps) {
  const inputClass =
    'w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 bg-gray-50 outline-none';

  // Contadores para dormitorios, baños y estacionamientos
  const Counter = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 20 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    min?: number; 
    max?: number; 
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          disabled={value <= min}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <div className="w-16 text-center">
          <span className="text-lg font-semibold text-gray-900">{value}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          disabled={value >= max}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );

  // Selector de opciones (para baño propio/compartido)
  const OptionSelector = ({ 
    label, 
    value, 
    onChange, 
    options 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void; 
    options: { label: string; value: string }[]; 
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
              value === option.value
                ? 'text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
            }`}
            style={{
              backgroundColor: value === option.value ? '#00a63e' : undefined,
              borderColor: value === option.value ? '#00a63e' : undefined,
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Input para valores monetarios y numéricos
  const NumberInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    suffix = '',
    prefix = '',
    optional = false 
  }: {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    placeholder: string;
    suffix?: string;
    prefix?: string;
    optional?: boolean;
  }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label} {optional && <span className="text-gray-300 font-normal normal-case">(opcional)</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );

  // Renderizar según el tipo de propiedad
  const renderPropertyCharacteristics = () => {
    switch (formData.type) {
      case 'ROOM':
        return (
          <>
            {/* ── CARACTERÍSTICAS DE HABITACIÓN ── */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Características de la habitación
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Especifica los servicios disponibles
              </p>

              <div className="space-y-6">
                <OptionSelector
                  label="Tipo de baño"
                  value={formData.bathroomType || 'PRIVATE'}
                  onChange={(value) => onChange('bathroomType', value)}
                  options={[
                    { label: 'Baño propio', value: 'PRIVATE' },
                    { label: 'Baño compartido', value: 'SHARED' },
                  ]}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NumberInput
                    label="Área de la habitación"
                    value={formData.roomArea || ''}
                    onChange={(value) => onChange('roomArea', value)}
                    placeholder="0"
                    suffix="m²"
                  />
                  <NumberInput
                    label="Capacidad máxima"
                    value={formData.maxCapacity || ''}
                    onChange={(value) => onChange('maxCapacity', value)}
                    placeholder="1"
                    suffix="personas"
                  />
                </div>
              </div>
            </section>
          </>
        );

      case 'LAND':
        return (
          <>
            {/* ── CARACTERÍSTICAS DE TERRENO ── */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Características del terreno
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Especifica las medidas y uso del suelo
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NumberInput
                    label="Área total"
                    value={formData.totalArea || ''}
                    onChange={(value) => onChange('totalArea', value)}
                    placeholder="0"
                    suffix="m²"
                  />
                  <NumberInput
                    label="Frente"
                    value={formData.frontage || ''}
                    onChange={(value) => onChange('frontage', value)}
                    placeholder="0"
                    suffix="ml"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NumberInput
                    label="Fondo"
                    value={formData.depth || ''}
                    onChange={(value) => onChange('depth', value)}
                    placeholder="0"
                    suffix="ml"
                  />
                  <NumberInput
                    label="Perímetro"
                    value={formData.perimeter || ''}
                    onChange={(value) => onChange('perimeter', value)}
                    placeholder="0"
                    suffix="ml"
                  />
                </div>

                <OptionSelector
                  label="Uso de suelo"
                  value={formData.landUse || 'RESIDENTIAL'}
                  onChange={(value) => onChange('landUse', value)}
                  options={[
                    { label: 'Residencial', value: 'RESIDENTIAL' },
                    { label: 'Comercial', value: 'COMMERCIAL' },
                    { label: 'Mixto', value: 'MIXED' },
                  ]}
                />
              </div>
            </section>
          </>
        );

      case 'OFFICE':
        return (
          <>
            {/* ── CARACTERÍSTICAS DE OFICINA ── */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Características de la oficina
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Detalles del espacio comercial
              </p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Counter
                    label="Baños"
                    value={formData.bathrooms || 1}
                    onChange={(value) => onChange('bathrooms', value)}
                    min={0}
                    max={10}
                  />
                  <Counter
                    label="Estacionamientos"
                    value={formData.parking || 0}
                    onChange={(value) => onChange('parking', value)}
                    min={0}
                    max={50}
                  />
                  <Counter
                    label="Pisos de oficina"
                    value={formData.officeFloors || 1}
                    onChange={(value) => onChange('officeFloors', value)}
                    min={1}
                    max={20}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NumberInput
                    label="Área total"
                    value={formData.totalArea || ''}
                    onChange={(value) => onChange('totalArea', value)}
                    placeholder="0"
                    suffix="m²"
                  />
                  <NumberInput
                    label="Área útil"
                    value={formData.usableArea || ''}
                    onChange={(value) => onChange('usableArea', value)}
                    placeholder="0"
                    suffix="m²"
                  />
                </div>

                <OptionSelector
                  label="Tipo de oficina"
                  value={formData.officeType || 'PRIVATE'}
                  onChange={(value) => onChange('officeType', value)}
                  options={[
                    { label: 'Privada', value: 'PRIVATE' },
                    { label: 'Coworking', value: 'COWORKING' },
                    { label: 'Servido', value: 'SERVED' },
                  ]}
                />
              </div>
            </section>
          </>
        );

      default: // APARTMENT, HOUSE, etc.
        return (
          <>
            {/* ── CONTADORES ── */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Características principales
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Indica la cantidad de ambientes disponibles
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Counter
                  label="Dormitorios"
                  value={formData.bedrooms || 1}
                  onChange={(value) => onChange('bedrooms', value)}
                  min={0}
                  max={20}
                />
                <Counter
                  label="Baños"
                  value={formData.bathrooms || 1}
                  onChange={(value) => onChange('bathrooms', value)}
                  min={0}
                  max={20}
                />
                <Counter
                  label="Estacionamientos"
                  value={formData.parking || 0}
                  onChange={(value) => onChange('parking', value)}
                  min={0}
                  max={20}
                />
              </div>
            </section>

            {/* ── MEDIDAS ── */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Medidas del inmueble
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Especifica las áreas en metros cuadrados
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput
                  label="Área total"
                  value={formData.totalArea || ''}
                  onChange={(value) => onChange('totalArea', value)}
                  placeholder="0"
                  suffix="m²"
                />
                <NumberInput
                  label="Área construida"
                  value={formData.builtArea || ''}
                  onChange={(value) => onChange('builtArea', value)}
                  placeholder="0"
                  suffix="m²"
                />
              </div>
            </section>

            {/* ── PISO Y ANTIGÜEDAD (solo para departamentos) ── */}
            {formData.type === 'APARTMENT' && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Detalles del departamento
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  Información adicional específica para departamentos
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <NumberInput
                    label="Piso"
                    value={formData.floor || ''}
                    onChange={(value) => onChange('floor', value)}
                    placeholder="1"
                  />
                  <NumberInput
                    label="Antigüedad (años)"
                    value={formData.age || ''}
                    onChange={(value) => onChange('age', value)}
                    placeholder="0"
                    suffix="años"
                  />
                </div>
              </section>
            )}
          </>
        );
    }
  };

  return (
    <div className="space-y-8">
      {renderPropertyCharacteristics()}

      {/* ── MANTENIMIENTO (no para terrenos) ── */}
      {formData.type !== 'LAND' && (
        <section>
          <NumberInput
            label="Mantenimiento mensual"
            value={formData.maintenanceFee || ''}
            onChange={(value) => onChange('maintenanceFee', value)}
            placeholder="0"
            prefix="$"
            optional={true}
          />
          <p className="text-xs text-gray-400 mt-2">
            Costo mensual de mantenimiento o cuota de condominio
          </p>
        </section>
      )}
    </div>
  );
}
