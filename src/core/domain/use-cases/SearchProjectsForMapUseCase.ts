import { ProjectMapSearchResult } from '@/core/domain/entities/PropertyMapResult';
import { IProjectRepository } from '@/core/domain/repositories/IProjectRepository';

export class SearchProjectsForMapUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(filters: {
    district?: string;
    province?: string;
    region?: string;
    type?: string;
    phase?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    isFeatured?: boolean;
  }): Promise<ProjectMapSearchResult> {
    return this.projectRepository.searchForMap(filters);
  }
}
