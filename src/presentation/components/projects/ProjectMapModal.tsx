'use client';

import React, { useEffect } from 'react';
import { useProjectMap } from '@/presentation/hooks/useProjectMap';
import { ProjectMapView } from './ProjectMapView';
import { ProjectMapSidebar } from './ProjectMapSidebar';

interface ProjectMapModalProps {
  filters?: {
    district?: string;
    province?: string;
    region?: string;
    type?: string;
    phase?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    isFeatured?: boolean;
  };
  onClose: () => void;
}

export function ProjectMapModal({ filters, onClose }: ProjectMapModalProps) {
  const {
    searchResult,
    isLoading,
    selectedProjectId,
    search,
    selectProject,
    reset,
  } = useProjectMap();

  useEffect(() => {
    if (filters) {
      search(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full h-full flex flex-col md:flex-row">
        <div className="md:w-96 md:max-w-md bg-white md:rounded-l-2xl overflow-hidden z-10
          order-2 md:order-1 h-1/3 md:h-full">
          <ProjectMapSidebar
            projects={searchResult?.projects || []}
            selectedProjectId={selectedProjectId}
            isLoading={isLoading}
            totalResults={searchResult?.totalResults || 0}
            coverageMessage={searchResult?.coverageMessage || null}
            onSelectProject={selectProject}
            onClose={onClose}
          />
        </div>

        <div className="flex-1 order-1 md:order-2 h-2/3 md:h-full">
          <ProjectMapView
            projects={searchResult?.projects || []}
            selectedProjectId={selectedProjectId}
            onSelectProject={selectProject}
          />
        </div>
      </div>
    </div>
  );
}
