export interface NotificationPreferences {
  emailOnContact: boolean;
  emailOnFavorite: boolean;
  emailOnPropertyPublished: boolean;
  emailOnSubscriptionExpiring: boolean;
  emailMarketing: boolean;
}

export type NotificationType = 
  | 'CONTACT' 
  | 'FAVORITE' 
  | 'PROPERTY_PUBLISHED' 
  | 'SUBSCRIPTION_EXPIRING' 
  | 'MARKETING';
