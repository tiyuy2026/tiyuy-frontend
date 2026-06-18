// CHANNEL USE CASES - Hexagonal Architecture
// This file belongs to CHANNELS module (Domain - Use Cases)

import { ChannelRepository, CreateChannelData, CreateChannelPostData, CreateChannelEventData } from '../repositories/ChannelRepository';
import { Channel, ChannelPost, ChannelEvent, ChannelStatistics, ChannelCollaborator, ChannelComment } from '../entities/Channel';

// Use cases implementation (Domain)
export class ChannelUseCases {
  constructor(private channelRepository: ChannelRepository) {}

  // Channel operations
  async getChannels(userId?: number): Promise<Channel[]> {
    return this.channelRepository.getChannels(userId);
  }

  async getChannelById(id: number): Promise<Channel> {
    return this.channelRepository.getChannelById(id);
  }

  async createChannel(data: CreateChannelData): Promise<Channel> {
    // Business logic validation
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('El nombre del canal debe tener al menos 3 caracteres');
    }

    if (!data.city || data.city.trim().length < 2) {
      throw new Error('La ciudad debe tener al menos 2 caracteres');
    }

    if (!data.description || data.description.trim().length < 10) {
      throw new Error('La descripción debe tener al menos 10 caracteres');
    }

    return this.channelRepository.createChannel(data);
  }

  async updateChannel(id: number, data: CreateChannelData): Promise<Channel> {
    // Business logic validation
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('El nombre del canal debe tener al menos 3 caracteres');
    }

    if (!data.description || data.description.trim().length < 10) {
      throw new Error('La descripción debe tener al menos 10 caracteres');
    }

    return this.channelRepository.updateChannel(id, data);
  }

  async deleteChannel(id: number): Promise<void> {
    return this.channelRepository.deleteChannel(id);
  }

  async subscribeToChannel(channelId: number, userId: number): Promise<void> {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    // The backend handles the "already subscribed" check and returns 400
    // We let it propagate and handle it in the hook's onError
    return this.channelRepository.subscribeToChannel(channelId, userId);
  }

  async unsubscribeFromChannel(channelId: number, userId: number): Promise<void> {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    return this.channelRepository.unsubscribeFromChannel(channelId, userId);
  }

  async updateSubscribersCanPost(channelId: number, subscribersCanPost: boolean): Promise<Channel> {
    return this.channelRepository.updateSubscribersCanPost(channelId, subscribersCanPost);
  }

  // Post operations
  async getChannelPosts(channelId: number, page?: number, size?: number): Promise<ChannelPost[]> {
    return this.channelRepository.getChannelPosts(channelId, page, size);
  }

  async createChannelPost(channelId: number, data: CreateChannelPostData): Promise<ChannelPost> {
    // Business logic validation
    if (!data.content || data.content.trim().length < 1) {
      throw new Error('El contenido del post no puede estar vacío');
    }

    if (data.content.length > 2000) {
      throw new Error('El contenido del post no puede exceder los 2000 caracteres');
    }

    return this.channelRepository.createChannelPost(channelId, data);
  }

  async likeChannelPost(channelId: number, postId: number): Promise<{ isCurrentlyActive: boolean; likeCount: number }> {
    return this.channelRepository.likeChannelPost(channelId, postId);
  }

  async shareChannelPost(channelId: number, postId: number, message?: string): Promise<void> {
    return this.channelRepository.shareChannelPost(channelId, postId, message);
  }

  // Event operations
  async getChannelEvents(channelId: number): Promise<ChannelEvent[]> {
    return this.channelRepository.getChannelEvents(channelId);
  }

  async getChannelEventsWithFilters(
    channelId: number,
    filters: {
      eventType?: string;
      city?: string;
      featured?: boolean;
      dateFilter?: string;
      location?: string;
    }
  ): Promise<ChannelEvent[]> {
    return this.channelRepository.getChannelEventsWithFilters(channelId, filters);
  }

  async createChannelEvent(channelId: number, data: CreateChannelEventData): Promise<ChannelEvent> {
    // Business logic validation
    if (!data.title || data.title.trim().length < 3) {
      throw new Error('El título del evento debe tener al menos 3 caracteres');
    }

    if (!data.description || data.description.trim().length < 10) {
      throw new Error('La descripción del evento debe tener al menos 10 caracteres');
    }

    if (!data.location || data.location.trim().length < 3) {
      throw new Error('La ubicación del evento debe tener al menos 3 caracteres');
    }

    const startDate = new Date(data.startDateTime);
    const endDate = new Date(data.endDateTime);

    if (startDate <= new Date()) {
      throw new Error('La fecha de inicio del evento debe ser futura');
    }

    if (endDate <= startDate) {
      throw new Error('La fecha de fin del evento debe ser posterior a la fecha de inicio');
    }

    return this.channelRepository.createChannelEvent(channelId, data);
  }

  async respondToChannelEvent(eventId: number, response: string, userId: number): Promise<void> {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    if (!response || response.trim().length < 1) {
      throw new Error('La respuesta no puede estar vacía');
    }

    return this.channelRepository.respondToChannelEvent(eventId, response, userId);
  }

  async saveEvent(eventId: number, userId: number): Promise<void> {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    return this.channelRepository.saveEvent(eventId, userId);
  }

  async unsaveEvent(eventId: number, userId: number): Promise<void> {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    return this.channelRepository.unsaveEvent(eventId, userId);
  }

  // User Events
  async getUserEvents(userId: number, page?: number, size?: number): Promise<ChannelEvent[]> {
    return this.channelRepository.getUserEvents(userId, page, size);
  }

  async getUserSubscribedEvents(userId: number, page?: number, size?: number): Promise<ChannelEvent[]> {
    return this.channelRepository.getUserSubscribedEvents(userId, page, size);
  }

  async getUserUpcomingEvents(userId: number): Promise<ChannelEvent[]> {
    return this.channelRepository.getUserUpcomingEvents(userId);
  }

  async getUserPastEvents(userId: number): Promise<ChannelEvent[]> {
    return this.channelRepository.getUserPastEvents(userId);
  }

  async getUserSavedEvents(userId: number, page?: number, size?: number): Promise<ChannelEvent[]> {
    return this.channelRepository.getUserSavedEvents(userId, page, size);
  }

  // Collaborators
  async searchUsersForChannelDelegation(query: string, excludeUserId: number): Promise<Array<{
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    dni?: string;
    avatar?: string;
    role?: string;
  }>> {
    if (!query || query.trim().length < 1) {
      throw new Error('La búsqueda no puede estar vacía');
    }

    return this.channelRepository.searchUsersForChannelDelegation(query, excludeUserId);
  }

  async grantPublishingPermission(channelId: number, userId: number, adminId: number): Promise<ChannelCollaborator> {
    return this.channelRepository.grantPublishingPermission(channelId, userId, adminId);
  }

  async revokePublishingPermission(channelId: number, userId: number, adminId: number): Promise<ChannelCollaborator> {
    return this.channelRepository.revokePublishingPermission(channelId, userId, adminId);
  }

  async getChannelCollaborators(channelId: number, adminId: number): Promise<ChannelCollaborator[]> {
    return this.channelRepository.getChannelCollaborators(channelId, adminId);
  }

  async canUserPublish(channelId: number, userId: number): Promise<{ canPublish: boolean }> {
    return this.channelRepository.canUserPublish(channelId, userId);
  }

  async canUserPublishInChannel(channelId: number): Promise<boolean> {
    // This method is called from hooks where userId is determined by auth context
    // The backend endpoint handles the current authenticated user
    const result = await this.channelRepository.canUserPublish(channelId, 0);
    return result.canPublish;
  }

  async getChannelComments(channelId: number, postId: number): Promise<ChannelComment[]> {
    return this.channelRepository.getChannelComments(channelId, postId);
  }

  async createChannelComment(channelId: number, postId: number, content: string, userId: number, replyToCommentId?: number): Promise<void> {
    if (!content || content.trim().length < 1) {
      throw new Error('El comentario no puede estar vacío');
    }
    if (content.length > 500) {
      throw new Error('El comentario no puede exceder los 500 caracteres');
    }
    return this.channelRepository.createChannelComment(channelId, postId, content.trim(), userId, replyToCommentId);
  }

  // Statistics
  async getChannelStatistics(channelId: number, userId: number): Promise<ChannelStatistics> {
    return this.channelRepository.getChannelStatistics(channelId, userId);
  }
}
