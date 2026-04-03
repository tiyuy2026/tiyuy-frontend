export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED_WON' | 'CLOSED_LOST' | 'ARCHIVED';
export type ClientInteractionType = 'CALL' | 'EMAIL' | 'MEETING' | 'WHATSAPP' | 'VISIT' | 'NOTE' | 'STATUS_CHANGE' | 'FOLLOW_UP';
export type ClientTemperature = 'HOT' | 'WARM' | 'COLD';

export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  dni?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  preferredLocation?: string;
  propertyType?: string;
  notes?: string;
  status: ClientStatus;
  source?: string;
  temperature?: ClientTemperature;
  nextFollowUp?: string; // ISO date
  lastContactAt?: string; // ISO datetime
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  originLeadId?: number;
  totalInteractions?: number;
  recentInteractions?: ClientInteraction[];
}

export interface ClientInteraction {
  id: number;
  type: ClientInteractionType;
  title: string;
  notes?: string;
  interactionDate: string; // ISO datetime
  createdAt: string;
  createdBy: number;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  closedWon: number;
  closedLost: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  followUpsDue: number;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  dni?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  preferredLocation?: string;
  propertyType?: string;
  notes?: string;
  status?: ClientStatus;
  source?: string;
  temperature?: ClientTemperature;
  nextFollowUp?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  dni?: string;
  budgetMin?: number;
  budgetMax?: number;
  currency?: string;
  preferredLocation?: string;
  propertyType?: string;
  notes?: string;
  status?: ClientStatus;
  temperature?: ClientTemperature;
  nextFollowUp?: string;
  lastContactAt?: string;
  archived?: boolean;
}

export interface CreateInteractionData {
  type: ClientInteractionType;
  title: string;
  notes?: string;
  interactionDate: string;
}

export interface ClientFilter {
  status?: ClientStatus;
  archived?: boolean;
  temperature?: ClientTemperature;
  page?: number;
  size?: number;
}
