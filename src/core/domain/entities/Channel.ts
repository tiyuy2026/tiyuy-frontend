// CHANNEL ENTITY - Hexagonal Architecture
// This file belongs to CHANNELS module (Domain - Core Entity)

export interface Channel {
  id: number;
  name: string;
  city: string;
  description: string;
  avatar?: string;
  type: 'PUBLIC' | 'PRIVATE';
  subscriberCount: number;
  isSubscribed: boolean;
  isAdmin: boolean;
  isOwner?: boolean;
  subscribersCanPost?: boolean;
  shareLink: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelPost {
  id: number;
  channelId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelEvent {
  id: number;
  channelId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  maxAttendees?: number;
  currentAttendees: number;
  imageUrls: string[];
  isAttending: boolean;
  isOwner: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelSubscriber {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  subscribedAt: string;
}

export interface ChannelCollaborator {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  canPublish: boolean;
  grantedAt: string;
}

export interface ChannelComment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  replyToCommentId?: number;
  replies?: ChannelComment[];
}

export interface ChannelStatistics {
  subscriberCount: number;
  collaboratorCount: number;
  totalPosts: number;
  totalComments: number;
  postsLast30Days: number;
  postsLast7Days: number;
  commentsLast30Days: number;
  commentsLast7Days: number;
  activeUsersLast7Days: number;
  dailyActivity: Array<{
    date: string;
    posts: number;
    comments: number;
    interactions: number;
  }>;
}
