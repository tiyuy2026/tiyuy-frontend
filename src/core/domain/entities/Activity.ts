export interface ActivityLog {
  id: string;
  type: 'view' | 'contact' | 'message' | 'search' | 'favorite' | 'publication' | 'subscription';
  title: string;
  description: string;
  propertyTitle?: string;
  date: string;
  details: string;
  status: 'active' | 'completed' | 'pending';
  userId: string;
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

export interface ActivityFilters {
  type?: ActivityLog['type'] | 'all';
  dateRange?: 'week' | 'month' | 'quarter' | 'year';
}
