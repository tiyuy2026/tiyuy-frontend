import { apiClient } from '../api/axios-client';

export interface SearchTrackingData {
  propertyType: string;
  transactionType: string;
  district: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  hasPrivateBathroom?: boolean;
}

export class SearchTrackingRepository {
  async trackSearch(searchData: SearchTrackingData): Promise<void> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(searchData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      // Guardar búsqueda para tracking
      await apiClient.post(`/notifications/track-search?${params.toString()}`);

      // ✅ DISPARAR NOTIFICACIONES AUTOMÁTICAS POR EMAIL
      // Construir los parámetros correctamente para el backend
      const triggerParams = new URLSearchParams();
      triggerParams.append('propertyType', searchData.propertyType);
      triggerParams.append('transactionType', searchData.transactionType);
      triggerParams.append('district', searchData.district);
      
      await apiClient.post(`/notifications/trigger-search-notifications?${triggerParams.toString()}`);
      
    } catch (error) {
      console.error('Error tracking search:', error);
      // No lanzar error para no afectar la experiencia del usuario
    }
  }

  async getSearchHistory(): Promise<any[]> {
    const { data } = await apiClient.get('/notifications/search-history');
    return data;
  }

  async markSearchCompleted(propertyType: string, transactionType: string, district: string): Promise<void> {
    const params = new URLSearchParams({
      propertyType,
      transactionType,
      district
    });

    await apiClient.post(`/notifications/mark-search-completed?${params.toString()}`);
  }

  // ✅ NUEVO: Método para disparar notificaciones de nueva propiedad
  async triggerNewPropertyNotifications(propertyId: number): Promise<void> {
    try {
      await apiClient.post(`/notifications/trigger-new-property-notifications?propertyId=${propertyId}`);
    } catch (error) {
      console.error('Error triggering new property notifications:', error);
    }
  }

  // ✅ NUEVO: Método para disparar notificaciones de reactivación
  async triggerReactivationNotifications(): Promise<void> {
    try {
      await apiClient.post('/notifications/trigger-reactivation-notifications');
    } catch (error) {
      console.error('Error triggering reactivation notifications:', error);
    }
  }
}
