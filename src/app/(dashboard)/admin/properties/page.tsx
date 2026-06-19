/**
 * Admin Property Management Page
 * Complete property moderation with real backend integration
 */

'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  usePropertiesForModeration,
  useToggleFeaturedProperty,
  useModerateProperty,
  usePropertyReports,
  usePropertyComments,
  useDeletePropertyComment,
  useNotifyPropertyOwner,
  useDisablePropertyByAdmin,
  useEnablePropertyByAdmin
} from '@/presentation/hooks/useAdmin';
import { usePermissions } from '@/presentation/hooks/usePermissions';
import { Card, CardHeader, CardTitle, CardContent } from '@/presentation/components/ui/Card';
import { NotificationModal } from './NotificationModal';
import { Modal } from '@/presentation/components/ui/Modal';
import { Button } from '@/presentation/components/ui/Button';
import { AdminTable } from '@/presentation/components/admin/AdminTable/AdminTable';
import { PropertiesFilters } from '@/presentation/components/admin/PropertiesFilters/PropertiesFilters';
import { PaginationParams, PaginatedResponse } from '@/core/domain/repositories/IAdminRepository';
import { PropertyModerationItem, ModeratePropertyRequest } from '@/core/domain/entities/Admin';
import { PropertiesHeaderStats } from '@/presentation/components/admin/PropertiesHeaderStats';
import { PropertyDetailModal } from '@/presentation/components/admin/PropertyDetailModal/PropertyDetailModal';
import { PropertyCardView, PropertyCard } from '@/presentation/components/admin/PropertyCardView';
import { LayoutList, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedProperties, setSelectedProperties] = useState<PropertyModerationItem[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isModerateModalOpen, setIsModerateModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyModerationItem | null>(null);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [disableReason, setDisableReason] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const { hasPermission } = usePermissions();
  const canModerateProperties = hasPermission('PROPERTIES_MODERATE');
  const canDeleteProperties = hasPermission('PROPERTIES_DELETE');
  const canFeatureProperties = hasPermission('PROPERTIES_FEATURE');

  const { data: propertiesData, isLoading, error, refetch } = usePropertiesForModeration(
    statusFilter !== 'all' ? statusFilter as any : undefined,
    searchQuery || undefined,
    { page: currentPage - 1, size: pageSize }
  );

  const moderateMutation = useModerateProperty();
  const toggleFeaturedMutation = useToggleFeaturedProperty();
  const disablePropertyMutation = useDisablePropertyByAdmin();
  const enablePropertyMutation = useEnablePropertyByAdmin();
  const notifyOwnerMutation = useNotifyPropertyOwner();

  const handleViewProperty = (property: PropertyModerationItem) => {
    setSelectedProperty(property);
    setIsViewModalOpen(true);
  };

  const handleModerateProperty = (property: PropertyModerationItem, action: string) => {
    setSelectedProperty(property);
    setIsModerateModalOpen(true);
  };

  const confirmModeration = async (action: 'APPROVE' | 'REJECT' | 'SUSPEND', reason?: string) => {
    if (!selectedProperty) return;

    await moderateMutation.mutateAsync({
      propertyId: selectedProperty.id,
      request: {
        action,
        reason,
        notes: `Moderated by admin: ${reason || 'No additional notes'}`
      }
    });
    setIsModerateModalOpen(false);
    setSelectedProperty(null);
    refetch();
  };

  const handleToggleFeatured = async (property: PropertyModerationItem) => {
    const newFeaturedState = !property.isFeatured;
    await toggleFeaturedMutation.mutateAsync({
      propertyId: property.id,
      featured: newFeaturedState
    });
    refetch();
  };

  const handleDisableProperty = async (property: PropertyModerationItem, reason: string) => {
    try {
      await disablePropertyMutation.mutateAsync({
        propertyId: property.id,
        reason
      });
      toast.success('Propiedad deshabilitada', {
        description: 'La propiedad ha sido deshabilitada exitosamente.',
        icon: '🚫',
      });
      setIsDisableModalOpen(false);
      setDisableReason('');
      setSelectedProperty(null);
      refetch();
    } catch (error) {
      toast.error('Error al deshabilitar', {
        description: 'No se pudo deshabilitar la propiedad. Inténtalo de nuevo.',
        icon: '❌',
      });
    }
  };

  const handleEnableProperty = async (property: PropertyModerationItem) => {
    try {
      await enablePropertyMutation.mutateAsync({
        propertyId: property.id,
        notifyOwner: true
      });
      toast.success('Propiedad habilitada', {
        description: 'La propiedad ha sido habilitada exitosamente.',
        icon: '✅',
      });
      setIsViewModalOpen(false);
      setSelectedProperty(null);
      refetch();
    } catch (error) {
      toast.error('Error al habilitar', {
        description: 'No se pudo habilitar la propiedad. Inténtalo de nuevo.',
        icon: '❌',
      });
    }
  };

  // Table columns
  const columns = [
    {
      key: 'title' as keyof PropertyModerationItem,
      label: 'Propiedad',
      sortable: true,
      render: (value: string, property: PropertyModerationItem) => (
        <div className="flex items-center gap-3">
          {property.thumbnailUrl && (
            <img
              src={property.thumbnailUrl}
              alt={property.title}
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{property.slug}</div>
          </div>
        </div>
      )
    },
    {
      key: 'ownerName' as keyof PropertyModerationItem,
      label: 'Propietario',
      sortable: true,
      render: (value: string, property: PropertyModerationItem) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{property.ownerEmail}</div>
        </div>
      )
    },
    {
      key: 'price' as keyof PropertyModerationItem,
      label: 'Precio',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-green-600">
          ${value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'district' as keyof PropertyModerationItem,
      label: 'Ubicación',
      sortable: true,
      render: (value: string, property: PropertyModerationItem) => (
        <div className="text-sm">
          <div>{value}</div>
          <div className="text-gray-500">{property.district}</div>
        </div>
      )
    },
    {
      key: 'status' as keyof PropertyModerationItem,
      label: 'Estado',
      sortable: true,
      render: (value: string) => {
        const statusLabels: Record<string, string> = {
          'PUBLISHED': 'Publicada',
          'PENDING': 'Pendiente',
          'REJECTED': 'Rechazada',
          'SUSPENDED': 'Suspendida',
          'DRAFT': 'Borrador',
          'PAUSED': 'Pausada',
          'EXPIRED': 'Expirada',
          'DISABLED_BY_ADMIN': 'Deshabilitada',
          'RENTED': 'Alquilada',
          'SOLD': 'Vendida'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
            value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            value === 'REJECTED' ? 'bg-red-100 text-red-800' :
            value === 'SUSPENDED' ? 'bg-orange-100 text-orange-800' :
            value === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
            value === 'PAUSED' ? 'bg-blue-100 text-blue-800' :
            value === 'EXPIRED' ? 'bg-purple-100 text-purple-800' :
            value === 'DISABLED_BY_ADMIN' ? 'bg-red-200 text-red-900 border border-red-300' :
            'bg-blue-100 text-blue-800'
          }`}>
            {statusLabels[value] || value}
          </span>
        );
      }
    },
    {
      key: 'isFeatured' as keyof PropertyModerationItem,
      label: 'Destacada',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      key: 'viewsCount' as keyof PropertyModerationItem,
      label: 'Vistas',
      sortable: true,
      render: (value: number) => (value ?? 0).toLocaleString()
    },
    {
      key: 'reportCount' as keyof PropertyModerationItem,
      label: 'Reportes',
      sortable: true,
      render: (value: number) => (
        <div className={value > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
          {value} {value === 1 ? 'reporte' : 'reportes'}
        </div>
      )
    },
    {
      key: 'createdAt' as keyof PropertyModerationItem,
      label: 'Creada',
      sortable: true,
      render: (value: Date) => new Date(value).toLocaleDateString('es-ES')
    }
  ];

  // Table actions
  const actions = [
    {
      label: 'Ver Detalles',
      onClick: handleViewProperty,
      variant: 'primary' as const
    },
    ...(canModerateProperties ? [
      {
        label: 'Aprobar',
        onClick: (property: PropertyModerationItem) => handleModerateProperty(property, 'APPROVE'),
        variant: 'primary' as const
      },
      {
        label: 'Rechazar',
        onClick: (property: PropertyModerationItem) => handleModerateProperty(property, 'REJECT'),
        variant: 'secondary' as const
      },
      {
        label: 'Suspender',
        onClick: (property: PropertyModerationItem) => handleModerateProperty(property, 'SUSPEND'),
        variant: 'secondary' as const
      }
    ] : []),
    ...(canFeatureProperties ? [
      {
        label: 'Destacar',
        onClick: handleToggleFeatured,
        variant: 'secondary' as const
      }
    ] : []),
    ...(canModerateProperties ? [
      {
        label: 'Deshabilitar',
        onClick: (property: PropertyModerationItem) => {
          const reason = prompt('Motivo para deshabilitar la propiedad:');
          if (reason) handleDisableProperty(property, reason);
        },
        variant: 'danger' as const,
        condition: (property: PropertyModerationItem) => property.status !== 'DISABLED_BY_ADMIN'
      },
      {
        label: 'Habilitar',
        onClick: handleEnableProperty,
        variant: 'primary' as const,
        condition: (property: PropertyModerationItem) => property.status === 'DISABLED_BY_ADMIN'
      }
    ] : [])
  ];

  // Filter options
  const filterOptions = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'DRAFT', label: 'Borrador' },
        { value: 'PENDING', label: 'Pendiente de aprobación' },
        { value: 'PUBLISHED', label: 'Publicada' },
        { value: 'PAUSED', label: 'Pausada (Suscripción)' },
        { value: 'EXPIRED', label: 'Expirada' },
        { value: 'REJECTED', label: 'Rechazada' },
        { value: 'SUSPENDED', label: 'Suspendida' },
        { value: 'DISABLED_BY_ADMIN', label: 'Deshabilitada por Admin' }
      ]
    }
  ];

  const handleFilterChange = (filters: Record<string, any>) => {
    if (filters.status !== undefined) {
      setStatusFilter(filters.status);
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Calcular estadísticas
  const totalProperties = propertiesData?.totalElements || 0;
  const publishedProperties = propertiesData?.content?.filter(p => p.status === 'PUBLISHED').length || 0;
  const draftProperties = propertiesData?.content?.filter(p => p.status === 'DRAFT').length || 0;
  const totalViews = propertiesData?.content?.reduce((sum, p) => sum + (p.viewsCount || 0), 0) || 0;
  const totalReports = propertiesData?.content?.reduce((sum, p) => sum + (p.reportCount || 0), 0) || 0;

  return (
    <div className="space-y-6 px-6 py-4">
      {/* Stats Cards Header */}
      <PropertiesHeaderStats
        totalProperties={totalProperties}
        publishedProperties={publishedProperties}
        draftProperties={draftProperties}
        totalViews={totalViews}
        totalReports={totalReports}
      />

      {/* Filters */}
      <PropertiesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={handleClearFilters}
      />

      {/* View Mode Toggle */}
      <div className="flex items-center justify-end gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-1 flex gap-1 shadow-sm">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            Tabla
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === 'cards'
                ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            Tarjetas
          </button>
        </div>
      </div>

      {/* Properties List - Table or Cards */}
      {viewMode === 'table' ? (
        <AdminTable
          data={propertiesData?.content || []}
          columns={columns}
          loading={isLoading}
          error={error?.message || undefined}
          actions={actions}
          selection={{
            selectedItems: selectedProperties,
            onSelectionChange: setSelectedProperties,
            getRowId: (property) => property.id
          }}
          pagination={
            propertiesData && {
              page: currentPage,
              size: pageSize,
              total: propertiesData.totalElements,
              onPageChange: setCurrentPage,
              onSizeChange: setPageSize
            }
          }
          emptyState={{
            title: 'No se encontraron propiedades',
            description: 'Intenta ajustar tu búsqueda o filtros.',
            action: {
              label: 'Limpiar filtros',
              onClick: handleClearFilters
            }
          }}
        />
      ) : (
        <PropertyCardView
          data={propertiesData?.content || []}
          loading={isLoading}
          error={error?.message || undefined}
          onViewDetails={handleViewProperty}
          actions={[
            ...(canModerateProperties ? [
              {
                label: 'Aprobar',
                onClick: (property: PropertyModerationItem) => handleModerateProperty(property, 'APPROVE'),
                variant: 'primary' as const
              },
              {
                label: 'Rechazar',
                onClick: (property: PropertyModerationItem) => handleModerateProperty(property, 'REJECT'),
                variant: 'secondary' as const
              },
              {
                label: 'Suspender',
                onClick: (property: PropertyModerationItem) => handleModerateProperty(property, 'SUSPEND'),
                variant: 'secondary' as const
              }
            ] : []),
            ...(canFeatureProperties ? [
              {
                label: 'Destacar',
                onClick: handleToggleFeatured,
                variant: 'primary' as const
              }
            ] : []),
            ...(canModerateProperties ? [
              {
                label: 'Deshabilitar',
                onClick: (property: PropertyModerationItem) => {
                  const reason = prompt('Motivo para deshabilitar la propiedad:');
                  if (reason) handleDisableProperty(property, reason);
                },
                variant: 'danger' as const,
                condition: (property: PropertyModerationItem) => property.status !== 'DISABLED_BY_ADMIN'
              },
              {
                label: 'Habilitar',
                onClick: handleEnableProperty,
                variant: 'primary' as const,
                condition: (property: PropertyModerationItem) => property.status === 'DISABLED_BY_ADMIN'
              }
            ] : [])
          ]}
          renderCard={(property: PropertyModerationItem) => (
            <PropertyCard
              property={property}
              onClick={handleViewProperty}
            />
          )}
          pagination={
            propertiesData && {
              page: currentPage,
              size: pageSize,
              total: propertiesData.totalElements,
              onPageChange: setCurrentPage,
              onSizeChange: setPageSize
            }
          }
          emptyState={{
            title: 'No se encontraron propiedades',
            description: 'Intenta ajustar tu búsqueda o filtros.',
            action: {
              label: 'Limpiar filtros',
              onClick: handleClearFilters
            }
          }}
        />
      )}

      {/* Property Details Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isLoading={isLoading}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEnableProperty={handleEnableProperty}
        onDisableProperty={handleDisableProperty}
        onNotifyOwner={(property) => {
          setSelectedProperty(property);
          setIsNotifyModalOpen(true);
        }}
        isEnabling={enablePropertyMutation.isPending}
        isDisabling={disablePropertyMutation.isPending}
      />

      {/* Moderation Modal */}
      {selectedProperty && (
        <Modal isOpen={isModerateModalOpen} onClose={() => setIsModerateModalOpen(false)}>
          <ModerationModal
            property={selectedProperty}
            onConfirm={confirmModeration}
            onCancel={() => setIsModerateModalOpen(false)}
          />
        </Modal>
      )}

      {/* Notification Modal */}
      {selectedProperty && (
        <Modal isOpen={isNotifyModalOpen} onClose={() => setIsNotifyModalOpen(false)}>
          <NotificationModal
            property={selectedProperty}
            onSend={async (subject, message, includeDetails) => {
              await notifyOwnerMutation.mutateAsync({
                propertyId: selectedProperty.id,
                request: {
                  subject,
                  message,
                  includePropertyDetails: includeDetails
                }
              });
              toast.success('Notificación enviada', {
                description: 'El propietario ha sido notificado exitosamente.',
                icon: '📧',
              });
              setIsNotifyModalOpen(false);
            }}
            onCancel={() => setIsNotifyModalOpen(false)}
          />
        </Modal>
      )}

      {/* Disable Property Modal */}
      {selectedProperty && (
        <Modal isOpen={isDisableModalOpen} onClose={() => setIsDisableModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Deshabilitar Propiedad</h3>
            <p className="text-sm text-gray-600 mb-4">
              Esta acción deshabilitará la propiedad <strong>{selectedProperty.title}</strong> del propietario <strong>{selectedProperty.ownerName}</strong>.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo para deshabilitar <span className="text-red-500">*</span>
              </label>
              <textarea
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: La propiedad incumple las políticas de publicación..."
                required
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">
                <strong>Nota:</strong> El propietario será notificado automáticamente sobre esta deshabilitación.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={() => {
                  if (disableReason.trim()) {
                    handleDisableProperty(selectedProperty, disableReason);
                    setDisableReason('');
                    setIsDisableModalOpen(false);
                  }
                }}
                disabled={!disableReason.trim()}
              >
                Deshabilitar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDisableReason('');
                  setIsDisableModalOpen(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Moderation Modal Component
interface ModerationModalProps {
  property: PropertyModerationItem;
  onConfirm: (action: 'APPROVE' | 'REJECT' | 'SUSPEND', reason?: string) => void;
  onCancel: () => void;
}

function ModerationModal({ property, onConfirm, onCancel }: ModerationModalProps) {
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | 'SUSPEND'>('APPROVE');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(action, reason);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-lg font-semibold mb-4">Moderar Propiedad</h3>

      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          Moderando: <strong>{property.title}</strong>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acción</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="APPROVE">Aprobar</option>
              <option value="REJECT">Rechazar</option>
              <option value="SUSPEND">Suspender</option>
            </select>
          </div>

          {(action === 'REJECT' || action === 'SUSPEND') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`Motivo para ${action === 'REJECT' ? 'rechazar' : 'suspender'}...`}
                required
              />
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant={action === 'APPROVE' ? 'primary' : 'danger'}>
              {action === 'APPROVE' ? 'Aprobar' : action === 'REJECT' ? 'Rechazar' : 'Suspender'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Property Reports Section Component - Shows real data from backend
interface PropertyReportsSectionProps {
  propertyId: number;
}

function PropertyReportsSection({ propertyId }: PropertyReportsSectionProps) {
  const { data: reports, isLoading, error } = usePropertyReports(propertyId);

  if (isLoading) {
    return (
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Reportes de Usuarios</h4>
        <div className="text-gray-500">Cargando reportes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Reportes de Usuarios</h4>
        <div className="text-red-500">Error al cargar reportes</div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Reportes de Usuarios</h4>
        <div className="text-gray-500 bg-gray-50 p-4 rounded-lg">
          No hay reportes para esta propiedad
        </div>
      </div>
    );
  }

  const reasonLabels: Record<string, string> = {
    'SPAM': 'Spam',
    'SCAM': 'Estafa',
    'INCORRECT_DATA': 'Datos incorrectos',
    'OFFENSIVE': 'Contenido ofensivo',
    'DUPLICATE': 'Propiedad duplicada',
    'OTHER': 'Otro'
  };

  const statusLabels: Record<string, string> = {
    'PENDING': 'Pendiente',
    'APPROVED': 'Aprobado',
    'REJECTED': 'Rechazado'
  };

  const statusColors: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800'
  };

  return (
    <div className="mt-6">
      <h4 className="font-medium text-gray-900 mb-3">
        Reportes de Usuarios ({reports.length})
      </h4>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {reports.map((report) => (
          <div key={report.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{report.reporterName}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[report.status] || 'bg-gray-100'}`}>
                  {statusLabels[report.status] || report.status}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(report.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-1">
              <strong>Motivo:</strong> {reasonLabels[report.reason] || report.reason}
            </div>
            <div className="text-sm text-gray-700">
              {report.description}
            </div>
            {report.reviewedBy && (
              <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                Revisado por: {report.reviewerName} - {statusLabels[report.status]}
                {report.reviewNotes && (
                  <div className="mt-1 italic">"{report.reviewNotes}"</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Property Comments Section Component - Shows real data from backend
interface PropertyCommentsSectionProps {
  propertyId: number;
}

function PropertyCommentsSection({ propertyId }: PropertyCommentsSectionProps) {
  const { data: comments, isLoading, error } = usePropertyComments(propertyId);
  const deleteCommentMutation = useDeletePropertyComment();
  const queryClient = useQueryClient();
  const [showAll, setShowAll] = useState(false);
  const MAX_VISIBLE = 5;

  if (isLoading) {
    return (
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Comentarios de Usuarios</h4>
        <div className="text-gray-500">Cargando comentarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Comentarios de Usuarios</h4>
        <div className="text-red-500">Error al cargar comentarios</div>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Comentarios de Usuarios</h4>
        <div className="text-gray-500 bg-gray-50 p-4 rounded-lg">
          No hay comentarios para esta propiedad
        </div>
      </div>
    );
  }

  const handleDeleteComment = async (commentId: number) => {
    if (confirm('¿Estás seguro de eliminar este comentario?')) {
      await deleteCommentMutation.mutateAsync({ propertyId, commentId });
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties', propertyId, 'comments'] });
    }
  };

  return (
    <div className="mt-6">
      <h4 className="font-medium text-gray-900 mb-3">
        Comentarios de Usuarios ({comments.length})
      </h4>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {(showAll ? comments : comments.slice(0, MAX_VISIBLE)).map((comment) => (
          <div key={comment.id} className={`bg-gray-50 p-4 rounded-lg border border-gray-200 ${comment.isFlagged ? 'border-red-300 bg-red-50' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.userName}</span>
                {comment.isFlagged && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                    [MARCADO]
                  </span>
                )}
                {comment.rating && (
                  <span className="text-yellow-500">
                    {'★'.repeat(comment.rating)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="text-sm text-gray-700 mb-2">
              {comment.content}
            </div>
            {comment.isFlagged && comment.flagReason && (
              <div className="text-xs text-red-600 mb-2">
                <strong>Motivo de marca:</strong> {comment.flagReason}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Eliminar comentario
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
