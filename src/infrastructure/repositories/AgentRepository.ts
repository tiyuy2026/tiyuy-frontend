import { axiosClient } from '../api/axios-client';
import { IAgentRepository } from '@/core/domain/repositories/IAgentRepository';
import { Agent, AgentDashboard, PublicAgentProfile, UpdateAgentProfileRequest } from '@/core/domain/entities/Agent';
import { PromotionCampaign, MarketingStats, CreatePromotionCampaignRequest, UpdatePromotionCampaignRequest, Banner, CreateBannerRequest } from '@/core/domain/entities/Admin';
import { PaginatedResponse } from '@/core/domain/repositories/IAdminRepository';

export interface TargetEntity {
  id: number;
  title: string;
  type: 'PROPERTY' | 'PROJECT';
  status: string;
  imageUrl: string | null;
  price: string;
  location: string;
}

const BASE_URL = '/v1/agent';

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

  async updateMyCampaign(id: number, request: UpdatePromotionCampaignRequest): Promise<PromotionCampaign> {
    const response = await axiosClient.put(`${BASE_URL}/marketing/campaigns/${id}`, request);
    return response.data;
  }

  async deleteMyCampaign(id: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/marketing/campaigns/${id}`);
  }

  // Banners
  async getMyBanners(): Promise<Banner[]> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/banners`);
    return response.data;
  }

  async createMyBanner(request: CreateBannerRequest): Promise<Banner> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/banners`, request);
    return response.data;
  }

  async updateMyBanner(id: number, request: CreateBannerRequest): Promise<Banner> {
    const response = await axiosClient.put(`${BASE_URL}/marketing/banners/${id}`, request);
    return response.data;
  }

  async deleteMyBanner(id: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/marketing/banners/${id}`);
  }

  // Publish campaign
  async publishMyCampaign(id: number): Promise<PromotionCampaign> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/campaigns/${id}/publish`);
    return response.data;
  }

  // Renew campaign
  async renewMyCampaign(id: number, paymentRequest: { paymentMethod: string }): Promise<PromotionCampaign> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/campaigns/${id}/renew`, paymentRequest);
    return response.data;
  }

  // Target entities (projects & properties for linking)
  async getMyTargetEntities(): Promise<TargetEntity[]> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/target-entities`);
    const data = response.data;
    const entities: TargetEntity[] = [];
    if (data?.projects && Array.isArray(data.projects)) {
      data.projects.forEach((p: any) => {
        entities.push({
          id: p.id,
          title: p.title || p.name || '',
          type: 'PROJECT',
          status: p.status || 'ACTIVE',
          imageUrl: p.imageUrl || p.mainImageUrl || null,
          price: p.price ? `${p.price}` : '',
          location: p.location || p.district || '',
        });
      });
    }
    if (data?.properties && Array.isArray(data.properties)) {
      data.properties.forEach((p: any) => {
        entities.push({
          id: p.id,
          title: p.title || p.name || '',
          type: 'PROPERTY',
          status: p.status || 'ACTIVE',
          imageUrl: p.imageUrl || p.mainImageUrl || null,
          price: p.price ? `${p.price}` : '',
          location: p.location || p.district || '',
        });
      });
    }
    return entities;
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
