// CHANNEL REPOSITORY IMPLEMENTATION - Hexagonal Architecture
// This file belongs to CHANNELS module (Infrastructure - Concrete implementation)

import { ChannelRepository, CreateChannelData, CreateChannelPostData, CreateChannelEventData } from '../../core/domain/repositories/ChannelRepository';
import { Channel, ChannelPost, ChannelEvent, ChannelStatistics, ChannelCollaborator, ChannelComment } from '../../core/domain/entities/Channel';
import { axiosClient } from '../api/axios-client';
import { CHANNEL_ENDPOINTS } from '../api/channelEndpoints';

// Concrete repository implementation (Infrastructure)
export class ChannelRepositoryImpl implements ChannelRepository {
  
  // Channels
  async getChannels(userId?: number): Promise<Channel[]> {
    const response = await axiosClient.get(CHANNEL_ENDPOINTS.BASE);
    return response.data.content?.map((item: any) => this.mapToChannel(item)) || [];
  }

  async getChannelById(id: number): Promise<Channel> {
    const response = await axiosClient.get(`${CHANNEL_ENDPOINTS.BASE}/${id}`);
    return this.mapToChannel(response.data);
  }

  async createChannel(data: CreateChannelData): Promise<Channel> {
    const response = await axiosClient.post(CHANNEL_ENDPOINTS.CREATE, data);
    return this.mapToChannel(response.data);
  }

  async updateChannel(id: number, data: CreateChannelData): Promise<Channel> {
    const response = await axiosClient.put(`${CHANNEL_ENDPOINTS.BASE}/${id}`, data);
    return this.mapToChannel(response.data);
  }

  async deleteChannel(id: number): Promise<void> {
    await axiosClient.delete(`${CHANNEL_ENDPOINTS.BASE}/${id}`);
  }

  async subscribeToChannel(channelId: number, userId: number): Promise<void> {
    await axiosClient.post(CHANNEL_ENDPOINTS.SUBSCRIBE(channelId));
  }

  async unsubscribeFromChannel(channelId: number, userId: number): Promise<void> {
    await axiosClient.delete(CHANNEL_ENDPOINTS.SUBSCRIBE(channelId));
  }
  
  // Posts
  async getChannelPosts(channelId: number, page = 0, size = 20): Promise<ChannelPost[]> {
    const response = await axiosClient.get(`${CHANNEL_ENDPOINTS.POSTS(channelId)}?page=${page}&size=${size}`);
    return response.data.content?.map((item: any) => this.mapToChannelPost(item)) || [];
  }

  async createChannelPost(channelId: number, data: CreateChannelPostData): Promise<ChannelPost> {
    const response = await axiosClient.post(CHANNEL_ENDPOINTS.POSTS(channelId), data);
    return this.mapToChannelPost(response.data);
  }

  async likeChannelPost(channelId: number, postId: number): Promise<{ isCurrentlyActive: boolean; likeCount: number }> {
    const response = await axiosClient.post(CHANNEL_ENDPOINTS.LIKE_POST(channelId, postId));
    return response.data;
  }

  async shareChannelPost(channelId: number, postId: number, message?: string): Promise<void> {
    await axiosClient.post(CHANNEL_ENDPOINTS.SHARE_POST(channelId, postId), { message });
  }

  async getChannelComments(channelId: number, postId: number): Promise<ChannelComment[]> {
    const response = await axiosClient.get(CHANNEL_ENDPOINTS.COMMENTS(channelId, postId));
    return response.data?.map((item: any) => this.mapToChannelComment(item)) || [];
  }

  async createChannelComment(channelId: number, postId: number, content: string, userId: number, replyToCommentId?: number): Promise<void> {
    const body: any = { content, userId };
    if (replyToCommentId) {
      body.replyToCommentId = replyToCommentId;
    }
    await axiosClient.post(CHANNEL_ENDPOINTS.COMMENTS(channelId, postId), body);
  }

