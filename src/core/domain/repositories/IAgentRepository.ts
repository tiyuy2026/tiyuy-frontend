import { Agent, AgentDashboard, PublicAgentProfile, UpdateAgentProfileRequest } from '../entities/Agent';
import { PromotionCampaign, MarketingStats, CreatePromotionCampaignRequest, Banner, CreateBannerRequest, UpdatePromotionCampaignRequest } from '../entities/Admin';
import { PaginatedResponse } from './IAdminRepository';

export interface TargetEntity {
  id: number;
  title: string;
  type: 'PROPERTY' | 'PROJECT';
  status: string;
  imageUrl: string | null;
  price: string;
  location: string;
}

export interface IAgentRepository {
  getProfile(): Promise<Agent>;
  updateProfile(data: UpdateAgentProfileRequest): Promise<Agent>;
  getPublicProfile(slug: string): Promise<PublicAgentProfile>;
  getDashboard(): Promise<AgentDashboard>;

  // Marketing
  getMarketingStats(): Promise<MarketingStats>;
  getMyCampaigns(params?: { page?: number; size?: number }): Promise<PaginatedResponse<PromotionCampaign>>;
  createMyCampaign(request: CreatePromotionCampaignRequest): Promise<PromotionCampaign>;
  updateMyCampaign(id: number, request: UpdatePromotionCampaignRequest): Promise<PromotionCampaign>;
  deleteMyCampaign(id: number): Promise<void>;
  publishMyCampaign(id: number): Promise<PromotionCampaign>;
  renewMyCampaign(id: number, paymentRequest: { paymentMethod: string }): Promise<PromotionCampaign>;
  getMyTargetEntities(): Promise<TargetEntity[]>;

  // Banners
  getMyBanners(): Promise<Banner[]>;
  createMyBanner(request: CreateBannerRequest): Promise<Banner>;
  updateMyBanner(id: number, request: CreateBannerRequest): Promise<Banner>;
  deleteMyBanner(id: number): Promise<void>;
}
