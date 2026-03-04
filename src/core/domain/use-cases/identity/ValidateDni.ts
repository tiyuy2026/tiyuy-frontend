// src/core/domain/use-cases/identity/ValidateDni.ts
import { IIdentityRepository } from '../../repositories/IIdentityRepository';
import { IdentityValidationResponse } from '../../../application/dtos/IdentityDTO';

export class ValidateDni {
  constructor(private identityRepository: IIdentityRepository) {}

  async execute(dni: string): Promise<IdentityValidationResponse> {
    return await this.identityRepository.validateDni(dni);
  }
}
