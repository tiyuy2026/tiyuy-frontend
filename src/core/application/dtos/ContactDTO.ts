export interface SendContactRequestDTO {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message: string;
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'WHATSAPP';
}

export interface ContactResponseDTO {
  id: number;
  propertyId: number;
  propertyTitle: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message: string;
  status: string;
  preferredContactMethod: string;
  isRead: boolean;
  createdAt: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export interface UnreadCountDTO {
  unreadCount: number;
}

export interface ContactPageDTO {
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  content: ContactResponseDTO[];
}
