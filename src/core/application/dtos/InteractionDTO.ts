// src/core/application/dtos/InteractionDTO.ts

export interface LeadDTO {
  id: number;
  propertyId: number;
  propertyTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'PENDING' | 'CONTACTED' | 'CLOSED';
  isRead: boolean;
  createdAt: string;
}

export interface CreateLeadDTO {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface RatingDTO {
  id: number;
  propertyId: number;
  userId: number;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface InteractionStats {
  totalViews: number;
  uniqueViews: number;
  totalLeads: number;
  totalRatings: number;
  averageRating: number;
  conversionRate: number; // leads / views
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
