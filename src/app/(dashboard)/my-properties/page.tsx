'use client';

import { useMyProperties, useDeleteProperty, usePublishProperty } from '@/presentation/hooks/useProperties';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import Link from 'next/link';
import Image from 'next/image';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useAuthStore } from '@/presentation/store/authStore';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UpgradePlanModal } from '@/presentation/components/modals/UpgradePlanModal';
import { PlanExpiredModal } from '@/presentation/components/modals/PlanExpiredModal';
import { useQueryClient } from '@tanstack/react-query';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';

export default function MyPropertiesPage() {
  const { data, isLoading, refetch } = useMyProperties();
  const deleteMutation = useDeleteProperty();
  const publishMutation = usePublishProperty();
  const { data: activeSubscription, refetch: refetchSubscription } = useActiveSubscription();
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'RENTED' | 'SOLD' | 'PAUSED' | 'INACTIVE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPlanExpiredModal, setShowPlanExpiredModal] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [previousPlan, setPreviousPlan] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Detect plan change
  useEffect(() => {
    if (activeSubscription && activeSubscription.plan) {
      const currentPlan = activeSubscription.plan.name;
      
      // If there is a previous plan and it is different from the current one
      if (previousPlan && previousPlan !== currentPlan) {
        setShowWelcomeMessage(true);
        
        // Hide message after 5 seconds
        const timer = setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
      
      // Save current plan as previous for future comparisons
      setPreviousPlan(currentPlan);
    }
  }, [activeSubscription, previousPlan]);

  // Force data reload when component mounts
  useEffect(() => {
    refetch();
    refetchSubscription();
    
    // Force cache invalidation
    queryClient.invalidateQueries({ queryKey: ['properties'] });
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
  }, [refetch, refetchSubscription, queryClient]);

  // Force reload when upgrade modal closes
  useEffect(() => {
    if (!showUpgradeModal) {
      setTimeout(() => {
        refetch();
        refetchSubscription();
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        queryClient.invalidateQueries({ queryKey: ['subscription'] });
      }, 1000);
    }
  }, [showUpgradeModal, refetch, refetchSubscription, queryClient]);

  // Periodic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      refetchSubscription();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch, refetchSubscription]);

  const properties = data?.properties || [];

  const normalizedProperties = useMemo(() => {
    return (properties as any[]).map((p) => {
      const status = normalizeStatus(p?.status);
      return { ...p, status };
    });
  }, [properties]);

  const publishedCount = useMemo(() => {
    return normalizedProperties.filter((p: any) => p.status === 'PUBLISHED').length;
  }, [normalizedProperties]);

  // Enhanced logic with FREE plan permanent blocking
  const canPublish = useMemo(() => {
    if (activeSubscription) {
      // Has plan: use plan logic (remainingPublications)
      return activeSubscription.remainingPublications > 0;
    }
    
    // WITHOUT SUBSCRIPTION: up to 1 FREE PUBLISHED property
    // Once user publishes 1 property, FREE is permanently blocked
    return publishedCount < 1;
  }, [activeSubscription, publishedCount]);

  // To display in the UI
  const maxPublications = activeSubscription?.plan?.maxPublications || 1;
  const remainingPublications = activeSubscription?.remainingPublications ?? (1 - publishedCount);

  const counts = useMemo(() => {
    const base = {
      ALL: normalizedProperties.length,
      PUBLISHED: 0,
      DRAFT: 0,
      RENTED: 0,
      SOLD: 0,
      PAUSED: 0,
      INACTIVE: 0,
    };

    for (const p of normalizedProperties as any[]) {
      const status = p.status as string;
      if ((base as any)[status] !== undefined) (base as any)[status] += 1;
    }

    return base;
  }, [normalizedProperties]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[mis-propiedades] Datos del backend:', {
      data,
      properties,
      activeSubscription,
      publishedCount,
      maxPublications,
      remainingPublications,
      canPublish
    });
    
    // eslint-disable-next-line no-console
    console.debug('[mis-propiedades] Propiedades individuales:', 
      properties.map((p: any) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        normalizedStatus: normalizeStatus(p?.status)
      }))
    );
    
    // eslint-disable-next-line no-console
    console.debug('[mis-propiedades] Conteos:', counts);
  }, [data, properties, activeSubscription, publishedCount, maxPublications, remainingPublications, canPublish, counts]);

  const searchedProperties = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return normalizedProperties;

    return (normalizedProperties as any[]).filter((p) => {
      const title = String(p?.title || '').toLowerCase();
      const district = String(p?.district || '').toLowerCase();
      const province = String(p?.province || '').toLowerCase();
      return title.includes(q) || district.includes(q) || province.includes(q);
    });
  }, [normalizedProperties, searchTerm]);

  const filteredProperties = useMemo(() => {
    if (activeTab === 'ALL') return searchedProperties;
    return searchedProperties.filter((p: any) => p.status === activeTab);
  }, [searchedProperties, activeTab]);

  const handleEdit = (id: unknown) => {
    const parsedId = typeof id === 'number' ? id : Number(id);
    if (!parsedId || Number.isNaN(parsedId)) {
      toast.error('No se pudo abrir edicion: falta ID de propiedad');
      return;
    }
    router.push(`/my-properties/${parsedId}/edit`);
  };

  const handleDelete = async (id: number, title: string, status: string) => {
    // Solo permitir eliminar si está en borrador
    if (status !== 'DRAFT') {
      toast.error('Solo se pueden eliminar propiedades en estado BORRADOR');
      return;
    }
    
    const confirmMessage = `¿Estás seguro de eliminar la propiedad "${title}"?\n\nEsta acción no se puede deshacer.`;
    if (confirm(confirmMessage)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handlePublish = async (id: unknown) => {
    const parsedId = typeof id === 'number' ? id : Number(id);
    if (!parsedId || Number.isNaN(parsedId)) {
      toast.error('No se pudo publicar: falta ID de propiedad');
      return;
    }
    if (!canPublish) {
      setShowPlanExpiredModal(true);
      return;
    }
    
    publishMutation.mutate(parsedId, {
      onError: (error: any) => {
        const status = error?.response?.status;
        if (status === 402) {
          setShowPlanExpiredModal(true);
        }
      }
    });
  };


  const goToPublishedHistory = () => {
    setSearchTerm('');
    setActiveTab('PUBLISHED');
  };

  const handleRefresh = () => {
    // Clear cache completely
    queryClient.clear();
    
    // Refresh everything
    refetch();
    refetchSubscription();
    
    toast.info('Forzando actualizacion completa...');
    
    // Refresh again after 2 seconds
    setTimeout(() => {
      refetch();
      refetchSubscription();
    }, 2000);
  };

  // Function to feature property
  const handleFeatureProperty = async (propertyId: number) => {
    try {
      // Create repository instance
      const propertyRepo = new PropertyRepository();
      
      // Call backend to feature property
      await propertyRepo.featureProperty(propertyId);
      
      // Show success
      toast.success('Propiedad destacada exitosamente!');
      
      // Refresh properties
      refetch();
      
    } catch (error: any) {
      console.error('Error featuring property:', error);
      
      // Handle specific errors
      if (error.response?.status === 403) {
        toast.error('No tienes permiso para destacar esta propiedad');
        return;
      }
      
      // Generic error message for other errors
      toast.error('Error al destacar propiedad. Intenta nuevamente.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Propiedades</h1>
            <p className="text-gray-600 mt-1">
              {counts.PUBLISHED} de {data?.pagination.totalElements || 0} propiedades
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="px-5 py-3 rounded-lg font-semibold transition-colors bg-red-100 text-red-800 hover:bg-red-200"
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Forzar Actualizacion'}
            </button>
            <button
              type="button"
              onClick={goToPublishedHistory}
              className="px-5 py-3 rounded-lg font-semibold transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Historial Publicados ({counts.PUBLISHED})
            </button>

            <Link
              href="/my-properties/new"
              className={`
                px-6 py-3 rounded-lg font-semibold transition-colors
                ${canPublish
                  ? 'text-white hover:opacity-90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
              style={{
                backgroundColor: canPublish ? '#00a63e' : undefined
              }}
            >
              + Nueva Propiedad
            </Link>
          </div>
        </div>

        {/* Tabs */}
        {!isLoading && properties.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col gap-3">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por titulo, distrito o provincia"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex flex-wrap gap-2">
                <TabButton
                  label="Todas"
                  count={counts.ALL}
                  isActive={activeTab === 'ALL'}
                  onClick={() => setActiveTab('ALL')}
                />
                <TabButton
                  label="Publicadas"
                  count={counts.PUBLISHED}
                  isActive={activeTab === 'PUBLISHED'}
                  onClick={() => setActiveTab('PUBLISHED')}
                />
                <TabButton
                  label="Borradores"
                  count={counts.DRAFT}
                  isActive={activeTab === 'DRAFT'}
                  onClick={() => setActiveTab('DRAFT')}
                />
                <TabButton
                  label="Alquiladas"
                  count={counts.RENTED}
                  isActive={activeTab === 'RENTED'}
                  onClick={() => setActiveTab('RENTED')}
                />
                <TabButton
                  label="Vendidas"
                  count={counts.SOLD}
                  isActive={activeTab === 'SOLD'}
                  onClick={() => setActiveTab('SOLD')}
                />
                <TabButton
                  label="Inactivas"
                  count={counts.INACTIVE}
                  isActive={activeTab === 'INACTIVE'}
                  onClick={() => setActiveTab('INACTIVE')}
                />
                <TabButton
                  label="Pausadas"
                  count={counts.PAUSED}
                  isActive={activeTab === 'PAUSED'}
                  onClick={() => setActiveTab('PAUSED')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Debug Panel - Deleted */}

        {/* Welcome message for new plan */}
        {showWelcomeMessage && activeSubscription && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-pulse">
            <p className="text-green-800 font-medium">
              🎉 ¡Felicidades! Ahora tienes el plan {activeSubscription.plan.name} con acceso a {activeSubscription.plan.maxPublications} publicaciones.
              ¡Aprovecha al máximo tus nuevos beneficios!
            </p>
          </div>
        )}

        {!canPublish && !showWelcomeMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">
              {activeSubscription && activeSubscription.plan
                ? `Has alcanzado el limite de ${activeSubscription.plan.maxPublications} publicaciones para tu plan ${activeSubscription.plan.name}.` 
                : 'Has alcanzado el limite de 1 propiedad gratis.'}{' '}
              <Link
                href="/plans"
                className="text-blue-600 hover:underline font-semibold"
              >
                {activeSubscription && activeSubscription.plan ? 'Renovar plan' : 'Mejorar tu plan'}
              </Link>{' '}
              para publicar mas propiedades.
            </p>
          </div>
        )}

        
        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && properties.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">HOME</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aún no tienes propiedades
            </h3>
            <p className="text-gray-500 mb-6">
              Publica tu primera propiedad y empieza a recibir contactos
            </p>
            <Link
              href="/my-properties/new"
              className="inline-block px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90"
              style={{ backgroundColor: '#00a63e' }}
            >
              Publicar Primera Propiedad
            </Link>
          </div>
        )}

        {/* Empty tab state */}
        {!isLoading && properties.length > 0 && filteredProperties.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-5xl mb-3">FOLDER</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No tienes propiedades en esta sección
            </h3>
            <p className="text-gray-500 mb-6">
              Cambia de pestaña o crea una nueva propiedad.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('ALL')}
                className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Ver todas
              </button>
              <Link
                href="/my-properties/new"
                className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90"
                style={{ backgroundColor: '#00a63e' }}
              >
                + Nueva Propiedad
              </Link>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && properties.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property: any) => (
                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Imagen */}
                  <div className="relative h-48 bg-gray-200">
                    {property.coverPhotoUrl ? (
                    <img
                      src={`/api/images/proxy?url=${encodeURIComponent(property.coverPhotoUrl)}`}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading image:', property.coverPhotoUrl);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl">🏠</span>';
                      }}
                    />
                  ) : property.media && property.media.length > 0 ? (
                    <img
                      src={`/api/images/proxy?url=${encodeURIComponent(property.media.find((m: any) => m.isCover)?.url || property.media[0].url)}`}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading media image:', property.media[0]?.url);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl">🏠</span>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl"></span>
                    </div>
                  )}
                    
                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <StatusBadge 
                        status={property.status} 
                        lifecycleStatus={property.lifecycleStatus}
                        remainingGraceDays={property.remainingGraceDays}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {property.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      📍 {property.district}, {property.province}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-blue-600">
                        {property.currency === 'USD' ? 'US$' : 'S/'} {property.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        👁️ {property.viewsCount}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {/* Reactivate button for PAUSED properties */}
                      {property.status === 'PAUSED' && (
                        <button
                          onClick={() => handlePublish(property.id)}
                          disabled={publishMutation.isPending}
                          className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 disabled:bg-gray-400"
                        >
                          {publishMutation.isPending ? 'Reactivando...' : 'Reactivar'}
                        </button>
                      )}
                      
                      {/* Publish button for DRAFT properties */}
                      {property.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublish(property.id)}
                          disabled={publishMutation.isPending}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {publishMutation.isPending ? 'Publicando...' : 'Publicar'}
                        </button>
                      )}

                      
                      {/* Featured property button */}
                      {property.status === 'PUBLISHED' && !property.isFeatured && (
                        <button
                          onClick={() => handleFeatureProperty(property.id)}
                          className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 flex items-center gap-1"
                        >
                          ⭐ Destacar
                        </button>
                      )}
                      
                      {/* Debug: Show property status */}
                      <div className="text-xs text-gray-400 hidden">
                        Status: {property.status} | Featured: {property.isFeatured ? 'true' : 'false'}
                      </div>
                      
                      {/* Featured property badge */}
                      {property.status === 'PUBLISHED' && property.isFeatured && (
                        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-1">
                          ⭐ Destacada
                        </div>
                      )}
                      
                      <Link
                        href={`/property/${property.id}`}
                        target="_blank"
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                      >
                        Ver
                      </Link>
                      
                      <Link
                        href={`/my-properties/${property.id}/edit`}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Editar
                      </Link>
                      
                      {property.status === 'DRAFT' && (
                        <button
                          onClick={() => handleDelete(property.id, property.title, property.status)}
                          disabled={deleteMutation.isPending}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400"
                        >
                          {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Plan upgrade modal */}
      <UpgradePlanModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      
      {/* Plan expired modal */}
      <PlanExpiredModal 
        isOpen={showPlanExpiredModal}
        onClose={() => setShowPlanExpiredModal(false)}
      />
    </ProtectedRoute>

  );
}

function normalizeStatus(status: unknown): 'PUBLISHED' | 'DRAFT' | 'RENTED' | 'SOLD' | 'PAUSED' | 'INACTIVE' {
  const normalized = String(status || '').trim().toUpperCase();
  if (normalized === 'PUBLISHED') return 'PUBLISHED';
  if (normalized === 'RENTED') return 'RENTED';
  if (normalized === 'SOLD') return 'SOLD';
  if (normalized === 'PAUSED') return 'PAUSED';
  if (normalized === 'INACTIVE') return 'INACTIVE';
  return 'DRAFT';
}

function StatusBadge({ status, lifecycleStatus, remainingGraceDays }: { status: string; lifecycleStatus?: string; remainingGraceDays?: number }) {
  const badges: Record<string, { bg: string; text: string; label: string }> = {
    DRAFT: { bg: 'bg-gray-500', text: 'text-white', label: 'Borrador' },
    PUBLISHED: { bg: 'bg-green-500', text: 'text-white', label: 'Publicada' },
    PAUSED: { bg: 'bg-amber-500', text: 'text-white', label: 'Pausada' },
    INACTIVE: { bg: 'bg-yellow-500', text: 'text-white', label: 'Inactiva' },
    SOLD: { bg: 'bg-red-500', text: 'text-white', label: 'Vendida' },
    RENTED: { bg: 'bg-blue-500', text: 'text-white', label: 'Alquilada' },
  };

  const badge = badges[status] || badges.DRAFT;

  // Show grace period info if applicable
  if (lifecycleStatus === 'GRACE_PERIOD' && remainingGraceDays !== undefined && remainingGraceDays > 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className={`${badge.bg} ${badge.text} text-xs font-bold px-2 py-1 rounded`}>
          {badge.label}
        </span>
        <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
          {remainingGraceDays} dias para renovar
        </span>
      </div>
    );
  }

  return (
    <span className={`${badge.bg} ${badge.text} text-xs font-bold px-2 py-1 rounded`}>
      {badge.label}
    </span>
  );
}

function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-300" />
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded mb-2" />
        <div className="h-4 bg-gray-300 rounded w-2/3 mb-3" />
        <div className="h-8 bg-gray-300 rounded mb-4" />
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-300 rounded" />
          <div className="flex-1 h-10 bg-gray-300 rounded" />
          <div className="w-12 h-10 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}

function TabButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        isActive
          ? 'px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm'
          : 'px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200'
      }
    >
      {label} <span className={isActive ? 'text-white/90' : 'text-gray-500'}>({count})</span>
    </button>
  );
}
