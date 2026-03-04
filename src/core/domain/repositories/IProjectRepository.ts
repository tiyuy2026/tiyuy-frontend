import { Project, ProjectFull, ProjectUnit } from '../entities/Project';

/**
 * Interface del repositorio de Proyectos
 * Define todos los métodos para interactuar con el backend de proyectos
 */
export interface IProjectRepository {
  /**
   * Obtener proyecto básico por ID
   * Usado para: cards, listados, previews
   */
  getById(projectId: number): Promise<Project>;

  /**
   * Obtener proyecto completo por ID
   * Incluye: developer, units, amenities, media
   * Usado para: página de detalle con toda la info
   */
  getProjectFull(projectId: number): Promise<ProjectFull>;

  /**
   * Obtener proyecto completo por slug (SEO)
   * Usado para: SSR/SSG en páginas públicas
   * Ejemplo: /proyectos/edificio-miraflores
   */
  getBySlug(slug: string): Promise<ProjectFull>;

  /**
   * Búsqueda pública de proyectos con filtros
   * Usado para: página de búsqueda, filtros, SEO
   */
  searchProjects(filters: {
    district?: string;
    province?: string;
    region?: string;
    type?: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED';
    phase?: 'PRE_SALE' | 'SALE' | 'DELIVERY';
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    isVerified?: boolean;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<{
    content: Project[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }>;

  /**
   * Obtener proyectos del usuario autenticado (developer)
   * Usado para: dashboard "Mis Proyectos"
   */
  getMyProjects(page?: number, size?: number): Promise<{
    content: Project[];
    totalElements: number;
    totalPages: number;
  }>;

  /**
   * Crear nuevo proyecto (estado DRAFT)
   * Usado para: formulario de creación
   */
  createProject(projectData: {
    name: string;
    description: string;
    phase: 'PRE_SALE' | 'SALE' | 'DELIVERY';
    type: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED';
    totalUnits: number;
    priceFrom: number;
    priceTo?: number;
    startDate?: string;
    estimatedDelivery: string;
    areaFrom?: number;
    areaTo?: number;
    floors?: number;
    address: string;
    district: string;
    province: string;
    region: string;
    latitude?: number;
    longitude?: number;
  }): Promise<Project>;

  /**
   * Actualizar proyecto existente
   * Usado para: edición de proyectos
   */
  updateProject(projectId: number, projectData: {
    description?: string;
    status?: 'DRAFT' | 'PUBLISHED';
    phase?: 'PRE_SALE' | 'SALE' | 'DELIVERY';
    coverImageUrl?: string;
    expectedDeliveryDate?: string;
    isFeatured?: boolean;
  }): Promise<Project>;

  /**
   * Publicar proyecto (DRAFT → PUBLISHED)
   * Usado para: activar proyecto público
   */
  publishProject(projectId: number): Promise<Project>;

  /**
   * Obtener todas las unidades de un proyecto
   * Usado para: tabla de disponibilidad, gestión de unidades
   */
  getProjectUnits(projectId: number, page?: number, size?: number): Promise<{
    content: ProjectUnit[];
    totalElements: number;
    totalPages: number;
  }>;

  /**
   * Crear nueva unidad en proyecto
   * Usado para: agregar departamentos, oficinas, etc.
   */
  createUnit(projectId: number, unitData: {
    unitNumber: string;
    type: 'APARTMENT' | 'OFFICE' | 'PENTHOUSE' | 'COMMERCIAL';
    floor: number;
    area: number;
    bedrooms?: number;
    bathrooms?: number;
    parkingSpots: number;
    price: number;
    view?: string;
    status?: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  }): Promise<ProjectUnit>;

  /**
   * Actualizar unidad existente
   * Usado para: cambiar precio, estado, etc.
   */
  updateUnit(unitId: number, unitData: Partial<ProjectUnit>): Promise<ProjectUnit>;

  /**
   * Marcar unidad como vendida
   * Actualiza: status → SOLD, ajusta contadores del proyecto
   */
  sellUnit(unitId: number): Promise<ProjectUnit>;

  /**
   * Eliminar unidad
   * Usado para: borrar unidad antes de publicar
   */
  deleteUnit(unitId: number): Promise<void>;

  /**
   * Obtener estadísticas del proyecto
   * Usado para: analytics, dashboard del developer
   */
  getProjectStats(projectId: number): Promise<{
    viewsCount: number;
    contactsCount: number;
    favoritesCount: number;
    unitsAvailable: number;
    unitsSold: number;
    conversionRate: number;
  }>;

  /**
   * Subir media (fotos, videos) al proyecto
   * Usado para: galería de imágenes
   */
  uploadProjectMedia?(projectId: number, files: File[]): Promise<{
    urls: string[];
  }>;

  /**
   * Eliminar media del proyecto
   */
  deleteProjectMedia?(projectId: number, mediaId: number): Promise<void>;
}
