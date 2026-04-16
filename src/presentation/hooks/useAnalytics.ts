'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AnalyticsRepository } from '@/infrastructure/repositories/AnalyticsRepository';
import { 
  PropertyViewEvent, 
  PropertyStats, 
  DashboardStats,
  AuditLogEntry,
  AuditLogFilters,
  UserActivity,
  ActivityStats,
  CommunicationStats,
  AdminNotification,
  NotificationPreference,
  SystemAlert,
  DashboardMetrics
} from '@/core/domain/entities/Analytics';

const analyticsRepo = new AnalyticsRepository();

export function useTrackView() {
  return useMutation({
    mutationFn: (event: PropertyViewEvent) => analyticsRepo.trackPropertyView(event),
  });
}

export function usePropertyStats(propertyId: number | null) {
  return useQuery({
    queryKey: ['analytics', 'property-stats', propertyId],
    queryFn: () => analyticsRepo.getPropertyStats(propertyId!), 
    enabled: !!propertyId,
  });
}

// ✅ CAMBIO MÍNIMO: Solo agregué | null
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

// Audit Log hooks
export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ['audit', 'logs', filters],
    queryFn: () => analyticsRepo.getAuditLogs(filters),
  });
}

export function useAuditLogsByAction(action: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['audit', 'logs', 'by-action', action, page, size],
    queryFn: () => analyticsRepo.getAuditLogsByAction(action, page, size),
  });
}

export function useAuditLogsByDepartment(department: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['audit', 'logs', 'by-department', department, page, size],
    queryFn: () => analyticsRepo.getAuditLogsByDepartment(department, page, size),
  });
}

export function useAuditLogsByDateRange(startDate: string, endDate: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['audit', 'logs', 'by-date-range', startDate, endDate, page, size],
    queryFn: () => analyticsRepo.getAuditLogsByDateRange(startDate, endDate, page, size),
  });
}

// Activity hooks
export function useUserActivities(type?: string, dateRange?: string) {
  return useQuery({
    queryKey: ['activity', 'user', type, dateRange],
    queryFn: () => analyticsRepo.getUserActivities(type, dateRange),
  });
}

export function useActivityStats(dateRange?: string) {
  return useQuery({
    queryKey: ['activity', 'stats', dateRange],
    queryFn: () => analyticsRepo.getActivityStats(dateRange),
  });
}

export function useExportActivitiesToPDF() {
  return useMutation({
    mutationFn: ({ type, dateRange }: { type?: string; dateRange?: string }) => 
      analyticsRepo.exportActivitiesToPDF(type, dateRange),
  });
}

// Communication hooks
export function useCommunicationStats() {
  return useQuery({
    queryKey: ['communications', 'stats'],
    queryFn: () => analyticsRepo.getCommunicationStats(),
  });
}

// Notification hooks
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: () => analyticsRepo.getNotificationPreferences(),
  });
}

export function useUpdateNotificationPreferences() {
  return useMutation({
    mutationFn: (preferences: NotificationPreference) => 
      analyticsRepo.updateNotificationPreferences(preferences),
  });
}

export function useSendNotification() {
  return useMutation({
    mutationFn: (notification: Omit<AdminNotification, 'id' | 'createdBy'>) => 
      analyticsRepo.sendNotification(notification),
  });
}

export function useSendNewPropertyNotification() {
  return useMutation({
    mutationFn: ({ propertyId, userIds }: { propertyId: number; userIds?: number[] }) => 
      analyticsRepo.sendNewPropertyNotification(propertyId, userIds),
  });
}

export function useTriggerSearchNotifications() {
  return useMutation({
    mutationFn: ({ propertyType, transactionType, district }: { 
      propertyType: string; 
      transactionType: string; 
      district: string 
    }) => analyticsRepo.triggerSearchNotifications(propertyType, transactionType, district),
  });
}

export function useTriggerNewPropertyNotifications() {
  return useMutation({
    mutationFn: (propertyId: number) => analyticsRepo.triggerNewPropertyNotifications(propertyId),
  });
}

export function useTriggerReactivationNotifications() {
  return useMutation({
    mutationFn: () => analyticsRepo.triggerReactivationNotifications(),
  });
}

// Real-time hooks
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => analyticsRepo.getDashboardMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
  });
}

// System alerts hooks
export function useSystemAlerts() {
  return useQuery({
    queryKey: ['alerts', 'system'],
    queryFn: () => analyticsRepo.getSystemAlerts(),
    refetchInterval: 60000, // Refresh every minute for alerts
  });
}

export function useResolveSystemAlert() {
  return useMutation({
    mutationFn: (alertId: string) => analyticsRepo.resolveSystemAlert(alertId),
  });
}
