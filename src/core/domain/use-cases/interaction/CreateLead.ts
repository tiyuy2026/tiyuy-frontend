// src/core/domain/use-cases/interaction/CreateLead.ts
import { IInteractionRepository } from '../../repositories/IInteractionRepository';
import { CreateLeadDTO, LeadDTO } from '../../../application/dtos/InteractionDTO';

export class CreateLead {
  constructor(private interactionRepository: IInteractionRepository) {}

  async execute(propertyId: number, data: CreateLeadDTO): Promise<LeadDTO> {
    return await this.interactionRepository.createLead(propertyId, data);
  }
}
