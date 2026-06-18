/**
 * User Projects Modal Component
 * Modal para ver los proyectos de un usuario
 */

'use client';

import { UserProjectsResponse } from '@/core/domain/entities/Admin';
import { Modal } from '@/presentation/components/ui/Modal';
import { Building, CalendarDays, MapPin, X } from 'lucide-react';

interface UserProjectsModalProps {
  data: UserProjectsResponse | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProjectsModal({ data, isLoading, isOpen, onClose }: UserProjectsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-0 max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header Profesional */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">
                Proyectos de {data?.userName || 'Usuario'}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {data?.totalProjects || 0} {data?.totalProjects === 1 ? 'proyecto' : 'proyectos'} registrados
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando proyectos...</span>
            </div>
          ) : data?.projects && data.projects.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {data.projects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300"
                >
                  <div className="flex gap-3">
                    {/* Imagen con info debajo */}
                    <div className="flex flex-col gap-2">
                      {project.coverImageUrl ? (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={project.coverImageUrl} 
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                          <Building className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      {/* Stats bajo imagen */}
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-900">{project.totalUnits} unid</p>
                        <p className="text-xs text-emerald-600">{project.soldUnits} vend</p>
                      </div>
                    </div>
                    
                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                        {project.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {project.district}, {project.city}
                      </p>
                      
                      {/* Badges Compactos */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                          project.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                          project.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {project.phase}
                        </span>
                      </div>
                      
                      {/* Progress y entrega */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                          <span>Construcción</span>
                          <span className="font-medium">{project.constructionProgress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${project.constructionProgress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Info adicional */}
                      <div className="flex items-center justify-between mt-2 text-xs">
                        {project.estimatedDeliveryDate && (
                          <span className="text-gray-400 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(project.estimatedDeliveryDate).toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: 'short' 
                            })}
                          </span>
                        )}
                        <span className="text-blue-600 font-medium">
                          {project.availableUnits} disp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">Sin proyectos</h4>
              <p className="text-gray-500 mt-1">Este usuario no tiene proyectos registrados</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
