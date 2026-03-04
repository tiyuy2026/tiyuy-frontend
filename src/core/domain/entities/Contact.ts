export type ContactStatus = 'PENDING' | 'CONTACTED' | 'CLOSED';
export type PreferredContactMethod = 'EMAIL' | 'PHONE' | 'WHATSAPP';

export interface Contact {
  id: number;
  propertyId: number;
  propertyTitle: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message: string;
  status: ContactStatus;
  preferredContactMethod: PreferredContactMethod;
  isRead: boolean;
  createdAt: Date;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export interface SendContactData {
  propertyId: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message: string;
  preferredContactMethod: PreferredContactMethod;
}

export interface ContactListItem {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertySlug?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message: string;
  status: ContactStatus;
  isRead: boolean;
  createdAt: Date;
}
