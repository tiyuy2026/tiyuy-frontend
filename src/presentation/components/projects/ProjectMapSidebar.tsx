'use client';

import React from 'react';
import { ProjectMapSummary } from '@/core/domain/entities/PropertyMapResult';
import { ProjectMapCard } from './ProjectMapCard';

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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {coverageMessage && (
        <div className="mx-4 mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
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
