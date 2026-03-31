import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../infrastructure/api/axios-client';

interface UserEventsParams {
  eventType?: string;
  city?: string;
  featured?: boolean;
  dateFilter?: string;
  location?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: string;
}

interface UserEventsResponse {
  content: any[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const useUserEventsByRole = (params: UserEventsParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.eventType) queryParams.append('eventType', params.eventType);
  if (params.city) queryParams.append('city', params.city);
  if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
  if (params.dateFilter) queryParams.append('dateFilter', params.dateFilter);
  if (params.location) queryParams.append('location', params.location);
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.direction) queryParams.append('direction', params.direction);

  return useQuery({
    queryKey: ['user-events-by-role', params],
    queryFn: async () => {
      const response = await apiClient.get(`/contacts/extended/events/user-events?${queryParams.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
