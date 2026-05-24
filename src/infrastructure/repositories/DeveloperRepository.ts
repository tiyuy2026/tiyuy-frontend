import { axiosClient } from '../api/axios-client';
import { Banner, CampaignPricing, PromotionCampaign, MarketingStats, CreateBannerRequest, CreatePromotionCampaignRequest, UpdatePromotionCampaignRequest } from '@/core/domain/entities/Admin';
import { PaginatedResponse } from '@/core/domain/repositories/IAdminRepository';

const BASE_URL = '/v1/developer';

export class DeveloperRepository {
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

  async payForCampaign(id: number, paymentRequest: any): Promise<PromotionCampaign> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/campaigns/${id}/pay`, paymentRequest);
    return response.data;
  }

  async renewCampaign(id: number, paymentRequest: any): Promise<PromotionCampaign> {
    const response = await axiosClient.post(`${BASE_URL}/marketing/campaigns/${id}/renew`, paymentRequest);
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

  async updateMyBanner(id: number, request: CreateBannerRequest): Promise<Banner> {
    const response = await axiosClient.put(`${BASE_URL}/marketing/banners/${id}`, request);
    return response.data;
  }

  async deleteMyBanner(id: number): Promise<void> {
    await axiosClient.delete(`${BASE_URL}/marketing/banners/${id}`);
  }

  async getPricingList(): Promise<CampaignPricing[]> {
    const response = await axiosClient.get(`${BASE_URL}/marketing/pricing`);
    return response.data;
  }
}
