// CHANNEL REPOSITORY INTERFACE - Hexagonal Architecture
// This file belongs to CHANNELS module (Domain - Repository Interface)

import { Channel, ChannelPost, ChannelEvent, ChannelStatistics, ChannelCollaborator, ChannelComment } from '../entities/Channel';

export interface ChannelRepository {
  // Channels
  getChannels(userId?: number): Promise<Channel[]>;
  getChannelById(id: number): Promise<Channel>;
  createChannel(data: CreateChannelData): Promise<Channel>;
  updateChannel(id: number, data: CreateChannelData): Promise<Channel>;
  deleteChannel(id: number): Promise<void>;
  subscribeToChannel(channelId: number, userId: number): Promise<void>;
  unsubscribeFromChannel(channelId: number, userId: number): Promise<void>;
  
  // Posts
  getChannelPosts(channelId: number, page?: number, size?: number): Promise<ChannelPost[]>;
  createChannelPost(channelId: number, data: CreateChannelPostData): Promise<ChannelPost>;
  likeChannelPost(channelId: number, postId: number): Promise<{ isCurrentlyActive: boolean; likeCount: number }>;
  shareChannelPost(channelId: number, postId: number, message?: string): Promise<void>;
  getChannelComments(channelId: number, postId: number): Promise<ChannelComment[]>;
  createChannelComment(channelId: number, postId: number, content: string, userId: number, replyToCommentId?: number): Promise<void>;
  
  // Events
  getChannelEvents(channelId: number): Promise<ChannelEvent[]>;
  getChannelEventsWithFilters(
    channelId: number,
    filters: {
      eventType?: string;
      city?: string;
      featured?: boolean;
      dateFilter?: string;
      location?: string;
    }
  ): Promise<ChannelEvent[]>;
  createChannelEvent(channelId: number, data: CreateChannelEventData): Promise<ChannelEvent>;
  respondToChannelEvent(eventId: number, response: string, userId: number): Promise<void>;
  saveEvent(eventId: number, userId: number): Promise<void>;
  unsaveEvent(eventId: number, userId: number): Promise<void>;
  
  // User Events
  getUserEvents(userId: number, page?: number, size?: number): Promise<ChannelEvent[]>;
  getUserSubscribedEvents(userId: number, page?: number, size?: number): Promise<ChannelEvent[]>;
  getUserUpcomingEvents(userId: number): Promise<ChannelEvent[]>;
  getUserPastEvents(userId: number): Promise<ChannelEvent[]>;
  getUserSavedEvents(userId: number, page?: number, size?: number): Promise<ChannelEvent[]>;
  
  // Collaborators
  searchUsersForChannelDelegation(query: string, excludeUserId: number): Promise<Array<{
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    dni?: string;
    avatar?: string;
    role?: string;
  }>>;
  
  grantPublishingPermission(channelId: number, userId: number, adminId: number): Promise<ChannelCollaborator>;
  revokePublishingPermission(channelId: number, userId: number, adminId: number): Promise<ChannelCollaborator>;
  getChannelCollaborators(channelId: number, adminId: number): Promise<ChannelCollaborator[]>;
  canUserPublish(channelId: number, userId: number): Promise<{ canPublish: boolean }>;
  
  // Statistics
  getChannelStatistics(channelId: number, userId: number): Promise<ChannelStatistics>;
}

// Data Transfer Objects
export interface CreateChannelData {
  name: string;
  city: string;
  description: string;
  type?: 'PUBLIC' | 'PRIVATE';
  avatar?: string;
}

export interface CreateChannelPostData {
  content: string;
  imageUrls?: string[];
}

export interface CreateChannelEventData {
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  maxAttendees?: number;
  imageUrls?: string[];
}
