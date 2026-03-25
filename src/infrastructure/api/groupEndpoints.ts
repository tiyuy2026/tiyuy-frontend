// GROUP ENDPOINTS - Hexagonal Architecture
// This file belongs to GROUPS module (Infrastructure - API)

export const GROUP_ENDPOINTS = {
  // Groups
  BASE: '/contacts/extended/groups',
  CREATE: '/contacts/extended/groups',
  JOIN: (groupId: number) => `/contacts/extended/groups/${groupId}/join`,
  LEAVE: (groupId: number) => `/contacts/extended/groups/${groupId}/leave`,
  
  // Posts
  POSTS: (groupId: number) => `/contacts/extended/groups/${groupId}/posts`,
  POST_DETAIL: (postId: number) => `/contacts/extended/groups/posts/${postId}`,
  POSTS_RECENT: (groupId: number) => `/contacts/extended/groups/${groupId}/posts/recent`,
  POSTS_PINNED: (groupId: number) => `/contacts/extended/groups/${groupId}/posts/pinned`,
  
  // Comments
  COMMENTS: (groupId: number, postId: number) => `/contacts/extended/groups/${groupId}/posts/${postId}/comments`,
  COMMENT_DETAIL: (commentId: number) => `/contacts/extended/groups/comments/${commentId}`,
  
  // Interactions
  LIKE_POST: (postId: number) => `/contacts/extended/groups/posts/${postId}/like`,
  LIKE_COMMENT: (commentId: number) => `/contacts/extended/groups/comments/${commentId}/like`,
  SHARE_POST: (postId: number) => `/contacts/extended/groups/posts/${postId}/share`,
  
  // Images
  UPLOAD_IMAGES: (postId: number) => `/contacts/extended/groups/posts/${postId}/upload-images`,
  DELETE_IMAGE: '/contacts/extended/groups/posts/images/delete'
};
