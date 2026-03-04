'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AnalyticsRepository } from '@/infrastructure/repositories/AnalyticsRepository';
import { PropertyViewEvent, PropertyStats, DashboardStats } from '@/core/domain/entities/Analytics';

const analyticsRepo = new AnalyticsRepository();

export function useTrackView() {
  return useMutation({
    mutationFn: (event: PropertyViewEvent) => analyticsRepo.trackPropertyView(event),
  });
}

// ✅ CAMBIO MÍNIMO: Solo agregué | null
export function usePropertyStats(propertyId: number | null) {
  return useQuery({
    queryKey: ['analytics', 'property-stats', propertyId],
    queryFn: () => analyticsRepo.getPropertyStats(propertyId!), 
    enabled: !!propertyId,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsRepo.getDashboardStats(),
  });
}

// Hook automático para trackear vistas en PropertyDetail
export function useAutoTrackView(propertyId: number) {
  const trackMutation = useTrackView();

  useEffect(() => {
    if (!propertyId) return;

    const sessionId = sessionStorage.getItem('analytics_session') || 
      crypto.randomUUID().slice(0, 8);
    sessionStorage.setItem('analytics_session', sessionId);

    // Debounce para evitar spam
    const timeout = setTimeout(() => {
      trackMutation.mutate({
        propertyId,
        sessionId,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        deviceType: window.innerWidth >= 1024 ? 'DESKTOP' : 
                   window.innerWidth >= 768 ? 'TABLET' : 'MOBILE',
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [propertyId, trackMutation]);
}
