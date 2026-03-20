// 🏗️ ENDPOINTS DE GRUPOS - Arquitectura Hexagonal
// Este archivo pertenece al módulo de GRUPOS (Infraestructura - API)

export const GROUP_ENDPOINTS = {
  // Grupos
  BASE: '/contacts/extended/groups',
  CREATE: '/contacts/extended/groups',
  JOIN: (groupId: number) => `/contacts/extended/groups/${groupId}/join`,
  LEAVE: (groupId: number) => `/contacts/extended/groups/${groupId}/leave`,
  
  // Publicaciones
  POSTS: (groupId: number) => `/contacts/extended/groups/${groupId}/posts`,
  POST_DETAIL: (postId: number) => `/contacts/extended/groups/posts/${postId}`,
  POSTS_RECENT: (groupId: number) => `/contacts/extended/groups/${groupId}/posts/recent`,
  POSTS_PINNED: (groupId: number) => `/contacts/extended/groups/${groupId}/posts/pinned`,
  
  // Comentarios
  COMMENTS: (groupId: number, postId: number) => `/contacts/extended/groups/${groupId}/posts/${postId}/comments`,
  COMMENT_DETAIL: (commentId: number) => `/contacts/extended/groups/comments/${commentId}`,
  
  // Interacciones
  LIKE_POST: (postId: number) => `/contacts/extended/groups/posts/${postId}/like`,
  LIKE_COMMENT: (commentId: number) => `/contacts/extended/groups/comments/${commentId}/like`,
  SHARE_POST: (postId: number) => `/contacts/extended/groups/posts/${postId}/share`,
  
  // Imágenes
  UPLOAD_IMAGES: (postId: number) => `/contacts/extended/groups/posts/${postId}/upload-images`,
  DELETE_IMAGE: '/contacts/extended/groups/posts/images/delete'
};
