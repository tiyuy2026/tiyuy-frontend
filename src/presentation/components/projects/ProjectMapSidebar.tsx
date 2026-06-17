'use client';

import React from 'react';
import { ProjectMapSummary } from '@/core/domain/entities/PropertyMapResult';
import { ProjectMapCard } from './ProjectMapCard';
import { Home, Info, X } from 'lucide-react';

interface ProjectMapSidebarProps {
  projects: ProjectMapSummary[];
  selectedProjectId: number | null;
  isLoading: boolean;
  totalResults: number;
  coverageMessage: string | null;
  onSelectProject: (id: number | null) => void;
  onClose: () => void;
}

export function ProjectMapSidebar({
  projects,
  selectedProjectId,
  isLoading,
  totalResults,
  coverageMessage,
  onSelectProject,
  onClose,
}: ProjectMapSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Proyectos</h2>
          {!isLoading && (
            <p className="text-sm text-gray-500">
              {totalResults} {totalResults === 1 ? 'proyecto encontrado' : 'proyectos encontrados'}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {coverageMessage && (
        <div className="mx-4 mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">{coverageMessage}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Buscando proyectos...</p>
          </div>
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No se encontraron proyectos en esta zona</p>
            <p className="text-xs text-gray-400 mt-1">Intenta buscar en otra ubicación</p>
          </div>
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {projects.map((project) => (
            <ProjectMapCard
              key={project.id}
              project={project}
              isSelected={selectedProjectId === project.id}
              onClick={() => onSelectProject(
                selectedProjectId === project.id ? null : project.id
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
