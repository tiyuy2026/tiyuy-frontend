export interface NotificationPreferences {
  emailOnContact: boolean;
  emailOnFavorite: boolean;
  emailOnPropertyPublished: boolean;
  emailOnSubscriptionExpiring: boolean;
  emailMarketing: boolean;
  emailOnEventCreated: boolean;
  emailOnEventUpdated: boolean;
  emailOnEventReminder: boolean;
  emailOnEventJoined: boolean;
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
