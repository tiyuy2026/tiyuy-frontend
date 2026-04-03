export type AgentSpecialty = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'LUXURY' | 'RENTAL';

export type VerificationStatus = 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface AgentBasicInfo {
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  photoUrl?: string;
  city?: string;
  country?: string;
}

export interface AgentProfessionalInfo {
  licenseNumber: string;
  agency?: string;
  agencyRuc?: string;
  yearsOfExperience?: number;
  specialty?: AgentSpecialty;
  aboutProfessional?: string;
}

export interface AgentVerification {
  isVerified: boolean;
  status: VerificationStatus;
  badgeUrl?: string;
}

export interface AgentMetrics {
  averageRating?: number;
  totalSales: number;
  totalRentals: number;
  responseTimeAvg?: number;
  activeProperties: number;
}

export interface AgentPublicProfile {
  slug?: string;
  languages: string[];
  serviceAreas: string[];
}

export interface Agent {
  userId: number;
  basicInfo: AgentBasicInfo;
  professionalInfo?: AgentProfessionalInfo;
  verification?: AgentVerification;
  metrics?: AgentMetrics;
  publicProfile?: AgentPublicProfile;
}

export interface PublicAgentProfile {
  slug: string;
  fullName: string;
  photoUrl?: string;
  specialty?: string;
  agency?: string;
  isVerified: boolean;
  averageRating?: number;
  totalSales: number;
  yearsOfExperience?: number;
  about?: string;
  languages: string[];
  serviceAreas: string[];
  activeProperties: number;
  properties: PublicPropertySummary[];
}

export interface PublicPropertySummary {
  id: number;
  title: string;
  price: number;
  image?: string;
  type: string;
  transactionType: string;
}

export interface AgentDashboardSummary {
  totalProperties: number;
  activeProperties: number;
  totalLeads: number;
  unreadLeads: number;
  totalClients: number;
  pendingTasks: number;
}

export interface RecentLead {
  id: number;
  propertyTitle: string;
  clientName: string;
  status: string;
  isRead: boolean;
  createdAt: string;
}

export interface Pipeline {
  newLeads: number;
  contacted: number;
  scheduled: number;
  negotiating: number;
  closedWon: number;
}

export interface Performance {
  viewsThisMonth: number;
  leadsThisMonth: number;
  conversionRate: number;
}

export interface AgentDashboard {
  summary: AgentDashboardSummary;
  recentLeads: RecentLead[];
  pipeline: Pipeline;
  performance: Performance;
}

export interface UpdateAgentProfileRequest {
  licenseNumber: string;
  agency?: string;
  agencyRuc?: string;
  yearsOfExperience?: number;
  specialty?: AgentSpecialty;
  aboutProfessional?: string;
  languages?: string[];
  serviceAreas?: string[];
  publicSlug?: string;
}
