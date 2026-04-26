export interface PropertyViewEvent {
  propertyId: number;
  sessionId: string;
  referrer?: string;
  userAgent?: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
}

export interface PropertyStats {
  summary: {
    totalViews: number;
    uniqueViews: number;
    totalContacts: number;
    totalFavorites: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
    contactRate: number;
    favoriteRate: number;
  };
  viewsByDay: Record<string, number>;
  viewsByDevice: Record<string, number>;
  trafficSources: Record<string, number>;
  comparison: {
    viewsLastWeek: number;
    viewsThisWeek: number;
    weeklyGrowth: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  };
}

export interface DashboardStats {
  globalSummary: {
    totalProperties: number;
    totalViews: number;
    totalContacts: number;
    totalFavorites: number;
    avgContactRate: number;
    avgFavoriteRate: number;
  };
  topPropertiesByViews: Array<{
    propertyId: number;
    title: string;
    slug: string;
    views: number;
    contacts: number;
    favorites: number;
    contactRate: number;
    favoriteRate: number;
  }>;
  topPropertiesByContactRate: Array<{
    propertyId: number;
    title: string;
    slug: string;
    views: number;
    contacts: number;
    favorites: number;
    contactRate: number;
    favoriteRate: number;
  }>;
  periodComparison: {
    currentPeriod: string;
    viewsCurrent: number;
    viewsPrevious: number;
    contactsCurrent: number;
    contactsPrevious: number;
    viewsGrowth: number;
    contactsGrowth: number;
  };
}

// Audit Log entities
export interface AuditLogEntry {
  id: string;
  adminId: number;
  adminName: string;
  action: string;
  entityType: string;
  entityId: number;
  entityName: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  department: string;
  createdAt: string;
}

export interface AuditLogFilters {
  adminId?: number;
  action?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

// Activity and Events entities
export interface UserActivity {
  id: string;
  type: 'contact' | 'favorite' | 'view' | 'publication';
  title: string;
  propertyTitle: string;
  date: string;
  details: string;
  status: 'completed' | 'pending';
  userId: number;
}

export interface ActivityStats {
  totalViews: number;
  totalContacts: number;
  totalMessages: number;
  totalFavorites: number;
  totalPublications: number;
  pendingActions: number;
  periodStart: string;
  periodEnd: string;
}

// Communications entities
export interface CommunicationEvent {
  id: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  recipient: string;
  subject: string;
  content: string;
  status: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  metadata?: Record<string, any>;
}

export interface CommunicationStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

// Notifications entities - Matches backend SendNotificationRequest DTO
export interface AdminNotification {
  id?: string;
  subject: string;
  message: string;
  userIds?: number[];
  roles?: string[];
  agencyIds?: string[];  // RUCs de inmobiliarias
  agentIds?: number[];   // User IDs de agentes específicos
  sendToAll?: boolean;
  sendEmail?: boolean;
  sendInApp?: boolean;
  sendPush?: boolean;
  scheduledFor?: string; // ISO date string
  alertType?: 'SYSTEM' | 'PROPERTY' | 'MESSAGE' | 'MARKETING' | 'ANNOUNCEMENT' | 'EMERGENCY';
  propertyId?: number;
}

// AdminAlert entities - matches backend AdminAlertResponse DTO
export interface AdminAlert {
  id: number;
  subject: string;
  message: string;
  alertType: 'SYSTEM' | 'PROPERTY' | 'MESSAGE' | 'MARKETING' | 'ANNOUNCEMENT' | 'EMERGENCY';
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  sendEmail: boolean;
  sendInApp: boolean;
  sendPush: boolean;
  targetUserCount?: number;
  sentCount?: number;
  readCount?: number;
  readRate?: number;
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  sendToAll?: boolean;
  propertyId?: number;
  createdBy?: AdminSummary;
}

export interface AdminSummary {
  id: number;
  username: string;
  email: string;
  fullName?: string;
}

export interface AlertStats {
  totalAlerts: number;
  totalSent: number;
  totalRead: number;
  averageReadRate: number;
  alertsByStatus: Record<string, number>;
  alertsByType: Record<string, number>;
  sentByEmail: number;
  sentByInApp: number;
  sentByPush: number;
  periodStart: string;
  periodEnd: string;
  alertsLast24h: number;
  alertsLast7d: number;
  alertsLast30d: number;
  topPerformingAlerts: AlertPerformance[];
}

export interface AlertPerformance {
  alertId: number;
  subject: string;
  sentCount: number;
  readCount: number;
  readRate: number;
  alertType: string;
  sentAt: string;
}

export interface AlertFilters {
  status?: string;
  type?: string;
  page?: number;
  size?: number;
}

export interface NotificationPreference {
  // Email preferences - matches backend NotificationPreferenceResponse exactly
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

export interface SystemAlert {
  id: string;
  type: 'security' | 'performance' | 'business' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: number;
  resolvedAt?: string;
  actions: Array<{
    type: string;
    label: string;
    url?: string;
  }>;
}

// Real-time entities
export interface RealtimeEvent {
  type: 'user_activity' | 'property_view' | 'contact_request' | 'system_alert' | 'notification_sent';
  data: any;
  timestamp: string;
  userId?: number;
  sessionId?: string;
}

export interface DashboardMetrics {
  activeUsers: number;
  inactiveUsers: number;
  onlineUsers: number;
  chatUsage: {
    totalMessages: number;
    activeChats: number;
    averageResponseTime: number;
  };
  eventsGenerated: number;
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    averageOrderValue: number;
  };
  propertyMetrics: {
    mostViewed: Array<{
      propertyId: number;
      title: string;
      views: number;
    }>;
    conversionRates: Record<string, number>;
  };
  departmentPerformance: Record<string, {
    efficiency: number;
    tasksCompleted: number;
    averageResponseTime: number;
  }>;
}
