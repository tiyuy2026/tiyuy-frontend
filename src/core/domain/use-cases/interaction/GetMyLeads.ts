// src/core/domain/use-cases/interaction/GetMyLeads.ts
import { IInteractionRepository } from '../../repositories/IInteractionRepository';
import { PageResponse, LeadDTO } from '../../../application/dtos/InteractionDTO';

export class GetMyLeads {
  constructor(private interactionRepository: IInteractionRepository) {}

  async executeSent(page: number = 0, size: number = 10): Promise<PageResponse<LeadDTO>> {
    return await this.interactionRepository.getMySentLeads(page, size);
  }

  async executeReceived(page: number = 0, size: number = 10): Promise<PageResponse<LeadDTO>> {
    return await this.interactionRepository.getMyReceivedLeads(page, size);
  }
}
