import { IProjectRepository } from '../../repositories/IProjectRepository';
import { ProjectFull } from '../../entities/Project';

export class GetProjectFull {
  constructor(private projectRepository: IProjectRepository) {}

  async execute(projectId: number): Promise<ProjectFull> {
    return await this.projectRepository.getProjectFull(projectId);
  }
}
