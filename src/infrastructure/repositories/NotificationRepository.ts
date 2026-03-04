import { apiClient } from '../api/axios-client';
import { INotificationRepository } from '../../core/domain/repositories/INotificationRepository';
import { NotificationPreferences } from '../../core/domain/entities/Notification';

export class NotificationRepository implements INotificationRepository {
  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await apiClient.get<NotificationPreferences>('/notifications/preferences');
    return data;
  }

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const { data } = await apiClient.put<NotificationPreferences>('/notifications/preferences', preferences);
    return data;
  }
}
