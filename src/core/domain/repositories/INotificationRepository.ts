import { NotificationPreferences } from '../entities/Notification';

export interface INotificationRepository {
  getPreferences(): Promise<NotificationPreferences>;
  updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
}
