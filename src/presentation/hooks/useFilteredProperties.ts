'use client';

import { useQuery } from '@tanstack/react-query';
import { PropertyRepository } from '@/infrastructure/repositories/PropertyRepository';
import type { PropertySummary } from '@/core/domain/entities/Property';
import type { PropertyFilter } from '@/core/domain/entities/PropertyFilter';

const propertyRepo = new PropertyRepository();

const STALE_TIME = 5 * 60 * 1000; // 5 min
const CACHE_TIME = 30 * 60 * 1000; // 30 min

export function useFilteredProperties(filter: PropertyFilter) {
  const cacheKey = [
    'filtered-properties',
    filter.type,
    filter.transactionType,
    filter.district,
  ];

  return useQuery<PropertySummary[]>({
    queryKey: cacheKey,
    queryFn: async () => {
      const result = await propertyRepo.search({
        ...filter,
        page: 0,
        size: 15,
        sort: 'createdAt,desc',
      });
      return result.properties || [];
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
  });
}
