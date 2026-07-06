'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ProtectedRoute } from '@/presentation/components/auth/ProtectedRoute';
import { useAuthStore } from '@/presentation/store/authStore';
import { useProjects } from '@/presentation/hooks/useProjects';
import { useActiveSubscription } from '@/presentation/hooks/useFinance';
import { TrialGuard } from '@/presentation/components/guards/TrialGuard/TrialGuard';
import { TrialWarningBanner } from '@/presentation/components/guards/TrialGuard/TrialWarningBanner';
import { PlanExpiredModal } from '@/presentation/components/modals/PlanExpiredModal';
import { toast } from '@/presentation/store/toastStore';
import { Footer } from '@/presentation/components/layout/Footer/Footer';

export default function MyProjectsPage() {
  const { user } = useAuthStore();
  const { myProjects, publishProject, featureProject, deleteProject } = useProjects();
  const { data: activeSubscription } = useActiveSubscription();
  const [activeTab, setActiveTab] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'COMPLETED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPlanExpiredModal, setShowPlanExpiredModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  // Query para obtener proyectos
  const { data: projectsData, isLoading, refetch } = myProjects(currentPage, pageSize);

  // Mutations
  const publishMutation = publishProject();
  const featureMutation = featureProject();
  const deleteMutation = deleteProject();

  // Calculate if user can publish
  const publishedProjectsCount = useMemo(() => {
    return (projectsData?.content || []).filter((p: any) => p.status === 'PUBLISHED').length;
  }, [projectsData]);

  const canPublish = useMemo(() => {
    if (activeSubscription) {
      // Has plan: use plan logic (remainingPublications)
      return activeSubscription.remainingPublications > 0;
    }
    
    // WITHOUT SUBSCRIPTION: up to 1 FREE PUBLISHED project
    // Once user publishes 1 project, FREE is permanently blocked
    return publishedProjectsCount < 1;
  }, [activeSubscription, publishedProjectsCount]);


  // Function to publish project
  const handlePublish = async (projectId: number) => {
    if (!canPublish) {
      setShowPlanExpiredModal(true);
      return;
    }
    try {
      await publishMutation.mutateAsync(projectId);
      toast.success('Proyecto publicado exitosamente!');
    } catch (error: any) {
      toast.error(error.message || 'Error al publicar proyecto');
    }
  };


  // Function to feature project
  const handleFeature = async (projectId: number) => {
    try {
      await featureMutation.mutateAsync({ projectId, featured: true });
      toast.success('Proyecto destacado exitosamente!');
    } catch (error: any) {
      toast.error(error.message || 'Error al destacar proyecto');
    }
  };

  // Function to delete project
  const handleDelete = async (projectId: number) => {
    if (!confirm('Estas seguro de eliminar este proyecto? Esta accion no se puede deshacer.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(projectId);
      toast.success('Proyecto eliminado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar proyecto');
    }
  };

  const projects = projectsData?.content || [];
  const totalPages = projectsData?.totalPages || 0;
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'DRAFT':
        return matchesSearch && project.status === 'DRAFT';
      case 'PUBLISHED':
        return matchesSearch && project.status === 'PUBLISHED';
      case 'PAUSED':
        return matchesSearch && project.status === 'PAUSED';
      case 'COMPLETED':
        return matchesSearch && project.status === 'COMPLETED';
      default:
        return matchesSearch;
    }
  });

  const getStatusColor = (status: string, lifecycleStatus?: string, remainingGraceDays?: number) => {
    // Show amber for grace period
    if (lifecycleStatus === 'GRACE_PERIOD' && remainingGraceDays !== undefined && remainingGraceDays > 0) {
      return 'bg-amber-100 text-amber-800';
    }
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-amber-100 text-amber-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string, lifecycleStatus?: string, remainingGraceDays?: number) => {
    if (lifecycleStatus === 'GRACE_PERIOD' && remainingGraceDays !== undefined && remainingGraceDays > 0) {
      return `Pausado - ${remainingGraceDays} dias`;
    }
    switch (status) {
      case 'DRAFT': return 'Borrador';
      case 'PUBLISHED': return 'Publicado';
      case 'PAUSED': return 'Pausado';
      case 'COMPLETED': return 'Completado';
      default: return status;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'PRE_SALE': return 'bg-purple-100 text-purple-800';
      case 'SALE': return 'bg-orange-100 text-orange-800';
      case 'DELIVERY': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'PRE_SALE': return 'Pre-venta';
      case 'SALE': return 'En Venta';
      case 'DELIVERY': return 'Entrega';
      default: return phase;
    }
  };

  // In real estate context, we allow access to authorized users
  // Role-specific validation is handled at ProtectedRoute level

  return (
    <ProtectedRoute>

      <TrialGuard>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-9xl mx-auto px-8 xl:px-16">
            {/* Trial warning banner */}
            <TrialWarningBanner />
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Proyectos</h1>
                <p className="text-gray-600 mt-2">Administra tus proyectos inmobiliarios y desarrollos</p>
              </div>
              <Link
                href="/dashboard/projects/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                Nuevo Proyecto
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <div className="w-6 h-6 bg-purple-600 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Publicados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p: any) => p.status === 'PUBLISHED').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <div className="w-6 h-6 bg-orange-600 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unidades Vendidas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.reduce((total: number, p: any) => total + (p.soldUnits || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Construccion</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter((p: any) => p.phase === 'SALE').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar proyectos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-none">
              <div className="flex space-x-6 sm:space-x-8 px-4 min-w-max">
                {[
                  { key: 'ALL', label: 'Todos', count: projects.length },
                  { key: 'DRAFT', label: 'Borradores', count: projects.filter((p: any) => p.status === 'DRAFT').length },
                  { key: 'PUBLISHED', label: 'Publicados', count: projects.filter((p: any) => p.status === 'PUBLISHED').length },
                  { key: 'PAUSED', label: 'Pausados', count: projects.filter((p: any) => p.status === 'PAUSED').length },
                  { key: 'COMPLETED', label: 'Completados', count: projects.filter((p: any) => p.status === 'COMPLETED').length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Cargando proyectos...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos aun'}</h3>
              <p className="text-gray-500 mb-6">{searchTerm ? 'Intenta otros terminos de busqueda' : 'Comienza creando tu primer proyecto inmobiliario'}</p>
              {!searchTerm && (
                <Link
                  href="/dashboard/projects/new"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Crear Primer Proyecto
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProjects.map((project: any) => (
                <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Project Image */}
                  <div className="aspect-video bg-gray-100 relative">
                    {project.coverImageUrl ? (
                      <img
                        src={`/api/images/proxy?url=${encodeURIComponent(project.coverImageUrl)}`}
                        alt={project.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Error loading project image:', project.coverImageUrl);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-12 h-12 bg-gray-300 rounded"></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-12 bg-gray-300 rounded"></div>
                      </div>
                    )}
                    
                    {/* Status and Phase Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status, project.lifecycleStatus, project.remainingGraceDays)}`}>
                        {getStatusText(project.status, project.lifecycleStatus, project.remainingGraceDays)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(project.phase)}`}>
                        {getPhaseText(project.phase)}
                      </span>
                      {project.isFeatured && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Destacado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Project Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tipo:</span>
                        <span className="font-medium">{project.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unidades:</span>
                        <span className="font-medium">{project.totalUnits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Desde:</span>
                        <span className="font-medium">S/ {project.priceFrom?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ubicacion:</span>
                        <span className="font-medium text-right">{project.district}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {/* Debug to verify project status */}
                      <div className="text-xs text-red-600 mb-2 hidden">
                        DEBUG: status={project.status}, isFeatured={project.isFeatured}
                      </div>
                      
                      {/* First row: View and Edit */}
                      <div className="flex gap-2 mb-2">
                        <Link
                          href={`/projects/detail/${project.slug}`}
                          target="_blank"
                          className="flex-1 text-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/dashboard/projects/${project.id}/edit`}
                          className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Editar
                        </Link>
                      </div>
                      
                      {/* Second row: Actions by status */}
                      {project.status === 'DRAFT' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePublish(project.id)}
                            disabled={publishMutation.isPending}
                            className="flex-1 text-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {publishMutation.isPending ? 'Publicando...' : 'Publicar'}
                          </button>

                          <button
                            onClick={() => handleDelete(project.id)}
                            disabled={deleteMutation.isPending}
                            className="flex-1 text-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      )}
                      
                      {project.status === 'PAUSED' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePublish(project.id)}
                            disabled={publishMutation.isPending}
                            className="flex-1 text-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {publishMutation.isPending ? 'Reactivando...' : 'Reactivar'}
                          </button>


                          <button
                            onClick={() => handleDelete(project.id)}
                            disabled={deleteMutation.isPending}
                            className="flex-1 text-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      )}
                      
                      {project.status === 'PUBLISHED' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFeature(project.id)}
                            disabled={featureMutation.isPending}
                            className="flex-1 text-center px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {featureMutation.isPending ? 'Destacando...' : 'Destacar'}
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            disabled={deleteMutation.isPending}
                            className="flex-1 text-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      )}
                      
                      {project.status === 'PUBLISHED' && project.isFeatured && (
                        <div className="text-center">
                          <span className="inline-flex items-center px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                            Proyecto Destacado
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i;
                    } else if (currentPage <= 3) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 4) {
                      pageNum = totalPages - 7 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 text-sm font-semibold rounded-lg transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:text-gray-900'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                >
                  Siguiente
                </button>
              </div>
            )}
        </div>
      </div>
      </TrialGuard>
      
      {/* Plan expired modal */}
      <PlanExpiredModal 
        isOpen={showPlanExpiredModal}
        onClose={() => setShowPlanExpiredModal(false)}
      />
      <Footer />
    </ProtectedRoute>
    
  );
}


