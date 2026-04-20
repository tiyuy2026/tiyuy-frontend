/**
 * Hook for searching users with debounce
 * For large user bases - only fetches when user types
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminRepository } from '@/infrastructure/repositories/AdminRepository';
import { UserListItem } from '@/core/domain/entities/Admin';
import { PaginatedResponse } from '@/core/domain/repositories/IAdminRepository';

const adminRepository = new AdminRepository();
const USER_SEARCH_KEY = 'userSearch';

const emptyResponse: PaginatedResponse<UserListItem> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 50,
  number: 0,
  first: true,
  last: true,
  empty: true,
};

export function useUserSearch(debounceMs = 300) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Only fetch when there's a debounced query with at least 2 characters
  const { data, isLoading, error } = useQuery<PaginatedResponse<UserListItem>>({
    queryKey: [USER_SEARCH_KEY, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return emptyResponse;
      }
      return adminRepository.getAllUsers(undefined, undefined, debouncedQuery, { page: 0, size: 50 });
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    users: data?.content || [],
    isLoading,
    error,
    hasSearched: debouncedQuery.length >= 2,
  };
}
