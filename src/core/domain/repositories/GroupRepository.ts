// 🏗️ REPOSITORIOS DE GRUPOS - Arquitectura Hexagonal
// Este archivo pertenece al módulo de GRUPOS (Interfaces puras del dominio)

import { Group } from '../entities/Group';
import { GroupPost, GroupComment, GroupLike, GroupShare } from '../entities/GroupPost';

// Interfaz del repositorio (Dominio Puro)
export interface GroupRepository {
  // Grupos
  getGroups(userId?: number): Promise<Group[]>;
  getGroupById(id: number): Promise<Group>;
  joinGroup(groupId: number, userId: number): Promise<void>;
  leaveGroup(groupId: number, userId: number): Promise<void>;
  
  // Publicaciones
  getGroupPosts(groupId: number, page?: number, size?: number): Promise<{ content: GroupPost[]; totalElements: number; totalPages: number }>;
  createGroupPost(groupId: number, data: CreateGroupPostData): Promise<GroupPost>;
  updateGroupPost(postId: number, data: UpdateGroupPostData): Promise<GroupPost>;
  deleteGroupPost(postId: number, userId: number): Promise<void>;
  
  // Comentarios
  getGroupComments(postId: number, page?: number, size?: number): Promise<{ content: GroupComment[]; totalElements: number; totalPages: number }>;
  createGroupComment(postId: number, data: CreateGroupCommentData): Promise<GroupComment>;
  deleteGroupComment(commentId: number, userId: number): Promise<void>;
  
  // Interacciones
  toggleGroupPostLike(postId: number, userId: number): Promise<GroupLike>;
  toggleGroupCommentLike(commentId: number, userId: number): Promise<GroupLike>;
  shareGroupPost(postId: number, userId: number, message?: string): Promise<GroupShare>;
  
  // Imágenes
  uploadGroupPostImages(postId: number, files: File[]): Promise<string[]>;
  deleteGroupPostImage(imageUrl: string): Promise<void>;
}

// DTOs para el dominio
export interface CreateGroupPostData {
  content: string;
  backgroundColor?: string;
  textColor?: string;
  fontStyle?: 'normal' | 'bold' | 'italic';
  borderStyle?: 'none' | 'solid' | 'dashed' | 'rounded';
  postStyle?: 'default' | 'modern' | 'classic' | 'minimal';
  imageUrls?: string[];
}

export interface UpdateGroupPostData extends Partial<CreateGroupPostData> {}

export interface CreateGroupCommentData {
  content: string;
  replyToCommentId?: number;
}
