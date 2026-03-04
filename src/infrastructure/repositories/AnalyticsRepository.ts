import { axiosClient } from '../api/axios-client';
import { IAnalyticsRepository } from '@/core/domain/repositories/IAnalyticsRepository';
import { PropertyViewEvent, PropertyStats, DashboardStats } from '@/core/domain/entities/Analytics';

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
}
