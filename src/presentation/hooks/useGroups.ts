// 🏗️ HOOKS DE GRUPOS - Arquitectura Hexagonal
// Este archivo pertenece al módulo de GRUPOS (Presentation Layer - React Hooks)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GroupUseCases } from '../../core/domain/use-cases/GroupUseCases';
import { GroupRepositoryImpl } from '../../infrastructure/repositories/GroupRepositoryImpl';
import { CreateGroupPostData, CreateGroupCommentData, CreateGroupData } from '../../core/domain/repositories/GroupRepository';
import { Group } from '../../core/domain/entities/Group';
import { GroupPost, GroupComment, GroupLike, GroupShare } from '../../core/domain/entities/GroupPost';

// Hook principal de grupos (Presentation Layer)
export function useGroups(userId?: number) {
  const queryClient = useQueryClient();
  
  // Crear instancia del caso de uso con su dependencia
  const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());

  // Query para obtener grupos
  const {
    data: groups = [],
    isLoading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['groups', userId],
    queryFn: () => groupUseCases.getUserGroups(userId || 0),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutación para crear grupo
  const createGroupMutation = useMutation({
    mutationFn: (data: CreateGroupData) => groupUseCases.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      console.log(' Grupo creado exitosamente');
    },
    onError: (error) => {
      console.error('Error al crear grupo:', error);
    }
  });

  // Mutación para unirse a grupo
  const joinGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupUseCases.joinGroup(groupId, userId || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      console.log(' Te has unido al grupo exitosamente');
    },
    onError: (error) => {
      console.error(' Error al unirse al grupo:', error);
    }
  });

  // Mutación para abandonar grupo
  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupUseCases.leaveGroup(groupId, userId || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      console.log(' Has abandonado el grupo exitosamente');
    },
    onError: (error) => {
      console.error(' Error al abandonar el grupo:', error);
    }
  });

  return {
    groups,
    groupsLoading,
    groupsError,
    refetchGroups,
    createGroup: createGroupMutation.mutate,
    joinGroup: joinGroupMutation.mutate,
    leaveGroup: leaveGroupMutation.mutate,
    isCreatingGroup: createGroupMutation.isPending,
    isJoining: joinGroupMutation.isPending,
    isLeaving: leaveGroupMutation.isPending
  };
}

// Hook para publicaciones de grupo
export function useGroupPosts(groupId: number) {
  const queryClient = useQueryClient();
  const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());

  const {
    data: postsData = { content: [], totalElements: 0, totalPages: 0 },
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ['group-posts', groupId],
    queryFn: () => groupUseCases.getGroupPosts(groupId),
    staleTime: 30 * 1000, // 30 segundos para que se actualice más rápido
  });

  // Mutación para crear publicación
  const createPostMutation = useMutation({
    mutationFn: (data: CreateGroupPostData & { userId: number }) => 
      groupUseCases.createGroupPost(groupId, data, data.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
      console.log(' Publicación creada exitosamente');
    },
    onError: (error) => {
      console.error(' Error al crear publicación:', error);
    }
  });

  // Mutación para eliminar publicación
  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => 
      groupUseCases.deleteGroupPost(postId, 0), // userId se obtendrá del contexto
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
      console.log(' Publicación eliminada exitosamente');
    },
    onError: (error) => {
      console.error(' Error al eliminar publicación:', error);
    }
  });

  return {
    posts: postsData.content,
    postsLoading,
    postsError,
    totalPosts: postsData.totalElements,
    totalPages: postsData.totalPages,
    refetchPosts,
    createPost: createPostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    isDeletingPost: deletePostMutation.isPending
  };
}

// Hook para comentarios de grupo
export function useGroupComments(postId: number) {
  const queryClient = useQueryClient();
  const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());

  const {
    data: commentsData = { content: [], totalElements: 0, totalPages: 0 },
    isLoading: commentsLoading,
    error: commentsError,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['group-comments', postId],
    queryFn: () => groupUseCases.getGroupComments(postId),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });

  // Mutación para crear comentario
  const createCommentMutation = useMutation({
    mutationFn: (data: CreateGroupCommentData) => 
      groupUseCases.createGroupComment(postId, data, 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['group-posts'] }); // Para actualizar contador
      console.log(' Comentario creado exitosamente');
    },
    onError: (error) => {
      console.error(' Error al crear comentario:', error);
    }
  });

  // Mutación para eliminar comentario
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => 
      groupUseCases.deleteGroupComment(commentId, 0), // userId se obtendrá del contexto
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['group-posts'] }); // Para actualizar contador
      console.log(' Comentario eliminado exitosamente');
    },
    onError: (error) => {
      console.error(' Error al eliminar comentario:', error);
    }
  });

  return {
    comments: commentsData.content,
    commentsLoading,
    commentsError,
    totalComments: commentsData.totalElements,
    totalPages: commentsData.totalPages,
    refetchComments,
    createComment: createCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    isCreatingComment: createCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending
  };
}

// Hook para interacciones (likes, shares)
export function useGroupInteractions() {
  const queryClient = useQueryClient();
  const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());

  // Like publicación
  const likePostMutation = useMutation({
    mutationFn: (postId: number) => groupUseCases.toggleGroupPostLike(postId, 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      console.log(' Like a publicación actualizado');
    },
    onError: (error) => {
      console.error('❌ Error al dar like a publicación:', error);
    }
  });

  // Like comentario
  const likeCommentMutation = useMutation({
    mutationFn: (commentId: number) => groupUseCases.toggleGroupCommentLike(commentId, 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-comments'] });
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      console.log(' Like a comentario actualizado');
    },
    onError: (error) => {
      console.error('Error al dar like a comentario:', error);
    }
  });

  // Share publicación
  const sharePostMutation = useMutation({
    mutationFn: ({ postId, message }: { postId: number; message?: string }) => 
      groupUseCases.shareGroupPost(postId, 0, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      console.log('Publicación compartida exitosamente');
    },
    onError: (error) => {
      console.error('Error al compartir publicación:', error);
    }
  });

  return {
    likePost: likePostMutation.mutate,
    likeComment: likeCommentMutation.mutate,
    sharePost: sharePostMutation.mutate,
    isLikingPost: likePostMutation.isPending,
    isLikingComment: likeCommentMutation.isPending,
    isSharingPost: sharePostMutation.isPending
  };
}

// Hook para imágenes
export function useGroupImages() {
  const queryClient = useQueryClient();
  const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());

  // Subir imágenes
  const uploadImagesMutation = useMutation({
    mutationFn: ({ postId, files }: { postId: number; files: File[] }) => 
      groupUseCases.uploadGroupPostImages(postId, files),
    onSuccess: (imageUrls) => {
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      console.log(' Imágenes subidas exitosamente:', imageUrls);
    },
    onError: (error) => {
      console.error(' Error al subir imágenes:', error);
    }
  });

  // Eliminar imagen
  const deleteImageMutation = useMutation({
    mutationFn: (imageUrl: string) => groupUseCases.deleteGroupPostImage(imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      console.log(' Imagen eliminada exitosamente');
    },
    onError: (error) => {
      console.error(' Error al eliminar imagen:', error);
    }
  });

  return {
    uploadImages: uploadImagesMutation.mutate,
    deleteImage: deleteImageMutation.mutate,
    isUploadingImages: uploadImagesMutation.isPending,
    isDeletingImage: deleteImageMutation.isPending
  };
}