  // Events
  async getChannelEvents(channelId: number): Promise<ChannelEvent[]> {
    const response = await axiosClient.get(CHANNEL_ENDPOINTS.EVENTS(channelId));
    return response.data.content?.map((item: any) => this.mapToChannelEvent(item)) || [];
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
    const params = new URLSearchParams();
    if (filters.eventType) params.append('eventType', filters.eventType);
    if (filters.city) params.append('city', filters.city);
    if (filters.featured !== undefined) params.append('featured', String(filters.featured));
    if (filters.dateFilter) params.append('dateFilter', filters.dateFilter);
    if (filters.location) params.append('location', filters.location);
    
    const queryString = params.toString();
    const url = `${CHANNEL_ENDPOINTS.EVENTS(channelId)}${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosClient.get(url);
    return response.data.content?.map((item: any) => this.mapToChannelEvent(item)) || [];
  }

  async createChannelEvent(channelId: number, data: CreateChannelEventData): Promise<ChannelEvent> {
    const response = await axiosClient.post(CHANNEL_ENDPOINTS.EVENTS(channelId), data);
    return this.mapToChannelEvent(response.data);
  }

  async respondToChannelEvent(eventId: number, response: string, userId: number): Promise<void> {
    await axiosClient.post(CHANNEL_ENDPOINTS.RESPOND_EVENT(eventId), { response, userId });
  }

  async saveEvent(eventId: number, userId: number): Promise<void> {
    await axiosClient.post(CHANNEL_ENDPOINTS.SAVE_EVENT(eventId));
  }

  async unsaveEvent(eventId: number, userId: number): Promise<void> {
    await axiosClient.delete(CHANNEL_ENDPOINTS.SAVE_EVENT(eventId));
  }

  // User Events
  async getUserEvents(userId: number, page = 0, size = 10): Promise<ChannelEvent[]> {
    const response = await axiosClient.get(`${CHANNEL_ENDPOINTS.USER_EVENTS}?page=${page}&size=${size}`);
    return response.data.content?.map((item: any) => this.mapToChannelEvent(item)) || [];
  }

  async getUserSubscribedEvents(userId: number, page = 0, size = 50): Promise<ChannelEvent[]> {
    const response = await axiosClient.get(`${CHANNEL_ENDPOINTS.USER_SUBSCRIBED_EVENTS}?page=${page}&size=${size}`);
    return response.data.content?.map((item: any) => this.mapToChannelEvent(item)) || [];
  }

  async getUserUpcomingEvents(userId: number): Promise<ChannelEvent[]> {
    const response = await axiosClient.get(CHANNEL_ENDPOINTS.USER_UPCOMING_EVENTS);
    return response.data.map((item: any) => this.mapToChannelEvent(item));
  }

  async getUserPastEvents(userId: number): Promise<ChannelEvent[]> {
    const response = await axiosClient.get(CHANNEL_ENDPOINTS.USER_PAST_EVENTS);
    return response.data.map((item: any) => this.mapToChannelEvent(item));
  }

  async getUserSavedEvents(userId: number, page = 0, size = 10): Promise<ChannelEvent[]> {
    const response = await axiosClient.get(`${CHANNEL_ENDPOINTS.USER_SAVED_EVENTS}?page=${page}&size=${size}`);
    return response.data.content?.map((item: any) => this.mapToChannelEvent(item)) || [];
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
    const response = await axiosClient.get(`${CHANNEL_ENDPOINTS.SEARCH_USERS}?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  async grantPublishingPermission(channelId: number, userId: number, adminId: number): Promise<ChannelCollaborator> {
    const response = await axiosClient.post(CHANNEL_ENDPOINTS.COLLABORATORS(channelId), null, {
      params: { userId }
    });
    return this.mapToChannelCollaborator(response.data);
  }

  async revokePublishingPermission(channelId: number, userId: number, adminId: number): Promise<ChannelCollaborator> {
    const response = await axiosClient.delete(`${CHANNEL_ENDPOINTS.COLLABORATORS(channelId)}/${userId}`);
    return this.mapToChannelCollaborator(response.data);
  }

  async getChannelCollaborators(channelId: number, adminId: number): Promise<ChannelCollaborator[]> {
    const response = await axiosClient.get(CHANNEL_ENDPOINTS.COLLABORATORS(channelId));
    return response.data.map((item: any) => this.mapToChannelCollaborator(item));
  }

  async canUserPublish(channelId: number, userId: number): Promise<{ canPublish: boolean }> {
    const response = await axiosClient.get(CHANNEL_ENDPOINTS.CAN_PUBLISH(channelId));
    return response.data;
  }

  // Statistics
  async getChannelStatistics(channelId: number, userId: number): Promise<ChannelStatistics> {
    const response = await axiosClient.get(CHANNEL_ENDPOINTS.STATISTICS(channelId));
    return response.data;
  }

  // Mapping methods
  private mapToChannel(item: any): Channel {
    return {
      id: item.id,
      name: item.name,
      city: item.city,
      description: item.description,
      avatar: item.avatar,
      type: item.type,
      subscriberCount: item.subscriberCount || 0,
      isSubscribed: item.isSubscribed || false,
      isOwner: item.isOwner || false,
      shareLink: item.shareLink,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private mapToChannelPost(item: any): ChannelPost {
    return {
      id: item.id,
      channelId: item.channelId,
      userId: item.userId,
      userName: item.userName,
      userAvatar: item.userAvatar,
      content: item.content,
      imageUrls: item.imageUrls || [],
      likeCount: item.likeCount || 0,
      commentCount: item.commentCount || 0,
      shareCount: item.shareCount || 0,
      isLiked: item.isLiked || false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private mapToChannelComment(item: any): ChannelComment {
    return {
      id: item.id,
      postId: item.postId || item.channelPostId,
      userId: item.userId,
      userName: item.userName || item.userFirstName + ' ' + item.userLastName,
      userAvatar: item.userAvatar,
      content: item.content,
      likeCount: item.likeCount || 0,
      isLiked: item.isLiked || item.hasUserLiked || false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      replyToCommentId: item.replyToCommentId,
      replies: item.replies?.map((reply: any) => this.mapToChannelComment(reply)) || [],
    };
  }

  private mapToChannelEvent(item: any): ChannelEvent {
    return {
      id: item.id,
      channelId: item.channelId,
      userId: item.userId,
      userName: item.userName,
      userAvatar: item.userAvatar,
      title: item.title,
      description: item.description,
      location: item.location,
      startDateTime: item.startDateTime,
      endDateTime: item.endDateTime,
      maxAttendees: item.maxAttendees,
      currentAttendees: item.currentAttendees || 0,
      imageUrls: item.imageUrls || [],
      isAttending: item.isAttending || false,
      isOwner: item.isOwner || false,
      isSaved: item.isSaved || false,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private mapToChannelCollaborator(item: any): ChannelCollaborator {
    return {
      id: item.id,
      userId: item.userId,
      userName: item.userName,
      userAvatar: item.userAvatar,
      canPublish: item.canPublish,
      grantedAt: item.grantedAt,
    };
  }
}
