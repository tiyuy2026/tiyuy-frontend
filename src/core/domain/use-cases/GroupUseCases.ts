// 🏗️ CASOS DE USO DE GRUPOS - Arquitectura Hexagonal
// Este archivo pertenece al módulo de GRUPOS (Lógica de negocio pura)

import { Group } from '../entities/Group';
import { GroupPost, GroupComment, GroupLike, GroupShare } from '../entities/GroupPost';
import { GroupRepository, CreateGroupPostData, CreateGroupCommentData } from '../repositories/GroupRepository';

// Casos de uso del dominio (lógica de negocio pura)
export class GroupUseCases {
  constructor(private groupRepository: GroupRepository) {}

  // Casos de uso para grupos
  async getUserGroups(userId: number): Promise<Group[]> {
    return this.groupRepository.getGroups(userId);
  }

  async getGroupById(id: number): Promise<Group> {
    return this.groupRepository.getGroupById(id);
  }

  async joinGroup(groupId: number, userId: number): Promise<void> {
    await this.groupRepository.joinGroup(groupId, userId);
  }

  async leaveGroup(groupId: number, userId: number): Promise<void> {
    await this.groupRepository.leaveGroup(groupId, userId);
  }

  // Casos de uso para publicaciones
  async getGroupPosts(groupId: number, page: number = 0, size: number = 20): Promise<{ content: GroupPost[]; totalElements: number; totalPages: number }> {
    return this.groupRepository.getGroupPosts(groupId, page, size);
  }

  async createGroupPost(groupId: number, data: CreateGroupPostData, userId: number): Promise<GroupPost> {
    // Validaciones de negocio
    if (!data.content || data.content.trim().length === 0) {
      throw new Error('El contenido es obligatorio');
    }

    if (data.imageUrls && data.imageUrls.length > 3) {
      throw new Error('Máximo 3 imágenes permitidas');
    }

    return this.groupRepository.createGroupPost(groupId, data);
  }

  async updateGroupPost(postId: number, data: Partial<CreateGroupPostData>, userId: number, groupId: number): Promise<GroupPost> {
    const posts = await this.groupRepository.getGroupPosts(groupId);
    const existingPost = posts.content.find(p => p.id === postId);
    
    if (!existingPost) {
      throw new Error('Publicación no encontrada');
    }

    if (!existingPost.isOwn) {
      throw new Error('No puedes editar esta publicación');
    }

    return this.groupRepository.updateGroupPost(postId, data);
  }

  async deleteGroupPost(postId: number, userId: number): Promise<void> {
    // Validar que el usuario pueda eliminar
    const posts = await this.groupRepository.getGroupPosts(0); // Obtener todas las publicaciones para validar
    const post = posts.content.find(p => p.id === postId);
    
    if (!post) {
      throw new Error('Publicación no encontrada');
    }

    if (!post.isOwn) {
      throw new Error('No puedes eliminar esta publicación');
    }

    await this.groupRepository.deleteGroupPost(postId, userId);
  }

  // Casos de uso para comentarios
  async getGroupComments(postId: number, page: number = 0, size: number = 20): Promise<{ content: GroupComment[]; totalElements: number; totalPages: number }> {
    return this.groupRepository.getGroupComments(postId, page, size);
  }

  async createGroupComment(postId: number, data: CreateGroupCommentData, userId: number): Promise<GroupComment> {
    if (!data.content || data.content.trim().length === 0) {
      throw new Error('El contenido del comentario es obligatorio');
    }

    return this.groupRepository.createGroupComment(postId, data);
  }

  async deleteGroupComment(commentId: number, userId: number): Promise<void> {
    await this.groupRepository.deleteGroupComment(commentId, userId);
  }

  // Casos de uso para interacciones
  async toggleGroupPostLike(postId: number, userId: number): Promise<GroupLike> {
    return this.groupRepository.toggleGroupPostLike(postId, userId);
  }

  async toggleGroupCommentLike(commentId: number, userId: number): Promise<GroupLike> {
    return this.groupRepository.toggleGroupCommentLike(commentId, userId);
  }

  async shareGroupPost(postId: number, userId: number, message?: string): Promise<GroupShare> {
    return this.groupRepository.shareGroupPost(postId, userId, message);
  }

  // Casos de uso para imágenes
  async uploadGroupPostImages(postId: number, files: File[]): Promise<string[]> {
    if (files.length > 3) {
      throw new Error('Máximo 3 imágenes permitidas');
    }

    // Validar tipos de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de archivo no permitido: ${file.type}`);
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error(`El archivo ${file.name} excede los 5MB`);
      }
    }

    return this.groupRepository.uploadGroupPostImages(postId, files);
  }

  async deleteGroupPostImage(imageUrl: string): Promise<void> {
    await this.groupRepository.deleteGroupPostImage(imageUrl);
  }
}
