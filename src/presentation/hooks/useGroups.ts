// GROUP HOOKS - Hexagonal Architecture
// This file belongs to GROUPS module (Presentation Layer - React Hooks)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GroupUseCases } from '../../core/domain/use-cases/GroupUseCases';
import { GroupRepositoryImpl } from '../../infrastructure/repositories/GroupRepositoryImpl';
import { CreateGroupPostData, CreateGroupCommentData, CreateGroupData } from '../../core/domain/repositories/GroupRepository';
import { Group } from '../../core/domain/entities/Group';
import { GroupPost, GroupComment, GroupLike, GroupShare } from '../../core/domain/entities/GroupPost';

// Main group hook (Presentation Layer)
export function useGroups(userId?: number) {
  const queryClient = useQueryClient();
  
  // Create use case instance with its dependency
  const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());

  // Query to get groups
  const {
    data: groups = [],
    isLoading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['groups', userId],
    queryFn: () => groupUseCases.getUserGroups(userId || 0),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to create group
  const createGroupMutation = useMutation({
    mutationFn: (data: CreateGroupData) => groupUseCases.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      console.log('Group created successfully');
    },
    onError: (error) => {
      console.error('Error creating group:', error);
    }
  });

  // Mutation to join group
  const joinGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupUseCases.joinGroup(groupId, userId || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      console.log('Joined group successfully');
    },
    onError: (error) => {
      console.error('Error joining group:', error);
    }
  });

  // Mutation to leave group
  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => groupUseCases.leaveGroup(groupId, userId || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      console.log('Left group successfully');
    },
    onError: (error) => {
      console.error('Error leaving group:', error);
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

// Hook for group posts
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
    staleTime: 30 * 1000, // 30 seconds for faster updates
  });

  // Mutation to create post
  const createPostMutation = useMutation({
    mutationFn: (data: CreateGroupPostData & { userId: number }) => 
      groupUseCases.createGroupPost(groupId, data, data.userId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
      console.log('Post created successfully:', result);
      return result;
    },
    onError: (error) => {
      console.error('Error creating post:', error);
    }
  });

  // Mutation to delete post
  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => 
      groupUseCases.deleteGroupPost(postId, 0), // userId will be obtained from context
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts', groupId] });
      console.log('Post deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
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
    createPostAsync: createPostMutation.mutateAsync,
    deletePost: deletePostMutation.mutate,
    isCreatingPost: createPostMutation.isPending,
    isDeletingPost: deletePostMutation.isPending
  };
}

// Hook for group comments
export function useGroupComments(groupId: number, postId: number) {
  const queryClient = useQueryClient();
  const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());

  const {
    data: commentsData = { content: [], totalElements: 0, totalPages: 0 },
    isLoading: commentsLoading,
    error: commentsError,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['group-comments', groupId, postId],
    queryFn: () => groupUseCases.getGroupComments(groupId, postId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Mutation to create comment
  const createCommentMutation = useMutation({
    mutationFn: (data: CreateGroupCommentData) =>
      groupUseCases.createGroupComment(groupId, postId, data, 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-comments', groupId, postId] });
      queryClient.invalidateQueries({ queryKey: ['group-posts'] }); // Para actualizar contador
      console.log('Comment created successfully');
    },
    onError: (error) => {
      console.error(' Error al crear comentario:', error);
    }
  });

  // Mutation to delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => 
      groupUseCases.deleteGroupComment(commentId, 0), // userId will be obtained from context
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['group-posts'] }); // Para actualizar contador
      console.log('Comment deleted successfully');
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

// Hook for interactions (likes, shares)
export function useGroupInteractions(currentUserId?: number) {
  const queryClient = useQueryClient();
  const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());

  // Like post
  const likePostMutation = useMutation({
    mutationFn: (postId: number) => groupUseCases.toggleGroupPostLike(postId, currentUserId || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      console.log('Post like updated');
    },
    onError: (error) => {
      console.error('Error liking post:', error);
    }
  });

  // Like comment
  const likeCommentMutation = useMutation({
    mutationFn: (commentId: number) => groupUseCases.toggleGroupCommentLike(commentId, currentUserId || 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-comments'] });
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      console.log('Comment like updated');
    },
    onError: (error) => {
      console.error('Error liking comment:', error);
    }
  });

  // Share post
  const sharePostMutation = useMutation({
    mutationFn: ({ postId, message }: { postId: number; message?: string }) => 
      groupUseCases.shareGroupPost(postId, currentUserId || 0, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      console.log('Post shared successfully');
    },
    onError: (error) => {
      console.error('Error sharing post:', error);
      alert('Error sharing post. Please try again.');
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

// Hook for images
export function useGroupImages() {
  const queryClient = useQueryClient();
  const groupUseCases = new GroupUseCases(new GroupRepositoryImpl());

  // Upload images
  const uploadImagesMutation = useMutation({
    mutationFn: ({ postId, files }: { postId: number; files: File[] }) => 
      groupUseCases.uploadGroupPostImages(postId, files),
    onSuccess: (imageUrls) => {
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      console.log('Images uploaded successfully:', imageUrls);
    },
    onError: (error) => {
      console.error('Error uploading images:', error);
    }
  });

  // Delete image
  const deleteImageMutation = useMutation({
    mutationFn: (imageUrl: string) => groupUseCases.deleteGroupPostImage(imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      console.log('Image deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
    }
  });

  return {
    uploadImages: uploadImagesMutation.mutate,
    deleteImage: deleteImageMutation.mutate,
    isUploadingImages: uploadImagesMutation.isPending,
    isDeletingImage: deleteImageMutation.isPending
  };
}
