// CHANNEL ENDPOINTS - Hexagonal Architecture
// This file belongs to CHANNELS module (Infrastructure - API)

export const CHANNEL_ENDPOINTS = {
  // Channels
  BASE: '/contacts/extended/channels',
  CREATE: '/contacts/extended/channels',
  SUBSCRIBE: (channelId: number) => `/contacts/extended/channels/${channelId}/subscribe`,
  
  // Posts
  POSTS: (channelId: number) => `/contacts/extended/channels/${channelId}/posts`,
  LIKE_POST: (channelId: number, postId: number) => `/contacts/extended/channels/${channelId}/posts/${postId}/like`,
  SHARE_POST: (channelId: number, postId: number) => `/contacts/extended/channels/${channelId}/posts/${postId}/share`,
  COMMENTS: (channelId: number, postId: number) => `/contacts/extended/channels/${channelId}/posts/${postId}/comments`,
  
  // Events
  EVENTS: (channelId: number) => `/contacts/extended/channels/${channelId}/events`,
  RESPOND_EVENT: (eventId: number) => `/contacts/extended/channels/events/${eventId}/respond`,
  SAVE_EVENT: (eventId: number) => `/contacts/extended/events/${eventId}/save`,
  
  // User Events
  USER_EVENTS: '/contacts/extended/users/events',
  USER_SUBSCRIBED_EVENTS: '/contacts/extended/users/events/subscribed',
  USER_UPCOMING_EVENTS: '/contacts/extended/users/events/upcoming',
  USER_PAST_EVENTS: '/contacts/extended/users/events/past',
  USER_SAVED_EVENTS: '/contacts/extended/users/events/saved',
  
  // Collaborators
  SEARCH_USERS: '/contacts/extended/channels/users/search',
  COLLABORATORS: (channelId: number) => `/contacts/extended/channels/${channelId}/collaborators`,
  CAN_PUBLISH: (channelId: number) => `/contacts/extended/channels/${channelId}/can-publish`,
  
  // Statistics
  STATISTICS: (channelId: number) => `/contacts/extended/channels/${channelId}/statistics`,
};
