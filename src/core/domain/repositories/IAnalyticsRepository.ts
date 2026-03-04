import { PropertyViewEvent, PropertyStats, DashboardStats } from '../entities/Analytics';

export interface IAnalyticsRepository {
  trackPropertyView(event: PropertyViewEvent): Promise<void>;
  getPropertyStats(propertyId: number): Promise<PropertyStats>;
  getDashboardStats(): Promise<DashboardStats>;
}
