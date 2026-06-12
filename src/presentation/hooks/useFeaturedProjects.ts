'use client';

import { useQuery } from '@tanstack/react-query';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import type { ProjectSummary } from '@/core/domain/entities/Project';

const projectRepo = new ProjectRepository();

const STALE_TIME = 5 * 60 * 1000; // 5 min
const CACHE_TIME = 30 * 60 * 1000; // 30 min

export function useFeaturedProjects() {
  return useQuery<ProjectSummary[]>({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      const result = await projectRepo.getFeaturedItems();
      let items = result.content || [];

      if (items.length < 15) {
        try {
          const recentResult = await projectRepo.searchProjects({
            page: 0,
            size: 15,
            sort: 'createdAt,desc',
          });
          if (recentResult && recentResult.content) {
            const existingIds = new Set(items.map((p: any) => p.id));
            const additional = recentResult.content.filter(
              (p: any) => !existingIds.has(p.id)
            );
            items = [...items, ...additional].slice(0, 15);
          }
        } catch (e) {
          // silencio
        }
      }

      return items;
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
  });
}
