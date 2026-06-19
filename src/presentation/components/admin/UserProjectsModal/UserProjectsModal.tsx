/**
 * User Projects Modal Component
 * Modal para ver los proyectos de un usuario
 */

'use client';

import { UserProjectsResponse } from '@/core/domain/entities/Admin';
import { Modal } from '@/presentation/components/ui/Modal';
import { Building, MapPin, X } from 'lucide-react';

interface UserProjectsModalProps {
  data: UserProjectsResponse | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProjectsModal({ data, isLoading, isOpen, onClose }: UserProjectsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-0 max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#00E676] px-4 py-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-green-900">
                Proyectos de {data?.userName || 'Usuario'}
              </h3>
              <p className="text-green-700 text-xs mt-0.5">
                {data?.totalProjects || 0} {data?.totalProjects === 1 ? 'proyecto' : 'proyectos'} registrados
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-green-600 hover:text-green-800 transition-colors p-1 hover:bg-green-200 rounded-lg flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm text-gray-600">Cargando proyectos...</span>
            </div>
          ) : data?.projects && data.projects.length > 0 ? (
            <div className="space-y-2">
              {data.projects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300"
                >
                  <div className="flex gap-3">
                    {/* Imagen */}
                    <div className="flex-shrink-0">
                      {project.coverImageUrl ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={project.coverImageUrl} 
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                          <Building className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                            {project.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            {project.district}, {project.city}
                          </p>
                        </div>
                        {/* Stats compactos */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold text-gray-900">{project.totalUnits} unid</p>
                          <p className="text-[10px] text-emerald-600">{project.soldUnits} vend</p>
                        </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          project.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                          project.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                          project.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                          {project.phase}
                        </span>
                        <span className="text-[10px] text-blue-600 font-medium ml-auto">
                          {project.availableUnits} disp
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building className="w-7 h-7 text-gray-400" />
              </div>
              <h4 className="text-base font-medium text-gray-900">Sin proyectos</h4>
              <p className="text-sm text-gray-500 mt-1">Este usuario no tiene proyectos registrados</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
