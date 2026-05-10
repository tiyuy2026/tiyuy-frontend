'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '@/infrastructure/api/axios-client';

// Helper function for API calls - usando axiosClient centralizado
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const response = await axiosClient.request({
    method: options.method || 'GET',
    url,
    data: options.body,
  });
  
  return response.data;
}

interface SystemStats {
  groups: {
    total: number;
    recentGrowth: number;
  };
  channels: {
    total: number;
    recentGrowth: number;
  };
  states: {
    total: number;
    recentGrowth: number;
  };
  events: {
    total: number;
    recentCreated: number;
    data: Array<{
      date: string;
      count: number;
      label: string;
    }>;
  };
}

async function fetchSystemStats(): Promise<SystemStats> {
  // Use admin endpoint for stats (groups, channels, events, posts)
  const adminStats: any = await apiCall('/admin/dashboard/stats/contacts');
  console.log('[useSystemStats] Admin stats:', adminStats);

  // Use events chart data from admin endpoint
  const eventsData = adminStats?.events?.last7Days?.map((day: any) => ({
    date: day.date,
    count: day.count,
    label: new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' }),
  })) || [];

  return {
    groups: {
      total: adminStats?.groups?.total ?? 0,
      recentGrowth: adminStats?.groups?.newThisWeek ?? 0,
    },
    channels: {
      total: adminStats?.channels?.total ?? 0,
      recentGrowth: adminStats?.channels?.newThisWeek ?? 0,
    },
    states: {
      total: adminStats?.statusPosts?.total ?? 0,
      recentGrowth: adminStats?.statusPosts?.newThisWeek ?? 0,
    },
    events: {
      total: adminStats?.events?.total ?? 0,
      recentCreated: adminStats?.events?.newToday ?? 0,
      data: eventsData.length > 0 ? eventsData : Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          count: 0,
          label: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        };
      }),
    },
  };
}

export function useSystemStats() {
  return useQuery({
    queryKey: ['system-stats'],
    queryFn: fetchSystemStats,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}
