import { IProjectRepository } from '../../repositories/IProjectRepository';
import { Project } from '../../entities/Project';

export class SearchProjects {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(filters: {
    district?: string;
    province?: string;
    region?: string;
    type?: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED';  // ✅ Literal types del backend
    phase?: 'PRE_SALE' | 'SALE' | 'DELIVERY';      // ✅ Literal types del backend
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
  }> {
    // ✅ Convierte a los tipos exactos del repositorio
    const repoFilters = {
      ...filters,
      page: filters.page ?? 0,
      size: filters.size ?? 20,
      sort: filters.sort ?? 'createdAt,desc',
    };

    return await this.projectRepository.searchProjects(repoFilters);
  }
}
