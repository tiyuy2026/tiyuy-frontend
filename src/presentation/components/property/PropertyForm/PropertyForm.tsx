'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProperty, useUpdateProperty } from '@/presentation/hooks/useProperties';
import { useProjects } from '@/presentation/hooks/useProjects';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { Property } from '@/core/domain/entities/Property';
import { Project } from '@/core/domain/entities/Project';
import { BasicInfoStep } from './BasicInfoStep';
import { LocationStep } from './LocationStep';
import { CharacteristicsStep } from './CharacteristicsStep';
import { PhotosStep } from './PhotosStep';
import { ProjectInfoStep } from './ProjectInfoStep';
import { ProjectUnitsStep } from './ProjectUnitsStep';
import { ProjectTimelineStep } from './ProjectTimelineStep';
import { ProjectMultimediaStep } from './ProjectMultimediaStep';
import { UpgradePlanModal } from '@/presentation/components/modals/UpgradePlanModal';
import { useMyProperties } from '@/presentation/hooks/useProperties';
import { useAuth } from '@/presentation/hooks/useAuth';
import { authStorage } from '@/infrastructure/storage/auth-storage';
import { toast } from 'sonner';

interface PropertyFormProps {
  property?: Property | Project;
  mode: 'create' | 'edit';
  onStepChange?: (step: number) => void;
  formType?: 'property' | 'project'; // ← NUEVO: para diferenciar tipos
}

const STEPS = [
  { number: 1, title: 'Información básica', description: 'Tipo y precio' },
  { number: 2, title: 'Ubicación', description: 'Dirección exacta' },
  { number: 3, title: 'Características', description: 'Detalles del inmueble' },
  { number: 4, title: 'Fotos', description: 'Imágenes del inmueble' },
];

const PROJECT_STEPS = [
  { number: 1, title: 'Información del Proyecto', description: 'Tipo y fase' },
  { number: 2, title: 'Ubicación', description: 'Dirección exacta' },
  { number: 3, title: 'Unidades', description: 'Departamentos disponibles' },
  { number: 4, title: 'Timeline', description: 'Fechas de entrega' },
  { number: 5, title: 'Multimedia', description: 'Planos y renders' },
];

const StepComponents: Record<number, React.ComponentType<any>> = {
  1: BasicInfoStep,
  2: LocationStep,
  3: CharacteristicsStep,
  4: PhotosStep,
};

const ProjectStepComponents: Record<number, React.ComponentType<any>> = {
  1: ProjectInfoStep,
  2: LocationStep,
  3: ProjectUnitsStep,
  4: ProjectTimelineStep,
  5: ProjectMultimediaStep,
};

