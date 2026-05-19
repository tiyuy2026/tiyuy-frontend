import { axiosClient } from '../api/axios-client';
import { IAgentRepository } from '@/core/domain/repositories/IAgentRepository';
import { Agent, AgentDashboard, PublicAgentProfile, UpdateAgentProfileRequest } from '@/core/domain/entities/Agent';
import { Banner, CampaignPricing, PromotionCampaign, MarketingStats, CreateBannerRequest, CreatePromotionCampaignRequest } from '@/core/domain/entities/Admin';
import { PaginatedResponse } from '@/core/domain/repositories/IAdminRepository';

const BASE_URL = '/api/agent';

export class AgentRepository implements IAgentRepository {
  async getProfile(): Promise<Agent> {
    const response = await axiosClient.get(`${BASE_URL}/profile`);
    return this.mapToAgent(response.data);
  }

  async updateProfile(data: UpdateAgentProfileRequest): Promise<Agent> {
    const response = await axiosClient.put(`${BASE_URL}/profile`, data);
    return this.mapToAgent(response.data);
  }

  async getPublicProfile(slug: string): Promise<PublicAgentProfile> {
    const response = await axiosClient.get(`${BASE_URL}/${slug}`);
    return response.data;
  }

  async getDashboard(): Promise<AgentDashboard> {
    const response = await axiosClient.get(`${BASE_URL}/dashboard`);
    return response.data;
  }

  // Marketing
  async getMarketingStats(): Promise<MarketingStats> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/stats`);
    return response.data;
  }

  async getMyCampaigns(params?: { page?: number; size?: number }): Promise<PaginatedResponse<PromotionCampaign>> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/campaigns`, { params });
    return response.data;
  }

  async createMyCampaign(request: CreatePromotionCampaignRequest): Promise<PromotionCampaign> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/campaigns`, request);
    return response.data;
  }

  async getMyBanners(): Promise<Banner[]> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/banners`);
    return response.data;
  }

  async createMyBanner(request: CreateBannerRequest): Promise<Banner> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/banners`, request);
    return response.data;
  }

  async getPricingList(): Promise<CampaignPricing[]> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/pricing`);
    return response.data;
  }

  private mapToAgent(data: any): Agent {
    return {
      userId: data.userId,
      basicInfo: data.basicInfo || {
        email: '',
        phone: '',
      },
      professionalInfo: data.professionalInfo,
      verification: data.verification,
      metrics: data.metrics,
      publicProfile: data.publicProfile || {
        languages: [],
        serviceAreas: [],
      },
    };
  }
}
