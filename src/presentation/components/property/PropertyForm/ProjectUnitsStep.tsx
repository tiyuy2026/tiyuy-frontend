'use client';

import React, { useState } from 'react';
import {
  PROJECT_UNIT_TYPES_LABELS,
  PROJECT_UNIT_STATUS_LABELS,
  CURRENCIES,
} from '@/config/constants';

interface ProjectUnitsStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  propertyId?: number;
}

export function ProjectUnitsStep({ formData, onChange, propertyId }: ProjectUnitsStepProps) {
  const selectedCurrency = formData.currency || 'PEN';
  const currencySymbol = CURRENCIES[selectedCurrency as keyof typeof CURRENCIES]?.symbol || 'S/';

  const [mode, setMode] = useState<'individual' | 'group'>('individual');
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const emptyUnit = {
    unitNumber: '',
    type: 'APARTMENT',
    floor: 1,
    area: 60,
    bedrooms: 1,
    bathrooms: 1,
    parkingSpots: 1,
    price: selectedCurrency === 'USD' ? 50000 : 150000,
    status: 'AVAILABLE',
    view: '',
    blueprintImage: '',
    _previewUrl: '', // solo para UI, no se envía al backend
  };

  const emptyGroup = {
    groupName: '',
    unitType: 'APARTMENT',
    floorStart: 1,
    floorEnd: 1,
    area: 60,
    bedrooms: 1,
    bathrooms: 1,
    parkingSpots: 1,
    price: selectedCurrency === 'USD' ? 50000 : 150000,
    status: 'AVAILABLE',
    view: '',
    quantity: 1,
    blueprintImage: '',
    _previewUrl: '', // solo para UI
  };

  const [currentUnit, setCurrentUnit] = useState({ ...emptyUnit });
  const [currentGroup, setCurrentGroup] = useState({ ...emptyGroup });

  // ── IMAGEN: guardar File en formData + ObjectURL para preview ──
  const handleUnitBlueprint = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const tempId = `unit_temp_${Date.now()}`;

    // Guardar File real en formData para subir en paso 5
    onChange('unitBlueprintFiles', {
      ...(formData.unitBlueprintFiles || {}),
      [tempId]: { file, previewUrl },
    });

    // Guardar en el estado local: previewUrl para mostrar, tempId como referencia
    setCurrentUnit(prev => ({
      ...prev,
      blueprintImage: tempId,   // referencia al file
      _previewUrl: previewUrl,  // para mostrar en UI
    }));
  };

  const handleGroupBlueprint = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const tempId = `group_temp_${Date.now()}`;

    onChange('groupBlueprintFiles', {
      ...(formData.groupBlueprintFiles || {}),
      [tempId]: { file, previewUrl },
    });

    setCurrentGroup(prev => ({
      ...prev,
      blueprintImage: tempId,
      _previewUrl: previewUrl,
    }));
  };

  // ── Obtener URL de preview para mostrar ──
  const getPreviewUrl = (blueprintImage: string, type: 'unit' | 'group'): string => {
    if (!blueprintImage) return '';
    // Si ya es URL de S3
    if (blueprintImage.startsWith('http')) return blueprintImage;
    // Si es tempId, buscar en formData
    const files = type === 'unit'
      ? formData.unitBlueprintFiles
      : formData.groupBlueprintFiles;
    return files?.[blueprintImage]?.previewUrl || '';
  };

  // ── AGREGAR UNIDAD ──
  const addUnit = () => {
    if (!currentUnit.unitNumber.trim()) return;
    const units = formData.units || [];
    const newId = Date.now();

    // Mover blueprintFile del tempId al newId real
    const tempId = currentUnit.blueprintImage;
    if (tempId && !tempId.startsWith('http')) {
      const existing = formData.unitBlueprintFiles?.[tempId];
      if (existing) {
        const updated = { ...(formData.unitBlueprintFiles || {}) };
        delete updated[tempId];
        updated[newId] = existing;
        onChange('unitBlueprintFiles', updated);
      }
    }

    const newUnit = {
      id: newId,
      unitNumber: currentUnit.unitNumber,
      type: currentUnit.type,
      floor: currentUnit.floor,
      area: currentUnit.area,
      bedrooms: currentUnit.bedrooms,
      bathrooms: currentUnit.bathrooms,
      parkingSpots: currentUnit.parkingSpots,
      price: currentUnit.price,
      status: currentUnit.status,
      view: currentUnit.view,
      blueprintImage: tempId?.startsWith('http') ? tempId : String(newId),
    };

    const newUnits = [...units, newUnit];
    onChange('units', newUnits);
    onChange('totalUnits', newUnits.length + totalFromGroups());
    onChange('availableUnits', newUnits.length + totalFromGroups());
    setCurrentUnit({ ...emptyUnit });
    setShowUnitForm(false);
  };

  // ── AGREGAR GRUPO ──
  const addGroup = () => {
    if (!currentGroup.groupName.trim()) return;
    const unitGroups = formData.unitGroups || [];
    const newId = Date.now();

    const tempId = currentGroup.blueprintImage;
    if (tempId && !tempId.startsWith('http')) {
      const existing = formData.groupBlueprintFiles?.[tempId];
      if (existing) {
        const updated = { ...(formData.groupBlueprintFiles || {}) };
        delete updated[tempId];
        updated[newId] = existing;
        onChange('groupBlueprintFiles', updated);
      }
    }

    const newGroup = {
      id: newId,
      groupName: currentGroup.groupName,
      unitType: currentGroup.unitType,
      floorStart: currentGroup.floorStart,
      floorEnd: currentGroup.floorEnd,
      area: currentGroup.area,
      bedrooms: currentGroup.bedrooms,
      bathrooms: currentGroup.bathrooms,
      parkingSpots: currentGroup.parkingSpots,
      price: currentGroup.price,
      status: currentGroup.status,
      view: currentGroup.view,
      quantity: currentGroup.quantity,
      blueprintImage: tempId?.startsWith('http') ? tempId : String(newId),
    };

    const newGroups = [...unitGroups, newGroup];
    onChange('unitGroups', newGroups);
    onChange('totalUnits', (formData.units?.length || 0) + newGroups.reduce((s: number, g: any) => s + g.quantity, 0));
    onChange('availableUnits', (formData.units?.length || 0) + newGroups.reduce((s: number, g: any) => s + g.quantity, 0));
    setCurrentGroup({ ...emptyGroup });
    setShowGroupForm(false);
  };

  const totalFromGroups = () =>
    (formData.unitGroups || []).reduce((s: number, g: any) => s + (g.quantity || 0), 0);

  const removeUnit = (id: number) => {
    const newUnits = (formData.units || []).filter((u: any) => u.id !== id);
    onChange('units', newUnits);
    onChange('totalUnits', newUnits.length + totalFromGroups());
  };

  const removeGroup = (id: number) => {
    const newGroups = (formData.unitGroups || []).filter((g: any) => g.id !== id);
    onChange('unitGroups', newGroups);
    onChange('totalUnits', (formData.units?.length || 0) + newGroups.reduce((s: number, g: any) => s + g.quantity, 0));
  };

  const hasUnits = (formData.units?.length || 0) + (formData.unitGroups?.length || 0) > 0;

  // ── COMPONENTE DE IMAGEN REUTILIZABLE ──
  const BlueprintUploader = ({
    previewUrl,
    onFile,
    onClear,
  }: {
    previewUrl: string;
    onFile: (f: File) => void;
    onClear: () => void;
  }) => (
    <div className="space-y-2">
      {previewUrl && (
        <div className="relative w-full h-36 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <img src={previewUrl} alt="Plano" className="w-full h-full object-contain p-1" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >✕</button>
        </div>
      )}
      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {previewUrl ? 'Cambiar plano' : 'Subir plano'}
        <input type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Tipos de Unidades</h3>
        <p className="text-sm text-gray-500 mt-1">
          Define los departamentos de tu proyecto. Usa <strong>grupos</strong> para unidades idénticas (mismo precio, área, piso).
        </p>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-3 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setMode('individual')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
            mode === 'individual' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🏠 Individual
        </button>
        <button
          onClick={() => setMode('group')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
            mode === 'group' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🏗️ Por Grupo
        </button>
      </div>

      {/* ── CARDS DE GRUPOS CONFIGURADOS ── */}
      {formData.unitGroups?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Grupos configurados
          </h4>
          {formData.unitGroups.map((group: any) => {
            const preview = getPreviewUrl(group.blueprintImage, 'group');
            const available = group.status === 'AVAILABLE' ? group.quantity : 0;
            return (
              <div key={group.id}
                className="flex gap-4 border border-purple-200 bg-purple-50 rounded-xl p-4 hover:shadow-sm transition">

                {/* Imagen del plano */}
                <div className="flex-shrink-0 w-28 h-28 bg-white rounded-lg border border-purple-100 overflow-hidden flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="Plano" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-3xl">📐</span>
                  )}
                </div>

                {/* Info del grupo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900">{group.groupName}</p>
                      <p className="text-xs text-purple-600 font-medium mt-0.5">
                        {PROJECT_UNIT_TYPES_LABELS[group.unitType as keyof typeof PROJECT_UNIT_TYPES_LABELS] || group.unitType}
                      </p>
                    </div>
                    <button onClick={() => removeGroup(group.id)}
                      className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">
                      Eliminar
                    </button>
                  </div>

                  {/* Stats en fila */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                    <span>🛏 {group.bedrooms} dorm</span>
                    <span>🚿 {group.bathrooms} baños</span>
                    <span>📐 {group.area} m²</span>
                    <span>🚗 {group.parkingSpots} est.</span>
                    <span>🏢 Pisos {group.floorStart}–{group.floorEnd}</span>
                  </div>

                  {/* Precio + disponibilidad */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-base font-bold text-gray-900">
                      {currencySymbol} {group.price.toLocaleString()}
                    </span>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {available} unidades disponibles
                    </span>
                    <span className="text-xs text-gray-400">
                      ({group.quantity} en total)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CARDS DE UNIDADES INDIVIDUALES ── */}
      {formData.units?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Unidades individuales
          </h4>
          {formData.units.map((unit: any) => {
            const preview = getPreviewUrl(unit.blueprintImage, 'unit');
            return (
              <div key={unit.id}
                className="flex gap-4 border border-gray-200 bg-white rounded-xl p-4 hover:shadow-sm transition">

                <div className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-lg border overflow-hidden flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="Plano" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-2xl">🏠</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900">Unidad {unit.unitNumber}</p>
                      <p className="text-xs text-gray-500">
                        {PROJECT_UNIT_TYPES_LABELS[unit.type as keyof typeof PROJECT_UNIT_TYPES_LABELS]} · Piso {unit.floor}
                      </p>
                    </div>
                    <button onClick={() => removeUnit(unit.id)}
                      className="text-red-400 hover:text-red-600 text-xs">
                      Eliminar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                    {unit.bedrooms && <span>🛏 {unit.bedrooms} dorm</span>}
                    <span>🚿 {unit.bathrooms} baños</span>
                    <span>📐 {unit.area} m²</span>
                  </div>
                  <p className="text-base font-bold text-gray-900 mt-2">
                    {currencySymbol} {unit.price.toLocaleString()}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                      unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                      unit.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {PROJECT_UNIT_STATUS_LABELS[unit.status as keyof typeof PROJECT_UNIT_STATUS_LABELS] || unit.status}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BOTÓN AGREGAR ── */}
      <button
        onClick={() => mode === 'individual' ? setShowUnitForm(true) : setShowGroupForm(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-400 hover:text-purple-600 transition text-sm font-medium"
      >
        + {mode === 'individual' ? 'Agregar unidad individual' : 'Agregar grupo de unidades'}
      </button>

      {/* ── FORM UNIDAD INDIVIDUAL ── */}
      {showUnitForm && (
        <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4">
          <h4 className="font-semibold text-gray-900">Nueva unidad individual</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Field label="Número de unidad *">
              <input type="text" value={currentUnit.unitNumber}
                onChange={e => setCurrentUnit(p => ({ ...p, unitNumber: e.target.value }))}
                className="input" placeholder="Ej: 101-A" />
            </Field>

            <Field label="Tipo *">
              <select value={currentUnit.type}
                onChange={e => setCurrentUnit(p => ({ ...p, type: e.target.value }))}
                className="input">
                {Object.entries(PROJECT_UNIT_TYPES_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Piso *">
              <input type="number" value={currentUnit.floor} min={1}
                onChange={e => setCurrentUnit(p => ({ ...p, floor: +e.target.value || 1 }))}
                className="input" />
            </Field>

            <Field label="Área (m²) *">
              <input type="number" value={currentUnit.area} min={0} step={0.01}
                onChange={e => setCurrentUnit(p => ({ ...p, area: +e.target.value || 0 }))}
                className="input" />
            </Field>

            {['APARTMENT', 'PENTHOUSE', 'DUPLEX'].includes(currentUnit.type) && (
              <Field label="Dormitorios">
                <input type="number" value={currentUnit.bedrooms} min={0}
                  onChange={e => setCurrentUnit(p => ({ ...p, bedrooms: +e.target.value || 0 }))}
                  className="input" />
              </Field>
            )}

            <Field label="Baños *">
              <input type="number" value={currentUnit.bathrooms} min={0}
                onChange={e => setCurrentUnit(p => ({ ...p, bathrooms: +e.target.value || 0 }))}
                className="input" />
            </Field>

            <Field label="Estacionamientos">
              <input type="number" value={currentUnit.parkingSpots} min={0}
                onChange={e => setCurrentUnit(p => ({ ...p, parkingSpots: +e.target.value || 0 }))}
                className="input" />
            </Field>

            <Field label={`Precio (${currencySymbol}) *`}>
              <input type="number" value={currentUnit.price} min={0}
                onChange={e => setCurrentUnit(p => ({ ...p, price: +e.target.value || 0 }))}
                className="input" />
            </Field>

            <Field label="Vista">
              <input type="text" value={currentUnit.view}
                onChange={e => setCurrentUnit(p => ({ ...p, view: e.target.value }))}
                className="input" placeholder="Ej: Calle principal" />
            </Field>

            <Field label="Estado *">
              <select value={currentUnit.status}
                onChange={e => setCurrentUnit(p => ({ ...p, status: e.target.value }))}
                className="input">
                {Object.entries(PROJECT_UNIT_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Imagen de plano" className="md:col-span-2">
              <BlueprintUploader
                previewUrl={currentUnit._previewUrl}
                onFile={handleUnitBlueprint}
                onClear={() => setCurrentUnit(p => ({ ...p, blueprintImage: '', _previewUrl: '' }))}
              />
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={addUnit}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
              Agregar unidad
            </button>
            <button onClick={() => setShowUnitForm(false)}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── FORM GRUPO ── */}
      {showGroupForm && (
        <div className="border border-purple-200 rounded-xl p-5 bg-purple-50 space-y-4">
          <h4 className="font-semibold text-gray-900">Nuevo grupo de unidades</h4>
          <p className="text-xs text-gray-500">
            Un grupo representa N unidades idénticas (mismo tipo, área, precio). Se muestra como 1 tarjeta con contador.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Field label="Nombre del grupo *">
              <input type="text" value={currentGroup.groupName}
                onChange={e => setCurrentGroup(p => ({ ...p, groupName: e.target.value }))}
                className="input" placeholder="Ej: Departamentos 2 dorm - Torre A" />
            </Field>

            <Field label="Tipo de unidad *">
              <select value={currentGroup.unitType}
                onChange={e => setCurrentGroup(p => ({ ...p, unitType: e.target.value }))}
                className="input">
                {Object.entries(PROJECT_UNIT_TYPES_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Piso inicio">
              <input type="number" value={currentGroup.floorStart} min={1}
                onChange={e => setCurrentGroup(p => ({ ...p, floorStart: +e.target.value || 1 }))}
                className="input" />
            </Field>

            <Field label="Piso fin">
              <input type="number" value={currentGroup.floorEnd} min={currentGroup.floorStart}
                onChange={e => setCurrentGroup(p => ({ ...p, floorEnd: +e.target.value || 1 }))}
                className="input" />
            </Field>

            <Field label="Área (m²) *">
              <input type="number" value={currentGroup.area} min={0} step={0.01}
                onChange={e => setCurrentGroup(p => ({ ...p, area: +e.target.value || 60 }))}
                className="input" />
            </Field>

            <Field label="Dormitorios">
              <input type="number" value={currentGroup.bedrooms} min={0}
                onChange={e => setCurrentGroup(p => ({ ...p, bedrooms: +e.target.value || 0 }))}
                className="input" />
            </Field>

            <Field label="Baños *">
              <input type="number" value={currentGroup.bathrooms} min={0}
                onChange={e => setCurrentGroup(p => ({ ...p, bathrooms: +e.target.value || 0 }))}
                className="input" />
            </Field>

            <Field label="Estacionamientos">
              <input type="number" value={currentGroup.parkingSpots} min={0}
                onChange={e => setCurrentGroup(p => ({ ...p, parkingSpots: +e.target.value || 0 }))}
                className="input" />
            </Field>

            <Field label={`Precio (${currencySymbol}) *`}>
              <input type="number" value={currentGroup.price} min={0}
                onChange={e => setCurrentGroup(p => ({ ...p, price: +e.target.value || 0 }))}
                className="input" />
            </Field>

            <Field label="Cantidad de unidades *">
              <input type="number" value={currentGroup.quantity} min={1}
                onChange={e => setCurrentGroup(p => ({ ...p, quantity: +e.target.value || 1 }))}
                className="input" placeholder="Ej: 5" />
              <p className="text-xs text-gray-400 mt-1">
                Se crearán {currentGroup.quantity} unidades con las mismas características
              </p>
            </Field>

            <Field label="Estado *">
              <select value={currentGroup.status}
                onChange={e => setCurrentGroup(p => ({ ...p, status: e.target.value }))}
                className="input">
                {Object.entries(PROJECT_UNIT_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>

            <Field label="Vista">
              <input type="text" value={currentGroup.view}
                onChange={e => setCurrentGroup(p => ({ ...p, view: e.target.value }))}
                className="input" placeholder="Ej: Vista al parque" />
            </Field>

            <Field label="Plano del tipo de unidad" className="md:col-span-2">
              <BlueprintUploader
                previewUrl={currentGroup._previewUrl}
                onFile={handleGroupBlueprint}
                onClear={() => setCurrentGroup(p => ({ ...p, blueprintImage: '', _previewUrl: '' }))}
              />
            </Field>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={addGroup}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
              Agregar grupo
            </button>
            <button onClick={() => setShowGroupForm(false)}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── RESUMEN ── */}
      {hasUnits && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h4 className="font-semibold text-purple-900 mb-3">Resumen</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-purple-600 text-xs">Unidades individuales</p>
              <p className="font-bold text-purple-900 text-lg">{formData.units?.length || 0}</p>
            </div>
            <div>
              <p className="text-purple-600 text-xs">Grupos</p>
              <p className="font-bold text-purple-900 text-lg">{formData.unitGroups?.length || 0}</p>
            </div>
            <div>
              <p className="text-purple-600 text-xs">Total unidades</p>
              <p className="font-bold text-purple-900 text-lg">
                {(formData.units?.length || 0) + totalFromGroups()}
              </p>
            </div>
            <div>
              <p className="text-purple-600 text-xs">Precio desde</p>
              <p className="font-bold text-purple-900 text-lg">
                {currencySymbol} {Math.min(
                  ...(formData.units?.map((u: any) => u.price) || [Infinity]),
                  ...(formData.unitGroups?.map((g: any) => g.price) || [Infinity])
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers de UI ──
function Field({ label, children, className = '' }: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
