import { ActivityLog, ActivityStats, ActivityFilters } from '@/core/domain/entities/Activity';
import { axiosClient } from '../api/axios-client';

export class ActivityRepository {
  private baseUrl = '/activity';

  async getUserActivities(filters?: ActivityFilters): Promise<ActivityLog[]> {
    const params = new URLSearchParams();
    
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.dateRange) {
      params.append('dateRange', filters.dateRange);
    }

    const response = await axiosClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getActivityStats(filters?: Omit<ActivityFilters, 'limit' | 'offset'>): Promise<ActivityStats> {
    const params = new URLSearchParams();
    
    if (filters?.dateRange) {
      params.append('dateRange', filters.dateRange);
    }

    const response = await axiosClient.get(`${this.baseUrl}/stats?${params.toString()}`);
    return response.data;
  }

  async trackActivity(activity: Omit<ActivityLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActivityLog> {
    // El backend ya trackea automáticamente las actividades
    // Este método podría ser para actividades manuales si se necesita en el futuro
    throw new Error('Manual activity tracking not implemented - activities are tracked automatically');
  }

  async markActivityAsCompleted(id: string): Promise<ActivityLog> {
    // Para leads, usar el endpoint de leads del backend
    if (id.startsWith('lead_')) {
      const leadId = id.replace('lead_', '');
      await axiosClient.patch(`/interactions/leads/${leadId}/read`);
    }
    
    // Para otras actividades, no hay endpoint específico aún
    throw new Error('Activity completion not implemented for this type');
  }

  async deleteActivity(id: string): Promise<void> {
    // Para favoritos, usar el endpoint de favoritos
    if (id.startsWith('favorite_')) {
      // Esto requeriría el propertyId, no el favoriteId
      throw new Error('Use favorites endpoint to remove favorites');
    }
    
    throw new Error('Activity deletion not implemented');
  }

  async exportActivities(filters?: ActivityFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters?.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters?.dateRange) {
      params.append('dateRange', filters.dateRange);
    }

    const response = await axiosClient.get(`${this.baseUrl}/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}
