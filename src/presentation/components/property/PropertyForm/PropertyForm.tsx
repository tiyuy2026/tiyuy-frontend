'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProperty, useUpdateProperty } from '@/presentation/hooks/useProperties';
import { useProjects } from '@/presentation/hooks/useProjects';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { Property } from '@/core/domain/entities/Property';
import { Project } from '@/core/domain/entities/Project';
import { BasicInfoStep } from './BasicInfoStep';
import { LocationStep } from './LocationStep';
import { CharacteristicsStep } from './CharacteristicsStep';
import { ProjectMultimediaStep } from './ProjectMultimediaStep';
import { ProjectInfoStep } from './ProjectInfoStep';
import { ProjectUnitsStep } from './ProjectUnitsStep';
import { ProjectTimelineStep } from './ProjectTimelineStep';
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
  4: ProjectMultimediaStep,
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
    //  Sin suscripción: 1 publicación gratis entre propiedades + proyectos
    return (publishedPropertiesCount + publishedProjectsCount) < 1;
  }, [activeSubscription, publishedPropertiesCount, publishedProjectsCount]);

  const [formData, setFormData] = useState({
    // Propiedades existentes (solo si es property form)
    type: property?.type || 'APARTMENT',
    transactionType: (property && 'transactionType' in property) ? property.transactionType : 'SALE',
    // 🔍 FIX: Agregar estado para archivos de unidades
    unitBlueprintFiles: {},
    groupBlueprintFiles: {},
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
    
    // Campos para proyectos (solo si es project form)
    ...(formType === 'project' ? {
      name: (property && 'name' in property) ? property.name : '',
      phase: (property && 'phase' in property) ? property.phase : 'PRE_SALE',
      projectType: (property && 'type' in property) ? property.type : 'RESIDENTIAL',
      totalUnits: (property && 'totalUnits' in property) ? property.totalUnits : 0,
      availableUnits: (property && 'availableUnits' in property) ? property.availableUnits : 0,
      priceFrom: (property && 'priceFrom' in property) ? property.priceFrom : 0,
      priceTo: (property && 'priceTo' in property) ? property.priceTo : 0,
      startDate: (property && 'startDate' in property) ? property.startDate : '',
      estimatedDelivery: (property && 'estimatedDelivery' in property) ? property.estimatedDelivery : '',
      areaFrom: (property && 'areaFrom' in property) ? property.areaFrom : 0,
      areaTo: (property && 'areaTo' in property) ? property.areaTo : 0,
      floors: (property && 'floors' in property) ? property.floors : 0,
      address: (property && 'address' in property) ? property.address : ((property && 'location' in property) ? `${property.location?.district || ''}, ${property.location?.province || ''}, ${property.location?.region || ''}` : ''),
      units: (property && 'units' in property) ? property.units : [],
      timeline: (property && 'timeline' in property) ? property.timeline : [],
      amenities: (property && 'amenities' in property) ? property.amenities : [],
      images: (property && 'images' in property) ? property.images : [],
      blueprints: (property && 'blueprints' in property) ? property.blueprints : [],
      renders: (property && 'renders' in property) ? property.renders : [],
    } : {})
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
    // Crear proyecto cuando llegamos al paso 5 (antes de mostrar el componente)
    if (formType === 'project' && currentStep === 4 && !createdPropertyId) {
      //  VALIDACIÓN PREVIA de campos obligatorios
      const requiredFields = {
        name: formData.name,
        description: formData.description,
        phase: formData.phase,
        type: formData.type,
        totalUnits: formData.totalUnits,
        areaFrom: formData.areaFrom,
        areaTo: formData.areaTo,
        address: formData.address,
        district: formData.district,
        province: formData.province,
        region: formData.region
      };

      console.log('🔍 Validando campos obligatorios:', requiredFields);

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => {
          // For numeric fields, 0 is a valid value
          if (typeof value === 'number') {
            return isNaN(value);
          }
          // For string fields, check if empty or just whitespace
          return !value || (typeof value === 'string' && value.trim() === '');
        })
        .map(([key]) => key);

      if (missingFields.length > 0) {
        console.error('❌ Campos obligatorios faltantes:', missingFields);
        console.error('❌ Valores actuales:', requiredFields);
        toast.error(`Faltan campos obligatorios: ${missingFields.join(', ')}`);
        return;
      }

      console.log('✅ Todos los campos obligatorios están presentes');
      
      // Crear proyecto al pasar del paso 4 al 5
      const projectData = prepareProjectData(formData);
      console.log(' Creando proyecto como DRAFT con todos los datos:', projectData);
      
      createProjectMutation.mutate(projectData, {
        onSuccess: (result: any) => { 
          console.log('🔍 Type of result:', typeof result);
          
          let projectId = undefined;
          
          if (typeof result === 'string') {
            // Extraer el ID con regex del JSON truncado
            const idMatch = result.match(/"id":(\d+)/);
            if (idMatch) {
              projectId = parseInt(idMatch[1], 10);
              console.log('🔍 Extracted ID with regex:', projectId);
            } else {
              console.error('❌ Could not find ID in result string');
            }
          } else if (result && typeof result === 'object') {
            projectId = result.id;
            console.log('🔍 Direct ID access:', projectId);
          }
          
          console.log('🔧 Final projectId found:', projectId);
          
          // Validar que projectId exista antes de guardar
          if (projectId) {
            console.log('🔧 Saving project ID:', projectId);
            // ✅ Fix 1: Guardar en estado y localStorage con key correcta
            setCreatedPropertyId(projectId);
            localStorage.setItem('lastCreatedProjectId', String(projectId)); // ✅ Key correcta
            console.log('✅ Project ID guardado en localStorage:', projectId);
            
            // Avanzar al paso 5 después de crear el proyecto
            goToStep(5);
            
            // Mostrar toast de éxito y permitir subir imágenes
            toast.success('Proyecto guardado, ahora sube las imágenes');
          } else {
            console.error('❌ Error: projectId es undefined después de crear el proyecto');
            toast.error('Error al guardar el proyecto - ID no encontrado');
          }
        },
        onError: (error: any) => {
          console.error(' Error al crear proyecto:', error);
          
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
                  console.log(' Toast: Navegando a /planes...');
                  console.log(' URL actual:', window.location.href);
                  router.push('/planes');
                }
              }
            });
            
            // Redirigir después de un tiempo
            setTimeout(() => {
              console.log(' Timeout: Navegando a /planes...');
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
    console.log(' prepareProjectData - Todos los datos del formulario:', data);
    
    // Logging detallado para cada paso
    console.log(' Paso 1 - Información básica:', {
      name: data.name || data.projectName || '',
      description: data.description || '',
      phase: data.phase || 'PRE_SALE',
      type: data.projectType || 'RESIDENTIAL',
      mainAmenities: data.amenities || [] //  NUEVO: Amenidades principales del paso 1 (viene como 'amenities' del frontend)
    });
    
    console.log(' Paso 2 - Ubicación:', {
      address: data.address || data.fullAddress || '',
      district: data.district || '',
      province: data.province || '',
      region: data.region || '',
      latitude: data.latitude,
      longitude: data.longitude,
      urbanization: data.urbanization || '',
      street: data.street || '',
      streetNumber: data.streetNumber || '',
      fullAddress: data.fullAddress || '',
      showExactAddress: data.showExactAddress
    });
    
    console.log(' Paso 3 - Comercial y Unidades:', {
      totalUnits: data.totalUnits,
      availableUnits: data.availableUnits,
      priceFrom: data.priceFrom,
      priceTo: data.priceTo,
      currency: data.currency,
      areaFrom: data.areaFrom,
      areaTo: data.areaTo,
      units: data.units || [],
      amenities: data.amenities || []
    });
    
    console.log(' Paso 4 - Timeline:', {
      timeline: data.timeline || []
    });
    
    console.log(' Paso 5 - Multimedia (se subirá por separado):', {
      images: data.images || [],
      blueprints: data.blueprints || [],
      renders: data.renders || []
    });
    
    //  AHORA SÍ enviamos todos los campos que el backend acepta
    const projectData = {
      // Paso 1: Información básica
      name: data.name || data.projectName || '',
      description: data.description || '',
      phase: data.phase || 'PRE_SALE',
      type: data.projectType || 'RESIDENTIAL', // ✅ Usar projectType en lugar de type
      
      //  NUEVO: Amenidades principales (checkboxes del paso 1)
      mainAmenities: data.amenities || [], //  NUEVO: Amenidades principales del paso 1 (viene como 'amenities' del frontend)
      
      // Paso 2: Ubicación
      address: data.fullAddress || '',
      district: data.district || '',
      province: data.province || '',
      region: data.region || '',
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      
      //  NUEVO: Campos adicionales de dirección (del paso 2)
      urbanization: data.urbanization || '',
      street: data.street || '',
      streetNumber: data.streetNumber || '',
      fullAddress: data.fullAddress || '',
      showExactAddress: data.showExactAddress !== undefined ? data.showExactAddress : true,
      
      // Paso 3: Información comercial
      totalUnits: Number(data.totalUnits) > 0 ? Number(data.totalUnits) : 1, // Default to 1 if 0 or invalid
      availableUnits: Number(data.availableUnits) || Number(data.totalUnits) || 0,
      priceFrom: Number(data.priceFrom) || 0,
      priceTo: Number(data.priceTo) || 0,
      currency: data.currency || 'PEN',
      areaFrom: Number(data.areaFrom) || 60,
      areaTo: Number(data.areaTo) || 60,
      startDate: data.startDate || data.constructionStartDate || undefined,
      estimatedDelivery: data.estimatedDelivery || undefined,
      floors: data.floors ? Number(data.floors) : undefined,
      
      //  NUEVO: Unidades (del paso 3) - CON IMÁGENES
      units: (data.units || []).map((unit: any) => ({
        unitNumber: unit.unitNumber || '',
        type: unit.type || 'APARTMENT',
        floor: unit.floor || 1,
        area: unit.area || 60,
        bedrooms: unit.bedrooms || 1,
        bathrooms: unit.bathrooms || 1,
        parkingSpots: unit.parkingSpots || 1,
        price: unit.price || 150000,
        status: unit.status || 'AVAILABLE',
        view: unit.view || '',
        // 🔍 FIX: Agregar imágenes de las unidades
        image: unit.image || '',           // Imagen de la unidad
        blueprintImage: unit.blueprintImage || ''  // Plano de la unidad
      })),
      
      // 🔍 FIX: Agregar campos que faltaban del paso 3
      certifications: data.certifications || [],  // Certificados
      timeline: data.timeline || [],              // Timeline/Fechas importantes
      
      // Paso 5: Multimedia (se subirá por separado, pero incluimos URLs si ya existen)
      coverImageUrl: data.coverImageUrl || '',
      
      //  NUEVO: Grupos de unidades (del paso 3)
      unitGroups: (data.unitGroups || []).map((group: any) => ({
        groupName: group.groupName || '',
        unitType: group.unitType || 'APARTMENT',
        floorStart: group.floorStart || 1,
        floorEnd: group.floorEnd || 1,
        area: group.area || 60,
        bedrooms: group.bedrooms || 1,
        bathrooms: group.bathrooms || 1,
        parkingSpots: group.parkingSpots || 1,
        price: group.price || 150000,
        status: group.status || 'AVAILABLE',
        view: group.view || '',
        quantity: group.quantity || 1,
        image: group.image || '',           // Imagen del grupo
        blueprintImage: group.blueprintImage || ''  // Plano del grupo
      })),
      
      //  NUEVO: Amenidades detalladas (del paso 3)
      amenities: (data.amenities || []).map((amenity: any) => ({
        name: amenity.name || '',
        description: amenity.description || '',
        icon: amenity.icon || ''
      }))
    };
    
    console.log('📦 Datos finales a enviar:', projectData);
    return projectData;
  };

  const handlePrev = () => goToStep(Math.max(currentStep - 1, 1));

  // Función para verificar que todos los datos se guardaron correctamente
  const verifyProjectData = async (projectId: number) => {
    try {
      console.log('🔍 Verifying project data for ID:', projectId);
      
      // Use the repository directly instead of hooks
      const projectRepository = new ProjectRepository();
      const project = await projectRepository.getById(projectId);
      
      console.log('✅ Verificación de datos guardados:', {
          id: project.id,
          name: project.name,
          description: project.description,
          phase: project.phase,
          type: project.type,
          totalUnits: project.totalUnits,
          availableUnits: project.availableUnits,
          priceFrom: project.priceFrom,
          priceTo: project.priceTo,
          currency: project.currency,
          areaFrom: project.areaFrom,
          areaTo: project.areaTo,
          startDate: project.startDate,
          estimatedDelivery: project.estimatedDelivery,
          floors: project.floors,
          address: project.address,
          district: project.district,
          province: project.province,
          region: project.region,
          latitude: project.latitude,
          longitude: project.longitude,
          amenities: project.amenities,
          certifications: project.certifications,
          timeline: project.timeline,
          images: project.images,
          blueprints: project.blueprints,
          renders: project.renders
        });
        
        // Verificar arrays
        console.log(' Verificación de arrays:', {
          amenities: project.amenities?.length || 0,
          certifications: project.certifications?.length || 0,
          timeline: project.timeline?.length || 0,
          images: project.images?.length || 0,
          blueprints: project.blueprints?.length || 0,
          renders: project.renders?.length || 0
        });
      
    } catch (error) {
      console.error(' Error en verificación:', error);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'create' && formType === 'project' && createdPropertyId) {
      
      // Verificar si puede publicar (gratis o con suscripción)
      if (canPublish) {
        //  Tiene derecho a publicar (primer proyecto gratis o suscripción activa)
        try {
          // Primero actualizar el proyecto con los datos multimedia
          const token = authStorage.getToken() || localStorage.getItem('tiyuy-auth-token') || localStorage.getItem('token');
          
          const updateData = {
            ...prepareProjectData(formData),
            images: formData.images || [],
            blueprints: formData.blueprints || [],
            renders: formData.renders || [],
          };
          
          console.log(' Actualizando proyecto con multimedia:', updateData);
          
          const updateResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/projects/${createdPropertyId}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify(updateData)
            }
          );
          
          if (!updateResponse.ok) {
            const error = await updateResponse.json();
            console.error('Error actualizando proyecto:', error);
            toast.error('Error al actualizar los datos multimedia');
            return;
          }
          
          console.log(' Proyecto actualizado con multimedia, ahora publicando...');
          
          // Luego publicar
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
        //  No puede publicar → mostrar modal de upgrade
        setShowUpgradeModal(true);
      }
    } else if (mode === 'create' && formType === 'project' && !createdPropertyId) {
      // Crear proyecto y redirigir (se creó como DRAFT en handleNext)
      toast.success('Proyecto guardado como BORRADOR');
      router.push('/dashboard/mis-proyectos'); //  Redirigir a mis-proyectos
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
            propertyId={createdPropertyId}
            groupBlueprintFiles={formData.groupBlueprintFiles}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
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
        
        {/* Botón de Guardar Borrador visible para proyectos */}
        {formType === 'project' && !createdPropertyId && currentStep === 5 && (
          <button
            onClick={async () => {
              console.log('🔍 DEBUG - Datos actuales del formulario:', formData);
              
              try {
                // 🔍 FIX: Primero subir planos de unidades si existen
                if (formData.unitBlueprintFiles || formData.groupBlueprintFiles) {
                  console.log('� Subiendo planos de unidades antes de guardar...');
                  
                  // Obtener referencia al componente ProjectMultimediaStep
                  const multimediaStepRef = document.querySelector('[data-multimedia-step]') as any;
                  if (multimediaStepRef && multimediaStepRef.uploadUnitBlueprints) {
                    const uploadedBlueprints = await multimediaStepRef.uploadUnitBlueprints();
                    console.log('✅ Planos subidos:', uploadedBlueprints);
                    
                    // 🔍 FIX: Actualizar las unidades y grupos con las URLs subidas
                    const updatedUnits = Array.isArray(formData.units) ? formData.units.map((unit: any) => {
                      if (uploadedBlueprints[unit.id]) {
                        return { ...unit, blueprintImage: uploadedBlueprints[unit.id] };
                      }
                      return unit;
                    }) : [];
                    
                    const updatedGroups = Array.isArray((formData as any).groups) ? (formData as any).groups.map((group: any) => {
                      if (uploadedBlueprints[group.id]) {
                        return { ...group, blueprintImage: uploadedBlueprints[group.id] };
                      }
                      return group;
                    }) : [];
                    
                    // Actualizar formData con las URLs
                    const updatedFormData = {
                      ...formData,
                      units: updatedUnits,
                      groups: updatedGroups
                    };
                    
                    console.log('💾 Guardando proyecto con planos actualizados:', updatedFormData);
                    
                    const projectData = prepareProjectData(updatedFormData);
                    createProjectMutation.mutate(projectData, {
                      onSuccess: (result: any) => { 
                        console.log('✅ Proyecto guardado como BORRADOR:', result);
                        toast.success('¡Proyecto guardado como BORRADOR! 🎉');
                        router.push('/dashboard/mis-proyectos'); // ✅ Redirigir a borradores
                      },
                      onError: (error: any) => {
                        console.error('❌ Error guardando borrador:', error);
                        toast.error('Error al guardar el borrador');
                      }
                    });
                  } else {
                    console.warn('⚠️ No se encontró la función uploadUnitBlueprints');
                    // Guardar sin planos si no se encuentra la función
                    const projectData = prepareProjectData(formData);
                    createProjectMutation.mutate(projectData, {
                      onSuccess: (result: any) => { 
                        console.log('✅ Proyecto guardado como BORRADOR:', result);
                        toast.success('¡Proyecto guardado como BORRADOR! 🎉');
                        router.push('/dashboard/mis-proyectos'); // ✅ Redirigir a borradores
                      },
                      onError: (error: any) => {
                        console.error('❌ Error guardando borrador:', error);
                        toast.error('Error al guardar el borrador');
                      }
                    });
                  }
                } else {
                  // Guardar normalmente si no hay planos
                  const projectData = prepareProjectData(formData);
                  createProjectMutation.mutate(projectData, {
                    onSuccess: (result: any) => { 
                      console.log('✅ Proyecto guardado como BORRADOR:', result);
                      toast.success('¡Proyecto guardado como BORRADOR! 🎉');
                      router.push('/dashboard/mis-proyectos'); // ✅ Redirigir a borradores
                    },
                    onError: (error: any) => {
                      console.error('❌ Error guardando borrador:', error);
                      toast.error('Error al guardar el borrador');
                    }
                  });
                }
              } catch (error) {
                console.error('❌ Error en el proceso de guardado:', error);
                toast.error('Error al guardar el proyecto');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-orange-600 border border-orange-200 hover:bg-orange-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Guardar Borrador
          </button>
        )}
      </div>

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
                ? (canPublish ? ' Publicar Proyecto' : ' Guardar Borrador')
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
    </>
  );
}
