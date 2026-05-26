import { IProjectRepository } from '../../repositories/IProjectRepository';
import { ProjectSummary } from '../../entities/Project';

export class SearchProjects {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(filters: {
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
    content: ProjectSummary[];
    totalElements: number;
    totalPages: number;
  }> {
    const repoFilters = {
      ...filters,
      page: filters.page ?? 0,
      size: filters.size ?? 20,
      sort: filters.sort ?? 'createdAt,desc',
    };

    return await this.projectRepository.searchProjects(repoFilters);
  }
}
