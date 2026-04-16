import { axiosClient } from '../api/axios-client';
import { IAnalyticsRepository } from '@/core/domain/repositories/IAnalyticsRepository';
import { 
  PropertyViewEvent, 
  PropertyStats, 
  DashboardStats,
  AuditLogEntry,
  AuditLogFilters,
  UserActivity,
  ActivityStats,
  CommunicationEvent,
  CommunicationStats,
  AdminNotification,
  NotificationPreference,
  SystemAlert,
  RealtimeEvent,
  DashboardMetrics
} from '@/core/domain/entities/Analytics';

export class AnalyticsRepository implements IAnalyticsRepository {
  async trackPropertyView(event: PropertyViewEvent): Promise<void> {
    await axiosClient.post(`/analytics/track/properties/${event.propertyId}`, {
      sessionId: event.sessionId,
      referrer: event.referrer,
      userAgent: event.userAgent,
      deviceType: event.deviceType,
    });
  }

  async getPropertyStats(propertyId: number): Promise<PropertyStats> {
    const response = await axiosClient.get(`/analytics/properties/${propertyId}/stats`);
    return response.data;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await axiosClient.get('/analytics/dashboard');
    return response.data;
  }

  async trackView(propertyId: number, data: {
    sessionId: string;
    referrer: string;
    userAgent: string;
    deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
  }): Promise<void> {
    await axiosClient.post(`/analytics/track/properties/${propertyId}`, data);
  }

  // Audit Log endpoints
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<{ content: AuditLogEntry[]; totalElements: number }> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.size) params.append('size', filters.size.toString());
    if (filters.adminId) params.append('adminUserId', filters.adminId.toString());
    if (filters.action) params.append('action', filters.action);
    if (filters.department) params.append('departmentType', filters.department);
    if (filters.startDate) params.append('start', filters.startDate);
    if (filters.endDate) params.append('end', filters.endDate);

    const response = await axiosClient.get(`/admin/audit-logs?${params.toString()}`);
    return response.data;
  }

  async getAuditLogsByAction(action: string, page = 0, size = 20): Promise<{ content: AuditLogEntry[]; totalElements: number }> {
    const response = await axiosClient.get(`/admin/audit-logs/by-action?action=${action}&page=${page}&size=${size}`);
    return response.data;
  }

  async getAuditLogsByDepartment(department: string, page = 0, size = 20): Promise<{ content: AuditLogEntry[]; totalElements: number }> {
    const response = await axiosClient.get(`/admin/audit-logs/by-department?departmentType=${department}&page=${page}&size=${size}`);
    return response.data;
  }

  async getAuditLogsByDateRange(startDate: string, endDate: string, page = 0, size = 20): Promise<{ content: AuditLogEntry[]; totalElements: number }> {
    const response = await axiosClient.get(`/admin/audit-logs/by-date-range?start=${startDate}&end=${endDate}&page=${page}&size=${size}`);
    return response.data;
  }

  // Activity endpoints - Admin (datos de TODOS los usuarios)
  async getUserActivities(type?: string, dateRange?: string): Promise<UserActivity[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (dateRange) params.append('dateRange', dateRange);

    // Usar endpoint de admin para obtener datos de todos los usuarios
    const response = await axiosClient.get(`/activity/admin/all?${params.toString()}`);
    return response.data;
  }

  async getActivityStats(dateRange?: string): Promise<ActivityStats> {
    const params = dateRange ? `?dateRange=${dateRange}` : '';
    // Usar endpoint de admin para obtener estadísticas globales
    const response = await axiosClient.get(`/activity/admin/stats${params}`);
    return response.data;
  }

  async exportActivitiesToPDF(type?: string, dateRange?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (dateRange) params.append('dateRange', dateRange);

    const response = await axiosClient.get(`/activity/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Communications endpoints
  async getCommunicationStats(): Promise<CommunicationStats> {
    const response = await axiosClient.get('/communications/stats');
    return response.data;
  }

  // Notifications endpoints
  async getNotificationPreferences(): Promise<NotificationPreference> {
    const response = await axiosClient.get('/notifications/preferences');
    return response.data;
  }

  async updateNotificationPreferences(preferences: NotificationPreference): Promise<NotificationPreference> {
    const response = await axiosClient.put('/notifications/preferences', preferences);
    return response.data;
  }

  async sendNotification(notification: Omit<AdminNotification, 'id' | 'createdBy'>): Promise<void> {
    await axiosClient.post('/admin/notifications/send', notification);
  }

  async sendNewPropertyNotification(propertyId: number, userIds?: number[]): Promise<string> {
    const params = userIds ? `?userIds=${userIds.join(',')}` : '';
    const response = await axiosClient.post(`/notifications/new-property${propertyId}${params}`);
    return response.data;
  }

  async triggerSearchNotifications(propertyType: string, transactionType: string, district: string): Promise<string> {
    const response = await axiosClient.post('/notifications/trigger-search-notifications', {
      propertyType,
      transactionType,
      district
    });
    return response.data;
  }

  async triggerNewPropertyNotifications(propertyId: number): Promise<string> {
    const response = await axiosClient.post(`/notifications/trigger-new-property-notifications?propertyId=${propertyId}`);
    return response.data;
  }

  async triggerReactivationNotifications(): Promise<string> {
    const response = await axiosClient.post('/notifications/trigger-reactivation-notifications');
    return response.data;
  }

  // Real-time endpoints (mock for now)
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Mock implementation - backend doesn't have this endpoint yet
    return {
      activeUsers: 0,
      inactiveUsers: 0,
      onlineUsers: 0,
      chatUsage: {
        totalMessages: 0,
        activeChats: 0,
        averageResponseTime: 0
      },
      eventsGenerated: 0,
      revenue: {
        totalRevenue: 0,
        monthlyRevenue: 0,
        averageOrderValue: 0
      },
      propertyMetrics: {
        mostViewed: [],
        conversionRates: {}
      },
      departmentPerformance: {}
    };
  }

  // System alerts (mock for now)
  async getSystemAlerts(): Promise<SystemAlert[]> {
    // Mock implementation - backend doesn't have this endpoint yet
    return [];
  }

  async resolveSystemAlert(alertId: string): Promise<void> {
    // Mock implementation - backend doesn't have this endpoint yet
    console.log('Resolving alert:', alertId);
  }
}
