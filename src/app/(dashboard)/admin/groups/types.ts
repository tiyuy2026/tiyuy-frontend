// Tipos para gestión de Grupos y Canales

export interface Group {
  id: number;
  name: string;
  description: string;
  avatar: string | null;
  adminName: string;
  adminEmail: string;
  isRestrictedByEmail: boolean;
  isActive: boolean;
  memberCount: number;
  shareLink: string;
  createdAt: string;
  hasViolation?: boolean;
  suspensionType?: 'disabled' | 'violation';
  violationReason?: string;
  violationEmailSentAt?: string;
}

export interface Channel {
  id: number;
  name: string;
  city: string;
  description: string;
  avatar: string | null;
  adminName: string;
  adminEmail: string;
  type: 'PUBLIC' | 'PRIVATE';
  isDefault: boolean;
  isActive: boolean;
  subscriberCount: number;
  createdAt: string;
  suspensionType?: 'disabled' | 'violation';
}

export type ViewType = 'groups' | 'channels' | 'suspended';
export type ViewMode = 'grid' | 'list';
export type StatusFilter = 'all' | 'active' | 'inactive' | 'suspended' | 'violations';
export type SortBy = 'newest' | 'oldest' | 'az' | 'za' | 'most_members' | 'least_members';
export type SuspendedFilter = 'all' | 'groups' | 'channels';
