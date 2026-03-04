// src/core/domain/use-cases/identity/CompleteKyc.ts
import { IIdentityRepository } from '../../repositories/IIdentityRepository';
import { User } from '../../entities/User';

export class CompleteKyc {
  constructor(private identityRepository: IIdentityRepository) {}

  async execute(userId: number, documents: FormData): Promise<User> {
    return await this.identityRepository.completeKyc(userId, documents);
  }
}
