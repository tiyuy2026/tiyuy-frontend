import { apiClient, publicApiClient } from '../api/axios-client';
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
   * Obtener proyecto por ID (básico - para cards/listados) - Público
   */
  async getById(projectId: number): Promise<Project> {
    try {
      // Primero intentar obtener desde my-projects (endpoint autenticado)
      const response = await apiClient.get('/projects/my-projects');
      const projects = response.data.content || [];
      const project = projects.find((p: Project) => p.id === projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found in my-projects`);
      }
      
      return project;
    } catch (error) {
      console.error('❌ Error in getById, trying fallback:', error);
      // Fallback a público si falla
      const publicResponse = await publicApiClient.get(`/projects/${projectId}`);
      return publicResponse.data;
    }
  }

  /**
   * Obtener proyecto completo con todos los detalles
   */
  async getProjectFull(projectId: number): Promise<ProjectFull> {
    const response = await publicApiClient.get(`/projects/${projectId}/full`);
    const data = response.data;
    
    // ✅ Separar media por tipo
    const media: Array<{ id: number; url: string; mediaType: string; title: string; displayOrder: number }> = data.media || [];
    
    const images = media
      .filter(m => m.mediaType === 'PHOTO')
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(m => m.url);
    
    const renders = media
      .filter(m => m.mediaType === 'VIDEO' || m.mediaType === 'RENDER')
      .map(m => m.url);
    
    const blueprints = media
      .filter(m => m.mediaType === 'BLUEPRINT' || m.mediaType === 'PDF')
      .map(m => m.url);

    return {
      ...data,
      images,
      renders,
      blueprints,
    } as ProjectFull;
  }

  /**
   * Obtener proyecto por slug (SEO público) - Público
   */
  async getBySlug(slug: string): Promise<Project> {
    const response = await publicApiClient.get(`/projects/slug/${slug}`);
    const data = response.data;
    
    // ✅ Mismo mapeo
    const media: Array<{ url: string; mediaType: string; displayOrder: number }> = data.media || [];
    
    return {
      ...data,
      images: media
        .filter(m => m.mediaType === 'PHOTO')
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(m => m.url),
      renders: media
        .filter(m => m.mediaType === 'VIDEO' || m.mediaType === 'RENDER')
        .map(m => m.url),
      blueprints: media
        .filter(m => m.mediaType === 'BLUEPRINT' || m.mediaType === 'PDF')
        .map(m => m.url),
    } as Project;
  }

  /**
   * Obtener multimedia de un proyecto - Autenticado
   */
  async getProjectMedia(projectId: number): Promise<{
    images: string[];
    blueprints: string[];
    renders: string[];
  }> {
    try {
      // Primero intentar con endpoint autenticado
      const response = await apiClient.get(`/projects/${projectId}/media`);
      return response.data;
    } catch (error) {
      console.error('❌ getProjectMedia failed with auth, trying public:', error);
      // Fallback a público si falla
      const publicResponse = await publicApiClient.get(`/projects/${projectId}/media`);
      return publicResponse.data;
    }
  }

  /**
   * Búsqueda pública de proyectos (SEO + filtros) - Público
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

    const response = await publicApiClient.get(`/projects/search?${params}`);
    
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
      
      // Check authentication status
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('tiyuy-auth-token') || 
                     localStorage.getItem('token') || 
                     localStorage.getItem('auth-token');
        console.log('🔑 Authentication status:', token ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
        if (!token) {
          console.log('❌ No authentication token found. User may need to log in again.');
        }
      }
      
      console.log('👤 Usuario actual (rol debería ir en token JWT)');
      console.log('📋 Datos completos del proyecto a enviar:', JSON.stringify(projectData, null, 2));
      
      // Validar campos críticos antes de enviar
      console.log('🔍 Validación previa:');
      console.log('- Nombre:', projectData.name);
      console.log('- Tipo:', projectData.type);
      console.log('- Fase:', projectData.phase);
      console.log('- Total Unidades:', projectData.totalUnits);
      console.log('- Precio Desde:', projectData.priceFrom);
      console.log('- Dirección:', projectData.address);
      console.log('- Distrito:', projectData.district);
      
      console.log('📤 Enviando al backend:', JSON.stringify(projectData, null, 2));
      
      // Debugging de la petición antes de enviar
      const token = localStorage.getItem('tiyuy-auth-token') || 
                   localStorage.getItem('token') || 
                   localStorage.getItem('auth-token');
      
      console.log('🔍 Request details:');
      console.log('- URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/projects`);
      console.log('- Method: POST');
      console.log('- Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'NO_TOKEN'}`
      });
      console.log('- Data size:', JSON.stringify(projectData).length, 'characters');
      
      try {
        console.log('🚀 Enviando petición al backend...');
        const startTime = Date.now();
        
        const response = await apiClient.post('/projects', projectData);
        
        const endTime = Date.now();
        console.log(`✅ Petición completada en ${endTime - startTime}ms`);
        console.log('✅ Response status:', response.status);
        console.log('✅ Response headers:', response.headers);
        console.log('✅ Proyecto creado exitosamente:', response.data);
        console.log('🔍 Full response data:', JSON.stringify(response.data, null, 2));
        
        // 🔍 FIX: Debug completo de la respuesta del backend
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response headers:', response.headers);
        console.log('🔍 Response data type:', typeof response.data);
        console.log('🔍 Response data length:', response.data?.length || 0);
        console.log('🔍 First 500 chars:', response.data?.substring(0, 500));
        console.log('🔍 Last 500 chars:', response.data?.substring(-500));
        
        // 🔍 FIX: response.data viene como string, necesitamos parsearlo a objeto
        let parsedProjectData: any = response.data;
        if (typeof response.data === 'string') {
          try {
            // 🔍 FIX: Buscar el JSON dentro del string (eliminar texto extra)
            const jsonStart = response.data.indexOf('{');
            const jsonEnd = response.data.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonString = response.data.substring(jsonStart, jsonEnd + 1);
              console.log('🔍 Extracted JSON string length:', jsonString.length);
              parsedProjectData = JSON.parse(jsonString);
            } else {
              throw new Error('No JSON found in response');
            }
            
            console.log('🔍 Parsed project data:', parsedProjectData);
          } catch (parseError) {
            console.error('❌ Error parsing response data:', parseError);
            console.error('❌ Raw response data:', response.data);
            parsedProjectData = {};
          }
        }
        
        // Verificar que los datos importantes estén en la respuesta
        if (parsedProjectData) {
          console.log('🔍 Verificación de datos guardados:');
          console.log('- ID:', parsedProjectData.id);
          console.log('- Nombre:', parsedProjectData.name);
          console.log('- Descripción:', parsedProjectData.description?.substring(0, 100) + '...');
          console.log('- Tipo:', parsedProjectData.type);
          console.log('- Fase:', parsedProjectData.phase);
          console.log('- Total Unidades:', parsedProjectData.totalUnits);
          console.log('- Precio Desde:', parsedProjectData.priceFrom);
          console.log('- Dirección:', parsedProjectData.address);
          console.log('- Distrito:', parsedProjectData.district);
          console.log('- Amenidades principales:', parsedProjectData.mainAmenities?.length || 0);
          console.log('- Amenidades detalladas:', parsedProjectData.amenities?.length || 0);
          console.log('- Unidades:', parsedProjectData.units?.length || 0);
          console.log('- Timeline:', parsedProjectData.timeline?.length || 0);
        }
        
        return response.data;
      } catch (networkError) {
        console.error('❌ Error de red/conexión:', networkError);
        console.error('❌ ¿El backend está corriendo?');
        console.error('❌ ¿La URL es correcta?');
        throw networkError;
      }
    } catch (error: any) {
      console.error('❌ Error completo del backend:', error.response?.data);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Headers:', error.response?.config?.headers);
      console.error('❌ Request URL:', error.response?.config?.url);
      console.error('❌ Request Method:', error.response?.config?.method);
      console.error('❌ Request Data:', error.response?.config?.data);
      
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
   * Obtener proyectos destacados - Público
   */
  async getFeaturedProjects(district?: string): Promise<{
    content: Project[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (district) params.append('district', district);
      params.append('size', '5');

      const response = await publicApiClient.get(`/projects/featured?${params.toString()}`);
      
      return {
        content: response.data.content || [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
        page: response.data.number || 0,
        size: response.data.size || 5,
      };
    } catch (error) {
      console.error('Error loading featured projects:', error);
      // Retornar datos vacíos en caso de error para que la app no se rompa
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        page: 0,
        size: 5,
      };
    }
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
