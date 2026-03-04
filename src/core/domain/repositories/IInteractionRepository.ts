// src/core/domain/repositories/IInteractionRepository.ts
import { PageResponse, LeadDTO, CreateLeadDTO, RatingDTO, InteractionStats } from '../../application/dtos/InteractionDTO';

export interface IInteractionRepository {
  // Vistas y métricas
  trackView(propertyId: number, sessionId: string): Promise<void>;
  
  // Leads/Interacciones
  createLead(propertyId: number, data: CreateLeadDTO): Promise<LeadDTO>;
  
  // Gestión de leads (dashboard)
  getMySentLeads(page?: number, size?: number): Promise<PageResponse<LeadDTO>>;
  getMyReceivedLeads(page?: number, size?: number): Promise<PageResponse<LeadDTO>>;
  markLeadAsRead(leadId: number): Promise<void>;
  
  // Ratings y reseñas
  createRating(propertyId: number, rating: number, comment?: string): Promise<RatingDTO>;
  getUserRatings(userId: number): Promise<RatingDTO[]>;
  
  // Estadísticas de interacciones
  getInteractionStats(propertyId: number): Promise<InteractionStats>;
}
