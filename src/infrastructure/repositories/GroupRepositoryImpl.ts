// 🏗️ IMPLEMENTACIÓN DE REPOSITORIO DE GRUPOS - Arquitectura Hexagonal
// Este archivo pertenece al módulo de GRUPOS (Infraestructura - Implementación concreta)

import { GroupRepository, CreateGroupPostData, CreateGroupCommentData } from '../../core/domain/repositories/GroupRepository';
import { Group } from '../../core/domain/entities/Group';
import { GroupPost, GroupComment, GroupLike, GroupShare } from '../../core/domain/entities/GroupPost';
import { axiosClient } from '../api/axios-client';
import { GROUP_ENDPOINTS } from '../api/groupEndpoints';

// Implementación concreta del repositorio (Infraestructura)
export class GroupRepositoryImpl implements GroupRepository {
  
  // Grupos
  async getGroups(userId?: number): Promise<Group[]> {
    const response = await axiosClient.get(GROUP_ENDPOINTS.BASE);
    return response.data.map(this.mapToGroup);
  }

  async getGroupById(id: number): Promise<Group> {
    const response = await axiosClient.get(`${GROUP_ENDPOINTS.BASE}/${id}`);
    return this.mapToGroup(response.data);
  }

  async joinGroup(groupId: number, userId: number): Promise<void> {
    await axiosClient.post(GROUP_ENDPOINTS.JOIN(groupId));
  }

  async leaveGroup(groupId: number, userId: number): Promise<void> {
    await axiosClient.delete(GROUP_ENDPOINTS.LEAVE(groupId));
  }
  
  // Publicaciones
  async getGroupPosts(groupId: number, page: number = 0, size: number = 20): Promise<{ content: GroupPost[]; totalElements: number; totalPages: number }> {
    const response = await axiosClient.get(GROUP_ENDPOINTS.POSTS(groupId), {
      params: { page, size }
    });
    return {
      content: response.data.content.map(this.mapToGroupPost),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages
    };
  }

  async createGroupPost(groupId: number, data: CreateGroupPostData): Promise<GroupPost> {
    const response = await axiosClient.post(GROUP_ENDPOINTS.POSTS(groupId), data);
    return this.mapToGroupPost(response.data);
  }

  async updateGroupPost(postId: number, data: Partial<CreateGroupPostData>): Promise<GroupPost> {
    const response = await axiosClient.put(GROUP_ENDPOINTS.POST_DETAIL(postId), data);
    return this.mapToGroupPost(response.data);
  }

  async deleteGroupPost(postId: number, userId: number): Promise<void> {
    await axiosClient.delete(GROUP_ENDPOINTS.POST_DETAIL(postId));
  }
  
  // Comentarios
  async getGroupComments(postId: number, page: number = 0, size: number = 20): Promise<{ content: GroupComment[]; totalElements: number; totalPages: number }> {
    const response = await axiosClient.get(GROUP_ENDPOINTS.COMMENTS(0, postId), {
      params: { page, size }
    });
    return {
      content: response.data.content.map(this.mapToGroupComment),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages
    };
  }

  async createGroupComment(postId: number, data: CreateGroupCommentData): Promise<GroupComment> {
    const response = await axiosClient.post(GROUP_ENDPOINTS.COMMENTS(0, postId), data);
    return this.mapToGroupComment(response.data);
  }

  async deleteGroupComment(commentId: number, userId: number): Promise<void> {
    await axiosClient.delete(GROUP_ENDPOINTS.COMMENT_DETAIL(commentId));
  }
  
  // Interacciones
  async toggleGroupPostLike(postId: number, userId: number): Promise<GroupLike> {
    const response = await axiosClient.post(GROUP_ENDPOINTS.LIKE_POST(postId));
    return this.mapToGroupLike(response.data);
  }

  async toggleGroupCommentLike(commentId: number, userId: number): Promise<GroupLike> {
    const response = await axiosClient.post(GROUP_ENDPOINTS.LIKE_COMMENT(commentId));
    return this.mapToGroupLike(response.data);
  }

  async shareGroupPost(postId: number, userId: number, message?: string): Promise<GroupShare> {
    const response = await axiosClient.post(GROUP_ENDPOINTS.SHARE_POST(postId), { shareMessage: message });
    return this.mapToGroupShare(response.data);
  }
  
  // Imágenes
  async uploadGroupPostImages(postId: number, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await axiosClient.post(GROUP_ENDPOINTS.UPLOAD_IMAGES(postId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async deleteGroupPostImage(imageUrl: string): Promise<void> {
    await axiosClient.delete(GROUP_ENDPOINTS.DELETE_IMAGE, {
      params: { imageUrl }
    });
  }

  // Mappers (conversión de API a entidades del dominio)
  private mapToGroup(data: any): Group {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status,
      memberCount: data.memberCount,
      postCount: data.postCount,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      isUserMember: data.isUserMember,
      userRole: data.userRole
    };
  }

  private mapToGroupPost(data: any): GroupPost {
    return {
      id: data.id,
      groupId: data.groupId,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      content: data.content,
      backgroundColor: data.backgroundColor,
      textColor: data.textColor,
      fontStyle: data.fontStyle,
      borderStyle: data.borderStyle,
      postStyle: data.postStyle,
      imageUrls: data.imageUrls || [],
      likeCount: data.likeCount,
      commentCount: data.commentCount,
      shareCount: data.shareCount,
      viewCount: data.viewCount,
      isPinned: data.isPinned,
      isOwn: data.isOwn,
      canEdit: data.canEdit,
      canDelete: data.canDelete,
      hasUserLiked: data.hasUserLiked,
      hasUserShared: data.hasUserShared,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      expiresAt: new Date(data.expiresAt),
      timeAgo: data.timeAgo,
      recentComments: (data.recentComments || []).map(this.mapToGroupComment)
    };
  }

  private mapToGroupComment(data: any): GroupComment {
    return {
      id: data.id,
      groupPostId: data.groupPostId,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      content: data.content,
      replyToCommentId: data.replyToCommentId,
      replyToUserName: data.replyToUserName,
      replies: (data.replies || []).map(this.mapToGroupComment),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      isOwn: data.isOwn,
      canEdit: data.canEdit,
      canDelete: data.canDelete,
      timeAgo: data.timeAgo,
      replyCount: data.replyCount,
      hasUserLiked: data.hasUserLiked,
      likeCount: data.likeCount
    };
  }

  private mapToGroupLike(data: any): GroupLike {
    return {
      id: data.id,
      groupPostId: data.groupPostId,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      createdAt: new Date(data.createdAt),
      isOwn: data.isOwn,
      isCurrentlyActive: data.isCurrentlyActive,
      timeAgo: data.timeAgo
    };
  }

  private mapToGroupShare(data: any): GroupShare {
    return {
      id: data.id,
      groupPostId: data.groupPostId,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      shareMessage: data.shareMessage,
      createdAt: new Date(data.createdAt),
      isOwn: data.isOwn,
      isCurrentlyActive: data.isCurrentlyActive,
      timeAgo: data.timeAgo
    };
  }
}
