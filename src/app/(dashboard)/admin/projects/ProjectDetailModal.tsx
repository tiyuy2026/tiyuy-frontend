/**
 * Project Detail Modal Component
 * Muestra el modal con detalles completos del proyecto
 */

'use client';

import { ProjectAdminItem } from '@/core/domain/entities/Admin';
import { Button } from '@/presentation/components/ui/Button';
import { Modal } from '@/presentation/components/ui/Modal';

interface ProjectDetailModalProps {
  project: ProjectAdminItem | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onEnableProject: (project: ProjectAdminItem) => void;
  onDisableProject: (project: ProjectAdminItem) => void;
  onToggleFeatured: (project: ProjectAdminItem) => void;
  onNotifyDeveloper: (project: ProjectAdminItem) => void;
  isEnabling: boolean;
  isDisabling: boolean;
  isTogglingFeatured: boolean;
}

export function ProjectDetailModal({
  project,
  isLoading,
  isOpen,
  onClose,
  onEnableProject,
  onDisableProject,
  onToggleFeatured,
  onNotifyDeveloper,
  isEnabling,
  isDisabling,
  isTogglingFeatured,
}: ProjectDetailModalProps) {
  if (!project) return null;

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'PUBLISHED': 'Publicado',
      'PENDING': 'Pendiente',
      'REJECTED': 'Rechazado',
      'SUSPENDED': 'Suspendido',
      'DRAFT': 'Borrador',
      'PAUSED': 'Pausado',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado'
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-400/30 text-green-50 border border-green-400/40';
      case 'PENDING':
        return 'bg-amber-400/30 text-amber-50 border border-amber-400/40';
      case 'REJECTED':
        return 'bg-red-400/30 text-red-50 border border-red-400/40';
      case 'SUSPENDED':
        return 'bg-red-400/30 text-red-50 border border-red-400/40';
      case 'PAUSED':
        return 'bg-gray-400/30 text-gray-50 border border-gray-400/40';
      default:
        return 'bg-gray-400/30 text-gray-50 border border-gray-400/40';
    }
  };

  const getPhaseLabel = (phase: string) => {
    const phaseLabels: Record<string, string> = {
      'PLANNING': 'Planificacion',
      'CONSTRUCTION': 'En Construccion',
      'PRE_SALE': 'Pre Venta',
      'SALE': 'En Venta',
      'COMPLETED': 'Completado'
    };
    return phaseLabels[phase] || phase;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-0 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-5">
          <div className="flex items-center gap-4">
            {project.coverImageUrl ? (
              <img
                src={project.coverImageUrl}
                alt={project.name}
                className="w-20 h-20 rounded-xl object-cover border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30 shadow-lg">
                {project.name?.[0]?.toUpperCase() || 'P'}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">
                {project.name}
              </h3>
              <p className="text-blue-100 text-sm mt-0.5 truncate">{project.slug}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
                {project.isFeatured && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-400/30 text-purple-50 border border-purple-400/40">
                    Destacado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Grid de Informacion Profesional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Informacion del Proyecto */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Informacion del Proyecto</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tipo</span>
                  <span className="font-semibold text-gray-900">{project.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Fase</span>
                  <span className="font-medium text-gray-900">{getPhaseLabel(project.phase)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Precio</span>
                  <span className="font-semibold text-green-600">
                    ${project.priceRange?.min?.toLocaleString()} - ${project.priceRange?.max?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Creado</span>
                  <span className="font-medium text-gray-900">
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Desarrollador */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Desarrollador</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500">Nombre</span>
                  <div className="font-medium text-gray-900 truncate">{project.developerName}</div>
                </div>
                <div>
                  <span className="text-gray-500">Email</span>
                  <div className="font-medium text-gray-900 truncate">{project.developerEmail}</div>
                </div>
              </div>
            </div>

            {/* Ubicacion */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Ubicacion</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Distrito</span>
                  <span className="font-medium text-gray-900">{project.district}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ciudad</span>
                  <span className="font-medium text-gray-900">{project.city}</span>
                </div>
              </div>
            </div>

            {/* Unidades */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">Unidades</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold text-gray-900">{project.totalUnits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Vendidas</span>
                  <span className="font-medium text-green-600">{project.soldUnits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Disponibles</span>
                  <span className="font-medium text-blue-600">{project.availableUnits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Avance</span>
                  <span className="font-medium text-teal-600">{project.constructionProgress}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rapidas */}
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">Acciones Rapidas</h4>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => onNotifyDeveloper(project)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-sm"
              >
                <span className="flex items-center gap-2 text-gray-700">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Notificar Desarrollador
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => onToggleFeatured(project)}
                disabled={isTogglingFeatured}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-sm ${
                  project.isFeatured 
                    ? 'bg-purple-50 border-purple-200 hover:border-purple-300' 
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <span className={`flex items-center gap-2 ${project.isFeatured ? 'text-purple-700' : 'text-gray-700'}`}>
                  <svg className={`w-4 h-4 ${project.isFeatured ? 'text-purple-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {project.isFeatured ? 'Quitar Destacado' : 'Marcar como Destacado'}
                </span>
                {isTogglingFeatured ? (
                  <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Gestion de Estado */}
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">Gestion de Estado</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Administra el estado de este proyecto segun sea necesario.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              {(project.status === 'PAUSED' || project.status === 'SUSPENDED') && (
                <Button
                  onClick={() => onEnableProject(project)}
                  disabled={isEnabling || isLoading}
                  variant="primary"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-200"
                >
                  {isEnabling ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Habilitando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Habilitar Proyecto
                    </span>
                  )}
                </Button>
              )}
              {project.status !== 'PAUSED' && project.status !== 'SUSPENDED' && (
                <Button
                  onClick={() => onDisableProject(project)}
                  disabled={isDisabling || isLoading}
                  variant="danger"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/30 transition-all duration-200"
                >
                  {isDisabling ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Deshabilitando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Deshabilitar Proyecto
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 p-4 pt-4 border-t bg-white">
          <Button variant="outline" onClick={onClose} className="px-8">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
