'use client';

import { useState } from 'react';
import { Property } from '@/core/domain/entities/Property';
import { PropertyGallery } from '../PropertyGallery/PropertyGallery';
import { PropertyLocation } from './PropertyLocation';
import { PropertyQuickInfo } from './PropertyQuickInfo';
import { useUpdateProperty } from '@/presentation/hooks/useProperties';
import { useAuthStore } from '@/presentation/store/authStore';
import { toast } from 'sonner';

interface PropertyDetailEditableProps {
  property: Property;
  onSave?: () => void;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Departamento',
  HOUSE: 'Casa',
  LAND: 'Terreno',
  OFFICE: 'Oficina',
  COMMERCIAL: 'Local Comercial',
  ROOM: 'Habitación',
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  SALE: 'Venta',
  RENT: 'Alquiler',
};

export function PropertyDetailEditable({ property, onSave }: PropertyDetailEditableProps) {
  const updateMutation = useUpdateProperty();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: property.title || '',
    description: property.description || '',
    price: property.price || 0,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    totalArea: property.totalArea || 0,
    builtArea: property.builtArea || 0,
    parkingSpots: property.parkingSpots || 0,
    maintenanceFee: property.maintenanceFee || 0,
  });

  const [isEditing, setIsEditing] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'USD' ? 'US$' : 'S/';
    return `${symbol} ${price.toLocaleString('es-PE')}`;
  };

  const propertyTypeLabel = PROPERTY_TYPE_LABELS[property.type] || property.type;
  const transactionLabel = TRANSACTION_TYPE_LABELS[property.transactionType] || property.transactionType;

  const locationLine = [
    property.location?.fullAddress,
    property.location?.district,
    property.location?.province,
  ].filter(Boolean).join(', ');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      console.log('🔄 Guardando cambios...', formData);
      console.log('🔄 Property ID:', property.id);
      console.log('🔄 User ID:', user?.id);
      
      const updateData = {
        userId: user?.id || 0,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        totalArea: formData.totalArea,
        builtArea: formData.builtArea,
        parkingSpots: formData.parkingSpots,
        maintenanceFee: formData.maintenanceFee
      };
      
      console.log('🔄 Datos que se enviarán:', updateData);
      
      const result = await updateMutation.mutateAsync({
        id: property.id,
        data: updateData
      });
      
      console.log('✅ Propiedad actualizada:', result);
      toast.success('Propiedad actualizada exitosamente');
      setIsEditing(false);
      
      // Llamar a onSave después de que la actualización fue exitosa
      onSave?.();
    } catch (error) {
      console.error('❌ Error al actualizar la propiedad:', error);
      toast.error('Error al actualizar la propiedad');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 py-6">
        {/* Header con botones de acción */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Propiedad
          </h1>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Modo Edición
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUMNA PRINCIPAL */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1. GALERÍA (solo visual, no editable) */}
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm -mt-2">
              <PropertyGallery media={property.media} coverPhotoUrl={property.coverPhotoUrl} />
            </div>

            {/* 2. TIPO · PRECIO · TÍTULO · DIRECCIÓN */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-400">
                {propertyTypeLabel}
                {formData.totalArea ? ` · ${formData.totalArea} m²` : ''}
                {formData.bedrooms ? ` · ${formData.bedrooms} dormitorio${formData.bedrooms > 1 ? 's' : ''}` : ''}
              </p>

              <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', Number(e.target.value))}
                      className="text-2xl sm:text-3xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 w-48"
                    />
                    <span className="text-base font-normal text-gray-400">
                      {property.currency === 'USD' ? 'US$' : 'S/'}
                      {property.transactionType === 'RENT' && (
                        <span className="ml-1">/ mes</span>
                      )}
                    </span>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {transactionLabel}&nbsp;{formatPrice(formData.price, property.currency)}
                      {property.transactionType === 'RENT' && (
                        <span className="text-base font-normal text-gray-400 ml-1">/ mes</span>
                      )}
                    </h2>
                    {property.pricePerSqm && (
                      <span className="text-sm text-gray-400">
                        · {formatPrice(property.pricePerSqm, property.currency)} / m²
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Título editable */}
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-3 text-lg font-semibold text-gray-800 leading-snug w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Título de la propiedad"
                />
              ) : (
                <h1 className="mt-3 text-lg font-semibold text-gray-800 leading-snug">
                  {formData.title}
                </h1>
              )}

              {locationLine && (
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {locationLine}
                </p>
              )}
            </div>

            {/* 3. Stats editables */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Características</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Dormitorios', field: 'bedrooms', value: formData.bedrooms },
                  { label: 'Baños', field: 'bathrooms', value: formData.bathrooms },
                  { label: 'Área Total (m²)', field: 'totalArea', value: formData.totalArea },
                  { label: 'Área Construida (m²)', field: 'builtArea', value: formData.builtArea },
                  { label: 'Estacionamientos', field: 'parkingSpots', value: formData.parkingSpots },
                  { label: 'Mantenimiento', field: 'maintenanceFee', value: formData.maintenanceFee ? `S/ ${formData.maintenanceFee}` : 'No' },
                ].map(({ label, field, value }) => (
                  <div key={field} className="text-center">
                    <div className="text-sm text-gray-500 mb-1">{label}</div>
                    {isEditing && field !== 'maintenanceFee' ? (
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleInputChange(field, Number(e.target.value))}
                        className="w-full text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 text-center"
                        min="0"
                      />
                    ) : isEditing && field === 'maintenanceFee' ? (
                      <input
                        type="number"
                        value={formData.maintenanceFee || 0}
                        onChange={(e) => handleInputChange('maintenanceFee', Number(e.target.value))}
                        className="w-full text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 text-center"
                        min="0"
                        placeholder="0"
                      />
                    ) : (
                      <div className="text-lg font-semibold text-gray-900">{value}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. DESCRIPCIÓN editable */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Descripción de la propiedad
              </h2>
              {isEditing ? (
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full text-gray-700 leading-relaxed text-sm border border-gray-300 rounded px-3 py-2"
                  placeholder="Describe la propiedad..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {formData.description || 'No hay descripción disponible'}
                </p>
              )}
            </div>

            {/* 5. MAPA (solo visual) */}
            <PropertyLocation location={property.location} propertyId={property.id} />
          </div>

          {/* COLUMNA LATERAL */}
          <div className="lg:col-span-4">
            {/* Información rápida */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <PropertyQuickInfo property={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
