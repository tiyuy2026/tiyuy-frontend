// GROUP REPOSITORIES - Hexagonal Architecture
// This file belongs to GROUPS module (Pure domain interfaces)

import { Group } from '../entities/Group';
import { GroupPost, GroupComment, GroupLike, GroupShare } from '../entities/GroupPost';

// Repository interface (Pure Domain)
export interface GroupRepository {
  // Groups
  getGroups(userId?: number): Promise<Group[]>;
  getGroupById(id: number): Promise<Group>;
  createGroup(data: CreateGroupData): Promise<Group>;
  joinGroup(groupId: number, userId: number): Promise<void>;
  leaveGroup(groupId: number, userId: number): Promise<void>;
  
  // Posts
  getGroupPosts(groupId: number, page?: number, size?: number): Promise<{ content: GroupPost[]; totalElements: number; totalPages: number }>;
  createGroupPost(groupId: number, data: CreateGroupPostData): Promise<GroupPost>;
  updateGroupPost(postId: number, data: UpdateGroupPostData): Promise<GroupPost>;
  deleteGroupPost(postId: number, userId: number): Promise<void>;
  
  // Comments
  getGroupComments(groupId: number, postId: number, page?: number, size?: number): Promise<{ content: GroupComment[]; totalElements: number; totalPages: number }>;
  createGroupComment(groupId: number, postId: number, data: CreateGroupCommentData): Promise<GroupComment>;
  deleteGroupComment(commentId: number, userId: number): Promise<void>;
  
  // Interactions
  toggleGroupPostLike(postId: number, userId: number): Promise<GroupLike>;
  toggleGroupCommentLike(commentId: number, userId: number): Promise<GroupLike>;
  shareGroupPost(postId: number, userId: number, message?: string): Promise<GroupShare>;
  
  // Images
  uploadGroupPostImages(postId: number, files: File[]): Promise<string[]>;
  deleteGroupPostImage(imageUrl: string): Promise<void>;
}

// DTOs for domain
export interface CreateGroupPostData {
  content: string;
  backgroundColor?: string;
  textColor?: string;
  fontStyle?: 'normal' | 'bold' | 'italic';
  borderStyle?: 'none' | 'solid' | 'dashed' | 'rounded';
  postStyle?: 'default' | 'modern' | 'classic' | 'minimal';
  imageUrls?: string[];
  userId: number; // userId required by backend
}

export interface UpdateGroupPostData extends Partial<CreateGroupPostData> {}

export interface CreateGroupCommentData {
  content: string;
  replyToCommentId?: number;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  avatar?: string;
  isRestrictedByEmail?: boolean;
}
