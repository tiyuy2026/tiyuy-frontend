// src/core/domain/use-cases/interaction/CreateRating.ts
import { IInteractionRepository } from '../../repositories/IInteractionRepository';
import { RatingDTO } from '../../../application/dtos/InteractionDTO';

export class CreateRating {
  constructor(private interactionRepository: IInteractionRepository) {}

  async execute(propertyId: number, rating: number, comment?: string): Promise<RatingDTO> {
    return await this.interactionRepository.createRating(propertyId, rating, comment);
  }
}
