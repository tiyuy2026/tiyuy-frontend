import { apiClient, publicApiClient } from '../api/axios-client';
import { 
  Project, 
  ProjectFull, 
  ProjectUnit 
} from '@/core/domain/entities/Project';

export class ProjectRepository {
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
}
