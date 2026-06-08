'use client';

import { useQuery } from '@tanstack/react-query';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';
import type { PropertySummary } from '@/core/domain/entities/Property';

const propertyRepo = new PropertyRepository();

const STALE_TIME = 5 * 60 * 1000; // 5 min
const CACHE_TIME = 30 * 60 * 1000; // 30 min

export function useFeaturedProperties() {
  return useQuery<PropertySummary[]>({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      const mixProps = await propertyRepo.getFeaturedMix();
      if (mixProps.length > 0) return mixProps.slice(0, 10);

      const recentResult = await propertyRepo.search({
        transactionType: 'SALE' as any,
        page: 0,
        size: 10,
        sort: 'createdAt,desc',
      } as any);
      return (recentResult.properties || []).slice(0, 10);
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
  });
}
