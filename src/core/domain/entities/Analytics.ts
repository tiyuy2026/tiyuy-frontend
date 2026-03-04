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