export function PropertyForm({ property, mode, onStepChange, formType = 'property' }: PropertyFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [createdPropertyId, setCreatedPropertyId] = useState<number | undefined>(property?.id);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data: myPropertiesData } = useMyProperties();
  const { data: activeSubscription } = useActiveSubscription();
  const myProjectsQuery = useProjects().myProjects?.() ?? { data: null };

  const publishedPropertiesCount =
    myPropertiesData?.properties?.filter((p: any) => p.status === 'PUBLISHED').length || 0;

  const publishedProjectsCount =
    myProjectsQuery.data?.content?.filter((p: any) => p.status === 'PUBLISHED').length || 0;

  const canPublish = useMemo(() => {
    if (activeSubscription) return activeSubscription.remainingPublications > 0;
    // ✅ Sin suscripción: 1 publicación gratis entre propiedades + proyectos
    return (publishedPropertiesCount + publishedProjectsCount) < 1;
  }, [activeSubscription, publishedPropertiesCount, publishedProjectsCount]);

  const [formData, setFormData] = useState({
    // Propiedades existentes
    type: property?.type || 'APARTMENT',
    transactionType: (property && 'transactionType' in property) ? property.transactionType : 'SALE',
    price: (property && 'price' in property) ? property.price : 0,
    currency: (property && 'currency' in property) ? property.currency : 'PEN',
    bedrooms: (property && 'bedrooms' in property) ? property.bedrooms : 1,
    bathrooms: (property && 'bathrooms' in property) ? property.bathrooms : 1,
    parking: (property && 'parkingSpots' in property) ? property.parkingSpots : 0,
    totalArea: (property && 'totalArea' in property) ? property.totalArea : 0,
    builtArea: (property && 'builtArea' in property) ? property.builtArea : 0,
    floor: (property && 'floor' in property) ? property.floor : 1,
    age: (property && 'age' in property) ? property.age : 0,
    maintenanceFee: (property && 'maintenanceFee' in property) ? property.maintenanceFee : 0,
    description: property?.description || '',
    fullAddress: (property && 'location' in property) ? property.location?.fullAddress : '',
    region: (property && 'location' in property) ? property.location?.region : 'Lima',
    province: (property && 'location' in property) ? property.location?.province : 'Lima',
    district: (property && 'location' in property) ? property.location?.district : '',
    urbanization: (property && 'location' in property) ? property.location?.urbanization : '',
    street: (property && 'location' in property) ? property.location?.street : '',
    streetNumber: (property && 'location' in property) ? property.location?.streetNumber : '',
    apartmentNumber: (property && 'location' in property) ? property.location?.apartmentNumber : '',
    latitude: (property && 'location' in property) ? property.location?.latitude : 0,
    longitude: (property && 'location' in property) ? property.location?.longitude : 0,
    showExactAddress: (property && 'location' in property) ? property.location?.showExactAddress : true,
    
    // Campos para proyectos (separados de los de propiedades)
    name: (property && 'name' in property) ? property.name : '',
    phase: (property && 'phase' in property) ? property.phase : 'PRE_SALE',
    projectType: (property && 'type' in property) ? property.type : 'RESIDENTIAL',
    totalUnits: (property && 'totalUnits' in property) ? property.totalUnits : 0,
    availableUnits: (property && 'availableUnits' in property) ? property.availableUnits : 0,
    priceFrom: (property && 'priceFrom' in property) ? property.priceFrom : 0,
    priceTo: (property && 'priceTo' in property) ? property.priceTo : 0,
    startDate: (property && 'estimatedDelivery' in property) ? property.estimatedDelivery : '',
    estimatedDelivery: (property && 'estimatedDelivery' in property) ? property.estimatedDelivery : '',
    areaFrom: 0,
    areaTo: 0,
    floors: 0,
    address: (property && 'district' in property) ? `${property.district}, ${property.province}, ${property.region}` : '',
    units: (property && 'units' in property) ? property.units : [],
    timeline: [],
  });

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const createProjectMutation = useProjects().createProject(); // ← Hook para proyectos
  const updateProjectMutation = useProjects().updateProject(); // ← Hook para actualizar proyectos

  // Determinar steps y componentes según el tipo
  const currentSteps = formType === 'project' ? PROJECT_STEPS : STEPS;
  const currentStepComponents = formType === 'project' ? ProjectStepComponents : StepComponents;
  const totalSteps = currentSteps.length;

  const goToStep = (step: number) => {
    setCurrentStep(step);
    onStepChange?.(step);
  };

  const handleChange = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleNext = () => {
    if (formType === 'project' && currentStep === 4 && !createdPropertyId) {
      // Crear proyecto en el paso 4 como DRAFT (no requiere suscripción)
      const projectData = prepareProjectData(formData);
      console.log('🚀 Creando proyecto como DRAFT:', projectData);
      
      createProjectMutation.mutate(projectData, {
        onSuccess: (result: any) => { 
          console.log('✅ Proyecto creado como DRAFT:', result);
          setCreatedPropertyId(result.id); 
          goToStep(5); 
        },
        onError: (error: any) => {
          console.error('❌ Error al crear proyecto:', error);
          
          // Manejar error de validación específicamente
          if (error.isValidationError) {
            toast.error(error.message, {
              duration: 5000,
              style: {
                background: '#ef4444',
                color: 'white',
              }
            });
            return;
          }
          
          // Manejar error de suscripción específicamente
          if (error.isSubscriptionError || error.message?.includes('ENTERPRISE') || error.message?.includes('suscripción')) {
            const errorMessage = 'Para crear proyectos necesitas una suscripción ENTERPRISE.';
            
            toast.error(errorMessage, {
              duration: 5000,
              action: {
                label: 'Ver Planes',
                onClick: () => {
                  console.log('🔍 Toast: Navegando a /planes...');
                  console.log('🔍 URL actual:', window.location.href);
                  router.push('/planes');
                }
              }
            });
            
            // Redirigir después de un tiempo
            setTimeout(() => {
              console.log('🔍 Timeout: Navegando a /planes...');
              router.push('/planes');
            }, 3000);
          } else {
            toast.error('Error al crear el proyecto');
          }
        },
      });
      return;
    }
    
    if (mode === 'create' && formType === 'property' && currentStep === 3 && !createdPropertyId) {
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
    goToStep(Math.min(currentStep + 1, totalSteps));
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

  // Función para preparar datos para proyectos según el backend
  const prepareProjectData = (data: any) => {
    return {
      name: data.name || data.projectName || '',
      description: data.description || '',
      phase: data.phase || 'PRE_SALE',
      type: data.projectType || 'RESIDENTIAL', // Usar projectType para el backend
      totalUnits: Number(data.totalUnits) || 0,
      priceFrom: Number(data.priceFrom) || 0,
      priceTo: Number(data.priceTo) || (Number(data.priceFrom) * 2), // ✅ Obligatorio según backend
      areaFrom: Number(data.areaFrom) || 60, // ✅ Obligatorio según backend
      areaTo: Number(data.areaTo) || (Number(data.areaFrom) * 2), // ✅ Obligatorio según backend
      startDate: data.startDate || data.constructionStartDate || undefined,
      estimatedDelivery: data.estimatedDelivery || '',
      floors: data.floors ? Number(data.floors) : undefined,
      address: data.address || data.fullAddress || '',
      district: data.district || '',
      province: data.province || '',
      region: data.region || '',
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
    };
  };

  const handlePrev = () => goToStep(Math.max(currentStep - 1, 1));

  const handleSubmit = async () => {
    if (mode === 'create' && formType === 'project' && createdPropertyId) {
      
      // Verificar si puede publicar (gratis o con suscripción)
      if (canPublish) {
        // ✅ Tiene derecho a publicar (primer proyecto gratis o suscripción activa)
        try {
          const token = authStorage.getToken() || localStorage.getItem('tiyuy-auth-token') || localStorage.getItem('token');
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/projects/${createdPropertyId}/publish`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
              }
            }
          );

          if (response.ok) {
            toast.success('¡Proyecto publicado exitosamente! 🎉');
            router.push('/dashboard/proyectos');
          } else {
            const error = await response.json();
            toast.error(error.message || 'Error al publicar el proyecto');
          }
        } catch (error) {
          toast.error('Error al publicar el proyecto');
        }
      } else {
        // ❌ No puede publicar → mostrar modal de upgrade
        setShowUpgradeModal(true);
      }
    } else if (mode === 'create' && formType === 'project' && !createdPropertyId) {
      // Crear proyecto y redirigir (se creó como DRAFT en handleNext)
      toast.success('Proyecto guardado como BORRADOR');
      router.push('/mis-proyectos'); // ✅ Redirigir a mis-proyectos
    } else if (mode === 'create' && formType !== 'project') {
      // Para propiedades, redirigir al historial
      if (createdPropertyId) {
        router.push('/mis-propiedades');
      } else {
        const createData = prepareCreateData(formData);
        createMutation.mutate(createData, {
          onSuccess: () => router.push('/mis-propiedades'),
          onError: (error: any) => {
            toast.error('Error al guardar la propiedad');
          },
        });
      }
    } else if (property) {
      if (formType === 'project') {
        // Actualizar proyecto existente
        const projectData = prepareProjectData(formData);
        updateProjectMutation.mutate(
          {
            projectId: property.id,
            projectData,
          },
          {
            onSuccess: () => router.push('/dashboard/proyectos'),
            onError: () => toast.error('Error al guardar el proyecto'),
          }
        );
      } else {
        // Actualizar propiedad existente
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
    }
  };

  const ActiveComponent = currentStepComponents[currentStep];
  const isLoading = createMutation.isPending || updateMutation.isPending || createProjectMutation.isPending || updateProjectMutation.isPending;
  const isLastStep = currentStep === totalSteps;

  return (
    <>
      <UpgradePlanModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />

      {/* ── STEP HEADER ── */}
      <div className="mb-8">
        <p style={{ color: '#00a63e' }} className="text-xs font-bold uppercase tracking-widest mb-1">
          Paso {currentStep} de {totalSteps}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {currentSteps[currentStep - 1].title}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{currentSteps[currentStep - 1].description}</p>
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
              {mode === 'create' ? (
                formType === 'project' 
                  ? (canPublish ? '✅ Publicar Proyecto' : '💾 Guardar Borrador')
                  : 'Finalizar'
              ) : 'Guardar cambios'}
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
