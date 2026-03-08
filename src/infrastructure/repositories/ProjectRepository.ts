import { apiClient } from '../api/axios-client';
import { IProjectRepository } from '@/core/domain/repositories/IProjectRepository';
import { 
  Project, 
  ProjectFull, 
  ProjectUnit 
} from '@/core/domain/entities/Project';

// ✅ INLINE type (no necesita SearchFilters import)
type SearchFilters = Parameters<IProjectRepository['searchProjects']>[0];

export class ProjectRepository implements IProjectRepository {
  /**
   * Obtener proyecto por ID (básico - para cards/listados)
   */
  async getById(projectId: number): Promise<Project> {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  }

  /**
   * Obtener proyecto completo por ID (SEO + detalle)
   */
  async getProjectFull(projectId: number): Promise<ProjectFull> {
    const response = await apiClient.get(`/projects/${projectId}/full`);
    return response.data;
  }

  /**
   * Obtener proyecto por slug (SEO público)
   */
  async getBySlug(slug: string): Promise<Project> {
    const response = await apiClient.get(`/projects/slug/${slug}`);
    return response.data;
  }

  /**
   * Búsqueda pública de proyectos (SEO + filtros)
   */
  async searchProjects(filters: SearchFilters): Promise<{
    content: Project[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters.district) params.append('district', filters.district);
    if (filters.province) params.append('province', filters.province);
    if (filters.region) params.append('region', filters.region);
    if (filters.type) params.append('type', filters.type);
    if (filters.phase) params.append('phase', filters.phase);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());
    if (filters.isVerified !== undefined) params.append('isVerified', filters.isVerified.toString());
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const response = await apiClient.get(`/projects/search?${params}`);
    
    return {
      content: response.data.content || [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      page: response.data.number || 0,
      size: response.data.size || 20,
    };
  }

  /**
   * Mis proyectos (dashboard propietario)
   */
  async getMyProjects(page = 0, size = 20): Promise<{
    content: Project[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get('/projects/my-projects', {
      params: { 
        page, 
        size, 
        sort: 'createdAt,desc' 
      },
    });
    
    return {
      content: response.data.content || [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
    };
  }

  /**
   * Crear nuevo proyecto (draft)
   */
  async createProject(projectData: Parameters<IProjectRepository['createProject']>[0]): Promise<Project> {
    try {
      console.log('🚀 Enviando solicitud de creación de proyecto al backend...');
      console.log('👤 Usuario actual (rol debería ir en token JWT)');
      
      const response = await apiClient.post('/projects', projectData);
      console.log('✅ Proyecto creado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error completo del backend:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Headers:', error.response?.config?.headers);
      
      // Si es error de validación, mostrar detalles específicos
      if (error.response?.status === 400) {
        const validationError = error.response?.data;
        console.error('❌ Detalles de validación:', validationError?.details);
        
        // Crear mensaje amigable para el usuario
        let errorMessage = 'Error en los datos del formulario';
        
        if (validationError?.details) {
          const details = validationError?.details;
          if (typeof details === 'object') {
            const errors = Object.values(details).flat();
            errorMessage = errors.join('. ');
          }
        }
        
        const validationErrorObj = new Error(errorMessage);
        (validationErrorObj as any).isValidationError = true;
        throw validationErrorObj;
      }
      
      // Si es error de suscripción, manejar apropiadamente
      if (error.response?.status === 402) {
        const errorMessage = error.response?.data?.message || 'Para crear proyectos necesitas una suscripción ENTERPRISE.';
        console.error('❌ Error de suscripción del backend:', errorMessage);
        
        // El backend devuelve 402, significa que realmente necesita suscripción
        const subscriptionError = new Error(errorMessage);
        (subscriptionError as any).isSubscriptionError = true;
        (subscriptionError as any).requiresEnterprise = true;
        throw subscriptionError;
      }
      
      throw error;
    }
  }

  /**
   * Actualizar proyecto existente
   */
  async updateProject(
    projectId: number, 
    projectData: Parameters<IProjectRepository['updateProject']>[1]
  ): Promise<Project> {
    const response = await apiClient.put(`/projects/${projectId}`, projectData);
    return response.data;
  }

  /**
   * Publicar proyecto (DRAFT → PUBLISHED)
   */
  async publishProject(projectId: number): Promise<Project> {
    const response = await apiClient.patch(`/projects/${projectId}/publish`);
    return response.data;
  }

  /**
   * Obtener unidades de proyecto
   */
  async getProjectUnits(projectId: number, page = 0, size = 20): Promise<{
    content: ProjectUnit[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(`/projects/${projectId}/units`, {
      params: { page, size },
    });
    return {
      content: response.data.content || [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
    };
  }

  /**
   * Crear nueva unidad
   */
  async createUnit(
    projectId: number, 
    unitData: Parameters<IProjectRepository['createUnit']>[1]
  ): Promise<ProjectUnit> {
    const response = await apiClient.post(`/projects/${projectId}/units`, unitData);
    return response.data;
  }

  /**
   * Actualizar unidad existente
   */
  async updateUnit(unitId: number, unitData: Partial<ProjectUnit>): Promise<ProjectUnit> {
    const response = await apiClient.put(`/projects/units/${unitId}`, unitData);
    return response.data;
  }

  /**
   * Marcar unidad como vendida
   */
  async sellUnit(unitId: number): Promise<ProjectUnit> {
    const response = await apiClient.post(`/projects/units/${unitId}/sell`);
    return response.data;
  }

  /**
   * Eliminar unidad
   */
  async deleteUnit(unitId: number): Promise<void> {
    await apiClient.delete(`/projects/units/${unitId}`);
  }

  /**
   * Stats del proyecto (vistas, contactos, etc.)
   */
  async getProjectStats(projectId: number): Promise<{
    viewsCount: number;
    contactsCount: number;
    favoritesCount: number;
    unitsAvailable: number;
    unitsSold: number;
    conversionRate: number;
  }> {
    const response = await apiClient.get(`/projects/${projectId}/stats`);
    return response.data;
  }

  /**
   * Subir media (fotos, videos) al proyecto
   */
  async uploadProjectMedia(projectId: number, files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await apiClient.post(`/projects/${projectId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  /**
   * Eliminar media del proyecto
   */
  async deleteProjectMedia(projectId: number, mediaId: number): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/media/${mediaId}`);
  }

  /**
   * Destacar proyecto
   */
  async featureProject(projectId: number): Promise<any> {
    const response = await apiClient.patch(`/projects/${projectId}/feature`);
    return response.data;
  }

  /**
   * Obtener proyectos destacados
   */
  async getFeaturedProjects(district?: string): Promise<{
    content: Project[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }> {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    params.append('size', '5');

    const response = await apiClient.get(`/projects/featured?${params}`);
    
    return {
      content: response.data.content || [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      page: response.data.number || 0,
      size: response.data.size || 5,
    };
  }

  /**
   * Obtener items destacados (alias para getFeaturedProjects)
   */
  async getFeaturedItems(district?: string): Promise<{
    content: Project[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
    last: boolean;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  }> {
    const result = await this.getFeaturedProjects(district);
    
    return {
      ...result,
      last: result.page >= result.totalPages - 1,
      numberOfElements: result.content.length,
      first: result.page === 0,
      empty: result.content.length === 0,
    };
  }
}
