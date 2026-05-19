import { Agent, AgentDashboard, PublicAgentProfile, UpdateAgentProfileRequest } from '../entities/Agent';
import { Banner, CampaignPricing, PromotionCampaign, MarketingStats, CreateBannerRequest, CreatePromotionCampaignRequest } from '../entities/Admin';
import { PaginatedResponse } from './IAdminRepository';

export interface IAgentRepository {
  getProfile(): Promise<Agent>;
  updateProfile(data: UpdateAgentProfileRequest): Promise<Agent>;
  getPublicProfile(slug: string): Promise<PublicAgentProfile>;
  getDashboard(): Promise<AgentDashboard>;

  // Marketing
  getMarketingStats(): Promise<MarketingStats>;
  getMyCampaigns(params?: { page?: number; size?: number }): Promise<PaginatedResponse<PromotionCampaign>>;
  createMyCampaign(request: CreatePromotionCampaignRequest): Promise<PromotionCampaign>;
  getMyBanners(): Promise<Banner[]>;
  createMyBanner(request: CreateBannerRequest): Promise<Banner>;
  getPricingList(): Promise<CampaignPricing[]>;
}
