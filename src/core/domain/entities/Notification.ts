export interface NotificationPreferences {
  // Email preferences
  emailOnContact: boolean;
  emailOnFavorite: boolean;
  emailOnPropertyPublished: boolean;
  emailOnSubscriptionExpiring: boolean;
  emailMarketing: boolean;

  // Push notifications
  pushEnabled: boolean;
  pushOnMessage: boolean;
  pushOnPropertyMatch: boolean;
  pushOnSystemAlert: boolean;

  // Notification frequency: IMMEDIATE, DAILY, WEEKLY
  notificationFrequency: string;

  // Specific alert types
  propertyAlertsEnabled: boolean;
  messageAlertsEnabled: boolean;
  systemAlertsEnabled: boolean;
}

export type NotificationType = 
  | 'CONTACT' 
  | 'FAVORITE' 
  | 'PROPERTY_PUBLISHED' 
  | 'SUBSCRIPTION_EXPIRING' 
  | 'MARKETING'
  | 'ADMIN_NOTIFICATION'
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'EVENT_REMINDER'
  | 'EVENT_JOINED';
