'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AnalyticsRepository } from '@/infrastructure/repositories/AnalyticsRepository';
import { authStorage } from '@/infrastructure/storage/auth-storage';
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
  DashboardMetrics,
  AdminAlert,
  AlertStats,
  AlertFilters
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: NotificationPreference) =>
      analyticsRepo.updateNotificationPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
    },
  });
}

export function useSendNotification() {
  return useMutation({
    mutationFn: (notification: Omit<AdminNotification, 'id'>) =>
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

// Admin Alerts hooks - matches backend AdminAlertController
export function useAdminAlerts(filters: AlertFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'alerts', filters],
    queryFn: () => analyticsRepo.getAdminAlerts(filters),
  });
}

// Notification History hook - matches backend /admin/notifications/history
export function useNotificationHistory(daysBack: number = 30, type?: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: ['admin', 'notifications', 'history', daysBack, type, page, size],
    queryFn: () => analyticsRepo.getNotificationHistory(daysBack, type, page, size),
    placeholderData: (previousData) => previousData,
  });
}

// Notification Types hook
export function useNotificationTypes() {
  return useQuery({
    queryKey: ['admin', 'notifications', 'types'],
    queryFn: () => analyticsRepo.getNotificationTypes(),
  });
}

export function useAdminAlertStats() {
  return useQuery({
    queryKey: ['admin', 'alerts', 'stats'],
    queryFn: () => analyticsRepo.getAdminAlertStats(),
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics', 'dashboard'],
    queryFn: () => analyticsRepo.getDashboardMetrics(),
  });
}

export function useCreateAdminAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alert: Omit<AdminAlert, 'id' | 'createdAt'>) => 
      analyticsRepo.createAdminAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts', 'stats'] });
    },
  });
}

export function useSendAdminAlertNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: number) => analyticsRepo.sendAdminAlertNow(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts', 'stats'] });
    },
  });
}

export function useDeleteAdminAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: number) => analyticsRepo.deleteAdminAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts', 'stats'] });
    },
  });
}

export function useSearchAdminAlerts(query: string) {
  return useQuery({
    queryKey: ['admin', 'alerts', 'search', query],
    queryFn: () => analyticsRepo.searchAdminAlerts(query),
    enabled: query.length > 2,
  });
}

// Admin alert by type hooks
export function useSendSystemAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alert: { subject: string; message: string; userIds?: number[]; roles?: string[]; agencyIds?: string[]; agentIds?: number[]; sendToAll?: boolean; sendEmail?: boolean; sendInApp?: boolean; sendPush?: boolean }) => 
      analyticsRepo.sendSystemAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}

export function useSendPropertyAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alert: { subject: string; message: string; propertyId: number; userIds?: number[]; roles?: string[]; agencyIds?: string[]; agentIds?: number[]; sendToAll?: boolean; sendEmail?: boolean; sendInApp?: boolean; sendPush?: boolean }) => 
      analyticsRepo.sendPropertyAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}

export function useSendMessageAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alert: { subject: string; message: string; userIds?: number[]; roles?: string[]; agencyIds?: string[]; agentIds?: number[]; sendToAll?: boolean; sendEmail?: boolean; sendInApp?: boolean; sendPush?: boolean }) => 
      analyticsRepo.sendMessageAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}

export function useSendAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alert: { subject: string; message: string; userIds?: number[]; roles?: string[]; agencyIds?: string[]; agentIds?: number[]; sendToAll?: boolean; sendEmail?: boolean; sendInApp?: boolean; sendPush?: boolean }) => 
      analyticsRepo.sendAnnouncement(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}

export function useSendEmergencyAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alert: { subject: string; message: string; userIds?: number[]; roles?: string[]; agencyIds?: string[]; agentIds?: number[]; sendToAll?: boolean; sendEmail?: boolean; sendInApp?: boolean; sendPush?: boolean }) => 
      analyticsRepo.sendEmergencyAlert(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
    },
  });
}

// Push notifications hooks
export interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

export function usePushSubscribe() {
  return useMutation({
    mutationFn: async (subscription: PushSubscription) => {
      const token = authStorage.getToken();
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) throw new Error('Failed to subscribe');
      return response.json();
    },
  });
}

export function usePushUnsubscribe() {
  return useMutation({
    mutationFn: async (endpoint: string) => {
      const token = authStorage.getToken();
      const response = await fetch('/api/notifications/push/unsubscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ endpoint }),
      });
      if (!response.ok) throw new Error('Failed to unsubscribe');
      return response.json();
    },
  });
}

export function usePushStatus() {
  return useQuery({
    queryKey: ['push', 'status'],
    queryFn: async () => {
      const token = authStorage.getToken();
      const response = await fetch('/api/notifications/push/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to get push status');
      return response.json();
    },
  });
}
