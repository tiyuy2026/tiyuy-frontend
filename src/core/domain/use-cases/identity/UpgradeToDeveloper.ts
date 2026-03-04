// src/core/domain/use-cases/identity/UpgradeToDeveloper.ts
import { IIdentityRepository } from '../../repositories/IIdentityRepository';
import { User } from '../../entities/User';

export class UpgradeToDeveloper {
  constructor(private identityRepository: IIdentityRepository) {}

  async execute(userId: number, ruc: string): Promise<User> {
    return await this.identityRepository.upgradeToDeveloper(userId, ruc);
  }
}
