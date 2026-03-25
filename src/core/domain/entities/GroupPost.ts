// GROUP ENTITIES - Hexagonal Architecture
// This file belongs to GROUPS module (Posts, Comments, Interactions)

export type PostStyle = 'default' | 'modern' | 'classic' | 'minimal';
export type FontStyle = 'normal' | 'bold' | 'italic';
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'rounded';

export interface GroupPost {
  id: number;
  groupId: number;
  userId: number;
  userName: string;
  userEmail: string;
  content: string;
  backgroundColor: string;
  textColor: string;
  fontStyle: FontStyle;
  borderStyle: BorderStyle;
  postStyle: PostStyle;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isPinned: boolean;
  isOwn: boolean;
  canEdit: boolean;
  canDelete: boolean;
  hasUserLiked: boolean;
  hasUserShared: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  timeAgo: string;
  recentComments: GroupComment[];
}

export interface GroupComment {
  id: number;
  groupPostId: number;
  userId: number;
  userName: string;
  userEmail: string;
  content: string;
  replyToCommentId?: number;
  replyToUserName?: string;
  replies: GroupComment[];
  createdAt: Date;
  updatedAt: Date;
  isOwn: boolean;
  canEdit: boolean;
  canDelete: boolean;
  timeAgo: string;
  replyCount: number;
  hasUserLiked: boolean;
  likeCount: number;
}

export interface GroupLike {
  id: number;
  groupPostId: number;
  userId: number;
  userName: string;
  userEmail: string;
  createdAt: Date;
  isOwn: boolean;
  isCurrentlyActive: boolean;
  timeAgo: string;
}

export interface GroupShare {
  id: number;
  groupPostId: number;
  userId: number;
  userName: string;
  userEmail: string;
  shareMessage?: string;
  createdAt: Date;
  isOwn: boolean;
  isCurrentlyActive: boolean;
  timeAgo: string;
}
