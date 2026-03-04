'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProperty, useUpdateProperty } from '@/presentation/hooks/useProperties';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { Property } from '@/core/domain/entities/Property';
import { BasicInfoStep } from './BasicInfoStep';
import { LocationStep } from './LocationStep';
import { CharacteristicsStep } from './CharacteristicsStep';
import { PhotosStep } from './PhotosStep';
import { UpgradePlanModal } from '@/presentation/components/modals/UpgradePlanModal';
import { useMyProperties } from '@/presentation/hooks/useProperties';
import { useAuth } from '@/presentation/hooks/useAuth';
import { toast } from 'sonner';

interface PropertyFormProps {
  property?: Property;
  mode: 'create' | 'edit';
  onStepChange?: (step: number) => void;
}

const STEPS = [
  { number: 1, title: 'Información básica', description: 'Tipo y precio' },
  { number: 2, title: 'Ubicación', description: 'Dirección exacta' },
  { number: 3, title: 'Características', description: 'Detalles del inmueble' },
  { number: 4, title: 'Fotos', description: 'Imágenes del inmueble' },
];

const StepComponents: Record<number, React.ComponentType<any>> = {
  1: BasicInfoStep,
  2: LocationStep,
  3: CharacteristicsStep,
  4: PhotosStep,
};

export function PropertyForm({ property, mode, onStepChange }: PropertyFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [createdPropertyId, setCreatedPropertyId] = useState<number | undefined>(property?.id);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data: myPropertiesData } = useMyProperties();
  const { data: activeSubscription } = useActiveSubscription();

  const publishedCount =
    myPropertiesData?.properties?.filter((p: any) => p.status === 'PUBLISHED').length || 0;

  const canPublish = useMemo(() => {
    if (activeSubscription) return activeSubscription.remainingPublications > 0;
    return publishedCount < 1;
  }, [activeSubscription, publishedCount]);

  const [formData, setFormData] = useState({
    type: property?.type || 'APARTMENT',
    transactionType: property?.transactionType || 'SALE',
    price: property?.price || 0,
    currency: property?.currency || 'PEN',
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    parking: property?.parkingSpots || 0,
    totalArea: property?.totalArea || 0,
    builtArea: property?.builtArea || 0,
    floor: property?.floor || 1,
    age: property?.age || 0,
    maintenanceFee: property?.maintenanceFee || 0,
    description: property?.description || '',
    fullAddress: property?.location?.fullAddress || '',
    region: property?.location?.region || 'Lima',
    province: property?.location?.province || 'Lima',
    district: property?.location?.district || '',
    urbanization: property?.location?.urbanization || '',
    street: property?.location?.street || '',
    streetNumber: property?.location?.streetNumber || '',
    apartmentNumber: property?.location?.apartmentNumber || '',
    latitude: property?.location?.latitude || 0,
    longitude: property?.location?.longitude || 0,
    showExactAddress: property?.location?.showExactAddress ?? true,
  });

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();

  const goToStep = (step: number) => {
    setCurrentStep(step);
    onStepChange?.(step);
  };

  const handleChange = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleNext = () => {
    if (mode === 'create' && currentStep === 3 && !createdPropertyId) {
      // Crear propiedad en el paso 3 para poder subir fotos en el paso 4
      const createData = prepareCreateData(formData);
      
      createMutation.mutate(createData, {
        onSuccess: (result) => { 
          setCreatedPropertyId(result.id); 
          goToStep(4); 
        },
        onError: (error: any) => {
          toast.error('Error al crear la propiedad');
        },
      });
      return;
    }
    goToStep(Math.min(currentStep + 1, 4));
  };

  // Función para preparar datos según el tipo de propiedad
  const prepareCreateData = (data: any) => {
    const baseData = {
      type: data.type,
      transactionType: data.transactionType,
      price: Number(data.price),
      currency: data.currency,
      description: data.description,
      fullAddress: data.fullAddress,
      region: data.region,
      province: data.province,
      district: data.district,
      latitude: Number(data.latitude) || undefined,
      longitude: Number(data.longitude) || undefined,
      showExactAddress: Boolean(data.showExactAddress),
    };

    // Agregar campos según el tipo de propiedad
    switch (data.type) {
      case 'ROOM':
        return {
          ...baseData,
          totalArea: Number(data.roomArea) || undefined,
          // Para habitaciones, no hay dormitorios ni baños en el backend actual
        };
      
      case 'LAND':
        return {
          ...baseData,
          totalArea: Number(data.totalArea) || undefined,
          // Para terrenos, no hay dormitorios ni baños
        };
      
      case 'OFFICE':
        return {
          ...baseData,
          totalArea: Number(data.totalArea) || undefined,
          builtArea: Number(data.usableArea) || undefined,
          bathrooms: Number(data.bathrooms) || undefined,
          parkingSpots: Number(data.parking) || undefined,
        };
      
      default: // APARTMENT, HOUSE
        return {
          ...baseData,
          bedrooms: Number(data.bedrooms) || undefined,
          bathrooms: Number(data.bathrooms) || undefined,
          parkingSpots: Number(data.parking) || undefined,
          totalArea: Number(data.totalArea) || undefined,
          builtArea: Number(data.builtArea) || undefined,
        };
    }
  };

  const handlePrev = () => goToStep(Math.max(currentStep - 1, 1));

  const handleSubmit = async () => {
    if (mode === 'create') {
      // NO validar límite aquí - solo redirigir al historial
      // El usuario publicará desde el historial si quiere
      
      if (createdPropertyId) {
        // Ya existe la propiedad, redirigir al historial
        router.push('/mis-propiedades');
      } else {
        // Crear propiedad y redirigir al historial
        const createData = prepareCreateData(formData);
        createMutation.mutate(createData, {
          onSuccess: () => router.push('/mis-propiedades'),
          onError: (error: any) => {
            toast.error('Error al guardar la propiedad');
          },
        });
      }
    } else if (property) {
      updateMutation.mutate(
        {
          id: property.id,
          data: {
            userId: user!.id,
            price: formData.price,
            description: formData.description,
            bedrooms: formData.bedrooms,
            bathrooms: formData.bathrooms,
            parkingSpots: formData.parking,
            totalArea: formData.totalArea,
            maintenanceFee: formData.maintenanceFee,
          },
        },
        {
          onSuccess: () => router.push('/mis-propiedades'),
          onError: () => toast.error('Error al guardar la propiedad'),
        }
      );
    }
  };

  const ActiveComponent = StepComponents[currentStep];
  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isLastStep = currentStep === 4;

  return (
    <>
      <UpgradePlanModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

      {/* ── STEP HEADER ── */}
      <div className="mb-8">
        <p style={{ color: '#00a63e' }} className="text-xs font-bold uppercase tracking-widest mb-1">
          Paso {currentStep} de {STEPS.length}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {STEPS[currentStep - 1].title}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{STEPS[currentStep - 1].description}</p>
      </div>

      {/* ── STEP CONTENT (con contenedor robusto) ── */}
      <div className="min-h-[400px] w-full">
        <div className="bg-white rounded-lg p-6">
          <ActiveComponent
            formData={formData}
            onChange={handleChange}
            propertyId={property?.id ?? createdPropertyId}
          />
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <button
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#00a63e' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#009135')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#00a63e')}
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </>
          ) : isLastStep ? (
            <>
              {mode === 'create' ? 'Finalizar' : 'Guardar cambios'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              Siguiente
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </>
  );
}
