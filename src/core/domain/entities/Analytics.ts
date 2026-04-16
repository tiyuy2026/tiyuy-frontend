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

// Notifications entities
export interface AdminNotification {
  id: string;
  type: 'alert' | 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  recipients: string[];
  channels: ('email' | 'in_app' | 'push')[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  scheduledAt?: string;
  metadata?: Record<string, any>;
  createdBy: number;
}

export interface NotificationPreference {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  propertyAlerts: boolean;
  messageAlerts: boolean;
  systemAlerts: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
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
